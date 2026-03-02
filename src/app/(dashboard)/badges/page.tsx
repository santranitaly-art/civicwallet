"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Filter } from "lucide-react";
import { BadgeGrid } from "@/components/badges/badge-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BadgeWithClaim } from "@/types";

type FilterType = "all" | "earned" | "unearned";

export default function BadgesPage() {
  const router = useRouter();
  const [badges, setBadges] = useState<BadgeWithClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch("/api/volunteers/me");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setBadges(data.data?.badges || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBadges();
  }, []);

  const filteredBadges = badges.filter((badge) => {
    if (filter === "earned") return badge.claimed;
    if (filter === "unearned") return !badge.claimed;
    return true;
  });

  const earnedCount = badges.filter((b) => b.claimed).length;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Galleria Badge</h1>
          <p className="text-sm text-muted-foreground">
            {earnedCount} di {badges.length} badge ottenuti
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["all", "earned", "unearned"] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "civic" : "outline"}
              size="sm"
              rounded="full"
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "Tutti"
                : f === "earned"
                  ? "Ottenuti"
                  : "Da ottenere"}
            </Button>
          ))}
        </div>
      </div>

      {/* Badge Grid */}
      <BadgeGrid
        badges={filteredBadges}
        onBadgeClick={(badge) => router.push(`/badges/${badge.id}`)}
      />

      {filteredBadges.length === 0 && filter !== "all" && (
        <div className="py-12 text-center">
          <Award className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {filter === "earned"
              ? "Non hai ancora ottenuto nessun badge. Continua con il volontariato!"
              : "Hai ottenuto tutti i badge disponibili. Complimenti!"}
          </p>
        </div>
      )}
    </div>
  );
}
