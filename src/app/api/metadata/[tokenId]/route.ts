import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBadgeMetadata } from "@/lib/metadata";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/metadata/[tokenId]
 *
 * Public endpoint returning ERC-1155 metadata JSON for a given badge token ID.
 * This is the URI that the CivicBadge smart contract points to.
 *
 * Returns a standard ERC-1155 metadata JSON object with:
 * - name, description, image
 * - attributes (category, hours required)
 * - properties (soulbound, non_monetary, issuer, country)
 *
 * Responses are cached for performance.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> },
) {
  // Rate limit by IP since this is a public endpoint
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`metadata:${ip}`, 120, 60_000)) {
    return Response.json(
      { error: "Troppe richieste", code: "RATE_LIMITED" },
      { status: 429 },
    );
  }

  const { tokenId: tokenIdStr } = await params;
  const tokenId = Number(tokenIdStr);

  if (isNaN(tokenId) || tokenId < 1 || !Number.isInteger(tokenId)) {
    return Response.json(
      { error: "Token ID non valido. Deve essere un intero positivo." },
      { status: 400 },
    );
  }

  // Look up the badge type from the database
  const badgeType = await prisma.badgeType.findUnique({
    where: { tokenId },
    select: {
      name: true,
      description: true,
      category: true,
      hoursRequired: true,
      imageUrl: true,
      isActive: true,
    },
  });

  // Generate metadata (works even without DB record, using fallback constants)
  const metadata = generateBadgeMetadata(
    tokenId,
    badgeType
      ? {
          name: badgeType.name,
          description: badgeType.description,
          category: badgeType.category,
          hoursRequired: badgeType.hoursRequired
            ? Number(badgeType.hoursRequired)
            : null,
          imageUrl: badgeType.imageUrl,
        }
      : undefined,
  );

  if (!metadata) {
    return Response.json(
      { error: `Metadata non trovata per token ID ${tokenId}` },
      { status: 404 },
    );
  }

  // Return JSON with cache headers for CDN/browser caching.
  // Badge metadata is mostly static, so a generous cache is appropriate.
  return new Response(JSON.stringify(metadata), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
