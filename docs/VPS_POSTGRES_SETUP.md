# CivicWallet — Setup Database PostgreSQL su VPS Aruba

Questo documento guida la creazione del database CivicWallet sul VPS Aruba esistente, co-locato con AppAmbulanza (GestioneModelloSaaS).

---

## 1. Prerequisiti

Il VPS Aruba ha già PostgreSQL 16 in esecuzione (Docker o nativo).

Verifica che sia attivo:
```bash
# Se PostgreSQL gira nativo sul VPS:
sudo systemctl status postgresql

# Se gira in Docker (come AppAmbulanza):
docker ps | grep postgres
```

---

## 2. Creazione Database e Utente

Accedi al VPS via SSH e crea il database dedicato a CivicWallet:

```bash
ssh root@80.211.137.124
```

Connettiti a PostgreSQL con l'utente admin:
```bash
# Se nativo:
sudo -u postgres psql

# Se Docker (adatta al nome del container):
docker exec -it <postgres-container> psql -U postgres
```

Esegui i comandi SQL:
```sql
-- Crea il database
CREATE DATABASE civicwallet_db
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'it_IT.UTF-8'
  LC_CTYPE   = 'it_IT.UTF-8'
  TEMPLATE   = template0;

-- Crea l'utente applicativo (NON usare superuser)
CREATE USER civicwallet_user WITH PASSWORD 'SCEGLI_PASSWORD_FORTE_QUI';

-- Concedi i privilegi minimi necessari
GRANT CONNECT ON DATABASE civicwallet_db TO civicwallet_user;
GRANT CREATE ON DATABASE civicwallet_db TO civicwallet_user;

-- Connettiti al nuovo DB e imposta i permessi sullo schema
\c civicwallet_db

GRANT USAGE ON SCHEMA public TO civicwallet_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO civicwallet_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO civicwallet_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO civicwallet_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO civicwallet_user;

\q
```

---

## 3. Configurazione .env.local

Sul server CivicWallet (o in locale per sviluppo), copia il file `.env.example` e imposta la variabile:

```bash
cp .env.example .env.local
nano .env.local
```

Imposta:
```env
DATABASE_URL="postgresql://civicwallet_user:SCEGLI_PASSWORD_FORTE_QUI@localhost:5432/civicwallet_db"
```

> **Se CivicWallet gira in Docker sullo stesso VPS**: usa `network_mode: host` (come GestioneModelloSaaS) oppure il nome del servizio PostgreSQL come host.

---

## 4. Esecuzione Migrazioni Prisma

```bash
# Da locale (durante sviluppo), puntando al DB remoto via .env:
pnpm prisma migrate dev --name init

# In produzione sul VPS:
pnpm prisma migrate deploy
```

Se vuoi verificare che lo schema sia stato applicato correttamente:
```bash
pnpm prisma studio
```

---

## 5. Sicurezza Aggiuntiva

### 5.1 Firewall (UFW)
Il DB è già protetto da UFW — PostgreSQL deve essere accessibile SOLO localhost (o rete Docker interna):
```bash
# Verifica che la porta 5432 NON sia aperta all'esterno:
sudo ufw status | grep 5432
# Non deve apparire nessuna regola ALLOW per 5432 verso 0.0.0.0
```

### 5.2 pg_hba.conf
Verifica che `pg_hba.conf` permetta la connessione solo da localhost:
```
# Aggiungere questa riga (se non presente):
local   civicwallet_db   civicwallet_user                  scram-sha-256
host    civicwallet_db   civicwallet_user  127.0.0.1/32    scram-sha-256
```

### 5.3 Backup
I backup di AppAmbulanza (giornalieri alle 03:00) possono essere estesi per includere CivicWallet:
```bash
# Aggiungere al cron di backup esistente:
pg_dump -U civicwallet_user civicwallet_db | gzip > /backups/civicwallet_$(date +%Y%m%d).sql.gz
```

---

## 6. Vantaggio Co-Location con AppAmbulanza

Poiché CivicWallet e AppAmbulanza condividono il VPS:

- I **webhook** tra AppAmbulanza → CivicWallet viaggiano su **localhost** (nessun transito Internet).
- La latenza è **< 1ms** invece dei tipici 50-200ms di una chiamata HTTPS esterna.
- Zero costi di traffico dati tra i servizi.
- Un solo vendor (Aruba S.p.A., GDPR-compliant) per entrambi i DB.

---

*Documento creato: Marzo 2026 — da aggiornare dopo ogni migrazione Prisma significativa.*
