import { prisma } from "@/lib/prisma";
import { generateQRToken, verifyQRToken, type QRPayload } from "@/lib/qr";
import { QR_EXPIRY_MINUTES } from "@/lib/constants";
import { NotFoundError, ValidationError, AppError } from "@/lib/errors";

// ---------------------------------------------------------------------------
// createQRToken
// ---------------------------------------------------------------------------

/**
 * Generate a signed, time-limited QR token that a volunteer can present to
 * a merchant for badge-based discount redemption.
 *
 * Steps:
 *  1. Validate the volunteer exists and owns the specified badges on-chain.
 *  2. Sign a JWT containing the wallet address and badge token IDs.
 *  3. Persist the token in the database for single-use enforcement.
 *  4. Return the signed token string.
 */
export async function createQRToken(
  volunteerId: string,
  walletAddress: string,
  badgeTokenIds: number[],
): Promise<{ token: string; expiresAt: Date }> {
  if (!walletAddress || !walletAddress.startsWith("0x")) {
    throw new ValidationError("Indirizzo wallet non valido");
  }

  if (!badgeTokenIds.length) {
    throw new ValidationError("Seleziona almeno un badge da mostrare");
  }

  // Verify the volunteer exists
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
    include: {
      user: { select: { walletAddress: true } },
    },
  });

  if (!volunteer) {
    throw new NotFoundError("Volontario non trovato");
  }

  // Verify the wallet matches the volunteer's user wallet
  if (volunteer.user.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new ValidationError("L'indirizzo wallet non corrisponde al profilo volontario");
  }

  // Verify that the volunteer has minted badges for the requested token IDs
  const mintedBadges = await prisma.mintedBadge.findMany({
    where: {
      volunteerId,
      onChainTokenId: { in: badgeTokenIds },
      mintStatus: "CONFIRMED",
    },
    select: { onChainTokenId: true },
  });

  const confirmedTokenIds = new Set(mintedBadges.map((mb) => mb.onChainTokenId));
  const missingTokenIds = badgeTokenIds.filter((id) => !confirmedTokenIds.has(id));

  if (missingTokenIds.length > 0) {
    throw new ValidationError(
      `I seguenti badge non sono stati confermati on-chain: ${missingTokenIds.join(", ")}`,
    );
  }

  // Generate the signed JWT
  const payload: QRPayload = {
    wallet: walletAddress,
    badges: badgeTokenIds,
    volunteerId,
  };

  const token = await generateQRToken(payload);
  const expiresAt = new Date(Date.now() + QR_EXPIRY_MINUTES * 60 * 1000);

  // Persist for single-use tracking
  await prisma.qRToken.create({
    data: {
      volunteerId,
      token,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

// ---------------------------------------------------------------------------
// validateQRToken
// ---------------------------------------------------------------------------

/**
 * Validate a QR token presented by a volunteer to a merchant.
 *
 * Verification steps:
 *  1. Verify the JWT signature and expiration.
 *  2. Look up the token in the database.
 *  3. Ensure it has not already been used (single-use).
 *  4. Mark it as used.
 *  5. Return the decoded payload.
 */
export async function validateQRToken(token: string): Promise<{
  wallet: string;
  badges: number[];
  volunteerId: string;
  volunteerName: string | null;
}> {
  if (!token) {
    throw new ValidationError("Token QR mancante");
  }

  // 1. Verify JWT signature and expiration
  const decoded = await verifyQRToken(token);

  if (!decoded) {
    throw new ValidationError("Token QR non valido o scaduto");
  }

  // 2. Look up in database
  const dbToken = await prisma.qRToken.findUnique({
    where: { token },
    include: {
      volunteer: {
        include: {
          user: { select: { displayName: true, walletAddress: true } },
        },
      },
    },
  });

  if (!dbToken) {
    throw new NotFoundError("Token QR non riconosciuto");
  }

  // 3. Check if already used
  if (dbToken.usedAt) {
    throw new ValidationError("Token QR già utilizzato");
  }

  // 4. Check database-level expiration (belt and suspenders with JWT exp)
  if (dbToken.expiresAt < new Date()) {
    throw new ValidationError("Token QR scaduto");
  }

  // 5. Mark as used atomically
  await prisma.qRToken.update({
    where: { id: dbToken.id },
    data: { usedAt: new Date() },
  });

  return {
    wallet: decoded.wallet,
    badges: decoded.badges,
    volunteerId: decoded.volunteerId,
    volunteerName: dbToken.volunteer.user.displayName,
  };
}

// ---------------------------------------------------------------------------
// revokeQRToken
// ---------------------------------------------------------------------------

/**
 * Revoke / invalidate a QR token before it expires.
 * Useful if a volunteer navigates away from the QR screen.
 */
export async function revokeQRToken(
  tokenId: string,
  volunteerId: string,
): Promise<void> {
  const dbToken = await prisma.qRToken.findUnique({
    where: { id: tokenId },
  });

  if (!dbToken) {
    throw new NotFoundError("Token QR non trovato");
  }

  if (dbToken.volunteerId !== volunteerId) {
    throw new ValidationError("Token QR non appartiene a questo volontario");
  }

  if (dbToken.usedAt) {
    // Already used — nothing to revoke
    return;
  }

  // Mark as "used" to prevent future validation (effectively revoked)
  await prisma.qRToken.update({
    where: { id: tokenId },
    data: { usedAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// cleanExpiredTokens
// ---------------------------------------------------------------------------

/**
 * Housekeeping: delete QR tokens that have been expired for more than 24
 * hours.  Intended to be called from a cron job or scheduled function.
 */
export async function cleanExpiredTokens(): Promise<{ deleted: number }> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await prisma.qRToken.deleteMany({
    where: {
      expiresAt: { lt: cutoff },
    },
  });

  return { deleted: result.count };
}
