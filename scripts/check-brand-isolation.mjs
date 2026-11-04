/**
 * Offline-only configuration check. Reads environment variable presence and
 * public URL origin; NEVER connects to databases, payment, email or Telegram.
 * Never print connection strings, API keys, tokens or passwords.
 */
const errors = [];
const warnings = [];
const present = (key) => Boolean(process.env[key]?.trim());
const site = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";

function parseOrigin(value, label) {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password) {
      errors.push(`${label} must be an HTTPS URL without embedded credentials.`);
      return null;
    }
    if (/game[ -]?on[ -]?garb|gameongarb/i.test(u.hostname)) {
      errors.push(`${label} is configured for a different brand.`);
      return null;
    }
    return u.origin;
  } catch {
    errors.push(`${label} is not a valid URL.`);
    return null;
  }
}

const siteOrigin = site ? parseOrigin(site, "KINGDROPP site URL") : null;
if (!site) errors.push("Set APP_URL or NEXT_PUBLIC_SITE_URL for the KINGDROPP deployment.");

if (!present("DATABASE_URL")) {
  errors.push("DATABASE_URL is missing. Create a separate KINGDROPP database.");
} else {
  try {
    const db = new URL(process.env.DATABASE_URL);
    if (!["postgresql:", "postgres:"].includes(db.protocol)) errors.push("DATABASE_URL must use PostgreSQL.");
    if (/game[ -]?on[ -]?garb|gameongarb/i.test(db.hostname + db.pathname)) {
      errors.push("DATABASE_URL appears to reference the other brand.");
    }
  } catch {
    errors.push("DATABASE_URL is not a valid connection URL.");
  }
}
if (!present("SESSION_SECRET")) errors.push("SESSION_SECRET is required.");

const telegramEnabled = process.env.KINGDROPP_TELEGRAM_ENABLED === "true";
if (telegramEnabled) {
  for (const k of ["TELEGRAM_BOT_TOKEN", "TELEGRAM_ORDER_CHAT_ID", "TELEGRAM_WEBHOOK_SECRET"]) {
    if (!present(k)) errors.push(`Telegram enabled, but ${k} is missing.`);
  }
  warnings.push("Manually verify Telegram bot/chat belong exclusively to KINGDROPP.");
}

const bkashEnabled = process.env.BKASH_PUBLIC_ENABLED === "true";
if (bkashEnabled) {
  const callback = process.env.BKASH_CALLBACK_URL?.trim();
  if (!callback) errors.push("Public bKash enabled without BKASH_CALLBACK_URL.");
  else {
    const cbOrigin = parseOrigin(callback, "bKash callback");
    if (siteOrigin && cbOrigin && siteOrigin !== cbOrigin) errors.push("bKash callback origin does not match KINGDROPP site URL.");
  }
  warnings.push("Verify dedicated bKash credentials and provider approval before public enablement.");
}

if (present("EMAIL_FROM")) warnings.push("Verify EMAIL_FROM and RESEND_API_KEY are KINGDROPP-specific.");
if (present("GOOGLE_CLIENT_ID") || present("FACEBOOK_CLIENT_ID")) {
  warnings.push("Verify independent OAuth application IDs and KINGDROPP redirect URLs.");
}
if (present("CLOUDINARY_CLOUD_NAME")) {
  warnings.push("Verify uploads use an isolated KINGDROPP Cloudinary account or folder.");
}

for (const e of errors) console.error(`ERROR: ${e}`);
for (const w of warnings) console.warn(`REVIEW: ${w}`);
console.log(`KINGDROPP offline configuration review: ${errors.length} error(s), ${warnings.length} manual check(s).`);
if (errors.length) process.exitCode = 1;
