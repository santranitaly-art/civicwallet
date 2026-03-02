// On-chain badge token IDs (must match CivicBadge.sol)
export const BADGE_TOKEN_IDS = {
  // Presence badges (auto-awarded by hours)
  BRONZE_PRESENCE: 1,
  SILVER_PRESENCE: 2,
  GOLD_PRESENCE: 3,
  // Skill badges (manually awarded)
  SAFE_HANDS: 10,
  LOGISTICS_PRO: 11,
  TEAM_LEADER: 12,
  // Special badges
  HERO_EVENT: 20,
  MENTOR: 21,
  // Certification badges (attested by CERT_ISSUER)
  CERT_AREU_SOCCORRITORE: 30,
  CERT_SSE_COMPLETO: 31,
  CERT_BLSD: 32,
  CERT_CRI_VOLONTARIO: 33,
  CERT_EFAC: 34,
  CERT_ANPAS_SOCCORRITORE: 35,
  CERT_PROTEZIONE_CIVILE: 36,
  CERT_MISERICORDIE_LV1: 37,
  CERT_MISERICORDIE_LV2: 38,
  CERT_GUIDA_EMERGENZA: 39,
} as const;

// Hours thresholds for presence badges
export const HOURS_THRESHOLDS = {
  [BADGE_TOKEN_IDS.BRONZE_PRESENCE]: 15,
  [BADGE_TOKEN_IDS.SILVER_PRESENCE]: 50,
  [BADGE_TOKEN_IDS.GOLD_PRESENCE]: 200,
} as const;

// Badge display metadata
export const BADGE_METADATA = {
  [BADGE_TOKEN_IDS.BRONZE_PRESENCE]: {
    name: "Presenza Bronzo",
    color: "#bf8040",
    gradient: "from-amber-700 to-amber-500",
    icon: "Award",
  },
  [BADGE_TOKEN_IDS.SILVER_PRESENCE]: {
    name: "Presenza Argento",
    color: "#90a4ae",
    gradient: "from-slate-400 to-slate-300",
    icon: "Award",
  },
  [BADGE_TOKEN_IDS.GOLD_PRESENCE]: {
    name: "Presenza Oro",
    color: "#f9a825",
    gradient: "from-yellow-500 to-amber-400",
    icon: "Crown",
  },
  [BADGE_TOKEN_IDS.SAFE_HANDS]: {
    name: "Mani Sicure",
    color: "#e53935",
    gradient: "from-red-600 to-red-400",
    icon: "Heart",
  },
  [BADGE_TOKEN_IDS.LOGISTICS_PRO]: {
    name: "Logistica Pro",
    color: "#1e88e5",
    gradient: "from-blue-600 to-blue-400",
    icon: "Truck",
  },
  [BADGE_TOKEN_IDS.TEAM_LEADER]: {
    name: "Capo Squadra",
    color: "#7b1fa2",
    gradient: "from-purple-700 to-purple-500",
    icon: "Users",
  },
  [BADGE_TOKEN_IDS.HERO_EVENT]: {
    name: "Evento Eroico",
    color: "#ff6f00",
    gradient: "from-orange-600 to-orange-400",
    icon: "Shield",
  },
  [BADGE_TOKEN_IDS.MENTOR]: {
    name: "Mentore",
    color: "#2e7d32",
    gradient: "from-green-700 to-green-500",
    icon: "BookOpen",
  },
  // Certification badges
  [BADGE_TOKEN_IDS.CERT_AREU_SOCCORRITORE]: {
    name: "Soccorritore AREU",
    color: "#c62828",
    gradient: "from-red-800 to-red-600",
    icon: "Stethoscope",
  },
  [BADGE_TOKEN_IDS.CERT_SSE_COMPLETO]: {
    name: "SSE Completo",
    color: "#ad1457",
    gradient: "from-pink-800 to-pink-600",
    icon: "Ambulance",
  },
  [BADGE_TOKEN_IDS.CERT_BLSD]: {
    name: "BLSD Certificato",
    color: "#d32f2f",
    gradient: "from-red-700 to-red-500",
    icon: "HeartPulse",
  },
  [BADGE_TOKEN_IDS.CERT_CRI_VOLONTARIO]: {
    name: "Volontario CRI",
    color: "#b71c1c",
    gradient: "from-red-900 to-red-700",
    icon: "Cross",
  },
  [BADGE_TOKEN_IDS.CERT_EFAC]: {
    name: "EFAC — First Aid",
    color: "#0d47a1",
    gradient: "from-blue-900 to-blue-700",
    icon: "BadgeCheck",
  },
  [BADGE_TOKEN_IDS.CERT_ANPAS_SOCCORRITORE]: {
    name: "Soccorritore ANPAS",
    color: "#1565c0",
    gradient: "from-blue-800 to-blue-600",
    icon: "Siren",
  },
  [BADGE_TOKEN_IDS.CERT_PROTEZIONE_CIVILE]: {
    name: "Operatore PC",
    color: "#e65100",
    gradient: "from-orange-800 to-orange-600",
    icon: "HardHat",
  },
  [BADGE_TOKEN_IDS.CERT_MISERICORDIE_LV1]: {
    name: "Misericordie Lv.I",
    color: "#4a148c",
    gradient: "from-purple-900 to-purple-700",
    icon: "ShieldCheck",
  },
  [BADGE_TOKEN_IDS.CERT_MISERICORDIE_LV2]: {
    name: "Misericordie Lv.II",
    color: "#6a1b9a",
    gradient: "from-purple-800 to-purple-600",
    icon: "ShieldPlus",
  },
  [BADGE_TOKEN_IDS.CERT_GUIDA_EMERGENZA]: {
    name: "Guida Emergenza",
    color: "#00695c",
    gradient: "from-teal-800 to-teal-600",
    icon: "CarFront",
  },
} as const;

