# CivicWallet — Proposta Istituzionale

**Infrastruttura Digitale per la Certificazione e la Portabilità delle Competenze nel Soccorso Volontario**

> Versione 2.0 (Executive) — Marzo 2026

---

## Abstract

CivicWallet è un'infrastruttura digitale (middleware) progettata per risolvere il problema della frammentazione dei titoli formativi nel Terzo Settore italiano. 
Agendo in background ai sistemi gestionali esistenti (es. AppAmbulanza), fornisce un **Libretto Formativo Digitale** per ogni soccorritore. La piattaforma acquisisce i dati sulle ore di servizio e le certificazioni sanitarie (BLSD, Soccorritore Esecutore, ecc.) e le trasforma in attestazioni **immutabili, portabili e verificabili legalmente**, sfruttando internamente un protocollo crittografico a registro distribuito.

L'obiettivo è azzerare la burocrazia per i responsabili della formazione e garantire in tempo reale l'idoneità operativa di ogni volontario, fornendo al contempo un portfolio professionale digitale riconosciuto per l'accesso al mondo del lavoro.

---

## 1. Problema

### 1.1 Frammentazione dei titoli formativi

L'Italia conta oltre **5,5 milioni di volontari** attivi. Nel settore dell'emergenza-urgenza sanitaria, la gestione delle competenze e delle scadenze è critica:

- **Burocrazia soffocante**: I responsabili formazione impiegano enormi risorse per verificare la validità di brevetti BLSD, certificazioni e attestati cartacei/PDF sparsi tra svariati database o faldoni.
- **Rischio normativo e operativo**: L'impiego operativo di personale con certificazioni scadute espone le associazioni ETS a rischi civili e penali incalcolabili.
- **Zero portabilità**: Un volontario che cambia associazione o regione deve affrontare iter reiterati per il riconoscimento delle proprie qualifiche faticosamente ottenute.

### 1.2 L'opportunità del Decreto 31 luglio 2025

Con il **Decreto interministeriale 31 luglio 2025** (G.U. 24 ottobre 2025), il quadro normativo è cambiato radicalmente. Il volontariato certificato (minimo 60 ore in 12 mesi con progetto personalizzato) garantisce ora:
- **Crediti formativi (CFU) e scolastici (PCTO)**
- **Titoli di preferenza nei concorsi pubblici** (a parità di punteggio)
- **Riconoscimento ufficiale nel mondo del lavoro**

Tuttavia, le associazioni non hanno gli strumenti digitali per certificare in modo inoppugnabile e automatizzato queste competenze, perdendo una leva di motivazione e reclutamento immensa, specialmente per gli under-35.

### 1.3 I limiti degli strumenti attuali

