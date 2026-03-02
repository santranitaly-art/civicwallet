import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { webhookPayloadSchema, type WebhookPayload } from "@/lib/validators";
import { NotFoundError, ValidationError, ConflictError, AppError } from "@/lib/errors";
import { isShadowMode } from "@/lib/config";
import { checkBadgeEligibility } from "./badge.service";

/**
 * Process an incoming shift_completed webhook from AppAmbulanza.it.
 *
 * Steps:
 *  1. Validate and parse the payload against the Zod schema.
 *  2. Resolve the association by fiscal code and the volunteer by external ref.
 *  3. Guard against duplicate delivery using the externalRef field.
 *  4. Persist the ActivityLog and increment the volunteer's running totals
 *     inside a single transaction.
 *  5. Mark the WebhookLog as PROCESSED (or FAILED on error).
 *  6. Trigger an asynchronous badge-eligibility check for the volunteer.
 */
export async function processShiftWebhook(
  payload: unknown,
  webhookLogId: string,
): Promise<{ activityLogId: string; volunteerId: string }> {
  // 1. Validate payload shape
  const parsed = webhookPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    await markWebhookFailed(webhookLogId, `Validation failed: ${parsed.error.message}`);
    throw new ValidationError(
      `Payload webhook non valido: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  const data: WebhookPayload = parsed.data;

  try {
    // 2. Mark webhook as PROCESSING
    await prisma.webhookLog.update({
      where: { id: webhookLogId },
      data: { status: "PROCESSING" },
    });

    // 3. Resolve the association by its fiscal code
    const association = await prisma.association.findUnique({
      where: { fiscalCode: data.data.associationCode },
    });

    if (!association) {
      await markWebhookFailed(webhookLogId, `Association not found: ${data.data.associationCode}`);
      throw new NotFoundError(
        `Associazione con codice fiscale ${data.data.associationCode} non trovata`,
      );
    }

    if (!association.isActive) {
      await markWebhookFailed(webhookLogId, `Association inactive: ${association.id}`);
      throw new ValidationError(
        `Associazione ${association.name} non è attiva`,
      );
    }

    // 4. Resolve volunteer — the volunteerId from AppAmbulanza is stored as the
    //    Prisma Volunteer.id  (they share the same identifier space).
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: data.data.volunteerId },
    });

    if (!volunteer) {
      await markWebhookFailed(webhookLogId, `Volunteer not found: ${data.data.volunteerId}`);
      throw new NotFoundError(
        `Volontario ${data.data.volunteerId} non trovato`,
      );
    }

    // 5. Duplicate detection — use externalRef (referenceId from AppAmbulanza)
    //    @@unique([externalRef]) in the schema guarantees no race-condition duplicates.
    const existing = await prisma.activityLog.findUnique({
      where: { externalRef: data.data.referenceId },
    });

    if (existing) {
      // Idempotent: mark webhook as processed and return the existing record
      await prisma.webhookLog.update({
        where: { id: webhookLogId },
        data: { status: "PROCESSED", processedAt: new Date() },
      });
      return { activityLogId: existing.id, volunteerId: volunteer.id };
    }

    // 6. Persist activity log + update volunteer totals in a single transaction
    const hoursWorked = new Prisma.Decimal(data.data.hoursWorked);

    const result = await prisma.$transaction(async (tx) => {
      const activityLog = await tx.activityLog.create({
        data: {
          volunteerId: volunteer.id,
          associationId: association.id,
          shiftDate: new Date(data.data.shiftDate),
          hoursWorked,
          activityType: data.data.activityType,
          description: data.data.description ?? null,
          externalRef: data.data.referenceId,
          webhookLogId,
        },
      });

      await tx.volunteer.update({
        where: { id: volunteer.id },
        data: {
          totalHours: { increment: hoursWorked },
          totalShifts: { increment: 1 },
        },
      });

      return activityLog;
    });

    // 7. Mark webhook as successfully processed
    await prisma.webhookLog.update({
      where: { id: webhookLogId },
      data: { status: "PROCESSED", processedAt: new Date() },
    });

    // 8. Badge eligibility check — only in active mode
    //    In shadow mode we log and validate everything but never trigger minting.
    if (isShadowMode()) {
      console.info(
        `[webhook.service] 🌑 SHADOW MODE — skipping badge eligibility for volunteer ${volunteer.id} (shift ${result.id})`,
      );
    } else {
      checkBadgeEligibility(volunteer.id).catch((err) => {
        console.error(
          `[webhook.service] Badge eligibility check failed for volunteer ${volunteer.id}:`,
          err,
        );
      });
    }

    return { activityLogId: result.id, volunteerId: volunteer.id };
  } catch (error) {
    // If it is already an AppError we have already handled the webhook status above
    if (error instanceof AppError) {
      throw error;
    }

    // Unexpected error — mark webhook as FAILED
    const message = error instanceof Error ? error.message : "Unknown error";
    await markWebhookFailed(webhookLogId, message);
    throw new AppError(`Errore durante l'elaborazione del webhook: ${message}`, 500, "WEBHOOK_PROCESSING_ERROR");
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function markWebhookFailed(webhookLogId: string, errorMessage: string): Promise<void> {
  try {
    await prisma.webhookLog.update({
      where: { id: webhookLogId },
      data: {
        status: "FAILED",
        processingError: errorMessage.slice(0, 2000), // guard against very long messages
        processedAt: new Date(),
      },
    });
  } catch (updateError) {
    console.error(
      `[webhook.service] Failed to mark webhook ${webhookLogId} as FAILED:`,
      updateError,
    );
  }
}
