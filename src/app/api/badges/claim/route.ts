import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { claimBadgeSchema } from "@/lib/validators";
import { claimBadge } from "@/services/badge.service";
import { mintBadgeOnChain } from "@/services/minting.service";
import { errorResponse, ValidationError } from "@/lib/errors";

/**
 * POST /api/badges/claim
 *
 * Claims a pending badge for the authenticated volunteer and triggers
 * on-chain minting as a fire-and-forget background operation.
 *
 * Request body: { claimId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user.volunteerId) {
      throw new ValidationError(
        "Profilo volontario non trovato. Completa l'onboarding prima di riscattare badge.",
      );
    }

    // Validate request body
    const body = await request.json();
    const parsed = claimBadgeSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    // Claim the badge (transitions from PENDING -> CLAIMED and creates MintedBadge)
    const result = await claimBadge(parsed.data.claimId, user.walletAddress);

    // Fire-and-forget: trigger on-chain minting
    // We don't await this because the on-chain transaction can take time.
    // The frontend polls for mint status updates.
    mintBadgeOnChain(result.mintedBadgeId).catch((err) => {
      console.error(
        `[badges/claim] Fire-and-forget minting failed for mintedBadge ${result.mintedBadgeId}:`,
        err,
      );
    });

    return Response.json(
      {
        data: {
          claimId: result.claimId,
          mintedBadgeId: result.mintedBadgeId,
          status: "CLAIMED",
          message: "Badge riscattato con successo. Il minting on-chain e' in corso.",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
