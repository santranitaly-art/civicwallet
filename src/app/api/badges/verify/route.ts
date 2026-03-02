import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, NotFoundError, ValidationError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const verifyBadgeSchema = z.object({
  walletAddress: z.string().startsWith("0x").min(42).max(42),
  tokenId: z.number().int().positive(),
});

/**
 * POST /api/badges/verify
 *
 * Public endpoint used by QR validation and external verifiers to check
 * whether a specific wallet address owns a specific badge token.
 *
 * This checks the database for a CONFIRMED MintedBadge record.
 * For stronger verification, callers can cross-reference the
 * returned transactionHash on-chain.
 *
 * Request body: { walletAddress: string, tokenId: number }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP since this is a public endpoint
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!rateLimit(`badges:verify:${ip}`, 30, 60_000)) {
      return Response.json(
        { error: "Troppe richieste", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = verifyBadgeSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const { walletAddress, tokenId } = parsed.data;

    // Look up the minted badge by wallet address and on-chain token ID
    const mintedBadge = await prisma.mintedBadge.findFirst({
      where: {
        walletAddress: {
          equals: walletAddress,
          mode: "insensitive",
        },
        onChainTokenId: tokenId,
        mintStatus: "CONFIRMED",
      },
      include: {
        badgeType: {
          select: {
            name: true,
            nameIt: true,
            description: true,
            descriptionIt: true,
            category: true,
            imageUrl: true,
            hoursRequired: true,
          },
        },
        volunteer: {
          include: {
            user: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!mintedBadge) {
      return Response.json({
        data: {
          verified: false,
          walletAddress,
          tokenId,
          message: "Badge non trovato per questo indirizzo wallet e token ID.",
        },
      });
    }

    return Response.json({
      data: {
        verified: true,
        walletAddress,
        tokenId,
        transactionHash: mintedBadge.transactionHash,
        mintedAt: mintedBadge.mintedAt,
        badge: {
          name: mintedBadge.badgeType.name,
          nameIt: mintedBadge.badgeType.nameIt,
          description: mintedBadge.badgeType.description,
          descriptionIt: mintedBadge.badgeType.descriptionIt,
          category: mintedBadge.badgeType.category,
          imageUrl: mintedBadge.badgeType.imageUrl,
          hoursRequired: mintedBadge.badgeType.hoursRequired
            ? Number(mintedBadge.badgeType.hoursRequired)
            : null,
        },
        volunteer: {
          displayName: mintedBadge.volunteer.user.displayName,
        },
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
