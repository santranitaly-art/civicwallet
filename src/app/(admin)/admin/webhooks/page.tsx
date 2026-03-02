"use client";

import { useEffect, useState } from "react";
import {
  Webhook,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

interface WebhookLogEntry {
  id: string;
  source: string;
  endpoint: string;
  hmacValid: boolean;
  status: string;
  processingError?: string;
  processedAt?: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export default function AdminWebhooksPage() {
  const [logs, setLogs] = useState<WebhookLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const limit = 20;

  async function fetchLogs(pageNum: number) {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/webhooks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLogs(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  const statusConfig: Record<
    string,
    { icon: React.ElementType; color: string; label: string }
  > = {
    RECEIVED: { icon: Clock, color: "text-blue-500", label: "Ricevuto" },
    PROCESSING: {
      icon: Loader2,
      color: "text-civic-gold",
      label: "In elaborazione",
    },
    PROCESSED: {
      icon: CheckCircle2,
      color: "text-civic-green",
      label: "Elaborato",
    },
    FAILED: { icon: XCircle, color: "text-destructive", label: "Fallito" },
  };

  if (isLoading && page === 1) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhook Log</h1>
          <p className="text-sm text-muted-foreground">
            {total} eventi webhook registrati
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchLogs(page)}
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Aggiorna
        </Button>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={Webhook}
          title="Nessun webhook registrato"
          description="Gli eventi webhook da AppAmbulanza appariranno qui."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {logs.map((log) => {
                const config = statusConfig[log.status] || statusConfig.RECEIVED;
                const StatusIcon = config.icon;
                const isExpanded = expandedLog === log.id;

                return (
                  <div key={log.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <StatusIcon
                        className={`h-5 w-5 flex-shrink-0 ${config.color} ${log.status === "PROCESSING" ? "animate-spin" : ""}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {log.source}
                          </p>
                          <UIBadge
                            variant={
                              log.status === "PROCESSED"
                                ? "success"
                                : log.status === "FAILED"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {config.label}
                          </UIBadge>
                          {!log.hmacValid && (
                            <UIBadge variant="destructive">
                              HMAC invalido
                            </UIBadge>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{log.endpoint}</span>
                          <span>
                            {new Date(log.createdAt).toLocaleString("it-IT")}
                          </span>
                        </div>
                        {log.processingError && (
                          <p className="mt-1 text-xs text-destructive">
                            {log.processingError}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setExpandedLog(isExpanded ? null : log.id)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Expanded Payload */}
                    {isExpanded && (
                      <div className="mt-3 rounded-lg bg-muted p-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          Payload:
                        </p>
                        <pre className="overflow-x-auto text-xs">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
