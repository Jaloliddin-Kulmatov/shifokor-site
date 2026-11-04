// Booked times: a doctor's weekly hours, the free slots, and the reminder a day before (Tashkent time, UTC+5).
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");

// ---------- booked times: Tashkent time (UTC+5, no daylight saving) ----------
const TK = 5 * 3600e3;
// a doctor's weekly hours for online consultations, from their profile: { days: [1..7, Monday = 1], from: "09:00", to: "18:00", len: 15 | 20 | 30 | 60 }
function hoursOf(p) {
  const h = p && p.hours;
  if (!h || !Array.isArray(h.days)) return null;
  const min = (x) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(String(x || "")) ? Number(x.slice(0, 2)) * 60 + Number(x.slice(3)) : null);
  const days = h.days.map(Number).filter((d) => d >= 1 && d <= 7), from = min(h.from), to = min(h.to), len = [15, 20, 30, 60].includes(Number(h.len)) ? Number(h.len) : null;
  if (!days.length || from == null || to == null || !len || to - from < len) return null;
  return { days, from, to, len };
}
// a time the patient may book: one of the doctor's slots, from 30 minutes to 14 days ahead
async function slotFor(doc, v) {
  const ms = Date.parse(String(v || "")), h = hoursOf(((await q("select profile from app_users where id = $1", [doc])).rows[0] || {}).profile);
  if (!h || isNaN(ms) || ms < Date.now() + 30 * 60e3 || ms > Date.now() + 14 * 864e5 || !onGrid(h, ms)) bad("slot");
  return new Date(ms).toISOString();
}
// a start time that is one of the doctor's slots: on a working day, inside the hours, on the slot grid
function onGrid(h, ms) {
  const d = new Date(ms + TK), wd = d.getUTCDay() || 7, m = d.getUTCHours() * 60 + d.getUTCMinutes();
  return d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0 && h.days.includes(wd) && m >= h.from && m + h.len <= h.to && (m - h.from) % h.len === 0;
}
const slotUz = (at) => { const d = new Date(new Date(at).getTime() + TK); return N.dayUz(d.toISOString().slice(0, 10)) + ", soat " + d.toISOString().slice(11, 16); };
async function sendSlotReminders() {
  const r = await q("update app_consults set slot_reminded = true where status in ('new', 'accepted') and not slot_reminded and slot_at > now() and slot_at < now() + interval '24 hours' returning id, n, slot_at, patient_id, coalesce(doctor_id, doc) as doctor_id");
  for (const c of r.rows) {
    const when = slotUz(c.slot_at);
    await notifyUser(c.patient_id, "Shifokor eslatmasi: onlayn maslahat " + when + " da (ariza №" + c.n + "). Telefoningiz yoniq va internet bor bo‘lsin. " + site.url() + "/#/consult/" + c.id);
    if (c.doctor_id) await notifyUser(c.doctor_id, "Shifokor eslatmasi: " + when + " da onlayn maslahat (ariza №" + c.n + "). " + site.url() + "/#/consult/" + c.id);
  }
  return r.rows.length;
}

const actions = {
  // the taken times of a doctor's slots in the next 14 days, so the booking form can grey them out
  async slots(b) {
    if (!UUID.test(String(b.doc || ""))) bad("id");
    const r = await q("select slot_at from app_consults where doc = $1 and slot_at > now() and slot_at < now() + interval '15 days' and status in ('new', 'accepted')", [b.doc]);
    return { taken: r.rows.map((x) => new Date(x.slot_at).getTime()) };
  }
};

module.exports = { actions, TK, hoursOf, slotFor, onGrid, slotUz, sendSlotReminders };
