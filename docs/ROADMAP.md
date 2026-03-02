# CivicWallet — Roadmap

**Piano di sviluppo dalla versione MVP alla piattaforma nazionale**

> Ultimo aggiornamento: Febbraio 2026

---

## Legenda stati

| Simbolo | Stato |
|---------|-------|
| ✅ | Completato |
| 🔨 | In sviluppo |
| 📋 | Pianificato |
| 💡 | Concept / Ricerca |

---

## Fase 0 — Fondamenta (Q4 2025 – Q1 2026) ✅

> *Costruire il core della piattaforma con costo operativo zero*

### Smart Contract
- ✅ `CivicBadge.sol` — ERC-1155 Soulbound su Polygon PoS
- ✅ Override `_update()` per bloccare trasferimenti
- ✅ Disabilitazione `setApprovalForAll`
- ✅ AccessControl con `MINTER_ROLE` e `PAUSER_ROLE`
- ✅ 8 badge types iniziali (Presence, Skill, Special)
- ✅ Batch minting e revoke con motivazione
- ✅ Test suite Hardhat completa

### Backend & Database
- ✅ Next.js 14 App Router con TypeScript strict
- ✅ Schema Prisma con 14 modelli (User, Volunteer, Association, Merchant, BadgeClaim, MintedBadge, etc.)
- ✅ PostgreSQL su Supabase (free tier EU)
- ✅ 9 service layer (analytics, association, badge, merchant, minting, notification, QR, volunteer, webhook)
- ✅ API Routes per tutte le CRUD operations
- ✅ Webhook handler con HMAC validation per AppAmbulanza

### Autenticazione & Wallet
- ✅ Thirdweb Connect SDK v5 (email + social login)
- ✅ In-app wallet automatico (zero conoscenze crypto richieste)
- ✅ 4 ruoli: Volunteer, ETS Admin, Merchant, Platform Admin

### Frontend
- ✅ Landing page con sezioni "Come funziona"
- ✅ Dashboard volontario (ore, badge, claim)
- ✅ Pannello admin ETS
- ✅ Sezione commercianti
- ✅ Admin panel piattaforma
- ✅ UI responsive (Tailwind + shadcn/ui)

### Ecosistema QR
- ✅ Generazione QR code temporaneo dal wallet volontario
- ✅ Scansione e verifica da parte del commerciante
- ✅ Token monouso con scadenza 5 minuti

---

## Fase 1 — Validazione (Q2 2026) 🔨

> *Pilota con 2-3 associazioni ETS e 10-15 commercianti in un'area urbana*

### Lancio pilota
- 📋 Onboarding di 2-3 associazioni ETS partner (focus: Comitati Locali)
- 📋 Integrazione diretta con AppAmbulanza via webhook in produzione
- 📋 Validazione sul campo dell'attestazione del "Libretto Formativo Digitale"
- 📋 Deployment smart contract su Polygon PoS mainnet
- 📋 Deployment frontend su Vercel (dominio `civicwallet.it`)

### Attestazione Certificazioni (v1)
- 📋 Nuovo ruolo `CERT_ISSUER` per referenti formazione
- 📋 Badge types per certificazioni AREU (Soccorritore Esecutore, SSE, BLSD)
- 📋 Upload attestato con hash on-chain e metadati estesi
- 📋 Gestione scadenze e notifiche rinnovo (BLSD biennale)
- 📋 UI per attestazione da pannello ETS Admin

### Miglioramenti UX D2025 (Decreto 2025)
- 📋 Modulo attestazione "Progetto Personalizzato" (accordo volontario-ETS per min 60h/anno)
- 📋 Export in One-Click del Libretto Formativo in PDF con firma digitale/hash di garanzia
- 📋 Integrazione LinkedIn "Add to Profile" per attestati e competenze
- 📋 Notifiche in-app real-time (certificazioni in scadenza, traguardi raggiunti)

### Monitoring & Analytics
- 📋 Dashboard analytics per admin piattaforma (ore totali, badge mintati, sconti usati)
- 📋 Metriche di engagement per ogni associazione
- 📋 Reports esportabili in CSV/PDF per le associazioni

### Compliance
- 📋 Audit indipendente dello smart contract
- 📋 DPIA (Data Protection Impact Assessment)
- 📋 Termini di servizio e privacy policy finali
- 📋 Cookie policy GDPR compliant

---

## Fase 2 — Crescita (Q3-Q4 2026) 📋

> *Espansione regionale, più integrazioni, merchant premium*

### Espansione geografica
- 📋 Onboarding di 20+ associazioni ETS in 3-5 regioni italiane
- 📋 Pilotaggio istituzionale con referenti formativi AREU/CRI/ANPAS
- 📋 Partnership con CSV (Centri Servizi per il Volontariato)

