# CivicWallet — Termini e Condizioni Generali di Utilizzo

**Ultimo aggiornamento**: Marzo 2026

---

## 1. Definizioni

- **"Piattaforma"**: l'infrastruttura digitale CivicWallet, accessibile via web, comprensiva di tutte le API, il database e i servizi blockchain collegati.
- **"Titolare"**: il soggetto giuridico che gestisce CivicWallet (di seguito anche "Noi" o "CivicWallet").
- **"Utente"**: qualsiasi persona fisica che accede alla Piattaforma, incluso il Volontario.
- **"Volontario"**: persona fisica che svolge attività di volontariato presso un ETS e utilizza la Piattaforma per la gestione del proprio portfolio formativo.
- **"ETS"**: Ente del Terzo Settore, ai sensi del D.Lgs. 117/2017 (Codice del Terzo Settore).
- **"Admin ETS"**: utente designato dall'ETS con diritti di gestione dei volontari della propria associazione.
- **"CERT_ISSUER"**: Admin ETS abilitato ad attestare certificazioni ufficiali sulla Piattaforma.
- **"Badge" / "SBT"**: attestazione digitale non trasferibile (Soulbound Token) emessa su blockchain Polygon PoS.
- **"Libretto Formativo Digitale"**: raccolta strutturata di ore, competenze e certificazioni di un Volontario, esportabile in formato digitale.

---

## 2. Oggetto del Servizio

CivicWallet è un'infrastruttura digitale (middleware) che fornisce:

1. **Registrazione e certificazione** delle ore di volontariato e delle competenze acquisite;
2. **Emissione di attestazioni digitali immutabili** (Soulbound Token) su blockchain Polygon PoS;
3. **Gestione del Libretto Formativo Digitale**, con export per finalità di riconoscimento ai sensi del Decreto interministeriale 31 luglio 2025 (CFU, PCTO, concorsi pubblici);
4. **Integrazione con gestionali esistenti** (es. AppAmbulanza) tramite API e webhook autenticati.

---

## 3. Accettazione dei Termini

L'accesso e l'utilizzo della Piattaforma comportano l'accettazione integrale e senza riserve dei presenti Termini. L'Utente che non intenda accettare i presenti Termini è tenuto a non utilizzare la Piattaforma.

---

## 4. Registrazione e Account

### 4.1 Requisiti
- L'Utente deve avere almeno **16 anni** di età.
- La registrazione richiede un indirizzo email valido.
- L'accesso avviene tramite Thirdweb Connect (login email/social), che genera automaticamente un wallet digitale in-app.

### 4.2 Responsabilità dell'Utente
L'Utente è l'unico responsabile:
- della riservatezza delle proprie credenziali di accesso;
- di tutte le attività svolte sul proprio account;
- della comunicazione tempestiva di eventuali utilizzi non autorizzati.

### 4.3 Chiusura Account
L'Utente può richiedere la chiusura dell'account in qualsiasi momento scrivendo a [privacy@civicwallet.it]. La chiusura comporta:
- la cancellazione dei dati off-chain (database), fatti salvi gli obblighi di legge;
- la revoca (burn) dei Badge on-chain, ove tecnicamente possibile;
- la perdita dell'accesso al Libretto Formativo Digitale.

---

## 5. Ruolo di CivicWallet: Intermediario Tecnologico

### 5.1 Natura del servizio
CivicWallet agisce come **mero intermediario tecnologico** ai sensi dell'Art. 16 del D.Lgs. 70/2003 (Direttiva E-Commerce). La Piattaforma:
- **non verifica** la veridicità o l'autenticità delle informazioni inserite dagli Admin ETS o dai CERT_ISSUER;
- **non sostituisce** gli enti di formazione o le autorità competenti nel rilascio delle certificazioni ufficiali;
- **non rilascia** titoli abilitanti aventi valore legale autonomo.

### 5.2 Responsabilità del CERT_ISSUER
Il CERT_ISSUER che attesta una certificazione sulla Piattaforma (es. BLSD, Soccorritore Esecutore AREU) dichiara e garantisce che:
- è autorizzato dall'ETS o dall'ente formatore a compiere tale attestazione;
- le informazioni inserite corrispondono a fatti realmente accaduti e a certificazioni effettivamente rilasciate;
- l'attestazione non viola alcuna normativa vigente.

**Il CERT_ISSUER e l'ETS di appartenenza sono gli unici responsabili** della veridicità delle certificazioni attestate. CivicWallet non risponde per attestazioni false, erronee o non autorizzate inserite da terzi.

### 5.3 Responsabilità dell'Admin ETS
L'Admin ETS è responsabile:
- della corretta gestione dei volontari della propria associazione;
- dell'accuratezza dei dati relativi alle ore e alle attività inserite tramite webhook o manualmente;
- dell'assegnazione del ruolo CERT_ISSUER esclusivamente a figure legittimate.

---

## 6. Badge e Soulbound Token