// Certification badges that have expiry dates
export const RENEWABLE_CERTIFICATIONS = {
  [BADGE_TOKEN_IDS.CERT_BLSD]: { renewalMonths: 24, name: "BLSD/DAE" },
} as const;

// ---------------------------------------------------------------------------
// SCALABLE CERTIFICATION REGISTRY
// ---------------------------------------------------------------------------
// New certification types are created at runtime via CertificationType DB
// model and addBadgeType() on the smart contract. Token IDs 30-999 are
// reserved for certifications and auto-assigned by the platform.
// ---------------------------------------------------------------------------

/** Token ID range reserved for dynamically-created certification badges */
export const CERTIFICATION_TOKEN_ID_RANGE = {
  MIN: 30,
  MAX: 999,
} as const;

/**
 * Issuer organizations — each can have unlimited certification types.
 * New orgs can be added without code changes (stored in CertificationType.issuerOrganization).
 */
export const ISSUER_ORGANIZATIONS = {
  AREU: { name: "AREU", fullName: "Agenzia Regionale Emergenza Urgenza", region: "Lombardia" },
  CRI: { name: "CRI", fullName: "Croce Rossa Italiana", region: "Nazionale" },
  ANPAS: { name: "ANPAS", fullName: "Associazione Nazionale Pubbliche Assistenze", region: "Nazionale" },
  MISERICORDIE: { name: "MISERICORDIE", fullName: "Confederazione Nazionale delle Misericordie d'Italia", region: "Nazionale" },
  FAPS: { name: "FAPS", fullName: "Federazione delle Associazioni di Pronto Soccorso", region: "Nazionale" },
  FVS: { name: "FVS", fullName: "Federazione Volontari del Soccorso", region: "Nazionale" },
} as const;

/**
 * CRI internal course areas — each area contains many courses.
 * These are used as the `courseArea` field in CertificationType.
 * The list can be extended at any time without code changes.
 */
export const CRI_COURSE_AREAS = {
  SALUTE: {
    name: "Salute",
    examples: ["Primo soccorso", "BLSD adulto", "BLSD pediatrico", "Assistenza al malato", "Assistenza all'anziano"],
  },
  SALUTE_SICUREZZA: {
    name: "Salute e Sicurezza",
    examples: ["D.Lgs 81/08", "Formazione base lavoratori", "Antincendio"],
  },
  EMERGENZA: {
    name: "Emergenza",
    examples: ["Operatore polivalente salvataggio acqua", "Soccorso speciale", "Gestione emergenze"],
  },
  INCLUSIONE_SOCIALE: {
    name: "Inclusione Sociale",
    examples: ["Volontariato sociale", "Comunicazione efficace", "Supporto psicologico"],
  },
  DIU: {
    name: "Principi e Valori (DIU)",
    examples: ["Diritto Internazionale Umanitario base", "DIU monografico", "DIU specializzazione", "Consigliere Qualificato"],
  },
  GIOVANI: {
    name: "Giovani",
    examples: ["Educazione alla salute", "Educazione alla pace", "Peer education"],
  },
  SVILUPPO_ORGANIZZATIVO: {
    name: "Sviluppo Organizzativo",
    examples: ["Gestione Comitati CRI", "Terzo Settore", "Comunicazione", "Innovazione"],
  },
  MIGRAZIONI: {
    name: "Migrazioni",
    examples: ["Gestione centri accoglienza", "Mediazione culturale", "RFL"],
  },
  COOPERAZIONE: {
    name: "Cooperazione Internazionale",
    examples: ["Missioni internazionali", "Coordinamento delegazioni", "Cooperazione sul campo"],
  },
  MOTORIZZAZIONE: {
    name: "Motorizzazione",
    examples: ["Guida ambulanza", "Guida mezzi speciali", "Art. 138 CdS", "Guida emergenza"],
  },
} as const;

