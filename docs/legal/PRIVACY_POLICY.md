# CivicWallet — Informativa sul Trattamento dei Dati Personali

*Ai sensi degli Artt. 13-14 del Regolamento UE 2016/679 (GDPR)*

**Ultimo aggiornamento**: Marzo 2026

---

## 1. Titolare del Trattamento

**CivicWallet** (di seguito "Titolare" o "Piattaforma")
Email: [privacy@civicwallet.it]

Il Titolare è responsabile del trattamento dei dati personali raccolti attraverso la piattaforma web CivicWallet e i servizi ad essa collegati.

---

## 2. Responsabile della Protezione dei Dati (DPO)

*(Da nominare formalmente prima del go-live, ai sensi dell'Art. 37 GDPR)*

Contatto provvisorio: [dpo@civicwallet.it]

---

## 3. Categorie di Dati Trattati

### 3.1 Dati identificativi e di contatto
- Nome e cognome
- Indirizzo email
- Numero di telefono (facoltativo)
- Codice fiscale dell'associazione di appartenenza

### 3.2 Dati relativi all'attività di volontariato (dati formativi/professionali)
- Ore di servizio prestate
- Turni effettuati (data, ora inizio/fine)
- Certificazioni formative ottenute (tipologia, ente emittente, data conseguimento, data scadenza)
- Competenze e qualifiche professionali (es. BLSD, Soccorritore Esecutore AREU, qualifiche CRI/ANPAS)
- Badge e attestazioni digitali ricevute

> **Nota**: Le certificazioni trattate (BLSD, corsi 120h, qualifiche CRI/ANPAS) sono classificate come **dati formativi e professionali ordinari**, NON come dati relativi alla salute (Art. 9 GDPR). CivicWallet non tratta in alcun caso dati sanitari, diagnosi, cartelle cliniche o informazioni sullo stato di salute dei volontari.

### 3.3 Dati tecnici e di navigazione
- Indirizzo IP
- Tipo di browser e sistema operativo
- Timestamp delle sessioni di accesso
- Log delle operazioni effettuate sulla piattaforma

### 3.4 Dati su registro distributo (Blockchain)
- **Nessun dato direttamente identificativo** è registrato on-chain
- Vengono registrati esclusivamente:
  - Hash crittografici (keccak256) non reversibili
  - Indirizzo wallet (generato automaticamente dal sistema, non correlabile all'identità senza accesso al database off-chain)
  - Metadati del badge (tipologia, ente emittente — in forma anonimizzata —, data)
- I dati on-chain sono **pseudonimizzati** ai sensi dell'Art. 4(5) GDPR

---

## 4. Finalità e Basi Giuridiche del Trattamento

| Finalità | Base Giuridica (Art. 6 GDPR) | Dati Trattati |
|----------|----------------------------|---------------|
| Gestione account e autenticazione | Esecuzione contrattuale (Art. 6.1.b) | Email, wallet address |
| Registrazione ore e certificazioni di volontariato | Consenso esplicito (Art. 6.1.a) | Ore, turni, certificazioni |
| Emissione badge SBT su blockchain | Consenso esplicito (Art. 6.1.a) | Hash dati, wallet address |
| Verifica idoneità operativa del volontario | Legittimo interesse dell'ETS (Art. 6.1.f) | Certificazioni, scadenze |
| Generazione del Libretto Formativo Digitale | Esecuzione contrattuale (Art. 6.1.b) | Ore, certificazioni, badge |
| Export CV / attestazioni per Decreto 2025 | Consenso esplicito (Art. 6.1.a) | Dati formativi aggregati |
| Sicurezza della piattaforma e prevenzione abusi | Legittimo interesse (Art. 6.1.f) | IP, log tecnici |
| Adempimenti fiscali e legali | Obbligo di legge (Art. 6.1.c) | Dati identificativi |

---

## 5. Modalità di Trattamento

### 5.1 Trattamento Off-Chain (Database)
I dati personali sono conservati in un database **PostgreSQL 16** ospitato su server **VPS Aruba** dedicato, fisicamente situato in **Italia/UE**, con le seguenti misure di sicurezza:
- Crittografia a riposo (AES-256)
- Crittografia in transito (TLS 1.2+)
- Accesso limitato tramite autenticazione e autorizzazione role-based (UFW + Fail2Ban)
- Backup automatici giornalieri (03:00) con retention di 30 giorni
- Il server è sotto **controllo diretto del Titolare**: nessun dato transita o è archiviato presso provider cloud terzi per lo storage principale

### 5.2 Trattamento On-Chain (Blockchain Polygon PoS)
I dati registrati su blockchain sono limitati a **hash crittografici** e Soulbound Token non trasferibili. La blockchain Polygon PoS è una rete pubblica; pertanto i dati ivi registrati sono:
- **Immutabili**: non possono essere modificati o cancellati dalla rete
- **Pubblicamente accessibili**: chiunque può leggere le transazioni
- **Pseudonimizzati**: nessun dato personale diretto è presente; l'associazione tra hash e identità è possibile solo attraverso il database off-chain

> **Nota importante**: In caso di esercizio del diritto alla cancellazione (Art. 17 GDPR), i dati off-chain verranno eliminati e il token on-chain verrà revocato (burned). L'hash residuo nella cronologia delle transazioni non sarà più riconducibile ad alcuna persona fisica, poiché la chiave di associazione sarà stata distrutta.

---

## 6. Conservazione dei Dati

| Categoria di Dati | Periodo di Conservazione |
|-------------------|--------------------------|
| Dati account | Per la durata del rapporto + 12 mesi dalla cancellazione |
| Ore e turni | 10 anni (prescrizione ordinaria per obblighi documentali ETS) |
| Certificazioni sanitarie | Per la durata di validità + 5 anni dalla scadenza |
| Log tecnici e di sicurezza | 12 mesi dalla generazione |
| Dati on-chain (hash) | Permanenti sulla rete blockchain (pseudonimizzati) |

---

## 7. Trasferimento dei Dati

I dati personali **non vengono trasferiti** al di fuori dello Spazio Economico Europeo (SEE).

- **Database**: VPS Aruba con sede in Italia/UE, sotto controllo diretto del Titolare. **Nessun dato viene inviato a provider cloud terzi** per lo storage principale.
- **Hosting frontend/API**: Vercel (server in regione UE quando disponibile; in caso di routing tramite server extra-UE, è in vigore la decisione di adeguatezza per il Data Privacy Framework UE-USA). *Nota: il frontend è statico e non contiene dati personali.*
- **Blockchain**: Polygon PoS è una rete decentralizzata; i dati pseudonimizzati sono replicati globalmente sui nodi della rete. Poiché non contengono PII diretti, il trasferimento non comporta rischi aggiuntivi per gli interessati.

---

## 8. Diritti dell'Interessato

Ai sensi degli Artt. 15-22 GDPR, l'interessato ha diritto di:

| Diritto | Descrizione | Come Esercitarlo |
|---------|-------------|------------------|
| **Accesso** (Art. 15) | Ottenere conferma del trattamento e copia dei propri dati | Email a privacy@civicwallet.it o dalla dashboard utente |
| **Rettifica** (Art. 16) | Correggere dati inesatti o incompleti | Dashboard utente o email |
| **Cancellazione** (Art. 17) | Richiedere la cancellazione dei dati off-chain e il burn del token on-chain | Email con richiesta formale |
| **Limitazione** (Art. 18) | Limitare il trattamento in determinate circostanze | Email |
| **Portabilità** (Art. 20) | Ricevere i propri dati in formato strutturato (JSON/CSV) | Export dalla dashboard o email |
| **Opposizione** (Art. 21) | Opporsi al trattamento basato su legittimo interesse | Email |
| **Revoca consenso** | Revocare il consenso in qualsiasi momento, senza pregiudizio per il trattamento precedente | Dashboard utente o email |

**Tempi di risposta**: Entro 30 giorni dalla ricezione della richiesta, prorogabili di ulteriori 60 giorni in caso di complessità (con comunicazione motivata).

**Reclamo**: L'interessato ha il diritto di proporre reclamo all'**Autorità Garante per la Protezione dei Dati Personali** ([www.garanteprivacy.it](https://www.garanteprivacy.it)).

---

## 9. Cookie e Tecnologie di Tracciamento

CivicWallet utilizza esclusivamente **cookie tecnici** necessari al funzionamento della piattaforma (sessione, autenticazione). Non vengono utilizzati cookie di profilazione o di terze parti a fini pubblicitari.

In caso di future integrazioni con strumenti analitici, verrà implementato un banner di consenso conforme alla Direttiva ePrivacy e alle Linee Guida del Garante Privacy italiano (provvedimento del 10 giugno 2021).

---

## 10. Sicurezza dei Dati (Art. 32 GDPR)

CivicWallet implementa le seguenti misure tecniche e organizzative:

- **Crittografia**: TLS 1.2+ per dati in transito, AES-256 per dati a riposo
- **Autenticazione**: Login via email con wallet automatico (Thirdweb Connect), eliminando la gestione diretta di chiavi private
- **Autorizzazione**: Modello RBAC (Role-Based Access Control) con 4 livelli (Volontario, Admin ETS, CERT_ISSUER, Admin Piattaforma)
- **Validazione Webhook**: Firma HMAC-SHA256 per ogni comunicazione inter-sistema
- **Rate Limiting**: Protezione contro attacchi brute-force su tutte le API
- **Audit Trail**: Log immutabili di tutte le operazioni critiche (emissione badge, revoche, modifiche permessi)
- **Principio di minimizzazione**: Solo hash crittografici su blockchain, zero PII on-chain

---

## 11. Processo Decisionale Automatizzato

CivicWallet utilizza processi automatizzati per:
- **Verifica eligibilità badge**: Il sistema verifica automaticamente se un volontario ha raggiunto i requisiti per un badge (es. 60 ore in 12 mesi). Questo processo non produce effetti giuridici significativi e il volontario mantiene sempre il controllo sulla decisione di riscattare (mint) il badge.
- **Notifiche scadenze**: Invio automatico di promemoria per certificazioni in scadenza.

Nessuna decisione automatizzata ai sensi dell'Art. 22 GDPR viene applicata senza intervento umano o possibilità di contestazione.

---

## 12. Contatti

Per qualsiasi domanda relativa al trattamento dei dati personali:

- **Email**: privacy@civicwallet.it
- **PEC**: *(da attivare prima del go-live)*

---

*Il presente documento è soggetto ad aggiornamenti. L'ultima versione è sempre disponibile all'indirizzo della piattaforma CivicWallet.*
