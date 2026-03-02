# CivicWallet — Piano di Espansione Futura

**Dalla piattaforma per il volontariato all'infrastruttura di identità civica italiana**

> Versione 1.0 — Febbraio 2026

---

## 1. Visione a lungo termine

CivicWallet nasce per riconoscere il volontariato, ma la sua architettura Soulbound Token è progettata per diventare un **layer universale di identità civica** — un portafoglio digitale che raccoglie ogni forma di merito civico, verificabile da istituzioni, aziende e comunità.

```
               ┌───────────────────────────────────────────┐
               │       CIVICWALLET ECOSYSTEM 2028+         │
               ├───────────────────────────────────────────┤
               │                                           │
               │  ┌──────────┐  ┌──────────┐  ┌────────┐  │
               │  │Volontari.│  │Protezione│  │Servizio│  │
               │  │ ETS      │  │ Civile   │  │Civile  │  │
               │  └────┬─────┘  └────┬─────┘  └───┬────┘  │
               │       │             │             │       │
               │       └──────┬──────┘─────────────┘       │
               │              │                            │
               │     ┌────────┴────────┐                   │
               │     │  CIVIC IDENTITY │                   │
               │     │    LAYER        │                   │
               │     └────────┬────────┘                   │
               │              │                            │
               │    ┌─────┬───┴───┬──────┐                 │
               │    │     │       │      │                 │
               │  ┌─┴──┐┌─┴──┐┌──┴──┐┌──┴──┐              │
               │  │Comm.││PA  ││Univ.││Corp.│              │
               │  │Loc. ││    ││     ││     │              │
               │  └─────┘└────┘└─────┘└─────┘              │
               └───────────────────────────────────────────┘
```

---

## 2. Espansione Verticale — Nuovi ambiti di merito civico

### 2.1 Protezione Civile (H2 2027)

**Opportunità**: L'Italia ha 300.000+ volontari di protezione civile — un settore dove la certificazione delle competenze è ancora più critica.

| Badge proposti | Requisito |
|----------------|-----------|
| Allertamento Base | Formazione base completata |
| Operatore Campo | 10+ interventi documentati |
| Coordinatore Emergenza | Ruolo di coordinamento in emergenza reale |
| Pioggia di Fuoco | Partecipazione a campagna antincendio |
| Soccorso Alluvione | Intervento in emergenza idrogeologica |

**Integrazione**: webhook con sistemi regionali di protezione civile (es. piattaforme SO115, Dewetra).

### 2.2 Servizio Civile Universale (2027-2028)

**Opportunità**: 50.000+ giovani ogni anno svolgono il Servizio Civile in Italia. CivicWallet può certificare le competenze acquisite.

| Badge proposti | Requisito |
|----------------|-----------|
| Operatore Civile | Completamento 12 mesi di servizio |
| Project Leader | Gestione di un progetto autonomo |
| Cultural Guardian | Servizio in ambito patrimonio culturale |
| Green Volunteer | Servizio in ambito ambientale |

**Integrazione**: API con piattaforme SCU (Dipartimento Politiche Giovanili).

### 2.3 Volontariato Scolastico e PCTO (2027)

