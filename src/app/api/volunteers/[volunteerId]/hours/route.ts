import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getVolunteerHoursSummary } from "@/services/volunteer.service";
import { errorResponse, ForbiddenError } from "@/lib/errors";

/**
 * GET /api/volunteers/[volunteerId]/hours
 *
 * Get a detailed hours summary for a volunteer including:
 * - Total hours and shifts
 * - Breakdown by activity type
 * - Monthly breakdown for the current year
 *
 * Accessible by the volunteer themselves or platform admins.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ volunteerId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    const { volunteerId } = await params;

    // Authorization: volunteers can view their own hours, admins can view any
    if (user.volunteerId !== volunteerId && user.role !== "PLATFORM_ADMIN") {
      throw new ForbiddenError("Non hai i permessi per visualizzare queste informazioni.");
    }

    const summary = await getVolunteerHoursSummary(volunteerId);

    return Response.json({ data: summary });
  } catch (error) {
    return errorResponse(error);
  }
}
