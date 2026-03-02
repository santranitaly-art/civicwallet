import { NextRequest } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth";
import {
  getMerchantById,
  updateMerchant,
  deleteMerchant,
} from "@/services/merchant.service";
import { errorResponse, ForbiddenError, ValidationError } from "@/lib/errors";
import { z } from "zod";

const updateMerchantSchema = z.object({
  businessName: z.string().min(2).max(200).optional(),
  city: z.string().min(1).optional(),
  province: z.string().length(2).optional(),
  category: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/merchants/[merchantId]
 *
 * Get merchant details including active discount rules.
 * Accessible by any authenticated user.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    const { merchantId } = await params;

    const merchant = await getMerchantById(merchantId);

    return Response.json({ data: merchant });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/merchants/[merchantId]
 *
 * Update a merchant profile. Accessible by:
 * - The merchant themselves (limited fields: businessName, city, province, category)
 * - Platform admins (all fields including isActive)
 *
 * Request body: {
 *   businessName?: string,
 *   city?: string,
 *   province?: string,
 *   category?: string,
 *   isActive?: boolean (admin only)
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    const { merchantId } = await params;

    // Authorization: merchant can update their own profile, admins can update any
    const isSelf = user.merchantId === merchantId;
    const isAdmin = user.role === "PLATFORM_ADMIN";

    if (!isSelf && !isAdmin) {
      throw new ForbiddenError("Non hai i permessi per modificare questo commerciante.");
    }

    const body = await request.json();
    const parsed = updateMerchantSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    // Non-admin users cannot change the isActive field
    if (!isAdmin && parsed.data.isActive !== undefined) {
      throw new ForbiddenError("Solo gli amministratori possono modificare lo stato attivo.");
    }

    const updated = await updateMerchant(merchantId, parsed.data);

    return Response.json({ data: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/merchants/[merchantId]
 *
 * Soft-delete (deactivate) a merchant. Requires PLATFORM_ADMIN role.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> },
) {
  try {
    const user = await requireAdmin(request);
    const { merchantId } = await params;

    const deactivated = await deleteMerchant(merchantId);

    return Response.json({
      data: deactivated,
      message: "Commerciante disattivato con successo.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
