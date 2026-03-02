"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className }: QRScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startScanning() {
    setError(null);
    setScanResult(null);

    try {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!scannerRef.current) return;

      const scannerId = "qr-scanner-element";
      scannerRef.current.id = scannerId;

      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          setScanResult(decodedText);
          onScan(decodedText);
          stopScanning();
        },
        () => {
          // QR scanning in progress - no match found yet
        },
      );

      setIsScanning(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossibile accedere alla fotocamera";
      setError(message);
      onError?.(message);
    }
  }

  async function stopScanning() {
    try {
      const scanner = html5QrCodeRef.current as {
        isScanning?: boolean;
        stop: () => Promise<void>;
      } | null;
      if (scanner && scanner.isScanning) {
        await scanner.stop();
      }
    } catch {
      // Ignore cleanup errors
    }
    setIsScanning(false);
    html5QrCodeRef.current = null;
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Scanner Area */}
      <div
        ref={scannerRef}
        className={cn(
          "relative w-full max-w-sm overflow-hidden rounded-2xl bg-black",
          !isScanning && "flex h-64 items-center justify-center",
        )}
      >
        {!isScanning && !scanResult && (
          <div className="text-center">
            <Camera className="mx-auto mb-3 h-12 w-12 text-white/30" />
            <p className="text-sm text-white/50">
              Premi il pulsante per scansionare
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col items-center gap-3">
        {!isScanning && !scanResult && (
          <Button
            onClick={startScanning}
            variant="civic"
            rounded="full"
            size="lg"
          >
            <Camera className="mr-2 h-4 w-4" />
            Avvia scansione
          </Button>
        )}

        {isScanning && (
          <Button
            onClick={stopScanning}
            variant="outline"
            rounded="full"
            size="sm"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Ferma scansione
          </Button>
        )}

        {isScanning && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Inquadra il codice QR...
          </div>
        )}

        {scanResult && (
          <div className="flex items-center gap-2 rounded-xl bg-civic-green/10 px-4 py-2 text-sm text-civic-green">
            <CheckCircle2 className="h-4 w-4" />
            QR code letto con successo!
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <XCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
