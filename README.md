# 🏛️ CivicWallet

**Infrastruttura digitale per la certificazione e la portabilità delle competenze nel soccorso volontario italiano.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

---

## Il Problema

L'Italia conta oltre 5,5 milioni di volontari. Nel settore dell'emergenza-urgenza, la gestione delle certificazioni (BLSD, corsi 120h, qualifiche CRI/ANPAS/Misericordie) è ancora affidata a fogli Excel, PDF e faldoni cartacei. Un volontario che cambia associazione deve ricominciare da zero.

Con il **Decreto interministeriale 31 luglio 2025**, le competenze di volontariato (min. 60h/anno) sono ora riconosciute per CFU universitari, PCTO scolastici e preferenze nei concorsi pubblici. Ma nessuno strumento digitale permette di attestarle in modo inoppugnabile.

## La Soluzione

CivicWallet è un **middleware invisibile** che si integra con i gestionali esistenti (AppAmbulanza, GAIA CRI, Bernardo, Anpasoft) e fornisce:

- 📋 **Libretto Formativo Digitale** — Portfolio portabile di ore, competenze e certificazioni
- 🔐 **Attestazioni Immutabili** — Soulbound Token (SBT) su Polygon PoS, non trasferibili e non monetizzabili
- ⚡ **Verifica Real-Time** — Controlla l'idoneità operativa di un volontario in 2 secondi
- 📤 **Export Decreto 2025** — Genera attestazioni per CFU, PCTO e concorsi pubblici in un click

## Stack Tecnologico

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL 16 (Prisma ORM) |
| Blockchain | Polygon PoS (ERC-1155 Soulbound) |
| Smart Contract | Solidity 0.8.20+, OpenZeppelin v5 |
| Auth | Thirdweb Connect (email/social → wallet in-app) |

## Quick Start

```bash
# Clona il repository
git clone https://github.com/santranitaly-art/civicwallet.git
cd civicwallet

# Installa le dipendenze
pnpm install

# Configura l'ambiente
cp .env.example .env.local
# Modifica .env.local con le tue credenziali

# Avvia il database (richiede PostgreSQL 16)
pnpm prisma migrate dev --name init

# Avvia il server di sviluppo
pnpm dev
```

L'app sarà disponibile su `http://localhost:3000`

## Architettura

```
Gestionale ETS ──webhook──> CivicWallet API
(AppAmbulanza)                    │
                    ┌─────────────┼──────────────┐
                    ▼             ▼              ▼
              PostgreSQL     Polygon PoS     Dashboard
              (dati PII)    (hash + SBT)    (volontario)
```

- **Zero PII on-chain**: solo hash crittografici keccak256 su blockchain
- **Webhook HMAC**: ogni comunicazione inter-sistema è firmata
- **RBAC**: 4 ruoli (Volontario, Admin ETS, CERT_ISSUER, Admin Piattaforma)

## Documentazione

| Documento | Descrizione |
|-----------|-------------|
| [Documento Tecnico](docs/DOCUMENTO_TECNICO.md) | Architettura completa, sistema badge, modello economico |
| [Roadmap](docs/ROADMAP.md) | Piano di sviluppo per fasi |
| [Setup VPS](docs/VPS_POSTGRES_SETUP.md) | Guida provisioning PostgreSQL su VPS |
| [Privacy Policy](docs/legal/PRIVACY_POLICY.md) | Informativa GDPR Art. 13-14 |
| [Termini di Servizio](docs/legal/TERMS_OF_SERVICE.md) | Condizioni generali di utilizzo |

## Conformità Normativa

- ✅ **GDPR** — Privacy by Design, minimizzazione dati, zero PII on-chain
- ✅ **Art. 17 D.Lgs. 117/2017** — I badge non costituiscono remunerazione del volontariato
- ✅ **MiCAR** — Gli SBT non rientrano nella definizione di crypto-asset (non trasferibili, zero valore monetario)
- ✅ **Decreto 2025** — Strumento abilitante per il riconoscimento delle competenze

## Licenza

Questo progetto è rilasciato sotto licenza [GNU Affero General Public License v3.0](LICENSE).

Chiunque può usare, modificare e distribuire il codice, a condizione che le modifiche siano rilasciate con la stessa licenza. Se il software viene offerto come servizio web (SaaS), il codice sorgente modificato deve essere reso disponibile.

---

**CivicWallet** — *Il tuo impegno, la tua identità civica.*