### 6.1 Natura dei Badge
I Badge emessi da CivicWallet sono **Soulbound Token (SBT)** su blockchain Polygon PoS. Essi:
- **non sono trasferibili** ad altri utenti o wallet;
- **non hanno valore monetario** e non sono convertibili in denaro o criptovalute;
- **non costituiscono** titoli di credito, strumenti finanziari, o crypto-asset ai sensi del Regolamento MiCAR (UE 2023/1114);
- **non rappresentano** una forma di remunerazione o retribuzione del volontariato ai sensi dell'Art. 17 del D.Lgs. 117/2017;
- hanno valore esclusivamente **attestativo, onorifico e certificativo**.

### 6.2 Mint e Revoca
- Il minting del Badge avviene su richiesta esplicita del Volontario ("lazy minting").
- CivicWallet si riserva il diritto di revocare (burn) un Badge in caso di:
  - attestazione fraudolenta accertata;
  - richiesta dell'ente emittente;
  - richiesta dell'Utente.
- La revoca è irreversibile.

### 6.3 Immutabilità
Una volta registrato su blockchain, il Badge non può essere modificato. Eventuali correzioni avverranno tramite revoca del Badge errato ed emissione di uno nuovo.

---

## 7. Gratuità e Non-Remuneratività

### 7.1 Principio fondamentale
CivicWallet rispetta integralmente il **principio di gratuità del volontariato** sancito dall'Art. 17 del D.Lgs. 117/2017. I Badge e il Libretto Formativo:
- non costituiscono *corrispettivo* per l'attività svolta;
- non conferiscono *vantaggi patrimoniali diretti o indiretti*;
- rappresentano esclusivamente una **certificazione di competenze e merito civico**.

### 7.2 Eventuali benefici pubblici
Qualora autorità pubbliche (Comuni, Regioni, Enti) deliberino agevolazioni per i volontari certificati (es. trasporti, musei), tali benefici:
- derivano da **atti amministrativi autonomi** dell'ente pubblico;
- non sono promessi né erogati da CivicWallet;
- non configurano remunerazione del volontariato.

---

## 8. Proprietà Intellettuale

### 8.1 Software
Il codice sorgente di CivicWallet è rilasciato con licenza *open-source* *(specificare licenza: MIT/Apache 2.0/GPL)*. I contributi al progetto sono soggetti ai termini della licenza scelta.

### 8.2 Contenuti Utente
L'Utente mantiene la titolarità dei propri dati personali e delle informazioni inserite. Concede a CivicWallet una licenza non esclusiva, gratuita e revocabile per il trattamento dei dati secondo le finalità indicate nella Privacy Policy.

---

## 9. Limitazione di Responsabilità

### 9.1 Esclusione di garanzie
La Piattaforma è fornita "as is" ("così com'è"). CivicWallet non garantisce:
- la disponibilità continua e ininterrotta del servizio;
- l'assenza di errori, bug o vulnerabilità di sicurezza;
- la permanenza dei dati su blockchain in caso di eventi catastrofici sulla rete Polygon.

### 9.2 Limitazione
CivicWallet non è responsabile per:
- danni diretti o indiretti derivanti dall'uso o dall'impossibilità di uso della Piattaforma;
- perdita di dati causata da eventi al di fuori del proprio ragionevole controllo (force majeure);
- comportamenti o attestazioni false di Admin ETS, CERT_ISSUER o terzi;
- decisioni di enti terzi basate sui dati contenuti nel Libretto Formativo (es. ammissione a concorsi, concessione CFU).

---

## 10. Sospensione e Terminazione

CivicWallet si riserva il diritto di:
- **sospendere** temporaneamente l'accesso a un account in caso di sospetta violazione dei presenti Termini;
- **disabilitare** permanentemente un account in caso di violazione accertata;
- **revocare** il ruolo CERT_ISSUER o Admin ETS in caso di abuso.

Prima della sospensione o disabilitazione, CivicWallet comunicherà all'Utente le motivazioni via email, salvo che l'urgenza della situazione non lo consenta.

---

## 11. Modifiche ai Termini

CivicWallet può modificare i presenti Termini in qualsiasi momento. Le modifiche saranno comunicate via email o tramite avviso sulla Piattaforma con un preavviso di almeno **15 giorni**. L'uso continuato della Piattaforma dopo la scadenza del preavviso costituisce accettazione delle modifiche.

---

## 12. Legge Applicabile e Foro Competente

I presenti Termini sono regolati dalla **legge italiana**. Per ogni controversia derivante dall'utilizzo della Piattaforma è competente in via esclusiva il **Foro di [sede legale del Titolare]**.

Per le controversie con consumatori residenti nell'UE, è disponibile la piattaforma ODR della Commissione Europea: [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).

---

## 13. Contatti

Per informazioni, domande o reclami relativi ai presenti Termini:

- **Email**: info@civicwallet.it
- **Privacy**: privacy@civicwallet.it

---

*Accedendo alla Piattaforma CivicWallet, l'Utente dichiara di aver letto, compreso e accettato integralmente i presenti Termini e Condizioni Generali di Utilizzo.*
