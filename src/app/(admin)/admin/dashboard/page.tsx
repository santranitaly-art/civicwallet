"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Award,
  Clock,
  Building,
  Store,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlatformAnalytics } from "@/types";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAnalytics(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const stats = [
    {
      label: "Volontari",
      value: analytics?.totalVolunteers || 0,
      icon: Users,
      color: "text-civic-blue",
      bg: "bg-civic-blue/10",
    },
    {
      label: "Badge coniati",
      value: analytics?.totalBadgesMinted || 0,
      icon: Award,
      color: "text-civic-gold",
      bg: "bg-civic-gold/10",
    },
    {
      label: "Ore registrate",
      value: analytics?.totalHoursLogged || 0,
      icon: Clock,
      color: "text-civic-green",
      bg: "bg-civic-green/10",
    },
    {
      label: "Associazioni",
      value: analytics?.totalAssociations || 0,
      icon: Building,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Esercenti",
      value: analytics?.totalMerchants || 0,
      icon: Store,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString("it-IT")
                    : stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Badges per Category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Badge per categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.badgesPerCategory ? (
              <div className="space-y-3">
                {Object.entries(analytics.badgesPerCategory).map(
                  ([category, count]) => {
                    const total = analytics.totalBadgesMinted || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={category}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="capitalize">{category}</span>
                          <span className="font-medium">
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-civic-blue transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nessun dato disponibile.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Mints */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Ultimi badge coniati
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!analytics?.recentMints?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nessun conio recente.
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.recentMints.map((mint) => (
                  <div
                    key={mint.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-civic-gold/10">
                      <Award className="h-4 w-4 text-civic-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {mint.badgeName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {mint.volunteerName || "Volontario anonimo"}
                      </p>
                    </div>
                    {mint.mintedAt && (
                      <UIBadge variant="secondary">
                        {new Date(mint.mintedAt).toLocaleDateString("it-IT")}
                      </UIBadge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