// QR token configuration
export const QR_EXPIRY_MINUTES = Number(
  process.env.QR_TOKEN_EXPIRY_MINUTES || "5",
);

// ---------------------------------------------------------------------------
// INTEGRATION HUB — SUPPORTED PLATFORMS
// ---------------------------------------------------------------------------
// CivicWallet can receive data from any platform via adapters.
// New platforms are registered at runtime via IntegrationSource DB model.
// The following are known platforms for seed data and documentation.
// ---------------------------------------------------------------------------

/** Integration connection modes */
export const INTEGRATION_MODES = {
  WEBHOOK: "webhook",       // Platform pushes data to CivicWallet endpoint
  API_PULL: "api_pull",     // CivicWallet periodically pulls from platform API
  API_PUSH: "api_push",     // CivicWallet pushes data to platform
  FILE_IMPORT: "file_import", // Manual CSV/Excel import
} as const;

/** Authentication methods for integrations */
export const INTEGRATION_AUTH_TYPES = {
  HMAC: "hmac",
  API_KEY: "api_key",
  OAUTH2: "oauth2",
  BEARER: "bearer",
  NONE: "none",
} as const;

/**
 * Known Italian volunteer management platforms.
 * Each can be registered as an IntegrationSource at runtime.
 * New platforms can be added without code changes.
 */
export const INTEGRATION_PLATFORMS = {
  APPAMBULANZA: {
    code: "appambulanza",
    name: "AppAmbulanza.it",
    organization: "custom",
    mode: INTEGRATION_MODES.WEBHOOK,
    authType: INTEGRATION_AUTH_TYPES.HMAC,
    capabilities: ["shifts", "hours", "activities"],
    notes: "Web + mobile. Already integrated via webhook.",
  },
  GAIA_CRI: {
    code: "gaia_cri",
    name: "GAIA — Croce Rossa Italiana",
    organization: "CRI",
    mode: INTEGRATION_MODES.API_PULL, // GAIA has APIs
    authType: INTEGRATION_AUTH_TYPES.OAUTH2,
    capabilities: ["volunteers", "shifts", "courses", "qualifications", "transfers"],
    notes: "Web-based. Central CRI platform, has documented APIs. Manages all CRI volunteers nationally.",
  },
  BERNARDO: {
    code: "bernardo",
    name: "Bernardo Gestionale",
    organization: "multi", // CRI, ANPAS, Misericordie
    mode: INTEGRATION_MODES.WEBHOOK,
    authType: INTEGRATION_AUTH_TYPES.API_KEY,
    capabilities: ["shifts", "hours", "accounting", "activities"],
    notes: "Cloud-based. Used by CRI, ANPAS, and Misericordie. Modular with Turni module.",
  },
  ANPASOFT: {
    code: "anpasoft",
    name: "Anpasoft (Butti Computer)",
    organization: "ANPAS",
    mode: INTEGRATION_MODES.API_PULL,
    authType: INTEGRATION_AUTH_TYPES.API_KEY,
    capabilities: ["volunteers", "shifts", "services", "radio_room"],
    notes: "Has mobile apps (ASSO, TurnASSO). Manages member archives and vehicle checklists.",
  },
  VOLONTAPP: {
    code: "volontapp",
    name: "VolontApp",
    organization: "MISERICORDIE",
    mode: INTEGRATION_MODES.WEBHOOK,
    authType: INTEGRATION_AUTH_TYPES.API_KEY,
    capabilities: ["shifts", "courses", "notifications"],
    notes: "Web-based + iOS/Android apps. Used by Misericordie for shift management.",
  },
  SINFONIA_WEB: {
    code: "sinfoniaweb",
    name: "Sinfonia Web",
    organization: "multi",
    mode: INTEGRATION_MODES.API_PULL,
    authType: INTEGRATION_AUTH_TYPES.BEARER,
    capabilities: ["shifts", "services", "volunteers", "vehicles"],
    notes: "Multi-device (PC, tablet, smartphone). Manages ambulance fleet and volunteer registry.",
  },
} as const;
