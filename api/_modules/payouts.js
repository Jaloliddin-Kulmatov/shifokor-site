// What doctors earned from paid consultations, and the transfers admins record.
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");
const { P } = require("./services");

// What doctors earned from paid consultations and what they were paid. A doctor is owed their share (the price
// minus the platform's fee) for each paid consultation once it's finished; a refunded one doesn't count.
async function earnings(doctorId) {
  const only = doctorId ? " and doctor_id = $1" : "", args = doctorId ? [doctorId] : [];
  const e = await q(
    "select doctor_id, count(*) filter (where status = 'done')::int as done_n, coalesce(sum(price) filter (where status = 'done'), 0)::bigint as gross, " +
    "coalesce(sum(coalesce(fee, 0)) filter (where status = 'done'), 0)::bigint as fee, count(*) filter (where status <> 'done')::int as open_n, " +
    "coalesce(sum(price - coalesce(fee, 0)) filter (where status <> 'done'), 0)::bigint as open_net from app_consults where pay_status = 'paid' and doctor_id is not null" + only + " group by doctor_id", args);
  const p = await q("select doctor_id, coalesce(sum(amount), 0)::bigint as paid_out, max(paid_on) as last_paid from app_payouts where doctor_id is not null" + only + " group by doctor_id", args);
  const by = {};
  const row = (id) => by[id] || (by[id] = { id, done_n: 0, gross: 0, fee: 0, net: 0, open_n: 0, open_net: 0, paid_out: 0, balance: 0, last_paid: null });
  e.rows.forEach((r) => Object.assign(row(r.doctor_id), { done_n: r.done_n, gross: Number(r.gross), fee: Number(r.fee), open_n: r.open_n, open_net: Number(r.open_net) }));
  p.rows.forEach((r) => Object.assign(row(r.doctor_id), { paid_out: Number(r.paid_out), last_paid: r.last_paid }));
  Object.values(by).forEach((r) => { r.net = r.gross - r.fee; r.balance = r.net - r.paid_out; });
  return by;
}

const actions = {
  // ---------- paying doctors (admins) ----------
  async admin_payouts(b, me) {
    requireAdmin(me);
    const by = await earnings(null), ids = Object.keys(by);
    const us = ids.length ? (await q("select id, name, phone, email from app_users where id = any($1::uuid[])", [ids])).rows : [];
    const doctors = us.map((u) => Object.assign(by[u.id], { name: u.name, phone: u.phone || "", email: u.email || "" })).sort((x, y) => y.balance - x.balance);
    const payouts = (await q("select id, doctor_id, doctor_name, amount, paid_on, ref, note, created_at from app_payouts order by paid_on desc, created_at desc limit 300")).rows.map((r) => Object.assign(r, { amount: Number(r.amount) }));
    const paid = (await q("select n, paid_at, status, price, coalesce(fee, 0) as fee, pay_provider, pay_status, doctor_id, doctor_name from app_consults where pay_status in ('paid', 'refunded') order by paid_at desc limit 2000")).rows;
    return { fee_pct: P.FEE, doctors, payouts, paid };
  },

  // a transfer the admin already made to a doctor: { doctor, amount (so‘m), paid_on, ref, note }
  async admin_payout(b, me) {
    requireAdmin(me);
    if (!UUID.test(String(b.doctor || ""))) bad("id");
    const d = (await q("select id, name from app_users where id = $1 and role = 'doctor'", [b.doctor])).rows[0];
    if (!d) throw new Fail(404, "not_found");
    const amount = Math.round(Number(b.amount));
    if (!(amount > 0 && amount <= 1e10)) bad("amount");
    const day = String(b.paid_on || ""), ms = /^\d{4}-\d{2}-\d{2}$/.test(day) ? Date.parse(day + "T00:00:00Z") : NaN;
    if (isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== day || day > today() || ms < Date.now() - 400 * 864e5) bad("date");
    if (amount > ((await earnings(d.id))[d.id] || { balance: 0 }).balance) throw new Fail(409, "over");   // more than the doctor is owed: probably a typo
    await q("insert into app_payouts (doctor_id, doctor_name, amount, paid_on, ref, note, created_by) values ($1, $2, $3, $4, $5, $6, $7)", [d.id, d.name, amount, day, opt(b.ref, 100), opt(b.note, 300), me.id]);
    await notifyUser(d.id, "Shifokor: sizga " + P.sum(amount) + " so‘m o‘tkazildi (" + N.dayUz(day) + "). " + site.url() + "/#/account");
    return { ok: true };
  },

  // removes a payout recorded by mistake
  async admin_payout_delete(b, me) {
    requireAdmin(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    if (!(await q("delete from app_payouts where id = $1 returning id", [b.id])).rows[0]) throw new Fail(404, "not_found");
    return { ok: true };
  }
};

module.exports = { actions, earnings };
