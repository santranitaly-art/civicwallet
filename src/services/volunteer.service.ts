import { prisma } from "@/lib/prisma";
import { HOURS_THRESHOLDS, BADGE_METADATA } from "@/lib/constants";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import type { VolunteerProfile, BadgeWithClaim } from "@/types";
import { getVolunteerBadges } from "./badge.service";

// ---------------------------------------------------------------------------
// getVolunteerByUserId
// ---------------------------------------------------------------------------

/**
 * Retrieve a volunteer record by the parent User ID, including the
 * association and all badge relationships.
 * Returns `null` when the user exists but has no volunteer profile.
 */
export async function getVolunteerByUserId(userId: string) {
  const volunteer = await prisma.volunteer.findUnique({
    where: { userId },
    include: {
      user: true,
      association: true,
      badgeClaims: {
        include: { badgeType: true },
        orderBy: { createdAt: "desc" },
      },
      mintedBadges: {
        include: { badgeType: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return volunteer;
}

// ---------------------------------------------------------------------------
// getVolunteerProfile
// ---------------------------------------------------------------------------

/**
 * Build the full VolunteerProfile DTO used by the frontend dashboard.
 * Includes total hours, badge progression, and the next milestone.
 */
export async function getVolunteerProfile(
  userId: string,
): Promise<VolunteerProfile> {
  const volunteer = await prisma.volunteer.findUnique({
    where: { userId },
    include: {
      user: true,
      association: true,
    },
  });

  if (!volunteer) {
    throw new NotFoundError("Profilo volontario non trovato");
  }

  const totalHours = Number(volunteer.totalHours);

  // Fetch badge progression
  const badges: BadgeWithClaim[] = await getVolunteerBadges(volunteer.id);

  // Determine the next milestone
  const nextMilestone = computeNextMilestone(totalHours);

  return {
    id: volunteer.id,
    displayName: volunteer.user.displayName,
    walletAddress: volunteer.user.walletAddress,
    email: volunteer.user.email,
    totalHours,
    totalShifts: volunteer.totalShifts,
    associationName: volunteer.association?.name ?? null,
    badges,
    nextMilestone,
  };
}

// ---------------------------------------------------------------------------
// createVolunteer
// ---------------------------------------------------------------------------

/**
 * Create a new Volunteer record linked to an existing User.
 * Optionally associates the volunteer with an ETS association.
 */
export async function createVolunteer(
  userId: string,
  data: {
    associationId?: string;
  },
): Promise<{ volunteerId: string }> {
  // Verify the user exists and does not already have a volunteer record
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { volunteer: true },
  });

  if (!user) {
    throw new NotFoundError("Utente non trovato");
  }

  if (user.volunteer) {
    throw new ConflictError("L'utente ha già un profilo volontario");
  }

  // If an association ID was provided, verify it exists and is active
  if (data.associationId) {
    const association = await prisma.association.findUnique({
      where: { id: data.associationId },
    });

    if (!association) {
      throw new NotFoundError("Associazione non trovata");
    }

    if (!association.isActive) {
      throw new ValidationError("L'associazione non è attiva");
    }
  }

  const volunteer = await prisma.volunteer.create({
    data: {
      userId,
      associationId: data.associationId ?? null,
    },
  });

  return { volunteerId: volunteer.id };
}

// ---------------------------------------------------------------------------
// getVolunteerHoursSummary
// ---------------------------------------------------------------------------

/**
 * Compute an hours breakdown for a volunteer: total, per activity type,
 * and monthly totals for the current year.
 */
export async function getVolunteerHoursSummary(volunteerId: string): Promise<{
  totalHours: number;
  totalShifts: number;
  byActivityType: Record<string, { hours: number; shifts: number }>;
  monthlyHours: Array<{ month: string; hours: number; shifts: number }>;
}> {
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
  });

  if (!volunteer) {
    throw new NotFoundError("Volontario non trovato");
  }

  // All activity logs for this volunteer
  const logs = await prisma.activityLog.findMany({
    where: { volunteerId },
    orderBy: { shiftDate: "asc" },
  });

  // Aggregate by activity type
  const byActivityType: Record<string, { hours: number; shifts: number }> = {};
  for (const log of logs) {
    const key = log.activityType;
    if (!byActivityType[key]) {
      byActivityType[key] = { hours: 0, shifts: 0 };
    }
    byActivityType[key].hours += Number(log.hoursWorked);
    byActivityType[key].shifts += 1;
  }

  // Round hours in each bucket
  for (const key of Object.keys(byActivityType)) {
    byActivityType[key].hours = Math.round(byActivityType[key].hours * 100) / 100;
  }

  // Monthly breakdown for the current year
  const currentYear = new Date().getFullYear();
  const monthlyMap = new Map<string, { hours: number; shifts: number }>();

  // Pre-populate all 12 months
  for (let m = 0; m < 12; m++) {
    const label = `${currentYear}-${String(m + 1).padStart(2, "0")}`;
    monthlyMap.set(label, { hours: 0, shifts: 0 });
  }

  for (const log of logs) {
    const date = new Date(log.shiftDate);
    if (date.getFullYear() !== currentYear) continue;
    const label = `${currentYear}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthlyMap.get(label)!;
    entry.hours += Number(log.hoursWorked);
    entry.shifts += 1;
  }

  const monthlyHours = Array.from(monthlyMap.entries()).map(
    ([month, data]) => ({
      month,
      hours: Math.round(data.hours * 100) / 100,
      shifts: data.shifts,
    }),
  );

  return {
    totalHours: Number(volunteer.totalHours),
    totalShifts: volunteer.totalShifts,
    byActivityType,
    monthlyHours,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Given the volunteer's current total hours, determine the next
 * hours-based milestone they have not yet reached.
 */
function computeNextMilestone(
  currentHours: number,
): VolunteerProfile["nextMilestone"] {
  // Sort thresholds ascending
  const sortedThresholds = (
    Object.entries(HOURS_THRESHOLDS) as Array<[string, number]>
  )
    .map(([tokenId, hours]) => ({ tokenId: Number(tokenId), hours }))
    .sort((a, b) => a.hours - b.hours);

  for (const { tokenId, hours } of sortedThresholds) {
    if (currentHours < hours) {
      const meta =
        BADGE_METADATA[tokenId as keyof typeof BADGE_METADATA];
      return {
        name: meta?.name ?? `Badge #${tokenId}`,
        hoursRequired: hours,
        hoursRemaining: Math.round((hours - currentHours) * 100) / 100,
        progress: Math.min(
          Math.round((currentHours / hours) * 100),
          99, // never show 100% if not actually reached
        ),
      };
    }
  }

  // Volunteer has surpassed all milestones
  return null;
}
