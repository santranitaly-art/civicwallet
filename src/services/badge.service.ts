import { prisma } from "@/lib/prisma";
import { HOURS_THRESHOLDS, BADGE_METADATA } from "@/lib/constants";
import { NotFoundError, ConflictError, ValidationError, AppError } from "@/lib/errors";
import type { BadgeWithClaim } from "@/types";
import { createNotification } from "./notification.service";

// ---------------------------------------------------------------------------
// checkBadgeEligibility
// ---------------------------------------------------------------------------

/**
 * Evaluate whether a volunteer has crossed any hours-based badge threshold
 * since the last check.  For every newly-eligible badge a PENDING BadgeClaim
 * is created and the volunteer is notified.
 *
 * This is safe to call repeatedly — the @@unique([volunteerId, badgeTypeId])
 * constraint on BadgeClaim prevents duplicate claims.
 *
 * Returns the list of newly created claim IDs.
 */
export async function checkBadgeEligibility(
  volunteerId: string,
): Promise<string[]> {
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
    include: {
      user: true,
      badgeClaims: { select: { badgeTypeId: true } },
    },
  });

  if (!volunteer) {
    throw new NotFoundError(`Volontario ${volunteerId} non trovato`);
  }

  const totalHours = Number(volunteer.totalHours);

  // Collect all presence-based badge types that match the thresholds
  const thresholdEntries = Object.entries(HOURS_THRESHOLDS) as Array<
    [string, number]
  >;

  // Find badge types whose hours requirement the volunteer now satisfies
  const eligibleTokenIds = thresholdEntries
    .filter(([, requiredHours]) => totalHours >= requiredHours)
    .map(([tokenId]) => Number(tokenId));

  if (eligibleTokenIds.length === 0) {
    return [];
  }

  // Load the corresponding BadgeType rows by on-chain tokenId
  const badgeTypes = await prisma.badgeType.findMany({
    where: {
      tokenId: { in: eligibleTokenIds },
      isActive: true,
    },
  });

  // Filter out badge types the volunteer already has a claim for
  const existingBadgeTypeIds = new Set(
    volunteer.badgeClaims.map((c) => c.badgeTypeId),
  );

  const newBadgeTypes = badgeTypes.filter(
    (bt) => !existingBadgeTypeIds.has(bt.id),
  );

  if (newBadgeTypes.length === 0) {
    return [];
  }

  // Create PENDING claims for each newly-eligible badge
  const createdClaimIds: string[] = [];

  for (const badgeType of newBadgeTypes) {
    try {
      const claim = await prisma.badgeClaim.create({
        data: {
          volunteerId: volunteer.id,
          badgeTypeId: badgeType.id,
          status: "PENDING",
          triggerReason: `hours_milestone_${badgeType.hoursRequired ?? badgeType.tokenId}`,
        },
      });

      createdClaimIds.push(claim.id);

      // Notify the volunteer about the new badge availability
      const displayName =
        BADGE_METADATA[badgeType.tokenId as keyof typeof BADGE_METADATA]?.name ??
        badgeType.nameIt;

      await createNotification(
        volunteer.userId,
        "badge_available",
        "Nuovo badge disponibile!",
        `Hai sbloccato il badge "${displayName}". Riscattalo ora nel tuo profilo!`,
        { claimId: claim.id, badgeTypeId: badgeType.id, tokenId: badgeType.tokenId },
      ).catch((err) => {
        console.error(
          `[badge.service] Failed to send notification for claim ${claim.id}:`,
          err,
        );
      });
    } catch (error) {
      // The unique constraint will reject duplicates created by concurrent calls.
      // This is expected behaviour — silently skip.
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        continue;
      }
      throw error;
    }
  }

  return createdClaimIds;
}

// ---------------------------------------------------------------------------
// getVolunteerBadges
// ---------------------------------------------------------------------------

/**
 * Return every badge type with its claim/mint status for a given volunteer.
 * Badge types that the volunteer has not earned yet are included with
 * `claimed: false` and no claim information, so the frontend can render
 * the full progression.
 */
export async function getVolunteerBadges(
  volunteerId: string,
): Promise<BadgeWithClaim[]> {
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
  });

  if (!volunteer) {
    throw new NotFoundError(`Volontario ${volunteerId} non trovato`);
  }

  // Load all active badge types and the volunteer's claims + minted badges
  const [badgeTypes, claims, mintedBadges] = await Promise.all([
    prisma.badgeType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.badgeClaim.findMany({
      where: { volunteerId },
    }),
    prisma.mintedBadge.findMany({
      where: { volunteerId },
    }),
  ]);

  // Index claims and minted badges by badgeTypeId for fast lookup
  const claimByBadgeType = new Map(claims.map((c) => [c.badgeTypeId, c]));
  const mintByBadgeType = new Map(mintedBadges.map((m) => [m.badgeTypeId, m]));

  return badgeTypes.map((bt) => {
    const claim = claimByBadgeType.get(bt.id);
    const minted = mintByBadgeType.get(bt.id);

    return {
      id: bt.id,
      tokenId: bt.tokenId,
      name: bt.name,
      nameIt: bt.nameIt,
      description: bt.description,
      descriptionIt: bt.descriptionIt,
      category: bt.category,
      imageUrl: bt.imageUrl,
      hoursRequired: bt.hoursRequired ? Number(bt.hoursRequired) : null,
      claimed: claim?.status === "CLAIMED",
      claimId: claim?.id,
      claimStatus: claim?.status,
      mintedAt: minted?.mintedAt ?? null,
      transactionHash: minted?.transactionHash ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// claimBadge
// ---------------------------------------------------------------------------

/**
 * Transition a PENDING BadgeClaim to CLAIMED.
 *
 * This creates the MintedBadge record with status PENDING (ready for on-chain
 * minting), sets the claim status to CLAIMED, and returns the minted badge ID
 * so the caller can kick off the minting pipeline.
 */
export async function claimBadge(
  claimId: string,
  walletAddress: string,
): Promise<{ mintedBadgeId: string; claimId: string }> {
  if (!walletAddress || !walletAddress.startsWith("0x")) {
    throw new ValidationError("Indirizzo wallet non valido");
  }

  const claim = await prisma.badgeClaim.findUnique({
    where: { id: claimId },
    include: { badgeType: true, volunteer: true },
  });

  if (!claim) {
    throw new NotFoundError(`Richiesta badge ${claimId} non trovata`);
  }

  if (claim.status !== "PENDING") {
    throw new ConflictError(
      `Richiesta badge non è in stato PENDING (stato attuale: ${claim.status})`,
    );
  }

  if (claim.expiresAt && claim.expiresAt < new Date()) {
    // Auto-expire the claim
    await prisma.badgeClaim.update({
      where: { id: claimId },
      data: { status: "EXPIRED" },
    });
    throw new ValidationError("Richiesta badge scaduta");
  }

  // Perform the claim + MintedBadge creation atomically
  const result = await prisma.$transaction(async (tx) => {
    const updatedClaim = await tx.badgeClaim.update({
      where: { id: claimId },
      data: {
        status: "CLAIMED",
        claimedAt: new Date(),
      },
    });

    const mintedBadge = await tx.mintedBadge.create({
      data: {
        volunteerId: claim.volunteerId,
        badgeTypeId: claim.badgeTypeId,
        claimId: updatedClaim.id,
        walletAddress,
        onChainTokenId: claim.badgeType.tokenId,
        mintStatus: "PENDING",
      },
    });

    return mintedBadge;
  });

  return { mintedBadgeId: result.id, claimId: claim.id };
}
