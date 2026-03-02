"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Award,
  Loader2,
  ScanLine,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRScanner } from "@/components/qr/qr-scanner";
import { BADGE_METADATA } from "@/lib/constants";
import { truncateAddress } from "@/lib/utils";

interface VerificationResult {
  valid: boolean;
  wallet?: string;
  badges?: Array<{
    tokenId: number;
    name: string;
    verified: boolean;
  }>;
  error?: string;
}

export default function MerchantScanPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showScanner, setShowScanner] = useState(true);

  async function handleScan(data: string) {
    setIsVerifying(true);
    setShowScanner(false);

    try {
      // Extract token from URL if needed
      let token = data;
      if (data.includes("token=")) {
        const url = new URL(data);
        token = url.searchParams.get("token") || data;
      }

      const res = await fetch("/api/qr/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setResult({
          valid: false,
          error: responseData.error || "Codice QR non valido",
        });
      } else {
        setResult({
          valid: true,
          wallet: responseData.data?.wallet,
          badges: responseData.data?.badges,
        });
      }
    } catch {
      setResult({
        valid: false,
        error: "Errore durante la verifica del codice QR",
      });
    } finally {
      setIsVerifying(false);
    }
  }

  function handleReset() {
    setResult(null);
    setShowScanner(true);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scansiona QR</h1>
        <p className="text-sm text-muted-foreground">
          Scansiona il codice QR del volontario per verificare i badge
        </p>
      </div>

      {/* Scanner */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onError={(err) =>
            setResult({ valid: false, error: err })
          }
        />
      )}

      {/* Loading */}
      {isVerifying && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-civic-blue" />
            <p className="text-sm text-muted-foreground">
              Verifica in corso...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && !isVerifying && (
        <Card>
          <CardContent className="p-6">
            {result.valid ? (
              <div className="space-y-4">
                {/* Success Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-civic-green/10">
                    <CheckCircle2 className="h-8 w-8 text-civic-green" />
                  </div>
                  <h2 className="text-lg font-bold text-civic-green">
                    Badge verificati!
                  </h2>
                  {result.wallet && (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Wallet: {truncateAddress(result.wallet)}
                    </p>
                  )}
                </div>

                {/* Badge List */}
                {result.badges && result.badges.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Badge del volontario:
                    </p>
                    {result.badges.map((badge) => {
                      const meta =
                        BADGE_METADATA[
                          badge.tokenId as keyof typeof BADGE_METADATA
                        ];
                      return (
                        <div
                          key={badge.tokenId}
                          className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                        >
                          <div
                            className={`h-8 w-8 flex-shrink-0 rounded-lg bg-gradient-to-br ${meta?.gradient || "from-civic-blue to-indigo-500"}`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {meta?.name || badge.name}
                            </p>
                          </div>
                          {badge.verified && (
                            <UIBadge variant="success">Verificato</UIBadge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-lg font-bold text-destructive">
                  Verifica fallita
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.error}
                </p>
              </div>
            )}

            {/* Reset Button */}
            <div className="mt-6 flex justify-center">
              <Button
                variant="civic"
                rounded="full"
                onClick={handleReset}
              >
                <ScanLine className="mr-2 h-4 w-4" />
                Scansiona un altro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
