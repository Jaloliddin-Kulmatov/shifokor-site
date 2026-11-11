// Everything a page needs in one call: doctors and clinics, and for a signed-in user their own consultations, visits, reviews and more.
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");
const { userOut } = require("./users");
const { earnings } = require("./payouts");
const { P, O, M } = require("./services");
const clinics = require("./clinics");

const actions = {
  async sync(b, me) {
    const pub = await q("select id, role, name, case when role = 'clinic' then phone end as phone, tg, profile, updated_at, verified_at, verified_fac, imported_at, claimed_at, online_until, photo_at from app_users where role in ('doctor', 'clinic') order by created_at");
    const users = pub.rows.map(userOut);
    let consults = [];
    let appts = [];
    let mine = null;
    let earned = null;
    let ona = { preg: null, mothers: [] };
    let medOrders = [];
    if (me) {
      mine = Object.assign(userOut(me), { email: me.email || "", phone: me.phone || "", tg_linked: !!me.tg_chat, email_verified: !!me.email_verified_at, admin: isAdmin(me), google: !!me.google_sub, has_pw: !!me.has_pw });
      const i = users.findIndex((u) => u.id === me.id);
      if (i > -1) users[i] = mine; else users.push(mine);
      const cs = await q(
        "select * from app_consults where patient_id = $1 or doctor_id = $1 or (status = 'new' and $2::boolean and (doc is null or doc = $1)) order by created_at desc limit 200",
        [me.id, me.role === "doctor"]
      );
      consults = cs.rows;
      if (consults.length) {
        const ms = await q("select m.consult_id, m.kind, m.name, m.body, m.file_id, f.mime as file_mime, m.created_at from app_messages m left join app_files f on f.id = m.file_id where m.consult_id = any($1::uuid[]) order by m.id", [consults.map((c) => c.id)]);
        const by = {};
        ms.rows.forEach((m) => { (by[m.consult_id] = by[m.consult_id] || []).push(m); });
        consults.forEach((c) => { c.messages = by[c.id] || []; });
      }
      appts = (await q("select * from app_appts where patient_id = $1 or clinic_id = $1 or doctor_id = $1 order by created_at desc limit 300", [me.id])).rows;
      ona = await O.sync(me);
      medOrders = await M.sync(me);
      if (me.role === "doctor") {
        const e = (await earnings(me.id))[me.id];
        if (e) earned = Object.assign(e, { fee_pct: P.FEE, payouts: (await q("select amount, paid_on, ref from app_payouts where doctor_id = $1 order by paid_on desc, created_at desc limit 20", [me.id])).rows.map((r) => ({ amount: Number(r.amount), paid_on: r.paid_on, ref: r.ref || "" })) });
      }
    }
    // shown reviews for everyone; the author also sees their own (and which consultation or visit it was for)
    const reviews = (await q(
      "select id, target_id, stars, s_att, s_exp, s_wait, body, author, hidden, reply, replied_at, created_at, consult_id is not null as by_consult, patient_id = $1::uuid as mine, case when patient_id = $1::uuid then consult_id end as consult_id, case when patient_id = $1::uuid then appt_id end as appt_id from app_reviews where not hidden or patient_id = $1::uuid order by created_at desc limit 1000",
      [me ? me.id : null]
    )).rows;
    return { me: mine, users, consults, appts, reviews, notify: { tg: N.TG, bot: N.TG ? await N.tgBotName().catch(() => "") : "", sms: N.SMS, mail: N.MAIL, video: require("./calls").LIVEKIT }, pay: { payme: P.PAYME, click: P.CLICK }, earnings: earned, ona, med_orders: medOrders, clinics: await clinics.sync(me) };
  }
};

module.exports = { actions };
