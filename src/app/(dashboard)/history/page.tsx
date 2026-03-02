"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Calendar,
  MapPin,
  ChevronDown,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatHours } from "@/lib/utils";

interface ActivityEntry {
  id: string;
  shiftDate: string;
  hoursWorked: number;
  activityType: string;
  description?: string;
  associationName?: string;
}

export default function HistoryPage() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  async function fetchActivities(pageNum: number) {
    try {
      const res = await fetch(
        `/api/volunteers/me/activities?page=${pageNum}&limit=20`,
      );
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();

      if (pageNum === 1) {
        setActivities(data.data || []);
      } else {
        setActivities((prev) => [...prev, ...(data.data || [])]);
      }

      setHasMore((data.data?.length || 0) === 20);
      setTotalHours(data.totalHours || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchActivities(1);
  }, []);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage);
  }

  const activityTypeLabels: Record<string, string> = {
    transport: "Trasporto",
    logistics: "Logistica",
    training: "Formazione",
    emergency: "Emergenza",
    events: "Eventi",
    administrative: "Amministrativo",
  };

  // Group by month
  const groupedByMonth = activities.reduce(
    (acc, activity) => {
      const date = new Date(activity.shiftDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(activity);
      return acc;
    },
    {} as Record<string, ActivityEntry[]>,
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Storico attivita</h1>
          <p className="text-sm text-muted-foreground">
            Il registro delle tue ore di volontariato
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Totale</p>
          <p className="text-lg font-bold text-civic-blue">
            {formatHours(totalHours)}
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Nessuna attivita registrata"
          description="Le tue ore di volontariato appariranno qui quando saranno registrate dalla tua associazione."
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByMonth)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([monthKey, monthActivities]) => {
              const [year, month] = monthKey.split("-");
              const monthName = new Date(
                Number(year),
                Number(month) - 1,
              ).toLocaleDateString("it-IT", {
                month: "long",
                year: "numeric",
              });

              const monthHours = monthActivities.reduce(
                (sum, a) => sum + a.hoursWorked,
                0,
              );

              return (
                <div key={monthKey}>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold capitalize text-muted-foreground">
                      {monthName}
                    </h2>
                    <UIBadge variant="secondary">
                      {formatHours(monthHours)}
                    </UIBadge>
                  </div>

                  <div className="space-y-2">
                    {monthActivities.map((activity) => (
                      <Card key={activity.id}>
                        <CardContent className="flex items-center gap-3 p-4">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-civic-blue/10">
                            <Activity className="h-5 w-5 text-civic-blue" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {activityTypeLabels[activity.activityType] ||
                                activity.activityType}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(
                                  activity.shiftDate,
                                ).toLocaleDateString("it-IT", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatHours(activity.hoursWorked)}
                              </span>
                              {activity.associationName && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {activity.associationName}
                                </span>
                              )}
                            </div>
                            {activity.description && (
                              <p className="mt-1 text-xs text-muted-foreground truncate">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-civic-blue">
                              {formatHours(activity.hoursWorked)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                rounded="full"
                onClick={handleLoadMore}
              >
                <ChevronDown className="mr-2 h-4 w-4" />
                Carica altre
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
