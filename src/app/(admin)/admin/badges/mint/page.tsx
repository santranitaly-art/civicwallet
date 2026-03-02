"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Hammer,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BADGE_METADATA } from "@/lib/constants";

interface BadgeOption {
  tokenId: number;
  name: string;
  nameIt: string;
}

interface VolunteerOption {
  id: string;
  displayName: string | null;
  walletAddress: string;
}

export default function AdminMintPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<VolunteerOption[]>([]);
  const [badgeOptions] = useState<BadgeOption[]>(
    Object.entries(BADGE_METADATA).map(([tokenId, meta]) => ({
      tokenId: Number(tokenId),
      name: meta.name,
      nameIt: meta.name,
    })),
  );

  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [volunteerSearch, setVolunteerSearch] = useState("");

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        const params = new URLSearchParams({ limit: "100" });
        if (volunteerSearch) params.set("search", volunteerSearch);

        const res = await fetch(`/api/admin/volunteers?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setVolunteers(data.data || []);
      } catch (err) {
        console.error(err);
      }
    }

    const debounce = setTimeout(fetchVolunteers, 300);
    return () => clearTimeout(debounce);
  }, [volunteerSearch]);

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!selectedVolunteerId || !selectedTokenId || !reason) {
      setError("Compila tutti i campi");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/badges/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerId: selectedVolunteerId,
          badgeTokenId: Number(selectedTokenId),
          reason,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante il conio");
      }

      setResult({
        success: true,
        message: "Badge assegnato con successo! Il conio e stato avviato.",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante il conio",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna ai badge
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Conio manuale</h1>
        <p className="text-sm text-muted-foreground">
          Assegna un badge manualmente a un volontario
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Hammer className="h-5 w-5 text-civic-gold" />
            Nuovo conio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMint} className="space-y-4">
            {/* Volunteer Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Volontario *</label>
              <Input
                placeholder="Cerca volontario per nome..."
                value={volunteerSearch}
                onChange={(e) => setVolunteerSearch(e.target.value)}
                className="mb-2"
              />
              <select
                value={selectedVolunteerId}
                onChange={(e) => setSelectedVolunteerId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Seleziona volontario</option>
                {volunteers.map((vol) => (
                  <option key={vol.id} value={vol.id}>
                    {vol.displayName || vol.walletAddress.slice(0, 10) + "..."}
                  </option>
                ))}
              </select>
            </div>

            {/* Badge Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo badge *</label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Seleziona badge</option>
                {badgeOptions.map((badge) => (
                  <option key={badge.tokenId} value={badge.tokenId}>
                    #{badge.tokenId} - {badge.nameIt || badge.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivazione *</label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="es. Completamento corso primo soccorso"
                required
              />
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 rounded-lg bg-civic-gold/10 p-3 text-xs text-civic-gold">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                Il conio manuale avviera una transazione sulla blockchain
                Polygon. Questa operazione non e reversibile.
              </span>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Success */}
            {result?.success && (
              <div className="flex items-center gap-2 rounded-lg bg-civic-green/10 p-3 text-sm text-civic-green">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {result.message}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="civic"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conio in corso...
                </>
              ) : (
                <>
                  <Hammer className="mr-2 h-4 w-4" />
                  Avvia conio
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
