import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { UserRole } from "@prisma/client";

/**
 * Authenticated user object returned by getAuthUser.
 */
export interface AuthUser {
  id: string;
  walletAddress: string;
  role: UserRole;
  displayName: string | null;
  email: string | null;
  volunteerId: string | null;
  merchantId: string | null;
}

/**
 * Extract the authenticated user from the request.
 *
 * Auth strategy (simplified Thirdweb Auth pattern):
 *  1. Check the `x-wallet-address` header (set by Thirdweb Auth middleware).
 *  2. Fall back to the `thirdweb_auth_token` cookie.
 *  3. Look up the user in the database by wallet address.
 *
 * Throws UnauthorizedError if no valid session is found.
 */
export async function getAuthUser(request: Request): Promise<AuthUser> {
  // 1. Try header first (set by auth middleware / proxy)
  let walletAddress = request.headers.get("x-wallet-address");

  // 2. Fall back to cookie-based auth
  if (!walletAddress) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("thirdweb_auth_token");
    if (authToken?.value) {
      // In a full implementation this would verify the JWT from Thirdweb Auth.
      // For now we extract the wallet address that was embedded in the cookie
      // by the Thirdweb Auth middleware.
      try {
        const payload = JSON.parse(
          Buffer.from(authToken.value.split(".")[1], "base64").toString(),
        );
        walletAddress = payload.sub ?? payload.address ?? null;
      } catch {
        // Malformed token
      }
    }
  }

  if (!walletAddress) {
    throw new UnauthorizedError("Sessione non valida. Effettua il login con il tuo wallet.");
  }

  // Normalize to lowercase for consistent lookups
  const normalized = walletAddress.toLowerCase();

  // 3. Look up user in the database
  const user = await prisma.user.findFirst({
    where: {
      walletAddress: {
        equals: normalized,
        mode: "insensitive",
      },
    },
    include: {
      volunteer: { select: { id: true } },
      merchant: { select: { id: true } },
    },
  });

  if (!user) {
    throw new UnauthorizedError("Utente non trovato. Completa la registrazione.");
  }

  if (!user.isActive) {
    throw new ForbiddenError("Account disattivato.");
  }

  return {
    id: user.id,
    walletAddress: user.walletAddress,
    role: user.role,
    displayName: user.displayName,
    email: user.email,
    volunteerId: user.volunteer?.id ?? null,
    merchantId: user.merchant?.id ?? null,
  };
}

/**
 * Require the authenticated user to have PLATFORM_ADMIN role.
 */
export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (user.role !== "PLATFORM_ADMIN") {
    throw new ForbiddenError("Accesso riservato agli amministratori della piattaforma.");
  }
  return user;
}

/**
 * Require the authenticated user to have MERCHANT role.
 */
export async function requireMerchant(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (user.role !== "MERCHANT") {
    throw new ForbiddenError("Accesso riservato ai commercianti.");
  }
  return user;
}

/**
 * Require the authenticated user to have VOLUNTEER role.
 */
export async function requireVolunteer(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (user.role !== "VOLUNTEER") {
    throw new ForbiddenError("Accesso riservato ai volontari.");
  }
  return user;
}

/**
 * Require the authenticated user to have one of the specified roles.
 */
export async function requireRole(
  request: Request,
  roles: UserRole[],
): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!roles.includes(user.role)) {
    throw new ForbiddenError("Non hai i permessi per accedere a questa risorsa.");
  }
  return user;
}
