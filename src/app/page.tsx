import Link from "next/link";
import { Award, Heart, BookOpen, ArrowRight, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-blue via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-civic-gold" />
          <span className="text-xl font-bold text-white">CivicWallet</span>
        </div>
        <Link
          href="/login"
          className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          Accedi
        </Link>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4">
        <section className="flex flex-col items-center py-16 text-center md:py-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-civic-gold/20 px-4 py-1.5 text-sm font-medium text-civic-gold">
            <Award className="h-4 w-4" />
            Powered by Blockchain
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
            Il tuo portafoglio di{" "}
            <span className="bg-gradient-to-r from-civic-gold to-amber-400 bg-clip-text text-transparent">
              merito e competenze
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300 md:text-xl">
            Ottieni il tuo Libretto Formativo Digitale immutabile. Trasforma le tue ore di volontariato in <strong>crediti universitari (CFU)</strong> e punteggi per <strong>concorsi pubblici</strong> (D.M. 31/07/2025).
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-civic-gold px-8 py-3.5 text-base font-semibold text-civic-blue shadow-lg transition-all hover:bg-amber-400 hover:shadow-xl"
            >
              Inizia ora
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#come-funziona"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              Come funziona
            </Link>
          </div>
        </section>

        {/* Feature Cards */}
        <section id="come-funziona" className="pb-20 pt-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-white md:text-3xl">
            Come funziona
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Volontariato */}
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-civic-green/30 hover:bg-white/10">
              <div className="mb-4 inline-flex rounded-xl bg-civic-green/20 p-3">
                <Heart className="h-6 w-6 text-civic-green" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                Volontariato
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Le tue ore di servizio vengono registrate automaticamente dalla
                tua associazione tramite l&apos;integrazione con AppAmbulanza.
                Ogni turno conta.
              </p>
            </div>

            {/* Card 2: Badge */}
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-civic-gold/30 hover:bg-white/10">
              <div className="mb-4 inline-flex rounded-xl bg-civic-gold/20 p-3">
                <Award className="h-6 w-6 text-civic-gold" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Badge</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Al raggiungimento di traguardi importanti, ricevi badge
                digitali Soulbound Token sulla blockchain. Sono tuoi per sempre,
                non trasferibili.
              </p>
            </div>

            {/* Card 3: Portabilità */}
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-civic-silver/30 hover:bg-white/10">
              <div className="mb-4 inline-flex rounded-xl bg-civic-blue/20 p-3">
                <BookOpen className="h-6 w-6 text-civic-blue" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                Portabilità D.2025
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Esporta le tue qualifiche e le tue ore certificate per l'Università, LinkedIn e Concorsi Pubblici. Un curriculum civico a prova di manomissione.
              </p>
            </div>
          </div>
        </section>

        {/* How it works steps */}
        <section className="pb-24">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Registrati con la tua email",
                  desc: "Crea il tuo wallet in pochi secondi. Nessuna conoscenza tecnica richiesta.",
                },
                {
                  step: "02",
                  title: "Fai volontariato",
                  desc: "Le tue ore vengono tracciate automaticamente dalla tua associazione.",
                },
                {
                  step: "03",
                  title: "Riscatta i badge",
                  desc: "Quando raggiungi un traguardo, riscatta il tuo badge con un tap.",
                },
                {
                  step: "04",
                  title: "Esporta per l'Università e CV",
                  desc: "Usa il tuo profilo certificato per ottenere crediti CFU o vantaggi lavorativi.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-civic-gold/20 text-sm font-bold text-civic-gold">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Shield className="h-4 w-4 text-civic-gold" />
              CivicWallet &copy; {new Date().getFullYear()}
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Termini
              </Link>
              <Link href="/about" className="hover:text-white">
                Chi siamo
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
