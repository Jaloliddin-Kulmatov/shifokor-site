// Vercel build step: writes site/config.js.
// If a database connection string is set (DATABASE_URL, POSTGRES_URL or SUPABASE_DB_URL), the site uses the
// server API at /api/app. The connection string itself is never written into the site: only the server reads it.
import { writeFileSync, readFileSync } from "node:fs";
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

// "Sign in with Google": the OAuth client ID is public (Google shows it to every visitor); the server checks tokens against it
const google = ((env.GOOGLE_CLIENT_ID || "").split(",")[0] || "").trim();
writeFileSync(
  "site/config.js",
  "/* Written at build time by scripts/write-config.mjs. No secrets here: the server holds the connection string. */\n" +
    "window.SHIFOKOR_CONFIG = " + JSON.stringify({ api: conn ? "/api/app" : "", google: conn ? google : "" }) + ";\n"
);
// Faster first load on slow mobile networks: on Vercel, the site's own scripts (about 45 small files) are joined, in the
// same order, into one file, and index.html loads that one instead. Locally nothing changes (separate files).
if (env.VERCEL) {
  try {
    const html = readFileSync("site/index.html", "utf8");
    const tag = /<script src="([a-z0-9-]+\.js)\?v=[^"]*"><\/script>\n?/g;
    const files = [...html.matchAll(tag)].map((m) => m[1]);
    const code = files.map((f) => "/* " + f + " */\n" + readFileSync("site/" + f, "utf8") + "\n;").join("\n");
    const v = createHash("sha256").update(code).digest("hex").slice(0, 12);
    writeFileSync("site/bundle.js", code);
    let first = true;
    writeFileSync("site/index.html", html.replace(tag, () => { if (!first) return ""; first = false; return '<script src="bundle.js?v=' + v + '"></script>\n'; }));
    console.log("write-config: joined " + files.length + " scripts into bundle.js (" + Math.round(code.length / 1024) + " KB)");
  } catch (e) { console.warn("write-config: couldn't join the scripts, the site loads them one by one: " + e.message); }
}
// Telegram notices: on a production deploy, point the bot's webhook at this site. Failing here never fails the build.
const tg = (env.TELEGRAM_BOT_TOKEN || "").trim(), host = (env.VERCEL_PROJECT_PRODUCTION_URL || "").trim();
if (tg && conn && host && env.VERCEL_ENV === "production") {
  const secret = createHash("sha256").update("shifokor-webhook:" + tg).digest("hex").slice(0, 48);   // same as api/_modules/notify.js
  try {
    const r = await fetch("https://api.telegram.org/bot" + tg + "/setWebhook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: "https://" + host + "/api/app?tg=hook", secret_token: secret, allowed_updates: ["message", "callback_query"] }) });
    const j = await r.json().catch(() => ({}));
    console.log(j.ok ? "write-config: Telegram bot webhook set to https://" + host + "/api/app?tg=hook" : "write-config: Telegram setWebhook failed: " + (j.description || r.status));
    // the bot's menu commands and the text people see before pressing Start
    const tgCall = (method, body) => fetch("https://api.telegram.org/bot" + tg + "/" + method, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((x) => x.json()).catch(() => ({}));
    await tgCall("setMyCommands", { commands: [
      { command: "menu", description: "Asosiy menyu" }, { command: "arizalar", description: "Arizalarim va shifokor javoblari" },
      { command: "qabullar", description: "Klinikaga yozilishlarim" }, { command: "shifokorlar", description: "Shifokor topish" },
      { command: "ai", description: "Shifo_AI: qaysi shifokor kerak?" }, { command: "ona", description: "Onalar uchun" }, { command: "cancel", description: "Bekor qilish" }] });
    await tgCall("setMyShortDescription", { short_description: "Shifokor: onlayn tibbiy maslahat. Arizalar, shifokor javoblari, qabullar va Shifo_AI." });
    await tgCall("setMyDescription", { description: "Shifokor.com boti.\n\n• Saytga Telegram orqali kirish\n• Shifokor javob yozsa yoki qo‘ng‘iroq qilsa — xabar\n• Arizalaringiz, xulosalar va klinikaga yozilishlar\n• Shifokor topish va Shifo_AI\n• Onalar uchun: haftalik so‘rov va ko‘rik eslatmalari\n\nShoshilinch holatda 103 ga qo‘ng‘iroq qiling." });
  } catch (e) { console.warn("write-config: couldn't reach Telegram: " + e.message); }
}

console.log(conn ? "write-config: database set (" + name + "), accounts and consultations use the server" : "write-config: no database set, the site runs in demo mode");
