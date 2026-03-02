export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getVolunteerProfile } from "@/services/volunteer.service";
import { getMerchantByUserId } from "@/services/merchant.service";
import { errorResponse } from "@/lib/errors";

/**
 * GET /api/auth/me
 *
 * Returns the current authenticated user's profile information.
 * Includes role-specific data:
 * - VOLUNTEER: volunteer profile with badges and hours
 * - MERCHANT: merchant profile with discount rules
 * - PLATFORM_ADMIN: basic user info with admin flag
 * - ETS_ADMIN: basic user info with association details
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);

    // Load the full user record with all relationships
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        walletAddress: true,
        email: true,
        displayName: true,
        role: true,
        hashedId: true,
        gdprConsentAt: true,
        createdAt: true,
        isActive: true,
      },
    });

    if (!user) {
      // This should not happen since getAuthUser already validated
      return Response.json(
        { error: "Utente non trovato", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Build role-specific profile data
    let roleData: Record<string, unknown> = {};

    switch (user.role) {
      case "VOLUNTEER": {
        if (authUser.volunteerId) {
          try {
            const profile = await getVolunteerProfile(user.id);
            roleData = {
              volunteer: {
                id: profile.id,
                totalHours: profile.totalHours,
                totalShifts: profile.totalShifts,
                associationName: profile.associationName,
                badgeCount: profile.badges.filter((b) => b.claimed).length,
                nextMilestone: profile.nextMilestone,
              },
            };
          } catch {
            // Volunteer profile might not be fully set up
            roleData = { volunteer: null };
          }
        } else {
          roleData = { volunteer: null, onboardingRequired: true };
        }
        break;
      }

      case "MERCHANT": {
        const merchant = await getMerchantByUserId(user.id);
        if (merchant) {
          roleData = {
            merchant: {
              id: merchant.id,
              businessName: merchant.businessName,
              vatNumber: merchant.vatNumber,
              city: merchant.city,
              province: merchant.province,
              category: merchant.category,
              isActive: merchant.isActive,
              activeDiscounts: merchant.discountRules.length,
              totalRedemptions: merchant._count.redemptions,
            },
          };
        } else {
          roleData = { merchant: null };
        }
        break;
      }

      case "ETS_ADMIN": {
        const etsAdmin = await prisma.eTSAdmin.findUnique({
          where: { userId: user.id },
          include: {
            association: {
              select: {
                id: true,
                name: true,
                fiscalCode: true,
                city: true,
                isActive: true,
              },
            },
          },
        });

        roleData = {
          etsAdmin: etsAdmin
            ? {
              id: etsAdmin.id,
              canMint: etsAdmin.canMint,
              association: etsAdmin.association,
            }
            : null,
        };
        break;
      }

      case "PLATFORM_ADMIN": {
        roleData = { isAdmin: true };
        break;
      }
    }

    // Get unread notification count
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: user.id,
        readAt: null,
      },
    });

    return Response.json({
      data: {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        hashedId: user.hashedId,
        gdprConsentAt: user.gdprConsentAt,
        createdAt: user.createdAt,
        unreadNotifications,
        ...roleData,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
