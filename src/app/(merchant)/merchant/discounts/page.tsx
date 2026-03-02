"use client";

import { useEffect, useState } from "react";
import {
  Percent,
  Plus,
  Trash2,
  Award,
  Calendar,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { BADGE_METADATA } from "@/lib/constants";

interface DiscountRule {
  id: string;
  badgeTypeId: string;
  badgeName: string;
  tokenId: number;
  discountPercent: number;
  description: string;
  descriptionIt: string;
  validFrom: string;
  validUntil?: string;
  maxRedemptions?: number;
  isActive: boolean;
  redemptionCount: number;
}

interface BadgeOption {
  id: string;
  tokenId: number;
  name: string;
  nameIt: string;
}

export default function MerchantDiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [badgeOptions, setBadgeOptions] = useState<BadgeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formBadgeTypeId, setFormBadgeTypeId] = useState("");
  const [formDiscount, setFormDiscount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDescriptionIt, setFormDescriptionIt] = useState("");
  const [formValidUntil, setFormValidUntil] = useState("");
  const [formMaxRedemptions, setFormMaxRedemptions] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [discountsRes, badgesRes] = await Promise.all([
          fetch("/api/merchants/me/discounts"),
          fetch("/api/badges"),
        ]);

        if (discountsRes.ok) {
          const data = await discountsRes.json();
          setDiscounts(data.data || []);
        }

        if (badgesRes.ok) {
          const data = await badgesRes.json();
          setBadgeOptions(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  async function handleCreateDiscount(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!formBadgeTypeId || !formDiscount || !formDescriptionIt) {
      setFormError("Compila tutti i campi obbligatori");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/merchants/me/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badgeTypeId: formBadgeTypeId,
          discountPercent: parseInt(formDiscount),
          description: formDescription || formDescriptionIt,
          descriptionIt: formDescriptionIt,
          validUntil: formValidUntil
            ? new Date(formValidUntil).toISOString()
            : undefined,
          maxRedemptions: formMaxRedemptions
            ? parseInt(formMaxRedemptions)
            : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore nella creazione dello sconto");
      }

      const data = await res.json();
      setDiscounts((prev) => [data.data, ...prev]);
      resetForm();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Errore nella creazione",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteDiscount(id: string) {
    if (!confirm("Sei sicuro di voler eliminare questo sconto?")) return;

    try {
      const res = await fetch(`/api/merchants/me/discounts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDiscounts((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  function resetForm() {
    setShowForm(false);
    setFormBadgeTypeId("");
    setFormDiscount("");
    setFormDescription("");
    setFormDescriptionIt("");
    setFormValidUntil("");
    setFormMaxRedemptions("");
    setFormError("");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestione sconti</h1>
          <p className="text-sm text-muted-foreground">
            Configura gli sconti per i volontari
          </p>
        </div>
        <Button
          variant="civic-gold"
          rounded="full"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Nuovo sconto
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nuovo sconto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDiscount} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Badge richiesto *</label>
                <select
                  value={formBadgeTypeId}
                  onChange={(e) => setFormBadgeTypeId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleziona badge</option>
                  {badgeOptions.map((badge) => (
                    <option key={badge.id} value={badge.id}>
                      {badge.nameIt || badge.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Percentuale sconto *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(e.target.value)}
                  placeholder="es. 10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Descrizione (italiano) *
                </label>
                <Input
                  value={formDescriptionIt}
                  onChange={(e) => setFormDescriptionIt(e.target.value)}
                  placeholder="es. 10% di sconto su tutti i prodotti"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description (English)
                </label>
                <Input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 10% off all products"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Scadenza (opz.)
                  </label>
                  <Input
                    type="date"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Max riscatti (opz.)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formMaxRedemptions}
                    onChange={(e) => setFormMaxRedemptions(e.target.value)}
                    placeholder="Illimitati"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="civic"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creazione...
                    </>
                  ) : (
                    "Crea sconto"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Discount List */}
      {discounts.length === 0 ? (
        <EmptyState
          icon={Percent}
          title="Nessuno sconto configurato"
          description="Crea il primo sconto per iniziare a premiare i volontari."
          action={
            <Button
              variant="civic-gold"
              rounded="full"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Crea sconto
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {discounts.map((discount) => {
            const meta =
              BADGE_METADATA[
                discount.tokenId as keyof typeof BADGE_METADATA
              ];

            return (
              <Card key={discount.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={`h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${meta?.gradient || "from-civic-blue to-indigo-500"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">
                        {discount.descriptionIt}
                      </p>
                      {!discount.isActive && (
                        <UIBadge variant="secondary">Inattivo</UIBadge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {discount.badgeName}
                      </span>
                      {discount.validUntil && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Fino al{" "}
                          {new Date(discount.validUntil).toLocaleDateString(
                            "it-IT",
                          )}
                        </span>
                      )}
                      <span>
                        {discount.redemptionCount} riscatti
                        {discount.maxRedemptions
                          ? ` / ${discount.maxRedemptions}`
                          : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UIBadge variant="success" className="text-base">
                      -{discount.discountPercent}%
                    </UIBadge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteDiscount(discount.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
