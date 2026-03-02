"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { BADGE_METADATA } from "@/lib/constants";
import type { BadgeWithClaim } from "@/types";

interface PendingClaim {
  id: string;
  badgeTypeId: string;
  tokenId: number;
  name: string;
  nameIt: string;
  category: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

export default function ClaimListPage() {
  const [claims, setClaims] = useState<PendingClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClaims() {
      try {
        const res = await fetch("/api/badges/claims?status=PENDING");
        if (!res.ok) throw new Error("Failed to fetch claims");
        const data = await res.json();
        setClaims(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClaims();
  }, []);

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
      <div>
        <h1 className="text-2xl font-bold">Badge da riscattare</h1>
        <p className="text-sm text-muted-foreground">
          Riscatta i tuoi badge per aggiungerli al wallet
        </p>
      </div>

      {claims.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Nessun badge da riscattare"
          description="Quando raggiungerai un traguardo, troverai qui i badge da riscattare."
        />
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => {
            const meta =
              BADGE_METADATA[
                claim.tokenId as keyof typeof BADGE_METADATA
              ];

            return (
              <Link key={claim.id} href={`/claim/${claim.id}`}>
                <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Badge Color Dot */}
                    <div
                      className={`h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br shadow-sm ${meta?.gradient || "from-civic-blue to-indigo-500"}`}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {claim.nameIt || claim.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <UIBadge variant="warning" className="text-[10px]">
                          Da riscattare
                        </UIBadge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(claim.createdAt).toLocaleDateString(
                            "it-IT",
                          )}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
