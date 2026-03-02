import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { qrGenerateSchema } from "@/lib/validators";
import { createQRToken } from "@/services/qr.service";
import { errorResponse, ValidationError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/qr/generate
 *
 * Generate a signed, time-limited QR token that a volunteer can present
 * to a merchant for badge-based discount redemption.
 *
 * Requires authentication as a volunteer with at least one confirmed badge.
 *
 * Request body: { badgeTokenIds: number[] }
 *
 * Returns: { token: string, expiresAt: string }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    // Rate limit by wallet to prevent abuse
    if (!rateLimit(`qr:generate:${user.walletAddress}`, 10, 60_000)) {
      return Response.json(
        { error: "Troppe richieste. Riprova tra qualche minuto.", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }

    if (!user.volunteerId) {
      throw new ValidationError(
        "Profilo volontario non trovato. Completa l'onboarding per generare codici QR.",
      );
    }

    const body = await request.json();
    const parsed = qrGenerateSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        `Dati non validi: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const result = await createQRToken(
      user.volunteerId,
      user.walletAddress,
      parsed.data.badgeTokenIds,
    );

    return Response.json({
      data: {
        token: result.token,
        expiresAt: result.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
