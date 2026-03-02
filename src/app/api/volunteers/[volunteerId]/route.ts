import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth";
import { getVolunteerProfile } from "@/services/volunteer.service";
import { errorResponse, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { z } from "zod";

const updateVolunteerSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  associationId: z.string().cuid().nullable().optional(),
});

/**
 * GET /api/volunteers/[volunteerId]
 *
 * Get detailed volunteer profile. Accessible by:
 * - The volunteer themselves
 * - Platform admins
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ volunteerId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    const { volunteerId } = await params;

    // Authorization: volunteers can view their own profile, admins can view any
    if (user.volunteerId !== volunteerId && user.role !== "PLATFORM_ADMIN") {
      throw new ForbiddenError("Non hai i permessi per visualizzare questo profilo.");
    }

    // Find the volunteer to get the userId
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      select: { userId: true },
    });

    if (!volunteer) {
      throw new NotFoundError("Volontario non trovato");
    }

    const profile = await getVolunteerProfile(volunteer.userId);

    return Response.json({ data: profile });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/volunteers/[volunteerId]
 *
 * Update volunteer profile. Accessible by:
 * - The volunteer themselves (limited fields)
 * - Platform admins (all fields)
 *
 * Request body: { displayName?: string, email?: string, associationId?: string | null }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ volunteerId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    const { volunteerId } = await params;

    // Authorization check
    if (user.volunteerId !== volunteerId && user.role !== "PLATFORM_ADMIN") {
      throw new ForbiddenError("Non hai i permessi per modificare questo profilo.");
    }

    const body = await request.json();
    const parsed = updateVolunteerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: { user: true },
    });

    if (!volunteer) {
      throw new NotFoundError("Volontario non trovato");
    }

    // Update user fields
    const userUpdates: Record<string, unknown> = {};
    if (parsed.data.displayName !== undefined) {
      userUpdates.displayName = parsed.data.displayName;
    }
    if (parsed.data.email !== undefined) {
      userUpdates.email = parsed.data.email;
    }

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: volunteer.userId },
        data: userUpdates,
      });
    }

    // Update volunteer fields
    if (parsed.data.associationId !== undefined) {
      // Verify the association exists if a non-null value is provided
      if (parsed.data.associationId !== null) {
        const association = await prisma.association.findUnique({
          where: { id: parsed.data.associationId },
        });
        if (!association) {
          throw new NotFoundError("Associazione non trovata");
        }
        if (!association.isActive) {
          throw new ValidationError("L'associazione non e' attiva");
        }
      }

      await prisma.volunteer.update({
        where: { id: volunteerId },
        data: { associationId: parsed.data.associationId },
      });
    }

    // Re-fetch the updated profile
    const profile = await getVolunteerProfile(volunteer.userId);

    return Response.json({ data: profile });
  } catch (error) {
    return errorResponse(error);
  }
}
