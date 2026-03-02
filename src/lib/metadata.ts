import { BADGE_METADATA } from "./constants";

interface ERC1155Metadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  properties: Record<string, unknown>;
}

/**
 * Generate ERC-1155 metadata JSON for a badge token ID
 */
export function generateBadgeMetadata(
  tokenId: number,
  badgeData?: {
    name: string;
    description: string;
    category: string;
    hoursRequired?: number | null;
    imageUrl: string;
  },
): ERC1155Metadata | null {
  const display = BADGE_METADATA[tokenId as keyof typeof BADGE_METADATA];
  if (!display && !badgeData) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://civicwallet.vercel.app";

  return {
    name: badgeData?.name || display?.name || `CivicWallet Badge #${tokenId}`,
    description: badgeData?.description || "",
    image: badgeData?.imageUrl
      ? `${appUrl}${badgeData.imageUrl}`
      : `${appUrl}/badges/badge-${tokenId}.svg`,
    attributes: [
      {
        trait_type: "Category",
        value: badgeData?.category || "Unknown",
      },
      ...(badgeData?.hoursRequired
        ? [
            {
              trait_type: "Hours Required",
              display_type: "number" as const,
              value: badgeData.hoursRequired,
            },
          ]
        : []),
    ],
    properties: {
      soulbound: true,
      non_monetary: true,
      issuer: "CivicWallet",
      country: "IT",
    },
  };
}
