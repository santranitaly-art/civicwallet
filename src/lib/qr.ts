import { SignJWT, jwtVerify } from "jose";
import { QR_EXPIRY_MINUTES } from "./constants";

const secret = new TextEncoder().encode(
  process.env.QR_JWT_SECRET || "development-secret-change-me",
);

export interface QRPayload {
  wallet: string;
  badges: number[];
  volunteerId: string;
}

/**
 * Generate a signed, time-limited QR token
 */
export async function generateQRToken(payload: QRPayload): Promise<string> {
  return new SignJWT({
    wallet: payload.wallet,
    badges: payload.badges,
    volunteerId: payload.volunteerId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${QR_EXPIRY_MINUTES}m`)
    .setJti(crypto.randomUUID())
    .sign(secret);
}

/**
 * Verify and decode a QR token
 */
export async function verifyQRToken(
  token: string,
): Promise<QRPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      wallet: payload.wallet as string,
      badges: payload.badges as number[],
      volunteerId: payload.volunteerId as string,
    };
  } catch {
    return null;
  }
}
