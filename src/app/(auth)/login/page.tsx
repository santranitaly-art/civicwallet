"use client";

import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { ConnectButton } from "thirdweb/react";
import { useEffect } from "react";
import { Shield } from "lucide-react";
import { getClient, civicWallets } from "@/lib/thirdweb";

export default function LoginPage() {
  const router = useRouter();
  const account = useActiveAccount();

  useEffect(() => {
    if (account?.address) {
      // Check if user has completed onboarding
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.displayName) {
            router.replace("/dashboard");
          } else {
            router.replace("/onboarding");
          }
        })
        .catch(() => {
          router.replace("/onboarding");
        });
    }
  }, [account, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-civic-blue via-indigo-900 to-slate-900 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <Shield className="h-12 w-12 text-civic-gold" />
          </div>
          <h1 className="text-2xl font-bold text-white">CivicWallet</h1>
          <p className="mt-2 text-sm text-slate-400">
            Accedi al tuo portafoglio di merito civico
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-6 text-center text-lg font-semibold text-white">
            Accedi o registrati
          </h2>

          <div className="flex justify-center">
            <ConnectButton
              client={getClient()}
              wallets={civicWallets}
              appMetadata={{
                name: "CivicWallet",
                url: "https://civicwallet.vercel.app",
              }}
              connectButton={{
                label: "Accedi con Email o Social",
                style: {
                  width: "100%",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  backgroundColor: "#f9a825",
                  color: "#1a237e",
                },
              }}
            />
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-500">
                accesso sicuro
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <p className="text-center text-xs text-slate-400">
              Nessuna password richiesta. Accedi tramite email magica,
              Google, Apple o altri metodi supportati.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Continuando, accetti i nostri{" "}
          <a href="/terms" className="text-slate-400 underline hover:text-white">
            Termini di servizio
          </a>{" "}
          e la{" "}
          <a href="/privacy" className="text-slate-400 underline hover:text-white">
            Privacy policy
          </a>
        </p>
      </div>
    </div>
  );
}
