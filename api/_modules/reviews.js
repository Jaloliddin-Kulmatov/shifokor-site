// Reviews: only after a finished consultation or a visit; doctors and clinics reply; admins can hide.
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");

const actions = {
  // ---------- reviews ----------
  async review_create(b, me) {
    need(me);
    const stars = Math.round(Number(b.stars));
    if (!(stars >= 1 && stars <= 5)) bad("stars");
    let row;
    if (b.consult) {
      if (!UUID.test(String(b.consult))) bad("id");
      row = (await q("select id, doctor_id as target from app_consults where id = $1 and patient_id = $2 and status = 'done' and doctor_id is not null", [b.consult, me.id])).rows[0];
    } else if (b.appt) {
      if (!UUID.test(String(b.appt))) bad("id");
      row = (await q("select id, clinic_id as target from app_appts where id = $1 and patient_id = $2 and status = 'confirmed' and day <= $3", [b.appt, me.id, today()])).rows[0];
    } else bad("id");
    if (!row) throw new Fail(403, "forbidden");
    const parts = String(me.name || "").trim().split(/\s+/);
    const author = b.anon ? "" : (parts[0] + (parts[1] ? " " + parts[1].charAt(0) + "." : "")).slice(0, 60);   // "Ali V."
    try {
      await q("insert into app_reviews (patient_id, target_id, consult_id, appt_id, stars, body, author) values ($1, $2, $3, $4, $5, $6, $7)", [me.id, row.target, b.consult ? row.id : null, b.appt ? row.id : null, stars, opt(b.body, 600), author]);
    } catch (e) {
      if (e.code === "23505") throw new Fail(409, "reviewed");
      throw e;
    }
    await notifyUser(row.target, "Shifokor: sizga yangi sharh, " + stars + " yulduz. " + site.url() + "/#/account");
    return { ok: true };
  },

  // the doctor or clinic answers a review about them, once or by editing the answer
  async review_reply(b, me) {
    need(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const r = await q("update app_reviews set reply = $3, replied_at = case when $3::text is null then null else now() end where id = $1 and target_id = $2 returning id", [b.id, me.id, opt(b.reply, 400)]);
    if (!r.rows[0]) throw new Fail(403, "forbidden");
    return { ok: true };
  },

  async admin_review(b, me) {
    requireAdmin(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    await q("update app_reviews set hidden = $2 where id = $1", [b.id, b.hidden === true]);
    return { ok: true };
  }
};

module.exports = { actions };
