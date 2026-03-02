"use client";

import { useEffect, useState } from "react";
import { QrCode, CheckSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QRGenerator } from "@/components/qr/qr-generator";
import { BADGE_METADATA } from "@/lib/constants";
import { QR_EXPIRY_MINUTES } from "@/lib/constants";
import type { BadgeWithClaim } from "@/types";

export default function QRPage() {
  const [badges, setBadges] = useState<BadgeWithClaim[]>([]);
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrData, setQrData] = useState<{
    token: string;
    createdAt: Date;
  } | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch("/api/volunteers/me");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const earned = (data.data?.badges || []).filter(
          (b: BadgeWithClaim) => b.claimed,
        );
        setBadges(earned);
        // Pre-select all earned badges
        setSelectedTokenIds(earned.map((b: BadgeWithClaim) => b.tokenId));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBadges();
  }, []);

  function toggleBadge(tokenId: number) {
    setSelectedTokenIds((prev) =>
      prev.includes(tokenId)
        ? prev.filter((id) => id !== tokenId)
        : [...prev, tokenId],
    );
    // Reset QR when selection changes
    setQrData(null);
  }

  async function handleGenerate() {
    if (selectedTokenIds.length === 0) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeTokenIds: selectedTokenIds }),
      });

      if (!res.ok) throw new Error("Failed to generate QR");
      const data = await res.json();
      setQrData({
        token: data.data.token,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Codice QR</h1>
        <p className="text-sm text-muted-foreground">
          Seleziona i badge da mostrare e genera il codice QR
        </p>
      </div>

      {badges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Devi avere almeno un badge per generare il codice QR.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Badge Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Seleziona badge da includere
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {badges.map((badge) => {
                  const meta =
                    BADGE_METADATA[
                      badge.tokenId as keyof typeof BADGE_METADATA
                    ];
                  const isSelected = selectedTokenIds.includes(badge.tokenId);

                  return (
                    <button
                      key={badge.id}
                      onClick={() => toggleBadge(badge.tokenId)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                        isSelected
                          ? "border-civic-blue bg-civic-blue/5"
                          : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                      }`}
                    >
                      <div
                        className={`h-8 w-8 flex-shrink-0 rounded-lg bg-gradient-to-br ${meta?.gradient || "from-civic-blue to-indigo-500"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {badge.nameIt || badge.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {badge.category}
                        </p>
                      </div>
                      <CheckSquare
                        className={`h-5 w-5 flex-shrink-0 transition-colors ${
                          isSelected
                            ? "text-civic-blue"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          {!qrData && (
            <Button
              onClick={handleGenerate}
              disabled={selectedTokenIds.length === 0 || isGenerating}
              variant="civic-gold"
              rounded="full"
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generazione...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Genera codice QR
                </>
              )}
            </Button>
          )}

          {/* QR Code Display */}
          {qrData && (
            <Card>
              <CardContent className="py-8">
                <QRGenerator
                  token={qrData.token}
                  expiryMinutes={QR_EXPIRY_MINUTES}
                  createdAt={qrData.createdAt}
                  onRefresh={handleGenerate}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
