"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const account = useActiveAccount();

  useEffect(() => {
    // Give Thirdweb a moment to restore the session
    const timeout = setTimeout(() => {
      if (!account) {
        router.replace("/login");
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [account, router]);

  if (!account) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">
            Verifica autenticazione...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
