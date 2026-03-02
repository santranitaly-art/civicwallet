"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Award,
  Clock,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { truncateAddress, formatHours } from "@/lib/utils";

interface VolunteerRow {
  id: string;
  displayName: string | null;
  email: string | null;
  walletAddress: string;
  totalHours: number;
  totalShifts: number;
  badgeCount: number;
  associationName: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    async function fetchVolunteers() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/volunteers?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setVolunteers(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounce = setTimeout(fetchVolunteers, 300);
    return () => clearTimeout(debounce);
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestione volontari</h1>
          <p className="text-sm text-muted-foreground">
            {total} volontari registrati
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, email o wallet..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : volunteers.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Search}
                title="Nessun volontario trovato"
                description={
                  search
                    ? "Prova a modificare i termini di ricerca."
                    : "Non ci sono ancora volontari registrati."
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Volontario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Wallet
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Associazione
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                        Ore
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                        Badge
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                        Stato
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        Registrato
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((vol) => (
                      <tr
                        key={vol.id}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">
                              {vol.displayName || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {vol.email || "—"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs text-muted-foreground">
                            {truncateAddress(vol.walletAddress)}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {vol.associationName || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="flex items-center justify-center gap-1 text-sm font-medium">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatHours(vol.totalHours)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="flex items-center justify-center gap-1 text-sm font-medium">
                            <Award className="h-3 w-3 text-civic-gold" />
                            {vol.badgeCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <UIBadge
                            variant={vol.isActive ? "success" : "secondary"}
                          >
                            {vol.isActive ? "Attivo" : "Inattivo"}
                          </UIBadge>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {new Date(vol.createdAt).toLocaleDateString("it-IT")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-2 p-4 md:hidden">
                {volunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {vol.displayName || truncateAddress(vol.walletAddress)}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatHours(vol.totalHours)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {vol.badgeCount} badge
                        </span>
                      </div>
                    </div>
                    <UIBadge
                      variant={vol.isActive ? "success" : "secondary"}
                    >
                      {vol.isActive ? "Attivo" : "Inattivo"}
                    </UIBadge>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
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
        </CardContent>
      </Card>
    </div>
  );
}
