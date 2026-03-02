# CivicWallet — Valutazione d'Impatto sulla Protezione dei Dati (DPIA)

*Ai sensi dell'Art. 35 del Regolamento UE 2016/679 (GDPR)*

**Ultimo aggiornamento**: Marzo 2026
**Stato**: Bozza — da validare con DPO prima del go-live

---

## 1. Necessità della DPIA

La DPIA è **obbligatoria** per CivicWallet in quanto il trattamento presenta le seguenti caratteristiche ad alto rischio (cfr. Linee Guida WP248 rev.01 e lista Garante Privacy italiano):

- **Uso di tecnologie innovative** (blockchain / DLT)
- **Trattamento su larga scala** di dati relativi a volontari (potenzialmente migliaia)
- **Monitoraggio sistematico** delle attività (ore, turni, certificazioni)

> **Nota sulla classificazione dei dati**: Le certificazioni trattate (BLSD, Soccorritore Esecutore 120h, qualifiche CRI/ANPAS) sono **dati formativi e professionali**, NON dati relativi alla salute ai sensi dell'Art. 9 GDPR. Il fatto che il contenuto formativo riguardi l'ambito sanitario non rende il dato stesso un "dato sanitario". CivicWallet non tratta in alcun modo dati sullo stato di salute dei volontari. Pertanto, non si applicano le basi giuridiche rafforzate dell'Art. 9 GDPR.

---

## 2. Descrizione Sistematica del Trattamento

### 2.1 Natura del trattamento
CivicWallet raccoglie, registra e certifica le attività di volontariato e le certificazioni sanitarie di volontari del soccorso in Italia. Il servizio opera come middleware tra i gestionali delle associazioni (es. AppAmbulanza) e un registro distribuito (Polygon PoS) per l'emissione di attestazioni immutabili.

### 2.2 Ambito
| Parametro | Dettaglio |
|-----------|----------|
| **Interessati** | Volontari ETS, Admin ETS, CERT_ISSUER |
| **Volume stimato** | 1.000-50.000 utenti nella fase pilota-scalata |
| **Area geografica** | Italia |
| **Dati trattati** | Identificativi, ore volontariato, certificazioni formative/professionali, hash crittografici, wallet address |
| **Basi giuridiche** | Consenso (Art. 6.1.a), Esecuzione contrattuale (Art. 6.1.b), Legittimo interesse (Art. 6.1.f), Obbligo di legge (Art. 6.1.c) |

### 2.3 Flusso dei dati

```
Volontario ──> App ETS (es. AppAmbulanza)
                    │
                    ▼ [Webhook HMAC]
              CivicWallet API
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
    Database    Blockchain   Utente
   (Supabase    (Polygon    (Dashboard
    EU, PG)      PoS)       Web/Export)
```

### 2.4 Finalità
1. Certificazione e portabilità delle competenze di volontariato
2. Attestazione immutabile di qualifiche operative (BLSD, Soccorritore, ecc.)
3. Generazione del Libretto Formativo Digitale (Decreto 2025)
4. Verifica real-time dell'idoneità operativa

---

## 3. Valutazione della Necessità e Proporzionalità

| Principio GDPR | Valutazione | Misure |
|-----------------|-------------|--------|
| **Minimizzazione** (Art. 5.1.c) | ✅ Adeguata | Solo hash su blockchain; PII esclusivamente off-chain |
| **Limitazione finalità** (Art. 5.1.b) | ✅ Adeguata | Dati usati solo per certificazione, non per marketing |
| **Limitazione conservazione** (Art. 5.1.e) | ⚠️ Parziale | Dati off-chain con retention definita; hash on-chain permanenti (ma pseudonimizzati) |
| **Esattezza** (Art. 5.1.d) | ✅ Adeguata | Meccanismo di rettifica via dashboard + burn/re-mint on-chain |
| **Liceità** (Art. 5.1.a) | ✅ Adeguata | Consenso esplicito con granularità per ogni finalità |

---

## 4. Valutazione dei Rischi

### 4.1 Matrice dei rischi

