import { NextRequest } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth";
import { createAssociationSchema } from "@/lib/validators";
import {
  listAssociations,
  createAssociation,
} from "@/services/association.service";
import { errorResponse, ValidationError } from "@/lib/errors";

/**
 * GET /api/associations
 *
 * List all associations. Accessible by any authenticated user.
 * Supports pagination and filtering by active status.
 *
 * Query params:
 * - page (default: 1)
 * - limit (default: 50, max: 100)
 * - activeOnly (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const result = await listAssociations({ activeOnly, page, limit });

    return Response.json({
      data: result.associations,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/associations
 *
 * Create a new association. Requires PLATFORM_ADMIN role.
 *
 * Request body: {
 *   name: string,
 *   fiscalCode: string (11 chars),
 *   city: string,
 *   province: string (2 chars),
 *   region: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request);

    const body = await request.json();
    const parsed = createAssociationSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const association = await createAssociation(parsed.data);

    return Response.json(
      { data: association },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
