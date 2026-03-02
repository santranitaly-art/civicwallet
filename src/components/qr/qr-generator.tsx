"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Timer, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRGeneratorProps {
  token: string;
  expiryMinutes: number;
  createdAt: Date;
  onRefresh?: () => void;
  className?: string;
}

export function QRGenerator({
  token,
  expiryMinutes,
  createdAt,
  onRefresh,
  className,
}: QRGeneratorProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    const created = new Date(createdAt).getTime();
    const expiresAt = created + expiryMinutes * 60 * 1000;
    const now = Date.now();
    return Math.max(0, Math.floor((expiresAt - now) / 1000));
  }, [createdAt, expiryMinutes]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  const isExpired = timeLeft <= 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/qr/verify?token=${token}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback - do nothing
    }
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* QR Code Display */}
      <div
        className={cn(
          "rounded-2xl bg-white p-6 shadow-lg transition-all",
          isExpired && "opacity-50 grayscale",
        )}
      >
        <QRCodeSVG
          value={qrUrl}
          size={240}
          level="M"
          includeMargin={false}
          bgColor="transparent"
          fgColor={isExpired ? "#9ca3af" : "#1a237e"}
        />
      </div>

      {/* Timer */}
      <div
        className={cn(
          "mt-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
          isExpired
            ? "bg-destructive/10 text-destructive"
            : timeLeft <= 60
              ? "bg-civic-gold/10 text-civic-gold"
              : "bg-civic-green/10 text-civic-green",
        )}
      >
        <Timer className="h-4 w-4" />
        {isExpired ? (
          <span>QR scaduto</span>
        ) : (
          <span>
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {isExpired && onRefresh ? (
          <Button
            onClick={onRefresh}
            variant="civic-gold"
            rounded="full"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Genera nuovo QR
          </Button>
        ) : (
          <Button
            onClick={handleCopy}
            variant="outline"
            rounded="full"
            size="sm"
            disabled={isExpired}
          >
            {copied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-civic-green" />
                Copiato!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copia link
              </>
            )}
          </Button>
        )}
      </div>

      {!isExpired && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Mostra questo codice QR al commerciante per ottenere lo sconto.
        </p>
      )}
    </div>
  );
}
