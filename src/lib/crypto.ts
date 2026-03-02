import { createHmac, createHash } from "crypto";

/**
 * Validate HMAC-SHA256 signature from webhook payloads
 */
export function validateHmac(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const computed = createHmac("sha256", secret).update(payload).digest("hex");
  // Constant-time comparison to prevent timing attacks
  if (computed.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < computed.length; i++) {
    result |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate keccak256-like hash for on-chain volunteer ID
 * Uses SHA-256 as a simpler alternative for off-chain hashing
 */
export function hashVolunteerId(volunteerId: string): string {
  return "0x" + createHash("sha256").update(volunteerId).digest("hex");
}

/**
 * Generate HMAC for webhook secret creation
 */
export function generateHmacSecret(): string {
  return createHash("sha256").update(crypto.randomUUID()).digest("hex");
}