### Integrazioni (Integration Hub Multi-Piattaforma)
- 📋 Integrazione nativa AppAmbulanza (webhook)
- 📋 Sviluppo adapter GAIA CRI (API pull/OAuth2)
- 📋 Sviluppo adapter Bernardo, VolontApp, Anpasoft, Sinfonia Web
- 📋 Integrazione con RUNTS (Registro Unico Nazionale Terzo Settore)
- 📋 Widget embeddabile per siti web delle associazioni

### Attestazione Certificazioni (v2) — Multi-ente
- 📋 Badge CRI: Volontario base, EFAC, specializzazioni
- 📋 Badge ANPAS: Soccorritore regionale, Operatore PC (OCN/AIB)
- 📋 Badge Misericordie: Livello I e Livello II
- 📋 Badge trasversali: Guida Emergenza, BLSD/DAE
- 📋 API per upload e validazione certificati da gestionali enti
- 📋 Portale CERT_ISSUER dedicato per referenti formazione
- 📋 Verifica scadenze certificazioni con dashboard dedicata
- 📋 Interoperabilità con standard Open Badges v3.0

### Sinergie Istituzionali e CSR (Corporate Social Responsibility)
- 📋 Dashboard di estrazione massiva per atenei e PA (verifica massiva validità attestati per concorsi/CFU)
- 📋 Protocolli operativi con Comuni e Regioni (welfare indiretto su trasporti, musei)
- 📋 Piattaforma Matching Corporate CSR: meccanismo collettivo basato su traguardi (es. "Se l'ente raggiunge 50.000 ore certificate on-chain, l'Azienda Partner finanzia un mezzo di soccorso")

### Badge Evolution e Identità
- 📋 Passaporto Competenze: mappatura delle skill acquisite su EQF (European Qualifications Framework)
- 📋 Livelli di anzianità (1, 5, 10 anni di servizio)
- 📋 Leaderboard aggregata e anonimizzata per regioni/comitati (sana competizione inter-ente, no focus sul singolo)
- 📋 Accesso prioritario o scontistica a corsi di formazione specializzati (guida sicura, masterclass) in base al livello raggiunto

### Mobile
- 📋 PWA (Progressive Web App) con push notifications
- 📋 Installazione home screen per Android/iOS
- 📋 Scan QR nativo da camera

---

## Fase 3 — Maturità (2027) 📋

> *Piattaforma di riferimento nazionale per il merito civico*

### Istituzionale
- 📋 Partnership con comuni per "Carta del Merito Civico" digitale
- 📋 Integrazione con SPID / CIE per identità verificata
- 📋 Portale per PA locali con statistiche aggregate
- 📋 Partecipazione a bandi europei per innovazione sociale

### Scalabilità tecnica
- 📋 Migrazione a Supabase Pro (o PostgreSQL managed)
- 📋 CDN e caching per prestazioni globali
- 📋 Event-driven architecture per webhook processing
- 📋 Multi-tenancy completa per white-labeling

### Governance
- 📋 Comitato scientifico per criteri badge
- 📋 Processo trasparente di governance delle regole
- 📋 Open-source community guidelines

---

## Fase 4 — Espansione (2028+) 💡

> *Oltre il volontariato: verso un'infrastruttura civica europea*

### Internazionalizzazione
- 💡 Localizzazione multilingue (EN, DE, FR, ES)
- 💡 Adattamento normativo per altri paesi UE
- 💡 Partnership con enti di volontariato europei

### Nuovi verticali
- 💡 Protezione civile e emergenze
- 💡 Servizio civile universale
- 💡 Volontariato scolastico e PCTO
- 💡 Community service (programmi comunali)

### Avanzamenti tecnici
- 💡 Verifiable Credentials (W3C DID standard)
- 💡 Cross-chain interoperability
- 💡 ZK-proofs per privacy-preserving badge verification
- 💡 AI-powered badge recommendation

> Vedi **[EXPANSION.md](./EXPANSION.md)** per il piano dettagliato di espansione futura.

---

## KPI di riferimento per fase

| Fase | Volontari | Associazioni | Enti Formativi | Certificazioni Emesse |
|------|-----------|-------------|--------------|---------------|
| 0 — Fondamenta | — | — | — | — (test) |
| 1 — Validazione | 50-100 | 2-3 | 0-1 | 100-300 |
| 2 — Crescita | 500-2.000 | 20-50 | 5-10 | 2.000-10.000 |
| 3 — Maturità | 10.000+ | 100+ | 50+ | 50.000+ |
| 4 — Espansione | 50.000+ | 500+ | 2.000+ | 250.000+ |

---

*CivicWallet — Un badge alla volta, costruiamo la cittadinanza attiva.*
