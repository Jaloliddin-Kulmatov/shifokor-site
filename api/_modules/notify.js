// Notices to patients, clinics and doctors: Telegram (free, the person links their chat once) and SMS (Eskiz.uz, paid).
// Both are optional and only switch on when their environment variables are set:
//   TELEGRAM_BOT_TOKEN            from @BotFather
//   ESKIZ_EMAIL, ESKIZ_PASSWORD   an Eskiz.uz account; ESKIZ_FROM is the sender name (default "4546")
// A notice that fails never fails the action that sent it.
const crypto = require("crypto");

const TG = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
const SMS = (process.env.ESKIZ_EMAIL || "").trim() && (process.env.ESKIZ_PASSWORD || "").trim();
// Telegram sends this back in a header on every webhook call, so the webhook knows the call is really from Telegram.
const TG_SECRET = TG ? crypto.createHash("sha256").update("shifokor-webhook:" + TG).digest("hex").slice(0, 48) : "";

const within = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);

async function tgApi(method, body) {
  if (!TG) return null;
  const r = await fetch("https://api.telegram.org/bot" + TG + "/" + method, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error("telegram " + method + ": " + (j.description || r.status));
  return j.result;
}
let botName = null;
async function tgBotName() {
  if (!botName && TG) botName = (await tgApi("getMe", {})).username;
  return botName;
}
async function tgSend(chat, text) {
  if (!TG || !chat) return false;
  try { await within(tgApi("sendMessage", { chat_id: chat, text, disable_web_page_preview: true }), 4000); return true; }
  catch (e) { console.error("tg send", e.message); return false; }
}

let eskizToken = null;
async function eskizLogin() {
  const r = await fetch("https://notify.eskiz.uz/api/auth/login", { method: "POST", body: new URLSearchParams({ email: process.env.ESKIZ_EMAIL.trim(), password: process.env.ESKIZ_PASSWORD.trim() }) });
  const j = await r.json().catch(() => ({}));
  eskizToken = j && j.data && j.data.token;
  if (!eskizToken) throw new Error("eskiz login " + r.status);
}
async function eskizSend(phone, text) {
  if (!eskizToken) await eskizLogin();
  const send = () => fetch("https://notify.eskiz.uz/api/message/sms/send", { method: "POST", headers: { Authorization: "Bearer " + eskizToken }, body: new URLSearchParams({ mobile_phone: phone, message: text, from: (process.env.ESKIZ_FROM || "4546").trim() }) });
  let r = await send();
  if (r.status === 401) { await eskizLogin(); r = await send(); }   // the token lasts 30 days
  if (!r.ok) throw new Error("eskiz send " + r.status);
}
async function sms(phone, text) {
  if (!SMS || !/^998\d{9}$/.test(String(phone || ""))) return false;
  try { await within(eskizSend(phone, text), 5000); return true; }
  catch (e) { console.error("sms send", e.message); return false; }
}

// Uzbek dates for notices: "31-oktabr"
const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const dayUz = (iso) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "")); return m ? Number(m[3]) + "-" + MONTHS[Number(m[2]) - 1] : String(iso || ""); };

module.exports = { TG: !!TG, SMS: !!SMS, TG_SECRET, tgApi, tgBotName, tgSend, sms, dayUz };
