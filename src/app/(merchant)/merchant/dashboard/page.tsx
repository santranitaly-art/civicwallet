"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ScanLine,
  Percent,
  Receipt,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { truncateAddress } from "@/lib/utils";
import type { MerchantDashboard } from "@/types";

export default function MerchantDashboardPage() {
  const [dashboard, setDashboard] = useState<MerchantDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/merchants/me/dashboard");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setDashboard(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Esercente</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-blue/10">
              <Receipt className="h-5 w-5 text-civic-blue" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Riscatti totali</p>
              <p className="text-xl font-bold">
                {dashboard?.totalRedemptions || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic-green/10">
              <Percent className="h-5 w-5 text-civic-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sconti attivi</p>
              <p className="text-xl font-bold">
                {dashboard?.activeDiscounts || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/merchant/scan">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-civic-gold/10">
                <ScanLine className="h-6 w-6 text-civic-gold" />
              </div>
              <span className="text-sm font-medium">Scansiona QR</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/merchant/discounts">
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-civic-blue/10">
                <TrendingUp className="h-6 w-6 text-civic-blue" />
              </div>
              <span className="text-sm font-medium">Gestisci sconti</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Redemptions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Riscatti recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {!dashboard?.recentRedemptions?.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nessun riscatto registrato.
            </p>
          ) : (
            <div className="space-y-3">
              {dashboard.recentRedemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-civic-green/10">
                    <Award className="h-4 w-4 text-civic-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {redemption.badgeName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">
                        {truncateAddress(redemption.volunteerWallet)}
                      </span>
                      <span>-</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(redemption.redeemedAt).toLocaleDateString(
                          "it-IT",
                        )}
                      </span>
                    </div>
                  </div>
                  <UIBadge variant="success">
                    -{redemption.discountPercent}%
                  </UIBadge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
