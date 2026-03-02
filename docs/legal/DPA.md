# CivicWallet — Accordo per il Trattamento dei Dati Personali (DPA)

*Ai sensi dell'Art. 28 del Regolamento UE 2016/679 (GDPR)*

**Ultimo aggiornamento**: Marzo 2026

---

## 1. Premesse

Il presente Accordo (di seguito "DPA") disciplina il trattamento dei dati personali effettuato da **CivicWallet** (di seguito "Responsabile del Trattamento") per conto dell'**Ente del Terzo Settore** (di seguito "Titolare del Trattamento" o "ETS") che sottoscrive il presente accordo.

Il DPA integra e fa parte delle Condizioni Generali di Utilizzo (Terms of Service) della piattaforma CivicWallet. In caso di conflitto tra il contenuto del presente DPA e le Condizioni Generali, prevalgono le disposizioni del presente DPA per quanto riguarda il trattamento dei dati personali.

---

## 2. Definizioni

I termini utilizzati nel presente DPA hanno il significato attribuito dal Regolamento UE 2016/679 (GDPR), in particolare:
- **"Dati Personali"**: qualsiasi informazione relativa a persona fisica identificata o identificabile (Art. 4.1 GDPR);
- **"Trattamento"**: qualsiasi operazione su Dati Personali (Art. 4.2 GDPR);
- **"Interessato"**: la persona fisica a cui si riferiscono i Dati (nel contesto di CivicWallet: il Volontario);
- **"Sub-responsabile"**: un soggetto terzo incaricato dal Responsabile di svolgere specifiche attività di trattamento.

---

## 3. Oggetto e Durata del Trattamento

### 3.1 Oggetto
Il Responsabile tratta i Dati Personali dei Volontari dell'ETS esclusivamente per le seguenti finalità:
- Registrazione delle ore di servizio e dei turni
- Gestione del ciclo di vita delle certificazioni formative (emissione, scadenza, rinnovo)
- Emissione di Badge SBT su blockchain Polygon PoS
- Generazione del Libretto Formativo Digitale
- Verifica dell'idoneità operativa

### 3.2 Categorie di Dati trattati
- Dati identificativi (nome, cognome, email)
- Dati relativi all'attività di volontariato (ore, turni, certificazioni formative/professionali)
- Dati tecnici (wallet address, hash crittografici)

### 3.3 Categorie di Interessati
- Volontari iscritti presso l'ETS
- Admin ETS e CERT_ISSUER autorizzati dall'ETS

### 3.4 Durata
Il presente DPA resta in vigore per tutta la durata del rapporto contrattuale tra l'ETS e CivicWallet, e per i 12 mesi successivi alla cessazione, limitatamente alle operazioni di restituzione e cancellazione dei dati.

---

## 4. Obblighi del Responsabile (CivicWallet)

CivicWallet si impegna a:

### 4.1 Istruzioni documentate
Trattare i Dati Personali esclusivamente sulla base delle istruzioni documentate del Titolare, salvo che il diritto dell'Unione o degli Stati membri applicabile non imponga diversamente (Art. 28.3.a GDPR).

### 4.2 Riservatezza
Garantire che le persone autorizzate a trattare i Dati Personali si siano impegnate alla riservatezza o siano soggette a un adeguato obbligo legale di riservatezza (Art. 28.3.b GDPR).

### 4.3 Misure di sicurezza (Art. 32 GDPR)
Implementare le seguenti misure tecniche e organizzative:

| Ambito | Misura |
|--------|--------|
| Crittografia in transito | TLS 1.2+ per tutte le comunicazioni |
| Crittografia a riposo | AES-256 per database PostgreSQL |
| Controllo accessi | RBAC con 4 livelli di autorizzazione |
| Autenticazione | Login non-custodial via Thirdweb Connect |
| Pseudonimizzazione | Solo hash keccak256 su blockchain, zero PII on-chain |
| Backup | Automatici giornalieri, retention 30 giorni, server UE |
| Audit trail | Log immutabili di operazioni critiche |
| Rate limiting | Protezione brute-force su API |
| Webhook security | Firma HMAC-SHA256 per comunicazioni inter-sistema |

### 4.4 Sub-responsabili
CivicWallet si avvale dei seguenti Sub-responsabili:

