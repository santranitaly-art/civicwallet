"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2, XCircle } from "lucide-react";

interface BadgeClaimButtonProps {
  claimId: string;
  badgeName: string;
  onSuccess?: () => void;
}

type ClaimState = "idle" | "loading" | "success" | "error";

export function BadgeClaimButton({
  claimId,
  badgeName,
  onSuccess,
}: BadgeClaimButtonProps) {
  const [state, setState] = useState<ClaimState>("idle");
  const [error, setError] = useState("");

  async function handleClaim() {
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/badges/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante il riscatto");
      }

      setState("success");
      onSuccess?.();
    } catch (err) {
      setState("error");
      setError(
        err instanceof Error ? err.message : "Errore durante il riscatto",
      );
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl bg-civic-green/10 p-4">
        <CheckCircle2 className="h-8 w-8 text-civic-green" />
        <p className="text-sm font-medium text-civic-green">
          Badge &quot;{badgeName}&quot; in fase di conio!
        </p>
        <p className="text-xs text-muted-foreground">
          Riceverai una notifica quando sara confermato sulla blockchain.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleClaim}
        disabled={state === "loading"}
        variant="civic-gold"
        rounded="full"
        size="lg"
        className="w-full"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Riscatto in corso...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Riscatta Badge
          </>
        )}
      </Button>

      {state === "loading" && (
        <div className="space-y-2 rounded-xl bg-muted p-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-civic-gold" />
            <span>Preparazione transazione...</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span>Invio alla blockchain Polygon</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <span>Conferma minting</span>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3">
          <XCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
