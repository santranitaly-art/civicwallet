import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth";
import { onboardingSchema } from "@/lib/validators";
import { createVolunteer } from "@/services/volunteer.service";
import { hashVolunteerId } from "@/lib/crypto";
import { errorResponse, ValidationError, ConflictError } from "@/lib/errors";

/**
 * GET /api/volunteers
 *
 * List all volunteers. Requires PLATFORM_ADMIN role.
 * Supports pagination via ?page=N&limit=N query params.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") ?? undefined;

    const where = search
      ? {
          OR: [
            { user: { displayName: { contains: search, mode: "insensitive" as const } } },
            { user: { walletAddress: { contains: search, mode: "insensitive" as const } } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {};

    const [volunteers, total] = await Promise.all([
      prisma.volunteer.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              walletAddress: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
          association: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              badgeClaims: true,
              mintedBadges: true,
              activityLogs: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.volunteer.count({ where }),
    ]);

    return Response.json({
      data: volunteers,
      total,
      page,
      limit,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/volunteers
 *
 * Create a volunteer profile for the authenticated user (onboarding).
 * The user must already exist (created via wallet connect) and must not
 * already have a volunteer profile.
 *
 * Request body: { displayName: string, associationId?: string, gdprConsent: true }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    // Update the user's display name and GDPR consent
    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: parsed.data.displayName,
        role: "VOLUNTEER",
        gdprConsentAt: new Date(),
        gdprConsentIp: request.headers.get("x-forwarded-for") ?? "unknown",
      },
    });

    // Create the volunteer profile
    const result = await createVolunteer(user.id, {
      associationId: parsed.data.associationId,
    });

    return Response.json(
      {
        data: {
          volunteerId: result.volunteerId,
          message: "Profilo volontario creato con successo.",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
