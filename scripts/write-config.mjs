// Vercel build step: writes site/config.js.
// If a database connection string is set (DATABASE_URL, POSTGRES_URL or SUPABASE_DB_URL), the site uses the
// server API at /api/app. The connection string itself is never written into the site: only the server reads it.
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const env = process.env;
const name = ["DATABASE_URL", "POSTGRES_URL", "SUPABASE_DB_URL"].find((k) => (env[k] || "").trim());
const conn = name ? env[name].trim() : "";

if (conn && !/^postgres(ql)?:\/\//i.test(conn)) {
  console.error("write-config: " + name + " must be a postgresql:// connection string.");
  process.exit(1);
}
if (conn && /\[YOUR-PASSWORD\]/i.test(conn)) {
  console.error("write-config: " + name + " still contains [YOUR-PASSWORD]. Put your real database password in its place.");
  process.exit(1);
}
if (/@db\.[a-z0-9]+\.supabase\.co/i.test(conn)) {
  console.warn("write-config: this is Supabase's direct connection, which works over IPv6 only. Vercel needs the " +
    "'Transaction pooler' string (host ...pooler.supabase.com, port 6543) from the same Connect window.");
}

writeFileSync(
  "site/config.js",
  "/* Written at build time by scripts/write-config.mjs. No secrets here: the server holds the connection string. */\n" +
    "window.SHIFOKOR_CONFIG = " + JSON.stringify({ api: conn ? "/api/app" : "" }) + ";\n"
);
// Telegram notices: on a production deploy, point the bot's webhook at this site. Failing here never fails the build.
const tg = (env.TELEGRAM_BOT_TOKEN || "").trim(), host = (env.VERCEL_PROJECT_PRODUCTION_URL || "").trim();
if (tg && conn && host && env.VERCEL_ENV === "production") {
  const secret = createHash("sha256").update("shifokor-webhook:" + tg).digest("hex").slice(0, 48);   // same as api/_notify.js
  try {
    const r = await fetch("https://api.telegram.org/bot" + tg + "/setWebhook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: "https://" + host + "/api/app?tg=hook", secret_token: secret, allowed_updates: ["message", "callback_query"] }) });
    const j = await r.json().catch(() => ({}));
    console.log(j.ok ? "write-config: Telegram bot webhook set to https://" + host + "/api/app?tg=hook" : "write-config: Telegram setWebhook failed: " + (j.description || r.status));
  } catch (e) { console.warn("write-config: couldn't reach Telegram: " + e.message); }
}

console.log(conn ? "write-config: database set (" + name + "), accounts and consultations use the server" : "write-config: no database set, the site runs in demo mode");
