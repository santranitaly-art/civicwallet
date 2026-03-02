import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <FileQuestion className="mb-6 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-3xl font-bold">Pagina non trovata</h1>
      <p className="mb-8 text-center text-muted-foreground">
        La pagina che stai cercando non esiste o e stata spostata.
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-full bg-civic-blue px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-civic-blue/90"
      >
        Torna alla home
      </Link>
    </div>
  );
}
