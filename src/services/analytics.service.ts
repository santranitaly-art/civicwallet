import { prisma } from "@/lib/prisma";
import type { PlatformAnalytics } from "@/types";

// ---------------------------------------------------------------------------
// getPlatformStats
// ---------------------------------------------------------------------------

/**
 * Compute platform-wide analytics for the admin dashboard.
 *
 * All counts are executed in parallel for speed.  The `recentMints` list
 * is limited to the 10 most recent confirmed mints.
 */
export async function getPlatformStats(): Promise<PlatformAnalytics> {
  const [
    totalVolunteers,
    totalBadgesMinted,
    totalAssociations,
    totalMerchants,
    hoursAggregate,
    badgesPerCategory,
    recentMints,
  ] = await Promise.all([
    // Total active volunteers
    prisma.volunteer.count(),

    // Total confirmed on-chain mints
    prisma.mintedBadge.count({
      where: { mintStatus: "CONFIRMED" },
    }),

    // Total active associations
    prisma.association.count({ where: { isActive: true } }),

    // Total active merchants
    prisma.merchant.count({ where: { isActive: true } }),

    // Sum of all hours logged across volunteers
    prisma.volunteer.aggregate({
      _sum: { totalHours: true },
    }),

    // Count of confirmed badges grouped by badge category
    prisma.mintedBadge.findMany({
      where: { mintStatus: "CONFIRMED" },
      include: { badgeType: { select: { category: true } } },
    }),

    // 10 most recent confirmed mints
    prisma.mintedBadge.findMany({
      where: { mintStatus: "CONFIRMED" },
      include: {
        badgeType: { select: { nameIt: true, name: true } },
        volunteer: {
          include: {
            user: { select: { displayName: true } },
          },
        },
      },
      orderBy: { mintedAt: "desc" },
      take: 10,
    }),
  ]);

  // Compute badges per category from raw records
  const categoryMap: Record<string, number> = {};
  for (const mb of badgesPerCategory) {
    const cat = mb.badgeType.category;
    categoryMap[cat] = (categoryMap[cat] ?? 0) + 1;
  }

  // Total hours — the aggregate may return null if no volunteers exist
  const totalHoursLogged = Number(hoursAggregate._sum.totalHours ?? 0);

  return {
    totalVolunteers,
    totalBadgesMinted,
    totalHoursLogged: Math.round(totalHoursLogged * 100) / 100,
    totalAssociations,
    totalMerchants,
    badgesPerCategory: categoryMap,
    recentMints: recentMints.map((mb) => ({
      id: mb.id,
      badgeName: mb.badgeType.nameIt || mb.badgeType.name,
      volunteerName: mb.volunteer.user.displayName,
      mintedAt: mb.mintedAt,
    })),
  };
}

// ---------------------------------------------------------------------------
// getAssociationStats
// ---------------------------------------------------------------------------

/**
 * Per-association analytics: volunteer count, hours, badge counts.
 */
export async function getAssociationStats(associationId: string) {
  const [association, volunteers, activityLogs] = await Promise.all([
    prisma.association.findUnique({
      where: { id: associationId },
      select: { id: true, name: true },
    }),

    prisma.volunteer.findMany({
      where: { associationId },
      select: { totalHours: true, totalShifts: true },
    }),

    prisma.activityLog.count({
      where: { associationId },
    }),
  ]);

  if (!association) {
    return null;
  }

  const totalVolunteers = volunteers.length;
  const totalHours = volunteers.reduce(
    (sum, v) => sum + Number(v.totalHours),
    0,
  );
  const totalShifts = volunteers.reduce(
    (sum, v) => sum + v.totalShifts,
    0,
  );
  const averageHours =
    totalVolunteers > 0
      ? Math.round((totalHours / totalVolunteers) * 100) / 100
      : 0;

  return {
    associationId: association.id,
    associationName: association.name,
    totalVolunteers,
    totalHours: Math.round(totalHours * 100) / 100,
    totalShifts,
    totalActivityLogs: activityLogs,
    averageHoursPerVolunteer: averageHours,
  };
}

// ---------------------------------------------------------------------------
// getMintingStats
// ---------------------------------------------------------------------------

/**
 * Minting pipeline health: counts by mint status.
 */
export async function getMintingStats() {
  const [pending, submitted, confirmed, failed] = await Promise.all([
    prisma.mintedBadge.count({ where: { mintStatus: "PENDING" } }),
    prisma.mintedBadge.count({ where: { mintStatus: "SUBMITTED" } }),
    prisma.mintedBadge.count({ where: { mintStatus: "CONFIRMED" } }),
    prisma.mintedBadge.count({ where: { mintStatus: "FAILED" } }),
  ]);

  return {
    pending,
    submitted,
    confirmed,
    failed,
    total: pending + submitted + confirmed + failed,
  };
}

// ---------------------------------------------------------------------------
// getWebhookStats
// ---------------------------------------------------------------------------

/**
 * Webhook processing health: counts by status over a given time window.
 */
export async function getWebhookStats(sinceDays = 7) {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);

  const [received, processing, processed, failed, total] = await Promise.all([
    prisma.webhookLog.count({
      where: { status: "RECEIVED", createdAt: { gte: since } },
    }),
    prisma.webhookLog.count({
      where: { status: "PROCESSING", createdAt: { gte: since } },
    }),
    prisma.webhookLog.count({
      where: { status: "PROCESSED", createdAt: { gte: since } },
    }),
    prisma.webhookLog.count({
      where: { status: "FAILED", createdAt: { gte: since } },
    }),
    prisma.webhookLog.count({
      where: { createdAt: { gte: since } },
    }),
  ]);

  return {
    sinceDays,
    received,
    processing,
    processed,
    failed,
    total,
    successRate:
      total > 0
        ? Math.round((processed / total) * 10000) / 100
        : 100,
  };
}