| Sub-responsabile | Servizio | Sede | Garanzie |
|------------------|----------|------|-----------|
| **Aruba S.p.A.** | Server VPS / Database PostgreSQL 16 | Italia (UE) | Fornitore EU, data center certificati ISO 27001 |
| **Vercel Inc.** | Hosting frontend statico (Next.js) | UE/USA | DPA Vercel, Data Privacy Framework UE-USA |
| **Thirdweb Inc.** | SDK Blockchain / Auth wallet | USA | DPA Thirdweb, Data Privacy Framework UE-USA |
| **Polygon (MATIC)** | Blockchain PoS (solo dati pseudonimizzati) | Decentralizzato | Rete pubblica; nessun PII trasmesso |

> **Nota**: Il database PostgreSQL 16 è ospitato direttamente su VPS Aruba, **sotto il controllo diretto del Titolare**, eliminando la dipendenza da provider cloud terzi per lo storage dei dati personali. Questo riduce il perimetro dei Sub-responsabili e rafforza la posizione GDPR del Titolare.

Il Titolare autorizza preventivamente l'uso dei Sub-responsabili elencati. CivicWallet notificherà al Titolare qualsiasi intenzione di modifica (aggiunta o sostituzione) con un preavviso di almeno **15 giorni**, durante i quali il Titolare può opporsi per giustificati motivi.

### 4.5 Assistenza al Titolare
CivicWallet assiste il Titolare:
- nel fornire riscontro alle richieste degli Interessati (diritti di accesso, rettifica, cancellazione, portabilità);
- nell'adempimento degli obblighi relativi alla sicurezza del trattamento, alla notifica di violazioni, alla DPIA e alla consultazione preventiva;
- mettendo a disposizione tutte le informazioni necessarie per dimostrare il rispetto degli obblighi di legge.

### 4.6 Notifica violazioni (Data Breach)
In caso di violazione dei Dati Personali (Art. 33 GDPR), CivicWallet:
- notificherà il Titolare **senza ingiustificato ritardo** e comunque entro **48 ore** dalla scoperta;
- fornirà tutte le informazioni necessarie (natura della violazione, categorie e numero approssimativo di interessati, conseguenze probabili, misure adottate);
- collaborerà con il Titolare per la gestione dell'incidente e la comunicazione all'Autorità Garante e/o agli Interessati.

---

## 5. Obblighi del Titolare (ETS)

L'ETS si impegna a:
- garantire di avere la **base giuridica** per il trattamento dei Dati Personali dei propri Volontari e di aver fornito l'informativa ex Art. 13 GDPR;
- impartire a CivicWallet **istruzioni documentate** conformi alla normativa vigente;
- designare come CERT_ISSUER esclusivamente **figure effettivamente autorizzate** dall'ente formatore o dall'ETS stesso;
- comunicare tempestivamente a CivicWallet qualsiasi variazione che possa incidere sul trattamento.

---

## 6. Restituzione e Cancellazione dei Dati

Al termine del rapporto contrattuale, CivicWallet, secondo le istruzioni del Titolare:
- **restituirà** tutti i Dati Personali in formato strutturato (JSON/CSV);
- **cancellerà** tutti i Dati Personali dai propri sistemi e da quelli dei Sub-responsabili entro 30 giorni dalla richiesta;
- fornirà **certificazione scritta** dell'avvenuta cancellazione.

**Eccezione**: i dati su blockchain (hash crittografici pseudonimizzati e SBT) non possono essere cancellati dalla rete pubblica. In caso di richiesta di cancellazione, il badge SBT verrà revocato (burned) e la chiave di associazione off-chain distrutta, rendendo i dati residui on-chain **non più riconducibili** ad alcuna persona fisica.

---

## 7. Audit

Il Titolare ha il diritto di verificare la conformità del Responsabile al presente DPA tramite:
- richiesta di documentazione (politiche di sicurezza, report di audit, certificazioni);
- audit in loco o da parte di un revisore indipendente, con un preavviso di almeno 30 giorni.

CivicWallet collaborerà ragionevolmente con tali verifiche. I costi degli audit in loco sono a carico del Titolare, salvo che l'audit riveli una non-conformità materiale da parte del Responsabile.

---

## 8. Legge Applicabile

Il presente DPA è regolato dalla **legge italiana** e dal **Regolamento UE 2016/679 (GDPR)**.

---

## 9. Sottoscrizione

Il presente DPA è sottoscritto al momento dell'attivazione del servizio CivicWallet da parte dell'ETS, tramite accettazione digitale (checkbox) durante il processo di onboarding.

---

**Per il Responsabile (CivicWallet)**:

Nome: _________________________________
Ruolo: _________________________________
Data: _________________________________
Firma: _________________________________

**Per il Titolare (ETS)**:

Denominazione ETS: _________________________________
Legale Rappresentante: _________________________________
Codice Fiscale: _________________________________
Data: _________________________________
Firma: _________________________________
