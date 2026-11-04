// Input checks shared by every module: ids, text, phone numbers, emails, Telegram names, profiles and dates.
const { bad } = require("./errors");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const opt = (v, max) => str(v, max) || null;
function phoneOf(v) {
  if (!v) return null;
  let d = String(v).replace(/\D/g, "");
  if (d.length === 9) d = "998" + d;
  if (!/^998\d{9}$/.test(d)) bad("phone");
  return d;
}
function emailOf(v) {
  const e = str(v, 254).toLowerCase();
  if (!e) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) bad("email");
  return e;
}
function tgOf(v) {
  const t = str(v, 40).replace(/^@/, "");
  if (!t) return null;
  if (!/^[A-Za-z0-9_]{5,32}$/.test(t)) bad("tg");
  return "@" + t;
}
function profileOf(v) {
  const p = v && typeof v === "object" && !Array.isArray(v) ? v : {};
  if (JSON.stringify(p).length > 20000) bad("profile");
  return p;
}

// Uzbekistan is UTC+5 all year. Requests may be made for today and the next 30 days.
const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
function dayOf(v) {
  const s = String(v || "");
  const ms = /^\d{4}-\d{2}-\d{2}$/.test(s) ? Date.parse(s + "T00:00:00Z") : NaN;
  if (isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== s) bad("date");
  const max = new Date(Date.parse(today() + "T00:00:00Z") + 30 * 864e5).toISOString().slice(0, 10);
  if (s < today() || s > max) bad("date");
  return s;
}

module.exports = { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf };
