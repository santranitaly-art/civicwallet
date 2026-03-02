/**
 * CivicWallet Runtime Configuration
 *
 * Centralises environment-variable reading so every service can import
 * a single, type-safe helper instead of reaching into `process.env`
 * directly.
 */

// ---------------------------------------------------------------------------
// CIVICWALLET_MODE — Shadow / Active
// ---------------------------------------------------------------------------
// In "shadow" mode the platform receives and validates webhooks, writes
// audit logs and activity records, but NEVER triggers on-chain minting.
// This allows you to battle-test the full pipeline (HMAC, payload mapping,
// DB writes) in production without spending gas or polluting the chain.
//
// Set CIVICWALLET_MODE="shadow" in .env.local during initial rollout,
// then switch to "active" once everything is stable.
// ---------------------------------------------------------------------------

export type CivicWalletMode = "shadow" | "active";

const VALID_MODES: ReadonlySet<string> = new Set(["shadow", "active"]);

/**
 * Returns the current runtime mode.
 * Defaults to `"active"` if the env variable is not set.
 */
export function getCivicWalletMode(): CivicWalletMode {
    const raw = (process.env.CIVICWALLET_MODE ?? "active").toLowerCase().trim();
    if (!VALID_MODES.has(raw)) {
        console.warn(
            `[config] Invalid CIVICWALLET_MODE="${raw}", falling back to "active"`,
        );
        return "active";
    }
    return raw as CivicWalletMode;
}

/**
 * Convenience predicate — `true` when minting is disabled.
 */
export function isShadowMode(): boolean {
    return getCivicWalletMode() === "shadow";
}
