import { NextRequest } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth";
import {
  getAssociationById,
  updateAssociation,
  deleteAssociation,
} from "@/services/association.service";
import { errorResponse, ValidationError } from "@/lib/errors";
import { z } from "zod";

const updateAssociationSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  city: z.string().min(1).optional(),
  province: z.string().length(2).optional(),
  region: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/associations/[associationId]
 *
 * Get association details. Accessible by any authenticated user.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ associationId: string }> },
) {
  try {
    const user = await getAuthUser(request);
    const { associationId } = await params;

    const association = await getAssociationById(associationId);

    return Response.json({ data: association });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH /api/associations/[associationId]
 *
 * Update an association. Requires PLATFORM_ADMIN role.
 *
 * Request body: {
 *   name?: string,
 *   city?: string,
 *   province?: string,
 *   region?: string,
 *   isActive?: boolean
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ associationId: string }> },
) {
  try {
    const user = await requireAdmin(request);
    const { associationId } = await params;

    const body = await request.json();
    const parsed = updateAssociationSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const updated = await updateAssociation(associationId, parsed.data);

    return Response.json({ data: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/associations/[associationId]
 *
 * Soft-delete (deactivate) an association. Requires PLATFORM_ADMIN role.
 * Hard deletes are not supported to preserve referential integrity.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ associationId: string }> },
) {
  try {
    const user = await requireAdmin(request);
    const { associationId } = await params;

    const deactivated = await deleteAssociation(associationId);

    return Response.json({
      data: deactivated,
      message: "Associazione disattivata con successo.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