**Opportunità**: Il PCTO (Percorsi per le Competenze Trasversali e l'Orientamento) coinvolge milioni di studenti. CivicWallet può fornire attestazioni blockchain verificabili.

| Badge proposti | Requisito |
|----------------|-----------|
| Student Volunteer | 30+ ore PCTO verificate |
| Community Impact | Progetto con impatto comunitario misurabile |
| Peer Educator | Formazione attiva verso altri studenti |

**Integrazione**: collaborazione con scuole e piattaforma Alternanza.

### 2.4 Community Service Comunale (2028)

**Opportunità**: Molti comuni italiani hanno programmi di partecipazione civica. CivicWallet può diventare lo strumento di attestazione.

| Badge proposti | Requisito |
|----------------|-----------|
| Cittadino Attivo | Partecipazione a 5+ iniziative comunali |
| Consulta Partecipativa | Membro attivo di consulte locali |
| Verde Urbano | 50+ ore di cura del verde pubblico |
| Assistenza Sociale | Supporto a programmi sociali comunali |

### 2.5 Attestazione Certificazioni di Soccorso (Q2 2026 — Q4 2026)

> **Innovazione chiave**: nessuna piattaforma in Italia offre attestazioni blockchain per le certificazioni di soccorso volontario. CivicWallet sarebbe la prima.

**Il panorama**: il sistema formativo italiano per il soccorso è complesso e frammentato tra enti regionali e nazionali:

| Ente | Corsi principali | Durata |
|------|-----------------|--------|
| **AREU** (Lombardia) | Soccorritore Esecutore (78h), SSE completo (120h+60h tirocinio) | 78-180h |
| **CRI** | Corso base (24-26h), EFAC, 8+ aree di specializzazione | 24-200+h |
| **ANPAS** | Addetto SSE (120h), Operatore PC (OCN/AIB) | 120h+ |
| **Misericordie** | Livello I (20h), Livello II (95-120h) | 20-120h |
| **Trasversale** | BLSD/DAE (rinnovo biennale), Guida Emergenza | 8-16h |

**Cosa esiste oggi in Italia per blockchain + credenziali:**

| Piattaforma | Settore | Copre volontariato? |
|-------------|---------|---------------------|
| CIMEA Diplome | Titoli di studio esteri | ❌ No |
| UniTorino Blockcerts | Diplomi universitari | ❌ No |
| KeCert (ITS Piemonte) | Certificati formativi ITS | ❌ No |
| LutinX BBadge | Volontariato generico (non IT) | ⚠️ Non italiano |
| **CivicWallet** | **Certificazioni soccorso ETS** | **✅ Prima in Italia** |

**Architettura attestazione**:

1. **Upload**: Admin ETS con ruolo `CERT_ISSUER` carica attestato (PDF/foto) + metadati
2. **Hash**: sistema calcola `keccak256` dell'attestato per verifica futura
3. **Validazione**: match tipo corso × ente × data × eventuale scadenza
4. **Mint**: SBT con metadati estesi (ente, tipo corso, ore, hash attestato)
5. **Scadenza**: monitoraggio automatico con notifiche pre-scadenza (BLSD ogni 2 anni)

**Percorso di integrazione**:
- **Fase 1 (Q2 2026)**: AREU + BLSD (il core soccorso) — manuale via CERT_ISSUER
- **Fase 2 (Q3-Q4 2026)**: CRI, ANPAS, Misericordie — multi-ente, API automatizzata
- **Fase 3 (2027+)**: Interoperabilità con EUDI Wallet e standard Verifiable Credentials W3C
### 2.6 Integration Hub: Agnosticità Gestionale

**L'opportunità**: Le organizzazioni di volontariato sul territorio nazionale utilizzano una miriade di software gestionali diversi. Non costringere le associazioni a cambiare gestionale è un vantaggio competitivo decisivo per l'adozione di CivicWallet.

**L'architettura**: Abbiamo progettato un **Integration Hub** universale tramite il modello `IntegrationSource`. Questo permette a CivicWallet di ricevere dati passivamente o attivamente da qualsiasi piattaforma.

**Piattaforme di integrazione target:**
- **AppAmbulanza**: Piattaforma di base per turni e attività.
- **GAIA (Cri.it)**: Gestionale centrale della Croce Rossa Italiana (oltre 150k volontari). Architettura chiusa ma accessibile tramite API.
- **Bernardo Gestionale**: Diffuso tra Misericordie, ANPAS e alcuni comitati CRI locali. Focus su turni e amministrazione.
- **VolontApp**: App specifica molto diffusa nelle Misericordie (es. Toscana) per prenotazione turni.
- **Anpasoft (by Butti Computer) / Sinfonia Web**: Sistemi gestionali storici radicati in molte pubbliche assistenze.

Le modalità di scambio dati spaziano dai webhook (real-time) alle API pull periodiche (sincronizzazione asincrona), garantendo copertura totale a prescindere dal livello tecnologico dell'associazione.

## 3. Espansione Orizzontale — Nuovi stakeholder

### 3.1 Pubblica Amministrazione (PA)

```
Comune / Regione ──API──> CivicWallet
                              │
              ┌───────────────┴──────────────┐
              │                              │
    Dashboard PA con statistiche     "Carta Civica" digitale
    aggregate sul volontariato        per il cittadino
              │                              │
    Report per bilancio sociale      Benefit PA (es. riduzione
    e rendicontazione                tassa rifiuti, parcheggio)
```

**Prodotto**: *CivicWallet PA* — portale white-label per comuni:

- Dashboard con metriche aggregate sui volontari del territorio
- Emissione diretta di badge comunali
- "Carta del Merito Civico" digitale integrabile con servizi PA
- Report per bilancio sociale e programmazione

### 3.2 Università e Centri di Formazione

**Prodotto**: *CivicWallet Campus* — riconoscimento del volontariato nel curriculum accademico:

- Badge verificabili allegabili a CV e portfolio
- Integrazione con Europass e Open Badges v3.0
- Crediti formativi (CFU) legati a badge specifici
- Partnership con Career Service universitari

### 3.3 Aziende CSR (Corporate Social Responsibility)

**Prodotto**: *CivicWallet Corporate* — volontariato d'impresa certificato:

- Badge per dipendenti che fanno volontariato aziendale
- Dashboard CSR per tracking impatto sociale
- Integrazione con piattaforme HR (SAP SuccessFactors, Workday)
- Report GRI (Global Reporting Initiative) automatizzati

---

## 4. Espansione Tecnologica

### 4.1 Verifiable Credentials (W3C Standard)

Evoluzione da Soulbound Token a **Verifiable Credentials** interoperabili:

```
┌─────────────────────────────────────────────────────────┐
│                  DUAL-LAYER IDENTITY                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 1: Soulbound Token (on-chain)                    │
│  ├── Prova immutabile e pubblica                        │
│  ├── Verificabile da chiunque                           │
│  └── Costo gas minimo su Polygon                        │
│                                                         │
│  Layer 2: Verifiable Credential (off-chain)             │
│  ├── Dati arricchiti (ore, competenze, contesto)        │
│  ├── Selective disclosure (ZK-proof)                    │
│  ├── Compatibile con W3C DID                            │
│  └── Interoperabile con EBSI (EU Blockchain)            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Timeline**: Q1 2028 — Integrazione con EBSI (European Blockchain Services Infrastructure).

### 4.2 Zero-Knowledge Proofs

Abilitare la **verifica senza rivelare**:

- Un volontario può dimostrare di avere "più di 50 ore" senza rivelare il numero esatto
- Un commerciante può verificare "ha almeno 1 badge" senza sapere quale
- Un comune può generare statistiche aggregate senza accedere ai dati individuali

**Tecnologia target**: Polygon zkEVM o Mina Protocol per ZK computations.

### 4.3 Interoperability Hub

```
CivicWallet ←→ Open Badges v3.0 (IMS Global)
CivicWallet ←→ Europass Digital Credentials
CivicWallet ←→ EBSI (EU Blockchain)
CivicWallet ←→ SPID / CIE (identità digitale italiana)
CivicWallet ←→ IO App (app dei servizi pubblici)
```

### 4.4 AI & Predictive Analytics

- **Badge Suggestion**: ML model che suggerisce badge in base al pattern di attività
- **Churn Prediction**: identificare volontari a rischio di abbandono
- **Impact Scoring**: calcolo dell'impatto sociale aggregato per associazione/territorio
- **Fraud Detection**: rilevamento anomalie nelle ore registrate

---

## 5. Espansione Internazionale

### 5.1 Fase 1 — EU Southern (2028)

| Paese | Settore target | Partner potenziali |
|-------|---------------|-------------------|
| 🇪🇸 Spagna | Voluntariado Social | Cruz Roja Española |
| 🇵🇹 Portogallo | Voluntariado Comunitário | Cruz Vermelha Portuguesa |
| 🇬🇷 Grecia | Εθελοντισμός | Hellenic Red Cross |

### 5.2 Fase 2 — EU Core (2029)

| Paese | Settore target | Partner potenziali |
|-------|---------------|-------------------|
| 🇩🇪 Germania | Ehrenamt | DRK (Croce Rossa Tedesca) |
| 🇫🇷 Francia | Bénévolat | Croix-Rouge française |
| 🇳🇱 Paesi Bassi | Vrijwilligerswerk | Het Rode Kruis |

### 5.3 Adattamenti necessari

- **Normativo**: conformità con leggi nazionali sul volontariato
- **Linguistico**: localizzazione completa (UI, badge names, descrizioni)
- **Infrastrutturale**: integrazione con sistemi di identità nazionali (eIDAS 2.0)
- **Culturale**: adattamento dei badge e delle soglie al contesto locale

---

## 6. Modello di revenue scalabile

### Tier Free (sempre gratuito)
- Volontari: wallet, badge, QR code
- Associazioni ETS: registrazione, webhook, gestione volontari
- Commercianti: registrazione, 1 regola sconto attiva

### Tier Community (€29/mese per ETS)
- Analytics avanzate per associazione
- Report PDF automatizzati
- Supporto prioritario
- Widget embeddabile per sito web

### Tier Professional (€99/mese per Merchant bundle)
- Analytics avanzate per commercianti
- Regole sconto illimitate
- Campagne promozionali mirate
- Badge "Merchant Premium"

### Tier Enterprise (custom pricing)
- White-label per PA e aziende
- API dedicata con SLA
- Customizzazione badge e branding
- Supporto dedicato + onboarding

### Grants & Finanziamenti
- **Horizon Europe** — Digital Society & Innovation
- **PNRR** — Digitalizzazione e innovazione (M1C1)
- **Erasmus+** — Cooperazione per il volontariato europeo
- **Digital Europe Programme** — Blockchain & AI
- **Bandi regionali** — Innovazione sociale

---

## 7. Potenziale impatto sociale

### Metriche di impatto a 5 anni (scenario ottimistico)

| Metrica | 2026 | 2027 | 2028 | 2029 | 2030 |
|---------|------|------|------|------|------|
| Volontari certificati | 500 | 5.000 | 25.000 | 80.000 | 200.000 |
| Associazioni attive | 20 | 100 | 400 | 1.000 | 3.000 |
| Commercianti aderenti | 100 | 500 | 2.000 | 5.000 | 15.000 |
| Badge emessi | 2.000 | 20.000 | 100.000 | 400.000 | 1.000.000 |
| Sconti erogati | 1.000 | 15.000 | 80.000 | 300.000 | 1.000.000 |
| Ore di volontariato tracciate | 10.000 | 100.000 | 500.000 | 2.000.000 | 5.000.000 |

### Impatto qualitativo

- **Per i volontari**: riconoscimento tangibile, motivazione, benefit concreti
- **Per le associazioni**: fidelizzazione volontari, metriche per funding, visibilità
- **Per i commercianti**: customer loyalty, responsabilità sociale, marketing etico
- **Per la PA**: dati aggregati per policy making, bilancio sociale, programmazione
- **Per la società**: incentivazione del volontariato, coesione sociale, economia circolare del merito

---

## 8. Rischi e mitigazioni

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|------------|---------|-------------|
| Bassa adozione iniziale | Media | Alto | Pilota territoriale concentrato, partnership CSV |
| Evoluzione normativa crypto | Media | Medio | SBT non monetari, consulenza legale continua |
| Scalabilità tecnica | Bassa | Medio | Architettura modulare, migrazione graduale |
| Concorrenza | Bassa | Medio | First-mover advantage, focus su Italia |
| Frode/Gaming delle ore | Media | Alto | HMAC webhook, audit trail, anomaly detection |
| GDPR enforcement | Bassa | Alto | Privacy by design, DPO, assessment periodici |
| Costi blockchain | Bassa | Basso | Polygon PoS < €0.001/mint, batch minting |

---

## 9. Partnership strategiche prioritarie

### Immediate (2026)
1. **CSV (Centri Servizi per il Volontariato)** — Distribuzione e onboarding associazioni
2. **Confcommercio / Confesercenti** — Onboarding commercianti
3. **AppAmbulanza.it** — Integrazione dati volontariato ✅ (già in corso)

### A medio termine (2027)
4. **ANCI (Associazione Nazionale Comuni Italiani)** — Portale PA
5. **AGID (Agenzia per l'Italia Digitale)** — Integrazione SPID/CIE
6. **Dipartimento Protezione Civile** — Verticalizzazione PC

### A lungo termine (2028+)
7. **European Volunteer Centre (CEV)** — Espansione UE
8. **European Commission DG CNECT** — Programma EBSI
9. **Fondazioni corporate** (Fondazione Cariplo, Compagnia di San Paolo) — Funding

---

## 10. Conclusioni

CivicWallet non è solo una piattaforma tecnologica: è un'**infrastruttura per il merito civico**. Partendo dal volontariato ETS — un settore con bisogni reali e immediati — possiamo costruire progressivamente un ecosistema che:

1. **Riconosce** ogni forma di impegno civico
2. **Verifica** le attestazioni in modo immutabile e trasparente
3. **Premia** la cittadinanza attiva con benefit concreti
4. **Connette** volontari, istituzioni, commercianti e comunità
5. **Scala** dall'Italia all'Europa grazie a standard aperti

> *"Il volontariato non ha prezzo, ma merita riconoscimento."*

---

*CivicWallet — Infrastruttura civica per l'Italia che si impegna.*
