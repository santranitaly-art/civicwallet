"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  Hammer,
  Hash,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BADGE_METADATA } from "@/lib/constants";

interface BadgeTypeRow {
  id: string;
  tokenId: number;
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  category: string;
  imageUrl: string;
  hoursRequired: number | null;
  isActive: boolean;
  totalMinted: number;
  pendingClaims: number;
}

export default function AdminBadgesPage() {
  const [badgeTypes, setBadgeTypes] = useState<BadgeTypeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBadgeTypes() {
      try {
        const res = await fetch("/api/admin/badges");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setBadgeTypes(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBadgeTypes();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tipi di badge</h1>
          <p className="text-sm text-muted-foreground">
            Gestisci i badge disponibili nella piattaforma
          </p>
        </div>
        <Link href="/admin/badges/mint">
          <Button variant="civic-gold" rounded="full" size="sm">
            <Hammer className="mr-1 h-4 w-4" />
            Conio manuale
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badgeTypes.map((badge) => {
          const meta =
            BADGE_METADATA[badge.tokenId as keyof typeof BADGE_METADATA];

          return (
            <Card
              key={badge.id}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Gradient Header */}
              <div
                className={`h-3 bg-gradient-to-r ${meta?.gradient || "from-civic-blue to-indigo-500"}`}
              />
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {badge.nameIt || badge.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {badge.descriptionIt || badge.description}
                    </p>
                  </div>
                  <UIBadge
                    variant={badge.isActive ? "success" : "secondary"}
                  >
                    {badge.isActive ? "Attivo" : "Inattivo"}
                  </UIBadge>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                    <Hash className="h-3 w-3" />
                    Token #{badge.tokenId}
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                    <Award className="h-3 w-3" />
                    {badge.totalMinted} coniati
                  </span>
                  {badge.hoursRequired && (
                    <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                      <Clock className="h-3 w-3" />
                      {badge.hoursRequired}h
                    </span>
                  )}
                </div>

                {badge.pendingClaims > 0 && (
                  <div className="mt-3 rounded-lg bg-civic-gold/10 px-3 py-2 text-xs font-medium text-civic-gold">
                    {badge.pendingClaims} riscatti in attesa
                  </div>
                )}

                <div className="mt-3">
                  <UIBadge variant="outline" className="capitalize">
                    {badge.category}
                  </UIBadge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
