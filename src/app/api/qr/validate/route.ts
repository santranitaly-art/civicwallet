import { NextRequest } from "next/server";
import { getAuthUser, requireMerchant } from "@/lib/auth";
import { qrValidateSchema } from "@/lib/validators";
import { validateQRToken } from "@/services/qr.service";
import { getDiscountRules } from "@/services/merchant.service";
import { prisma } from "@/lib/prisma";
import { errorResponse, ValidationError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/qr/validate
 *
 * Validate a QR token presented by a volunteer. Requires MERCHANT role.
 *
 * Steps:
 *  1. Validate the QR token (JWT signature, expiration, single-use).
 *  2. Load the badge information for the volunteer's token IDs.
 *  3. Match against the merchant's active discount rules.
 *  4. Return badge info and applicable discounts.
 *
 * Request body: { token: string }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireMerchant(request);

    // Rate limit per merchant to prevent brute-force scanning
    if (!rateLimit(`qr:validate:${user.walletAddress}`, 30, 60_000)) {
      return Response.json(
        { error: "Troppe richieste. Riprova tra qualche minuto.", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = qrValidateSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    // 1. Validate the QR token
    const qrResult = await validateQRToken(parsed.data.token);

    // 2. Load badge type information for the volunteer's badge token IDs
    const badgeTypes = await prisma.badgeType.findMany({
      where: {
        tokenId: { in: qrResult.badges },
        isActive: true,
      },
      select: {
        id: true,
        tokenId: true,
        name: true,
        nameIt: true,
        category: true,
        imageUrl: true,
      },
    });

    // 3. Load the merchant's active discount rules
    if (!user.merchantId) {
      throw new ValidationError("Profilo commerciante non trovato.");
    }

    const discountRules = await getDiscountRules(user.merchantId, true);

    // 4. Match badge types to applicable discount rules
    const badgeTypeIds = new Set(badgeTypes.map((bt) => bt.id));
    const applicableDiscounts = discountRules
      .filter((rule) => {
        // Rule must match one of the volunteer's badges
        if (!badgeTypeIds.has(rule.badgeTypeId)) return false;
        // Rule must not be expired
        if (rule.validUntil && new Date(rule.validUntil) < new Date()) return false;
        return true;
      })
      .map((rule) => ({
        discountRuleId: rule.id,
        badgeTypeId: rule.badgeTypeId,
        badgeName: rule.badgeType?.nameIt ?? rule.badgeType?.name ?? "Badge",
        discountPercent: rule.discountPercent,
        description: rule.descriptionIt ?? rule.description,
        validUntil: rule.validUntil,
      }));

    return Response.json({
      data: {
        valid: true,
        volunteer: {
          wallet: qrResult.wallet,
          volunteerId: qrResult.volunteerId,
          displayName: qrResult.volunteerName,
        },
        badges: badgeTypes.map((bt) => ({
          tokenId: bt.tokenId,
          name: bt.name,
          nameIt: bt.nameIt,
          category: bt.category,
          imageUrl: bt.imageUrl,
        })),
        applicableDiscounts,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
