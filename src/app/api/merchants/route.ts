import { NextRequest } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth";
import { createMerchantSchema } from "@/lib/validators";
import { listMerchants, createMerchant } from "@/services/merchant.service";
import { errorResponse, ValidationError } from "@/lib/errors";

/**
 * GET /api/merchants
 *
 * List all merchants. Accessible by any authenticated user.
 * Volunteers can use this to browse merchants offering badge-based discounts.
 *
 * Query params:
 * - page (default: 1)
 * - limit (default: 50, max: 100)
 * - activeOnly (default: true)
 * - city (filter by city)
 * - category (filter by category)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const city = searchParams.get("city") ?? undefined;
    const category = searchParams.get("category") ?? undefined;

    const result = await listMerchants({ activeOnly, city, category, page, limit });

    return Response.json({
      data: result.merchants,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/merchants
 *
 * Create a new merchant. Requires PLATFORM_ADMIN role.
 * The merchant is linked to an existing user account.
 *
 * Request body: {
 *   businessName: string,
 *   vatNumber: string (11 chars),
 *   city: string,
 *   province: string (2 chars),
 *   category: string,
 *   userId?: string (admin creates for a specific user)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const body = await request.json();

    // The admin must also provide the userId for the merchant
    const userId = body.userId;
    if (!userId || typeof userId !== "string") {
      throw new ValidationError("userId e' obbligatorio per creare un commerciante.");
    }

    const parsed = createMerchantSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const merchant = await createMerchant(userId, parsed.data);

    return Response.json(
      { data: merchant },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
