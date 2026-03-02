"use client";

import { useEffect, useState } from "react";
import {
  Store,
  MapPin,
  Receipt,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

interface MerchantRow {
  id: string;
  businessName: string;
  vatNumber: string;
  city: string;
  province: string;
  category: string;
  isActive: boolean;
  discountCount: number;
  redemptionCount: number;
  createdAt: string;
}

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<MerchantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    async function fetchMerchants() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/merchants?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMerchants(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounce = setTimeout(fetchMerchants, 300);
    return () => clearTimeout(debounce);
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  const categoryLabels: Record<string, string> = {
    restaurant: "Ristorante",
    shop: "Negozio",
    gym: "Palestra",
    pharmacy: "Farmacia",
    supermarket: "Supermercato",
    bar: "Bar",
    hotel: "Hotel",
    other: "Altro",
  };

  if (isLoading && page === 1) {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Esercenti</h1>
          <p className="text-sm text-muted-foreground">
            {total} esercenti registrati
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o P.IVA..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {merchants.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Nessun esercente trovato"
          description={
            search
              ? "Prova a modificare i termini di ricerca."
              : "Non ci sono ancora esercenti registrati."
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {merchants.map((merchant) => (
              <Card
                key={merchant.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                      <Store className="h-5 w-5 text-orange-600" />
                    </div>
                    <UIBadge
                      variant={merchant.isActive ? "success" : "secondary"}
                    >
                      {merchant.isActive ? "Attivo" : "Inattivo"}
                    </UIBadge>
                  </div>
                  <h3 className="mb-1 font-semibold leading-tight">
                    {merchant.businessName}
                  </h3>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {merchant.city} ({merchant.province})
                    </p>
                    <p>
                      {categoryLabels[merchant.category] || merchant.category}
                    </p>
                    <p className="font-mono">P.IVA: {merchant.vatNumber}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        {merchant.discountCount} sconti
                      </span>
                      <span>{merchant.redemptionCount} riscatti</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Pagina {page} di {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
