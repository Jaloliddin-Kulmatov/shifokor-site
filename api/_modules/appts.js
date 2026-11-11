// Visit requests to clinics: the patient asks for a day, the clinic confirms an hour or declines.
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");
const { isVerified } = require("./users");

// a visit request's patient: Telegram if they linked it, otherwise an SMS to the phone on the request
async function tellPatient(a, text) {
  if (await notifyUser(a.patient_id, text)) return;
  await N.sms(a.phone, text);
}

const actions = {
  // ---------- visit requests ----------
  async create_appt(b, me) {
    need(me);
    const a = b.a || {};
    if (!UUID.test(String(a.clinic || ""))) bad("clinic");
    const clinic = (await q("select id, role, name, profile, verified_at, verified_fac, tg_chat from app_users where id = $1 and role = 'clinic'", [a.clinic])).rows[0];
    if (!clinic) bad("clinic");
    if (clinic.id === me.id) throw new Fail(403, "forbidden");
    if (!isVerified(clinic)) throw new Fail(403, "unverified");
    const day = dayOf(a.day);
    const part = a.part === "am" || a.part === "pm" ? a.part : bad("part");
    // an optional preferred hour, inside the part of the day: 07:00–12:30 in the morning, 12:00–18:30 after lunch
    let ptime = null;
    if (a.time) {
      const m = /^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(String(a.time));
      const h = m ? +m[1] + +m[2] / 60 : -1;
      if (part === "am" ? h < 7 || h > 12.5 : h < 12 || h > 18.5) bad("time");
      ptime = String(a.time);
    }
    const who = a.who === "other" ? "other" : "self";
    const name = str(a.name, 200) || bad("name");
    const phone = phoneOf(a.phone) || bad("phone");
    // a doctor the patient picked: they must work at this clinic (joined its staff, or name it on their profile)
    let doc = null;
    if (a.doctor) {
      if (!UUID.test(String(a.doctor))) bad("doctor");
      const fac = clinic.profile && clinic.profile.fac ? String(clinic.profile.fac) : null;
      doc = (await q(
        "select d.id, d.name, d.profile from app_users d where d.id = $1 and d.role = 'doctor' and (exists (select 1 from app_staff s where s.clinic_id = $2 and s.doctor_id = d.id and s.status = 'active') or coalesce(d.profile->'work', '[]'::jsonb) @> $3::jsonb or ($4::text is not null and coalesce(d.profile->'work', '[]'::jsonb) @> $5::jsonb))",
        [a.doctor, clinic.id, JSON.stringify([{ t: "c", id: clinic.id }]), fac, JSON.stringify([{ t: "f", key: fac }])]
      )).rows[0];
      if (!doc) throw new Fail(400, "doctor");
    }
    const spec = doc ? opt((doc.profile || {}).spec, 20) : opt(a.spec, 20);
    const open = (await q("select count(*)::int as n, count(*) filter (where clinic_id = $2 and day = $3)::int as same from app_appts where patient_id = $1 and status in ('new', 'confirmed') and day >= $4", [me.id, clinic.id, day, today()])).rows[0];
    if (open.same) throw new Fail(409, "dup");
    if (open.n >= 5) throw new Fail(429, "limit");
    const r = await q(
      "insert into app_appts (patient_id, clinic_id, clinic_name, fac, day, part, who, name, phone, spec, reason, doctor_id, doctor_name, pref_time) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) returning id, n",
      [me.id, clinic.id, clinic.name, opt(a.fac, 40), day, part, who, name, phone, spec, opt(a.reason, 500), doc ? doc.id : null, doc ? doc.name : null, ptime]
    );
    if (clinic.tg_chat) await N.tgSend(clinic.tg_chat, "Shifokor: yangi qabul so‘rovi №" + r.rows[0].n + ". " + name + ", " + N.dayUz(day) + ", " + (part === "am" ? "ertalab" : "tushdan keyin") + (ptime ? " (taxminan " + ptime + ")" : "") + (doc ? ", shifokor: " + doc.name : "") + ". " + site.url() + "/#/account");
    if (doc) await notifyUser(doc.id, "Shifokor: " + clinic.name + " orqali sizga qabul so‘rovi №" + r.rows[0].n + ": " + name + ", " + N.dayUz(day) + ", " + (part === "am" ? "ertalab" : "tushdan keyin") + ". Soatni klinika tasdiqlaydi.");
    return { id: r.rows[0].id };
  },

  // the clinic sets the hour (and may move the day); the patient sees it in "My visits"
  async appt_confirm(b, me) {
    need(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const time = /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(String(b.time || "")) ? b.time : bad("time");
    const r = await q("update app_appts set status = 'confirmed', day = $3, appt_time = $4, note = $5, updated_at = now() where id = $1 and clinic_id = $2 and status in ('new', 'confirmed') returning *", [b.id, me.id, dayOf(b.day), time, opt(b.note, 300)]);
    if (!r.rows[0]) throw new Fail(409, "closed");
    const a = r.rows[0];
    await tellPatient(a, "Shifokor: " + a.clinic_name + " qabulingizni tasdiqladi: " + N.dayUz(a.day) + ", soat " + a.appt_time + "." + (a.note ? " " + a.note : ""));
    if (a.doctor_id) await notifyUser(a.doctor_id, "Shifokor: " + a.clinic_name + " qabulni tasdiqladi: " + a.name + ", " + N.dayUz(a.day) + ", soat " + a.appt_time + ".");
    return { ok: true };
  },

  async appt_decline(b, me) {
    need(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const r = await q("update app_appts set status = 'declined', note = $3, updated_at = now() where id = $1 and clinic_id = $2 and status in ('new', 'confirmed') returning *", [b.id, me.id, opt(b.note, 300)]);
    if (!r.rows[0]) throw new Fail(409, "closed");
    const a = r.rows[0];
    await tellPatient(a, "Shifokor: " + a.clinic_name + " " + N.dayUz(a.day) + " uchun so‘rovingizni rad etdi." + (a.note ? " " + a.note : "") + " Boshqa kunni tanlang.");
    return { ok: true };
  },

  async appt_cancel(b, me) {
    need(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const r = await q("update app_appts set status = 'cancelled', updated_at = now() where id = $1 and patient_id = $2 and status in ('new', 'confirmed') returning *", [b.id, me.id]);
    if (!r.rows[0]) throw new Fail(409, "closed");
    const a = r.rows[0];
    await notifyUser(a.clinic_id, "Shifokor: so‘rov №" + a.n + " bekor qilindi (" + a.name + ", " + N.dayUz(a.day) + ").");
    if (a.doctor_id) await notifyUser(a.doctor_id, "Shifokor: " + a.clinic_name + " dagi qabul so‘rovi №" + a.n + " bekor qilindi (" + a.name + ", " + N.dayUz(a.day) + ").");
    return { ok: true };
  }
};

module.exports = { actions, tellPatient };
