"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/dashboard",
}: RoleGuardProps) {
  const router = useRouter();
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function checkRole() {
      if (!account?.address) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`/api/auth/me`);
        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = await res.json();
        if (allowedRoles.includes(data.data?.role)) {
          setIsAuthorized(true);
        } else {
          router.replace(redirectTo);
        }
      } catch {
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    checkRole();
  }, [account, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">
            Verifica permessi...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
