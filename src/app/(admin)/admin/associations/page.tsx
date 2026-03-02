"use client";

import { useEffect, useState } from "react";
import {
  Building,
  Plus,
  MapPin,
  Users,
  Search,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

interface Association {
  id: string;
  name: string;
  fiscalCode: string;
  city: string;
  province: string;
  region: string;
  isActive: boolean;
  volunteerCount: number;
  createdAt: string;
}

export default function AdminAssociationsPage() {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formFiscalCode, setFormFiscalCode] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formProvince, setFormProvince] = useState("");
  const [formRegion, setFormRegion] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function fetchAssociations() {
      try {
        const res = await fetch("/api/admin/associations");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAssociations(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAssociations();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/associations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          fiscalCode: formFiscalCode,
          city: formCity,
          province: formProvince,
          region: formRegion,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore nella creazione");
      }

      const data = await res.json();
      setAssociations((prev) => [data.data, ...prev]);
      setShowForm(false);
      resetForm();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Errore nella creazione",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setFormName("");
    setFormFiscalCode("");
    setFormCity("");
    setFormProvince("");
    setFormRegion("");
    setFormError("");
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Associazioni</h1>
          <p className="text-sm text-muted-foreground">
            {associations.length} associazioni registrate
          </p>
        </div>
        <Button
          variant="civic-gold"
          rounded="full"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Nuova
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nuova associazione</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nome associazione *
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="es. Croce Rossa Italiana - Comitato di Roma"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Codice Fiscale *
                </label>
                <Input
                  value={formFiscalCode}
                  onChange={(e) => setFormFiscalCode(e.target.value)}
                  placeholder="11 cifre"
                  maxLength={11}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Citta *</label>
                  <Input
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Roma"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provincia *</label>
                  <Input
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
                    placeholder="RM"
                    maxLength={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Regione *</label>
                  <Input
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    placeholder="Lazio"
                    required
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
                    "Crea associazione"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Associations Grid */}
      {associations.length === 0 ? (
        <EmptyState
          icon={Building}
          title="Nessuna associazione"
          description="Aggiungi la prima associazione per iniziare."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {associations.map((assoc) => (
            <Card key={assoc.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-blue/10">
                    <Building className="h-5 w-5 text-civic-blue" />
                  </div>
                  <UIBadge
                    variant={assoc.isActive ? "success" : "secondary"}
                  >
                    {assoc.isActive ? "Attiva" : "Inattiva"}
                  </UIBadge>
                </div>
                <h3 className="mb-1 font-semibold leading-tight">
                  {assoc.name}
                </h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {assoc.city} ({assoc.province}), {assoc.region}
                  </p>
                  <p className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {assoc.volunteerCount} volontari
                  </p>
                  <p className="font-mono">CF: {assoc.fiscalCode}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
