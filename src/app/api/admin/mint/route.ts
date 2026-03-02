import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { manualMintSchema } from "@/lib/validators";
import { mintBadgeOnChain } from "@/services/minting.service";
import { errorResponse, NotFoundError, ValidationError, ConflictError } from "@/lib/errors";

/**
 * POST /api/admin/mint
 *
 * Manually mint a badge for a volunteer. Requires PLATFORM_ADMIN role.
 * This bypasses the normal claim flow and directly creates a MintedBadge
 * record, then triggers on-chain minting.
 *
 * Use cases:
 * - Admin correcting missed eligibility
 * - Special/honorary badges (HERO_EVENT, MENTOR)
 * - Retry failed mints
 *
 * Request body: {
 *   volunteerId: string,
 *   badgeTokenId: number,
 *   reason: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const body = await request.json();
    const parsed = manualMintSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const { volunteerId, badgeTokenId, reason } = parsed.data;

    // 1. Verify the volunteer exists
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: {
        user: { select: { walletAddress: true, displayName: true } },
      },
    });

    if (!volunteer) {
      throw new NotFoundError("Volontario non trovato");
    }

    // 2. Verify the badge type exists
    const badgeType = await prisma.badgeType.findUnique({
      where: { tokenId: badgeTokenId },
    });

    if (!badgeType) {
      throw new NotFoundError(`Badge con tokenId ${badgeTokenId} non trovato`);
    }

    // 3. Check if the volunteer already has this badge minted (CONFIRMED or SUBMITTED)
    const existingMint = await prisma.mintedBadge.findUnique({
      where: {
        volunteerId_badgeTypeId: {
          volunteerId,
          badgeTypeId: badgeType.id,
        },
      },
    });

    if (existingMint) {
      if (existingMint.mintStatus === "CONFIRMED") {
        throw new ConflictError(
          `Il volontario possiede gia' questo badge (tx: ${existingMint.transactionHash})`,
        );
      }

      if (existingMint.mintStatus === "SUBMITTED") {
        throw new ConflictError(
          "Una transazione di minting e' gia' in corso per questo badge.",
        );
      }

      // If PENDING or FAILED, we can retry the mint
      if (existingMint.mintStatus === "FAILED" || existingMint.mintStatus === "PENDING") {
        // Trigger re-mint of the existing record
        const result = await mintBadgeOnChain(existingMint.id);

        return Response.json({
          data: {
            mintedBadgeId: result.mintedBadgeId,
            transactionHash: result.transactionHash,
            status: "RETRY_SUBMITTED",
            message: "Mint riprovato per badge precedentemente fallito.",
          },
        });
      }
    }

    // 4. Create a BadgeClaim (admin-triggered) and MintedBadge atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create the claim record
      const claim = await tx.badgeClaim.create({
        data: {
          volunteerId,
          badgeTypeId: badgeType.id,
          status: "CLAIMED",
          triggerReason: `manual_admin:${reason}`,
          claimedAt: new Date(),
        },
      });

      // Create the minted badge record
      const mintedBadge = await tx.mintedBadge.create({
        data: {
          volunteerId,
          badgeTypeId: badgeType.id,
          claimId: claim.id,
          walletAddress: volunteer.user.walletAddress,
          onChainTokenId: badgeType.tokenId,
          mintStatus: "PENDING",
        },
      });

      return { claimId: claim.id, mintedBadgeId: mintedBadge.id };
    });

    // 5. Trigger on-chain minting (fire and forget)
    mintBadgeOnChain(result.mintedBadgeId).catch((err) => {
      console.error(
        `[admin/mint] Fire-and-forget minting failed for mintedBadge ${result.mintedBadgeId}:`,
        err,
      );
    });

    return Response.json(
      {
        data: {
          claimId: result.claimId,
          mintedBadgeId: result.mintedBadgeId,
          volunteerId,
          badgeTokenId,
          volunteerName: volunteer.user.displayName,
          walletAddress: volunteer.user.walletAddress,
          reason,
          initiatedBy: admin.walletAddress,
          status: "MINT_INITIATED",
          message: "Minting manuale avviato con successo.",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
