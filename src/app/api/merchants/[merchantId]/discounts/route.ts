import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createDiscountRuleSchema } from "@/lib/validators";
import {
  getDiscountRules,
  createDiscountRule,
} from "@/services/merchant.service";
import { errorResponse, ForbiddenError, ValidationError } from "@/lib/errors";

/**
 * GET /api/merchants/[merchantId]/discounts
 *
 * List discount rules for a specific merchant.
 * Accessible by any authenticated user (volunteers browse discounts).
 *
 * Query params:
 * - activeOnly (default: true; merchants/admins can set false to see inactive)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    const { merchantId } = await params;

    const { searchParams } = new URL(request.url);

    // Only the merchant themselves or admins can see inactive discount rules
    const isSelf = user.merchantId === merchantId;
    const isAdmin = user.role === "PLATFORM_ADMIN";
    const activeOnly = (isSelf || isAdmin)
      ? searchParams.get("activeOnly") !== "false"
      : true;

    const rules = await getDiscountRules(merchantId, activeOnly);

    return Response.json({ data: rules });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/merchants/[merchantId]/discounts
 *
 * Create a new discount rule for a merchant. Accessible by:
 * - The merchant themselves
 * - Platform admins
 *
 * Request body: {
 *   badgeTypeId: string,
 *   discountPercent: number (1-100),
 *   description: string,
 *   descriptionIt: string,
 *   validUntil?: string (ISO datetime),
 *   maxRedemptions?: number
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    const { merchantId } = await params;

    // Authorization: only the merchant themselves or admins
    const isSelf = user.merchantId === merchantId;
    const isAdmin = user.role === "PLATFORM_ADMIN";

    if (!isSelf && !isAdmin) {
      throw new ForbiddenError(
        "Non hai i permessi per creare regole sconto per questo commerciante.",
      );
    }

    const body = await request.json();
    const parsed = createDiscountRuleSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const discountRule = await createDiscountRule(merchantId, parsed.data);

    return Response.json(
      { data: discountRule },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
