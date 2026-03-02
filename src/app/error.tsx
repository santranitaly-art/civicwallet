"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <AlertTriangle className="mb-6 h-16 w-16 text-destructive" />
      <h1 className="mb-2 text-3xl font-bold">Qualcosa e andato storto</h1>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Si e verificato un errore imprevisto. Riprova o contatta il supporto se
        il problema persiste.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-full bg-civic-blue px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-civic-blue/90"
      >
        <RotateCcw className="h-4 w-4" />
        Riprova
      </button>
    </div>
  );
}
