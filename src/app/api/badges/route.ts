export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getVolunteerBadges } from "@/services/badge.service";
import { errorResponse, ValidationError } from "@/lib/errors";

/**
 * GET /api/badges
 *
 * Returns all badge types with the authenticated volunteer's claim/mint status.
 * Requires authentication as a volunteer.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user.volunteerId) {
      throw new ValidationError(
        "Profilo volontario non trovato. Completa l'onboarding per visualizzare i badge.",
      );
    }

    const badges = await getVolunteerBadges(user.volunteerId);

    return Response.json({ data: badges });
  } catch (error) {
    return errorResponse(error);
  }
}
