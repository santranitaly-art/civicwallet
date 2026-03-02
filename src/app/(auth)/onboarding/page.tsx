"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { Shield, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Association {
  id: string;
  name: string;
  city: string;
  province: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const [displayName, setDisplayName] = useState("");
  const [associationId, setAssociationId] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account?.address) {
      router.replace("/login");
      return;
    }

    // Fetch available associations
    fetch("/api/associations")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setAssociations(data.data);
        }
      })
      .catch(console.error);
  }, [account, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Inserisci il tuo nome visualizzato");
      return;
    }

    if (!gdprConsent) {
      setError("Devi accettare il trattamento dei dati per continuare");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          associationId: associationId || undefined,
          gdprConsent: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante la registrazione");
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante la registrazione",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-civic-blue via-indigo-900 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <Shield className="h-10 w-10 text-civic-gold" />
          </div>
          <h1 className="text-2xl font-bold text-white">Benvenuto!</h1>
          <p className="mt-2 text-sm text-slate-400">
            Completa il tuo profilo per iniziare
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Informazioni personali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Display Name */}
              <div className="space-y-2">
                <label
                  htmlFor="displayName"
                  className="text-sm font-medium text-slate-300"
                >
                  Nome visualizzato *
                </label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="es. Mario Rossi"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="border-white/20 bg-white/10 text-white placeholder:text-slate-500 focus-visible:ring-civic-gold"
                  maxLength={100}
                  required
                />
              </div>

              {/* Association Selector */}
              <div className="space-y-2">
                <label
                  htmlFor="association"
                  className="text-sm font-medium text-slate-300"
                >
                  Associazione di appartenenza
                </label>
                <select
                  id="association"
                  value={associationId}
                  onChange={(e) => setAssociationId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-gold"
                >
                  <option value="" className="bg-slate-800">
                    Seleziona associazione (opzionale)
                  </option>
                  {associations.map((assoc) => (
                    <option
                      key={assoc.id}
                      value={assoc.id}
                      className="bg-slate-800"
                    >
                      {assoc.name} - {assoc.city} ({assoc.province})
                    </option>
                  ))}
                </select>
              </div>

              {/* GDPR Consent */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={gdprConsent}
                    onChange={(e) => setGdprConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 text-civic-gold focus:ring-civic-gold"
                  />
                  <span className="text-xs leading-relaxed text-slate-400">
                    Acconsento al trattamento dei miei dati personali ai sensi
                    del Regolamento (UE) 2016/679 (GDPR). I dati saranno
                    utilizzati esclusivamente per il funzionamento della
                    piattaforma CivicWallet e la gestione dei badge di merito
                    civico.{" "}
                    <a
                      href="/privacy"
                      className="text-civic-gold underline hover:text-amber-300"
                    >
                      Leggi l&apos;informativa completa
                    </a>
                  </span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-destructive/20 px-4 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting || !gdprConsent}
                variant="civic-gold"
                rounded="full"
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrazione in corso...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completa registrazione
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