| Strumento Attuale | Rischio/Limite Operativo |
|-------------------|--------------------------|
| Certificati cartacei | Soggetti a smarrimento, falsificabili, non verificabili istantaneamente (es. di notte durante un'emergenza). |
| Fogli di calcolo (Excel) | Estremamente fragili, inclini ad errore umano, non interoperabili tra sedi. |
| Database silos locali | Non comunicanti. Se un volontario ha un BLSD valido nell'associazione A, l'associazione B non può verificarlo in automatico. |
| Tessere associative | DIMOSTRANO l'appartenenza, NON DIMOSTRANO la validità corrente delle abilitazioni sanitarie. |

---

## 2. Soluzione: Il Registro Digitale Certificato

CivicWallet si propone come il **Passaporto del Volontario**: un'infrastruttura di certificazione che opera come un registro notarile invisibile, svincolando la certificazione dall'ente che la produce transitoriamente per legarla permanentemente all'operatore.

### 2.1 Architettura a Livelli (Middleware Integrato)

```
    ┌─────────────────────────────────────────┐
    │      LIVELLO 3 — PORTFOLIO UTENTE       │
    │  Libretto Formativo portabile (Export   │
    │  CV, LinkedIn, Certificati Decreto 2025)│
    ├─────────────────────────────────────────┤
    │      LIVELLO 2 — NOTARIZZAZIONE         │
    │  Certificati Immutabili garantiti da    │
    │  Protocollo a Registro Distribuito (DLT)│
    ├─────────────────────────────────────────┤
    │      LIVELLO 1 — ACQUISIZIONE DATI      │
    │  Integrazione nativa (API/Webhook) con  │
    │  i gestionali esistenti (AppAmbulanza)  │
    └─────────────────────────────────────────┘
```

### 2.2 Pilastri della Soluzione

1. **Integrità Legale (Immutabilità)** — Un certificato attestato dal responsabile autorizzato non è alterabile né contraffabile retroattivamente.
2. **Privacy by Design** — Rigorosa segregazione dei dati. Nessun dato personale è esposto sul registro crittografico pubblico (utilizzo di impronte digitali hash). Conformità totale al GDPR.
3. **Verifica Real-Time** — Qualsiasi preposto (es. Capo Squadra, Coordinamento 118) può accertare in 2 secondi l'idoneità operativa del volontario.
4. **Boost Professionale (Decreto 2025)** — Il volontario costruisce un curriculum professionale digitale. La piattaforma mappa le ore certificate (min. 60h/anno) abilitando automaticamente i requisiti per CFU universitari e preferenze nei concorsi pubblici, esportabili in un click (PDF sicuro, LinkedIn Open Badge).

---

## 3. Architettura Tecnica

### 3.1 Stack tecnologico

| Componente | Tecnologia |
|-----------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Database | PostgreSQL 16 locale su VPS Aruba (con Prisma ORM) |
| Blockchain | Polygon PoS (ERC-1155 Soulbound) |
| Smart Contract | Solidity 0.8.20+, OpenZeppelin v5 |
| SDK Blockchain | Thirdweb SDK v5 |
| Autenticazione | Thirdweb Connect (email / social login → wallet in-app) |
| Deploy | Vercel (frontend) + Docker su VPS Aruba (API/DB) |
| Testing | Vitest + Playwright + Hardhat |

### 3.2 Smart Contract: `CivicBadge.sol`

Lo smart contract è un **ERC-1155 con override Soulbound**:

```solidity
// Soulbound: solo mint (from == 0) e burn (to == 0) consentiti
function _update(address from, address to, ...) internal override {
    if (from != address(0) && to != address(0)) {
        revert TransferBlocked();
    }
    super._update(from, to, ids, values);
}

// Approvazioni disabilitate
function setApprovalForAll(address, bool) public pure override {
    revert TransferBlocked();
}
```

**Caratteristiche principali:**

- **AccessControl**: `MINTER_ROLE` per il backend, `DEFAULT_ADMIN_ROLE` per l'admin
- **Pausable**: il contratto può essere messo in pausa in caso di emergenza
- **Deduplication**: mapping `hasBadge` impedisce la doppia emissione
- **Eventi**: `BadgeMinted`, `BadgeRevoked`, `BadgeTypeAdded` per tracciabilità

### 3.3 Database Schema

Il database è progettato per separare completamente i dati personali (off-chain) dagli identificativi on-chain:

```
User ──── Volunteer ──── ActivityLog
  │           │               │
  │           ├── BadgeClaim ──┤
  │           │       │        │
  │           ├── MintedBadge  │
  │           │                │
  │           └── QRToken      │
  │                            │
  ├── Merchant ── DiscountRule ── Redemption
  │
  ├── ETSAdmin ── Association ──┘
  │
  └── Notification

WebhookLog ── ActivityLog
BadgeType ── BadgeClaim, MintedBadge, DiscountRule
```

**14 modelli** con relazioni complete:

- **User**: wallet address, ruoli (`VOLUNTEER`, `ETS_ADMIN`, `CERT_ISSUER`, `PLATFORM_ADMIN`), consenso GDPR
- **Volunteer**: ore totali, turni, legame con associazione
- **Association**: nome, codice fiscale, città, webhook secret HMAC
- **BadgeClaim**: stato (`PENDING` → `CLAIMED` / `EXPIRED` / `REVOKED`), lazy minting
- **MintedBadge**: transaction hash, mint status, wallet address
- **DiscountRule**: percentuale sconto, validità temporale, max redemptions
- **QRToken**: token monouso con scadenza per verifica Merchant

### 3.4 Flusso dati e sicurezza

```
AppAmbulanza ──webhook──> CivicWallet API
                              │
              ┌── HMAC validation ──┐
              │                     │
         [valid]              [invalid]
              │                     │
     ProcessActivity            Reject
              │
     Update Volunteer Hours
              │
     Check Badge Eligibility
              │ (if milestone reached)
     Create BadgeClaim (PENDING)
              │
     Notify Volunteer
              │ (volunteer clicks "Riscatta")
     Mint Soulbound Token on Polygon
              │
     BadgeClaim → CLAIMED
     MintedBadge → CONFIRMED
```

**Sicurezza:**

- Webhook con validazione HMAC per ogni associazione
- Nessun dato PII (Personally Identifiable Information) on-chain
- Hash `keccak256` per collegare identità off-chain / on-chain
- Rate limiting su tutte le API
- Token QR monouso con scadenza di 5 minuti

### 3.5 Integration Hub Multi-Piattaforma

CivicWallet non è vincolata a un singolo gestionale: attraverso un **Integration Hub** dinamico, può ricevere dati da qualsiasi piattaforma di gestione volontari.

```
┌─────────────────────────────────────────────────────────┐
│              CIVICWALLET INTEGRATION HUB                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌─────────┐  ┌──────────┐             │
│  │AppAmbulanza│  │GAIA CRI │  │ Bernardo │             │
│  │ (webhook)  │  │(API pull)│  │(webhook) │             │
│  └─────┬──────┘  └────┬────┘  └────┬─────┘             │
│        │              │            │                     │
│  ┌─────┴──────┐  ┌────┴────┐  ┌───┴──────┐             │
│  │ Anpasoft   │  │VolontApp│  │Sinfonia  │             │
│  │ (API pull) │  │(webhook)│  │(API pull)│             │
│  └─────┬──────┘  └────┬────┘  └───┬──────┘             │
│        │              │            │                     │
│        └──────────┬───┘────────────┘                     │
│                   │                                      │
│        ┌──────────┴──────────┐                           │
│        │   Adapter Layer     │                           │
│        │  (auth + mapping +  │                           │
│        │   normalization)    │                           │
│        └──────────┬──────────┘                           │
│                   │                                      │
│        ┌──────────┴──────────┐                           │
│        │  Standardized       │                           │
│        │  ActivityLog        │                           │
│        └─────────────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

**Piattaforme supportate:**

| Piattaforma | Organizzazione | Modalità | Dati |
|-------------|---------------|----------|------|
| **AppAmbulanza** | Trasversale | Webhook (HMAC) | Turni, ore, attività |
| **GAIA** | CRI | API pull (OAuth2) | Volontari, turni, corsi, qualifiche |
| **Bernardo** | CRI/ANPAS/Misericordie | Webhook (API key) | Turni, ore, contabilità |
| **Anpasoft** | ANPAS | API pull (API key) | Volontari, turni, servizi |
| **VolontApp** | Misericordie | Webhook (API key) | Turni, corsi, notifiche |
| **Sinfonia Web** | Trasversale | API pull (Bearer) | Turni, servizi, mezzi |

**4 modalità di integrazione:**

1. **Webhook** — la piattaforma esterna invia dati a CivicWallet in tempo reale
2. **API Pull** — CivicWallet interroga periodicamente le API della piattaforma
3. **API Push** — CivicWallet invia dati alla piattaforma (bidirezionale)
4. **File Import** — importazione manuale CSV/Excel per piattaforme senza API

**Ogni integrazione è configurabile a runtime** dal pannello admin, senza modificare il codice. Il modello `IntegrationSource` nel database contiene: credenziali, field mapping (come i campi esterni mappano ai campi CivicWallet), rate limiting e stato di sync.

---

## 4. Sistema Badge

### 4.1 Tipologie di Attestazione

| ID | Nome | Categoria | Requisito | Spendibilità |
|----|------|-----------|-----------|--------------|
| 1 | Progetto 60h (Decreto 2025) | Base | Minimo 60 ore in 12 mesi | Concorsi PA, CFU universitari, PCTO scuole |
| 2 | Presenza Avanzata (150h) | Base | 150 ore di servizio logistico/sanitario | CV, Lettere di referenza |
| 10 | Mani Sicure | Competenza | Certificazione sanitaria | Qualifica operativa |
| 11 | Logistica Pro | Competenza | Certificazione logistica | Qualifica operativa |
| 12 | Capo Squadra | Competenza | Ruolo di team leader | Leadership, CV |
| 20 | Evento Eroico | Speciale | Partecipazione a emergenze | Onorificenza |
| 21 | Mentore | Speciale | Formazione di nuovi volontari | Leadership |
| **30** | **Soccorritore AREU** | **Certificazione** | Corso Soccorritore Esecutore (78h) superato | Requisito 118 |
| **31** | **SSE Completo** | **Certificazione** | Corso SSE 120h + tirocinio 60h completato | Requisito 118 |
| **32** | **BLSD Certificato** | **Certificazione** | Abilitazione BLSD/DAE in corso di validità | Operatività |
| **33** | **Volontario CRI** | **Certificazione** | Corso base CRI (24-26h) + esame superato | Ingresso CRI |
| **34** | **EFAC - First Aid** | **Certificazione** | European First Aid Certificate CRI |
| **35** | **Soccorritore ANPAS** | **Certificazione** | Qualifica soccorritore ANPAS regionale |
| **36** | **Operatore PC** | **Certificazione** | Formazione Protezione Civile completata |
| **37** | **Misericordie Lv.I** | **Certificazione** | Corso I° Livello Misericordie (20h) |
| **38** | **Misericordie Lv.II** | **Certificazione** | Corso II° Livello Misericordie (95-120h) |
| **39** | **Guida Emergenza** | **Certificazione** | Abilitazione guida mezzi di soccorso |

### 4.2 Lifecycle di un Badge

1. **Evento Originatore**: L'associazione registra un turno o il superamento di un esame
2. **Eligibility Check**: Il sistema verifica se i requisiti del badge sono soddisfatti
3. **Notifica**: Il volontario riceve una push notification ("Sei idoneo per un nuovo Badge!")
4. **Claim (Lazy Minting)**: Il volontario decide se e quando effettuare il minting
5. **Minting su Polygon**: Un Relayer paga il gas e conia l'SBT all'indirizzo del volontario
6. **Esibizione**: Il badge è visibile nel wallet e validabile tramite Export CV / QR Code

### 4.3 Modello di Gratificazione (Post-Decreto 2025)

Il passaggio al riconoscimento istituzionale sostituisce il rischioso modello a premi ("sconto al bar") con benefici professionalizzanti, etici e comunitari:

| Tipo Gratificazione | Vecchio (rischioso) | Nuovo (post-2025, solido) | Impatto Motivazionale |
|---------------------|---------------------|---------------------------|-----------------------|
| Economica | Sconto pizza 10% | Borse studio/master, donazioni matching CSR | Medio-Alto (giovani) |
| Professionale | Nulla o carta firmata | Badge LinkedIn + punti concorsi + CFU | Altissimo |
| Sociale/Identitario | Pacca spalla | Timeline, ruoli, cerimonie, leaderboard | Alto |
| Formativa | Corsi base | Priorità corsi avanzati + specializzazioni gratuite | Altissimo |
| Istituzionale | Nessuno | Agevolazioni pubbliche (parcheggi, musei, TPL) | Medio-Alto |

### 4.4 Lazy Minting

I badge utilizzano un modello di **lazy minting**:

1. Il sistema **rileva** il raggiungimento di un traguardo (es. 15 ore → Badge Bronzo)
2. Viene creato un **BadgeClaim** con stato `PENDING`
3. Il volontario riceve una **notifica** ("Hai un nuovo badge disponibile!")
4. Il volontario clicca **"Riscatta"** nella sua dashboard
5. Il sistema esegue il **minting on-chain** su Polygon PoS
6. Il badge appare nel **wallet digitale** del volontario

Questo approccio:

- **Riduce i costi** gas (mint solo quando richiesto)
- **Coinvolge il volontario** nell'esperienza
- **Evita badge indesiderati** nel wallet

### 4.3 Attestazione Certificazioni Ufficiali

Oltre ai badge di merito civico, CivicWallet è progettata per attestare su blockchain le **certificazioni ufficiali** rilasciate dagli enti di formazione del soccorso italiano. Questa funzionalità rappresenta un'innovazione significativa: **nessuna piattaforma in Italia offre attualmente attestazioni blockchain per certificazioni di volontariato**.

#### 4.3.1 Il panorama certificativo italiano

Il sistema formatico per il soccorso in Italia è strutturato su base regionale con enti riconosciuti:

| Ente | Corso | Durata | Attestato rilasciato |
|------|-------|--------|----------------------|
| **AREU** (Lombardia) | Soccorritore Esecutore | 78h teoria+pratica | Certificazione regionale + abilitazione MSB |
| **AREU** | SSE Completo | 120h + 60h tirocinio | Qualifica soccorritore extraospedaliero |
| **CRI** | Corso base volontario | 24-26h | Certificato CRI + EFAC (European First Aid Certificate) |
| **CRI** | Specializzazioni | Variabile | Certificati per area (emergenze, inclusione, motorizzazione) |
| **ANPAS** | Addetto SSE | 120h (50h teoria + 70h pratica) | Qualifica regionale soccorritore |
| **ANPAS** | Operatore PC (OCN/AIB) | Variabile | Abilitazione protezione civile |
| **Misericordie** | Livello I | ~20h | Attestato soccorritore base (ambulanza tipo B) |
| **Misericordie** | Livello II | 95-120h | Attestato soccorritore avanzato (ambulanza tipo A) |
| **Tutti** | BLSD/DAE | 8-16h | Abilitazione uso defibrillatore (rinnovo biennale) |

Questi corsi sono erogati da **CeFRA** (Centri di Formazione Riconosciuti e Accreditati) e prevedono esami teorico-pratici con commissioni regionali.

#### 4.3.2 Modello di attestazione on-chain

Le certificazioni ufficiali richiedono un modello diverso dai badge di presenza (che sono automatici). Il flusso prevede una **validazione da parte di un ente autorizzato**:

```
Volontario completa corso AREU/CRI/ANPAS/Misericordie
              │
     Ente rilascia attestato cartaceo/digitale
              │
     Admin ETS carica attestato su CivicWallet
              │ (upload PDF/foto + metadati)
     ┌── Validazione ──────────────────┐
     │                                 │
  [Opzione A]                    [Opzione B]
  Admin ETS con ruolo             API diretta
  CERT_ISSUER conferma            dall'ente formatore
     │                                 │
     └────────────┬────────────────────┘
                  │
     Sistema verifica: tipo corso, ente, scadenza
                  │
     Crea BadgeClaim (tipo CERTIFICATION)
                  │
     Mint SBT con metadati estesi:
     - Tipo certificazione
     - Ente emittente (hash)
     - Data conseguimento
     - Data scadenza (se applicabile)
     - Hash attestato originale
```

**Dati on-chain (metadati SBT):**

```json
{
  "name": "Soccorritore Esecutore AREU",
  "description": "Certificazione ufficiale Soccorritore Esecutore AREU",
  "attributes": [
    { "trait_type": "Category", "value": "CERTIFICATION" },
    { "trait_type": "Issuer", "value": "AREU Lombardia" },
    { "trait_type": "Course Hours", "value": 78 },
    { "trait_type": "Issue Date", "value": "2026-03-15" },
    { "trait_type": "Document Hash", "value": "0xabc123..." }
  ],
  "properties": {
    "soulbound": true,
    "certification_type": "AREU_SOCCORRITORE_ESECUTORE",
    "renewable": false
  }
}
```

**Nessun dato PII** è registrato on-chain. L'hash dell'attestato consente la verifica dell'autenticità senza esporre il documento originale.

#### 4.3.3 Ruolo CERTIFICATION_ISSUER

Per garantire l'autenticità delle certificazioni, CivicWallet introduce un nuovo ruolo:

| Ruolo | Chi può averlo | Capabilities |
|-------|---------------|-------------|
| `CERT_ISSUER` | Admin ETS autorizzati, referenti CeFRA | Validare e attestare certificazioni ufficiali per i volontari della propria associazione |

Questo ruolo è assegnato dal `PLATFORM_ADMIN` solo a figure riconosciute all'interno delle associazioni, creando una **catena di fiducia**: Piattaforma → Associazione → Referente Formazione → Attestazione.

#### 4.3.4 Registro Dinamico Certificazioni

L'architettura è progettata per essere **infinitamente espandibile**: nuovi tipi di certificazione vengono creati a runtime senza modificare codice o smart contract.

```
┌─────────────────────────────────────────────────────────┐
│            CertificationType (DB Registry)               │
├─────────────────────────────────────────────────────────┤
│ code: "CRI_BLSD_ADULTO"                                 │
│ issuerOrganization: "CRI"                                │
│ courseArea: "Salute"                                      │
│ courseHours: 8                                            │
│ isRenewable: true                                        │
│ renewalMonths: 24                                        │
│ level: "abilitante"                                      │
│ prerequisites: "Corso base CRI superato"                 │
├─────────────────────────────────────────────────────────┤
│         ↓ auto-genera ↓                                  │
│  BadgeType (tokenId auto-assegnato da range 30-999)      │
│         ↓ registrato on-chain ↓                          │
│  addBadgeType(tokenId) → validBadgeTypes[id] = true      │
└─────────────────────────────────────────────────────────┘
```

**Flusso per aggiungere una nuova certificazione:**

1. Il `PLATFORM_ADMIN` crea un nuovo `CertificationType` dal pannello admin
2. Il sistema auto-assegna un `tokenId` dal range 30-999
3. Il backend chiama `addBadgeType(tokenId)` sullo smart contract
4. Il nuovo badge è immediatamente disponibile per attestazione
5. **Nessun deploy, nessuna modifica al codice**

**Esempio: solo la CRI** ha 10 macro-aree con decine di corsi ciascuna:

| Area CRI | Corsi esempio |
|----------|---------------|
| Salute | Primo soccorso, BLSD adulto/pediatrico, Assistenza malato/anziano |
| Emergenza | Operatore salvataggio acqua, Soccorso speciale |
| DIU (Principi e Valori) | DIU base, monografico, specializzazione, Consigliere Qualificato |
| Inclusione Sociale | Volontariato sociale, Comunicazione efficace |
| Giovani | Educazione salute, pace, Peer education |
| Sviluppo Organizzativo | Gestione Comitati, Terzo Settore, Innovazione |
| Migrazioni | Gestione centri accoglienza, Mediazione culturale, RFL |
| Cooperazione Internazionale | Missioni internazionali, Coordinamento delegazioni |
| Motorizzazione | Guida ambulanza, mezzi speciali, Art. 138 CdS |
| Salute e Sicurezza | D.Lgs 81/08, Antincendio |

Ogni area può generare **N certificazioni** senza limiti. Lo stesso vale per AREU, ANPAS, Misericordie e futuri enti.

#### 4.3.5 Gestione scadenze e rinnovi

Alcune certificazioni hanno **scadenza** (es. BLSD/DAE ogni 2 anni). Il sistema:

1. Traccia le date di scadenza nel database off-chain
2. Invia **notifiche** ai volontari in prossimità della scadenza (30/15/7 giorni)
3. Il badge on-chain resta, ma il metadata API restituisce `"expired": true`
4. Al rinnovo, il CERT_ISSUER aggiorna lo stato e viene emesso un **nuovo SBT** con la data aggiornata
5. Il vecchio badge può essere revocato (burn) o mantenuto come storico

#### 4.3.6 Contesto italiano: blockchain e credenziali

In Italia esistono già iniziative di attestazione blockchain nel settore educativo:

| Iniziativa | Settore | Tecnologia |
|-----------|---------|------------|
| **CIMEA Diplome** | Riconoscimento titoli esteri | Blockchain (notarizzazione) |
| **UniTorino Blockcerts** | Diplomi universitari | Ethereum / Blockcerts |
| **ITS Piemonte / KeCert** | Certificati formativi ITS | Ethereum / Blockcerts MIT |
| **Villa Flaminia / EY** | Diplomi scuola superiore | Ethereum |
| **LutinX BBadge** | Volontariato generico | Solana (non italiano) |

**Nessuna** di queste piattaforme è focalizzata sulle certificazioni di soccorso e volontariato ETS. CivicWallet sarebbe la **prima piattaforma italiana** ad attestare su blockchain le qualifiche di soccorritore AREU, CRI, ANPAS e Misericordie.

A livello europeo, l'**EUDI Wallet** (previsto 2027) e l'**EBSI** (European Blockchain Services Infrastructure) stanno creando standard per le Verifiable Credentials: CivicWallet è progettata per essere interoperabile con questi standard futuri.

---

## 5. Evoluzioni Future: Sostenibilità e Convenzioni Territoriali

*(Nota Strategica: L'ipotesi iniziale di un "Ecosistema Merchant" per il rilascio di sconti diretti da singoli negozianti è stata intenzionalmente disattivata nell'MVP, per azzerare i rischi normativi legati all'Art. 17 del D.Lgs. 117/2017 in materia di divieto di remunerazione indiretta del volontariato).*

Il valore primario di CivicWallet è focalizzato sull'**efficienza organizzativa** e la **riduzione dei rischi legali** per gli ETS tramite l'inappuntabilità del dato formativo.

In fasi avanzate, la piattaforma potrà integrare pacchetti di Welfare Territoriale Istituzionale, stipulando convezioni di livello macro (es. accordi con Regioni o Comuni per gratuità nei trasporti pubblici, o crediti formativi standardizzati) slegati dal conteggio orario o economico del singolo intervento, mantenendosi così nei rigidi confini della pura promozione della cultura della solidarietà.

---

## 6. Ruoli e Permessi

| Ruolo | Capabilities |
|-------|-------------|
| **Volontario** | Visualizzazione ore, riscatta badge, export Libretto Formativo / CV |
| **Admin ETS** | Gestione volontari della propria associazione, verifica ore, assegna badge manuali |
| **CERT_ISSUER** | Attestazione certificazioni ufficiali (BLSD, SSE, ecc.) per i volontari della propria associazione |
| **Admin Piattaforma** | Gestione associazioni, badge types, utenti, analytics globali |

---

## 7. Conformità Normativa

### 7.1 GDPR (Regolamento Generale sulla Protezione dei Dati)

- **Consenso esplicito** registrato con timestamp e indirizzo IP
- **Minimizzazione dati**: solo hash keccak256 on-chain
- **Diritto all'oblio**: i dati off-chain possono essere cancellati; i token on-chain possono essere revocati (burned)
- **Crittografia**: dati PII cifrati a riposo
- **Data residency**: database PostgreSQL 16 su VPS Aruba (Italia/UE), sotto controllo diretto del Titolare. Nessun dato transita attraverso provider cloud terzi per lo storage.

### 7.2 Normativa Terzo Settore (D.Lgs. 117/2017 e successivi)

- I token **non costituiscono remunerazione** del volontariato (Art. 17). Il riconoscimento è puramente **onorifico, certificativo e formativo**.
- Piena attuazione del **Decreto interministeriale 31 luglio 2025**, fornendo agli ETS lo strato tecnologico per l'attestazione inoppugnabile del monte ore (min. 60h/anno) necessario per il riconoscimento di CFU, PCTO e preferenze nei public competition.

### 7.3 Normativa Crypto-Asset (MiCAR)

- I Soulbound Token **non rientrano** nella definizione di crypto-asset MiCAR in quanto:
  - Non sono trasferibili
  - Non hanno valore monetario
  - Non sono utilizzabili come mezzo di scambio
  - Non rappresentano un investimento

---

## 8. Modello Economico (Sostenibilità Istituzionale)

Il progetto CivicWallet supera il fragile modello di ricavo basato sui "centesimi" degli sconti commerciali, posizionandosi come un'infrastruttura B2B in grado di generare valore attraverso l'ottimizzazione dei processi e la certificazione del dato. Il modello di business è basato sulla "Sostenibilità Istituzionale".

### 8.1 Il Modello di Ricavo: Chi paga e perché?

| Segmento | Cosa acquista? | Perché paga? |
|----------|---------------|--------------|
| **Grandi ETS (CRI, ANPAS)** | SaaS / White Label | Risparmio netto sui costi di segreteria, gestione automatica scadenze (es. BLSD), eliminazione del cartaceo e del rischio legale. |
| **Pubblica Amministrazione** | Impact Reporting | Un Comune/Regione paga per avere dati aggregati, certificati e real-time sulle ore di volontariato prestate nel territorio (fondamentale per i bilanci sociali e l'allocazione fondi). |
| **Aziende (Corporate CSR)** | Verification Tool | Per certificare oggettivamente il "volontariato aziendale" dei dipendenti o fare "matching" di donazioni su base ore reali certificata blockchain (anti social-washing). |
| **Università / Enti Formativi** | API di Verifica | Per convalidare istantaneamente e in modo automatizzato i crediti formativi (CFU) o i tirocini, senza scambi di mail e PDF contraffabili. |

### 8.2 La Strategia del "Cavallo di Troia" (Low Cost Entry)

Per penetrare il mercato senza subire la naturale resistenza al cambiamento (e ai costi) delle associazioni, CivicWallet adotta un modello di pricing asimmetrico:

1. **Versione Base (Gratuita / Open Core)**
   - Dedicata al singolo volontario e alla singola sezione locale.
   - Integrazione nativa con AppAmbulanza.
   - Rilascio di badge presenza di base.
   - **Obiettivo**: Raccogliere rapidamente migliaia di utenti, creando un "effetto rete" inarrestabile dal basso.

2. **Modulo Certificazioni Legali (Premium B2B)**
   - Dedicato ai Comitati Regionali, Direzioni Nazionali o grandi consorzi.
   - Gestione completa del ciclo di vita dei documenti con valore legale (arene formazione 118, BLSD, ecc.).
   - Integrazione custom con gestionali legacy.
   - **Obiettivo**: Monetizzare il risparmio strutturale di lavoro umano (FTE) fornendo uno strumento di compliance inoppugnabile.

### 8.3 Finanziamenti a Fondo Perduto (Grant)

L'adozione delle *Verifiable Credentials* posiziona CivicWallet in linea perfetta con gli obiettivi di digitalizzazione italiani ed europei del 2026:

- **Fondo Repubblica Digitale**: Bandi per l'accrescimento delle competenze digitali (CivicWallet insegna la gestione dell'identità digitale decentralizzata on-the-job).
- **Bandi PNRR (Residui) / Fondazioni Bancarie**: Fondi destinati alla "Digitalizzazione del Terzo Settore" (Spesso vincolati all'acquisto di servizi software strutturali).

### 8.4 Roadmap di Finanziamento (6-12 mesi)

- **Mesi 1-3 (Bootstrap)**: Sviluppo dell'MVP con AppAmbulanza. Costi operativi ~€0 grazie all'infrastruttura esistente (VPS Aruba condiviso con AppAmbulanza, Vercel free tier, Polygon Gas Station).
- **Mesi 4-6 (Pilota Locale)**: Esecuzione di un pilota con un Comitato CRI/ANPAS "illuminato". Incasso di un "contributo spese" per la personalizzazione e validazione sul campo del Modulo Certificazioni.
- **Mesi 7-12 (Scale-up / CSR)**: Utilizzo delle metriche del pilota per siglare una partnership come "Sponsor Tecnico per il Volontariato" con un partner corporate (Banca/Assicurazione), garantendo la sostenibilità dell'infrastruttura su scala nazionale.

---

## 9. Differenziatori Competitivi

| Aspetto | CivicWallet | Soluzioni esistenti |
|---------|-------------|---------------------|
| Verificabilità | Blockchain pubblica | Certificati cartacei |
| Portabilità | Badge legati all'identità, non all'ente | Tesserini non interoperabili |
| Costo | Gratuito per volontari/ETS | Spesso a pagamento |
| Privacy | Zero PII on-chain, DB locale sotto controllo diretto | Dati centralizzati su cloud terzi |
| Decreto 2025 | Export automatico Libretto Formativo per CFU e concorsi | Nessun supporto |
| UX | Email login → wallet automatico | Richiede spesso conoscenze crypto |
| Trasferibilità | Impossibile (Soulbound) | N/A |

---

## 10. Team e Contatti

CivicWallet è un progetto open-source ideato per il panorama del volontariato italiano, sviluppato con lo scopo di valorizzare la cittadinanza attiva attraverso tecnologie Web3 accessibili.

**Contatto**: [info@civicwallet.it]

---

## Appendice A: Glossario

| Termine | Definizione |
|---------|------------|
| **SBT (Soulbound Token)** | Token non trasferibile legato a un'identità specifica |
| **ERC-1155** | Standard Ethereum per token fungibili e non fungibili nello stesso contratto |
| **Polygon PoS** | Blockchain Proof-of-Stake con basse commissioni e alta velocità |
| **Lazy Minting** | Creazione del token on-chain solo quando l'utente lo richiede |
| **HMAC** | Hash-based Message Authentication Code per validare i webhook |
| **ETS** | Ente del Terzo Settore (associazione di volontariato) |
| **PII** | Personally Identifiable Information — dato personale identificativo |
| **AREU** | Agenzia Regionale Emergenza Urgenza (Lombardia) |
| **CRI** | Croce Rossa Italiana |
| **ANPAS** | Associazione Nazionale Pubbliche Assistenze |
| **CeFRA** | Centro di Formazione Riconosciuto e Accreditato (da AREU) |
| **SSE** | Soccorso Sanitario Extraospedaliero (corso 120h) |
| **BLSD** | Basic Life Support and Defibrillation |
| **EFAC** | European First Aid Certificate (rilasciato da CRI) |
| **MSB** | Mezzo di Soccorso di Base (ambulanza) |
| **EBSI** | European Blockchain Services Infrastructure |
| **EUDI Wallet** | European Digital Identity Wallet (previsto 2027) |

---

## Appendice B: Riferimenti

1. Vitalik Buterin, "Soulbound" (2022) — Concetto di token non trasferibili
2. EIP-1155: Multi Token Standard
3. OpenZeppelin Contracts v5 — Librerie smart contract auditate
4. D.Lgs. 117/2017 — Codice del Terzo Settore
5. Regolamento UE 2016/679 (GDPR)
6. Regolamento MiCAR 2023/1114 — Markets in Crypto-Assets Regulation
7. AREU Lombardia — Percorso formativo Soccorritore Esecutore (areu.lombardia.it)
8. Croce Rossa Italiana — Catalogo formativo volontari (cri.it)
9. ANPAS — Formazione soccorritori e protezione civile (anpas.org)
10. Misericordie d'Italia — Corsi di formazione volontari (misericordie.it)
11. CIMEA Diplome — Notarizzazione blockchain titoli di studio (cimea-diplome.it)
12. UniTorino Blockcerts — Diplomi su Ethereum (unito.it)
13. EBSI — European Blockchain Services Infrastructure (ec.europa.eu/ebsi)
14. Regolamento eIDAS 2.0 — European Digital Identity Wallet

---

*CivicWallet — Il tuo impegno, la tua identità civica.*
