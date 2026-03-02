export type { BadgeType, Volunteer, User, Merchant, Association } from "@prisma/client";
export type { UserRole, BadgeCategory, ClaimStatus, MintStatus, WebhookStatus } from "@prisma/client";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface BadgeWithClaim {
  id: string;
  tokenId: number;
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  category: string;
  imageUrl: string;
  hoursRequired: number | null;
  claimed: boolean;
  claimId?: string;
  claimStatus?: string;
  mintedAt?: Date | null;
  transactionHash?: string | null;
}

export interface VolunteerProfile {
  id: string;
  displayName: string | null;
  walletAddress: string;
  email: string | null;
  totalHours: number;
  totalShifts: number;
  associationName: string | null;
  badges: BadgeWithClaim[];
  nextMilestone: {
    name: string;
    hoursRequired: number;
    hoursRemaining: number;
    progress: number;
  } | null;
}

export interface MerchantDashboard {
  totalRedemptions: number;
  activeDiscounts: number;
  recentRedemptions: Array<{
    id: string;
    volunteerWallet: string;
    discountPercent: number;
    badgeName: string;
    redeemedAt: Date;
  }>;
}

export interface PlatformAnalytics {
  totalVolunteers: number;
  totalBadgesMinted: number;
  totalHoursLogged: number;
  totalAssociations: number;
  totalMerchants: number;
  badgesPerCategory: Record<string, number>;
  recentMints: Array<{
    id: string;
    badgeName: string;
    volunteerName: string | null;
    mintedAt: Date | null;
  }>;
}