| # | Rischio | Probabilità | Impatto | Livello | Misure di mitigazione |
|---|---------|-------------|---------|---------|----------------------|
| R1 | **Re-identificazione da hash on-chain** — Un attaccante potrebbe tentare di correlare hash on-chain con dati off-chain | Bassa | Alto | Medio | Hash keccak256 con salt; separazione fisica dei database; distruzione salt su esercizio diritto cancellazione |
| R2 | **Violazione database off-chain** — Accesso non autorizzato al DB PostgreSQL 16 su VPS Aruba | Bassa | Alto | Medio | Crittografia AES-256 a riposo; TLS 1.2+; RBAC; UFW firewall; Fail2Ban; backup giornalieri cifrati; accesso SSH con chiave RSA |
| R3 | **Attestazione fraudolenta da CERT_ISSUER** — Un CERT_ISSUER compromesso attesta certificazioni false | Media | Alto | Alto | Audit trail immutabile; doppia verifica per certificazioni critiche; revocabilità immediata del ruolo |
| R4 | **Impossibilità di cancellazione completa** — Dati su blockchain non eliminabili | Certa | Basso | Medio | Solo hash pseudonimizzati on-chain; burn del token; distruzione chiave di associazione off-chain → dato on-chain non più riconducibile |
| R5 | **Data breach via webhook** — Intercettazione del payload webhook tra AppAmbulanza e CivicWallet | **Bassissima** | Medio | **Basso** | HMAC-SHA256 su ogni payload; TLS end-to-end; rate limiting; **comunicazione locale su VPS stesso** (latenza 0, nessun transito Internet) |
| R6 | **Profilazione involontaria** — Aggregazione di dati (ore, competenze, turni) crea un profilo dettagliato del volontario | Media | Medio | Medio | Accesso ai dati aggregati limitato al singolo volontario e al proprio Admin ETS; nessuna condivisione cross-associazione senza consenso |
| R7 | **Dipendenza da infrastruttura** — Indisponibilità del VPS Aruba | Bassa | Alto | Medio | Backup automatici giornalieri (retention 30gg); monitoring ogni 15 min; piano di disaster recovery documentato; upgrade VPS pianificato |

### 4.2 Rischio residuo complessivo: **MEDIO**

Il trattamento presenta rischi mitigabili con le misure indicate. Non si ravvisa un rischio residuo "elevato" che richieda la consultazione preventiva dell'Autorità Garante (Art. 36 GDPR).

---

## 5. Misure di Mitigazione Adottate

### 5.1 Misure Tecniche

| Misura | Descrizione | Rischi mitigati |
|--------|-------------|-----------------|
| **Pseudonimizzazione on-chain** | Solo hash keccak256 (con salt) su blockchain | R1, R4 |
| **Crittografia** | AES-256 a riposo, TLS 1.2+ in transito | R2 |
| **RBAC** | 4 livelli di accesso (Volontario, Admin ETS, CERT_ISSUER, Admin Piattaforma) | R3, R6 |
| **HMAC-SHA256** | Firma crittografica su ogni webhook | R5 |
| **Audit trail** | Log immutabili di ogni operazione (mint, revoke, role change) | R3 |
| **Burn on-chain** | Possibilità di revocare SBT e distruggere chiave associativa | R4 |
| **Rate limiting** | Throttling su API pubbliche e webhook | R5 |
| **Backup cifrati** | Backup giornalieri in regione UE | R2, R7 |

### 5.2 Misure Organizzative

| Misura | Descrizione | Rischi mitigati |
|--------|-------------|-----------------|
| **DPA con Sub-responsabili** | Accordi formali con Supabase, Vercel, Thirdweb | R2, R7 |
| **Formazione CERT_ISSUER** | Procedura di onboarding obbligatoria prima dell'abilitazione | R3 |
| **Policy Data Breach** | Notifica al Titolare entro 48h, supporto nella gestione | R2, R5 |
| **Privacy by Design** | Architettura progettata per minimizzazione dati fin dall'inizio | R1, R6 |
| **Revisione periodica** | DPIA rivista ogni 12 mesi o a seguito di modifiche significative | Tutti |

---

## 6. Parere del DPO

*(Da compilare a cura del DPO prima del go-live)*

Il DPO è stato consultato durante la redazione della presente DPIA.

- **Parere**: _________________________________
- **Data**: _________________________________
- **Firma**: _________________________________

---

## 7. Consultazione Preventiva (Art. 36 GDPR)

Sulla base della valutazione effettuata, il rischio residuo dopo l'applicazione delle misure di mitigazione è classificato come **MEDIO**. Non si ritiene pertanto necessaria la consultazione preventiva dell'Autorità Garante per la Protezione dei Dati Personali.

Qualora le misure si rivelassero insufficienti o emergessero nuovi rischi, CivicWallet si riserva di avviare la consultazione preventiva ex Art. 36 GDPR.

---

## 8. Revisione e Aggiornamento

La presente DPIA sarà rivista:
- **ogni 12 mesi** a partire dalla data di pubblicazione;
- **immediatamente** in caso di:
  - modifiche significative al trattamento (nuove categorie di dati, nuovi Sub-responsabili);
  - incidenti di sicurezza rilevanti;
  - modifiche normative che impattino il trattamento (es. nuove pronunce del Garante su blockchain).

---

## 9. Registro delle Revisioni

| Versione | Data | Autore | Descrizione Modifica |
|----------|------|--------|---------------------|
| 1.0 | Marzo 2026 | CivicWallet Team | Prima stesura |

---

*Documento redatto ai sensi dell'Art. 35 GDPR e delle Linee Guida WP248 rev.01 del Gruppo di Lavoro Art. 29 (oggi EDPB).*
