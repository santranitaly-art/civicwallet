import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHmac } from "@/lib/crypto";
import { webhookPayloadSchema } from "@/lib/validators";
import { processShiftWebhook } from "@/services/webhook.service";
import { errorResponse, ValidationError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/webhooks/appambulanza
 *
 * Receives shift_completed webhooks from AppAmbulanza.it.
 * Validates the HMAC signature, logs the webhook, and delegates
 * processing to the webhook service.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit by source IP
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!rateLimit(`webhook:appambulanza:${ip}`, 30, 60_000)) {
      return Response.json(
        { error: "Troppe richieste", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    // 1. Read the raw body for HMAC validation
    const rawBody = await request.text();

    if (!rawBody) {
      return Response.json(
        { error: "Body mancante", code: "EMPTY_BODY" },
        { status: 400 },
      );
    }

    // 2. Extract the HMAC signature from the header
    const signature = request.headers.get("x-webhook-signature")
      ?? request.headers.get("x-hmac-signature")
      ?? "";

    if (!signature) {
      return Response.json(
        { error: "Firma HMAC mancante", code: "MISSING_SIGNATURE" },
        { status: 401 },
      );
    }

    // 3. Parse the payload to extract the association code for secret lookup
    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return Response.json(
        { error: "JSON non valido", code: "INVALID_JSON" },
        { status: 400 },
      );
    }

    // 4. Validate payload shape
    const parsed = webhookPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json(
        {
          error: "Payload non valido",
          code: "VALIDATION_ERROR",
          details: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 422 },
      );
    }

    // 5. Look up the association's webhook secret for HMAC validation
    const association = await prisma.association.findUnique({
      where: { fiscalCode: parsed.data.data.associationCode },
      select: { webhookSecret: true, isActive: true },
    });

    if (!association) {
      return Response.json(
        {
          error: `Associazione con codice fiscale ${parsed.data.data.associationCode} non trovata`,
          code: "ASSOCIATION_NOT_FOUND",
        },
        { status: 404 },
      );
    }

    if (!association.isActive) {
      return Response.json(
        { error: "Associazione non attiva", code: "ASSOCIATION_INACTIVE" },
        { status: 403 },
      );
    }

    // 6. Validate the HMAC signature
    const hmacValid = validateHmac(rawBody, signature, association.webhookSecret);

    // 7. Create WebhookLog entry regardless of HMAC validity (for audit trail)
    const webhookLog = await prisma.webhookLog.create({
      data: {
        source: "appambulanza",
        endpoint: "/api/webhooks/appambulanza",
        payload: parsed.data as object,
        headers: {
          "content-type": request.headers.get("content-type"),
          "x-webhook-signature": signature ? "[REDACTED]" : null,
          "x-forwarded-for": ip,
          "user-agent": request.headers.get("user-agent"),
        },
        hmacValid,
        status: hmacValid ? "RECEIVED" : "FAILED",
        processingError: hmacValid ? null : "HMAC signature validation failed",
      },
    });

    // 8. If HMAC is invalid, return 401
    if (!hmacValid) {
      return Response.json(
        { error: "Firma HMAC non valida", code: "INVALID_SIGNATURE" },
        { status: 401 },
      );
    }

    // 9. Process the webhook (creates activity log, updates volunteer hours, etc.)
    const result = await processShiftWebhook(parsed.data, webhookLog.id);

    return Response.json(
      {
        success: true,
        webhookLogId: webhookLog.id,
        activityLogId: result.activityLogId,
        volunteerId: result.volunteerId,
      },
      { status: 200 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
