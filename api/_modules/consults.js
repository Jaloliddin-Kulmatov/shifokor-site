// Online consultations: applying (with a booked time), cancelling, moving, chat, accepting, finishing, sending to an in-person visit, paying.
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");
const { consultFor, sysNote } = require("./consult-repo");
const { slotFor, slotUz } = require("./slots");
const { photoOf, audioOf, MAX_PHOTOS, MAX_VOICE } = require("./files");
const { P } = require("./services");
const reminders = require("../_worker/reminders");

const actions = {
  async create_consult(b, me) {
    need(me);
    const c = b.c || {};
    const type = ["text", "video"].includes(c.type) ? c.type : bad("type");   // chat or video; audio applications were dropped (calls can still be voice-only)
    const who = ["self", "child", "other"].includes(c.who) ? c.who : "self";
    const name = str(c.name, 200) || bad("name");
    const age = c.age === "" || c.age == null ? null : Math.round(Number(c.age));
    if (age != null && !(age >= 0 && age <= 130)) bad("age");
    const sex = c.sex === "m" ? "m" : "f";
    // phone is optional: empty means the account's own phone (if any); Uzbek numbers get 998, foreign ones (7-15 digits) are kept as they are
    const pd = String(c.phone || "").replace(/\D/g, "");
    const phone = !pd ? me.phone || "" : pd.length === 9 ? "998" + pd : /^\d{7,15}$/.test(pd) ? pd : bad("phone");
    const complaint = str(c.complaint, 1500);
    if (complaint.length < 5) bad("complaint");
    const since = Math.min(4, Math.max(0, Math.round(Number(c.since) || 0)));
    let doc = UUID.test(String(c.doc || "")) ? c.doc : null;
    // an imported doctor who hasn't claimed their profile yet can't answer, so the application goes to any doctor
    if (doc && !(await q("select 1 from app_users where id = $1 and role = 'doctor' and (imported_at is null or claimed_at is not null)", [doc])).rows[0]) doc = null;
    // a booked time must be one of the chosen doctor's free slots, from 30 minutes to 14 days ahead
    const slot = c.slot && doc ? await slotFor(doc, c.slot) : null;
    // otherwise the day and time that suit the patient: within the next 14 days (the doctor confirms it in the chat)
    const wantMs = !slot && c.want ? Date.parse(String(c.want)) : NaN;
    if (!slot && c.want && (isNaN(wantMs) || wantMs < Date.now() - 10 * 60e3 || wantMs > Date.now() + 15 * 864e5)) bad("want");
    const want = isNaN(wantMs) ? null : new Date(wantMs).toISOString();
    const asap = !doc && c.asap === true && !want;   // "first available doctor, now": doctors online now are alerted, the first to accept takes it
    let r;
    try {
      r = await q(
        "insert into app_consults (patient_id, type, who, name, age, sex, phone, region, district, complaint, since, chronic, meds, allergy, spec, doc, asap, slot_at, want_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) returning id, n",
        [me.id, type, who, name, age, sex, phone, opt(c.region, 20), opt(c.district, 20), complaint, since, opt(c.chronic, 500), opt(c.meds, 500), opt(c.allergy, 500), opt(c.spec, 20), doc, asap, slot, want]
      );
    } catch (e) {
      if (e.code === "23505") throw new Fail(409, "slot_taken");   // someone booked the same time a moment earlier
      throw e;
    }
    const id = r.rows[0].id;
    if (slot) await reminders.remindBefore(id, slot);
    for (const note of (Array.isArray(b.notes) ? b.notes : []).slice(0, 3)) await sysNote(id, note);
    if (doc) await notifyUser(doc, "Shifokor: sizga yangi onlayn maslahat arizasi" + (slot ? " — " + slotUz(slot) : want ? " (bemorga qulay vaqt: " + slotUz(want) + ")" : "") + ". " + site.url() + "/#/consult/" + id, { link: site.url() + "/#/consult/" + id, button: "Arizani ochish" });
    if (asap) {
      const on = await q("select tg_chat from app_users where role = 'doctor' and online_until > now() and tg_chat is not null and (imported_at is null or claimed_at is not null) and ($1::text is null or profile->>'spec' = $1 or profile->>'spec' = 'gp') limit 50", [opt(c.spec, 20)]);
      const text = "Shifokor: hozir maslahat kerak (ariza №" + r.rows[0].n + "). Birinchi qabul qilgan shifokor oladi. " + site.url() + "/#/consult/" + id;
      await Promise.all(on.rows.map((d) => N.tgSend(d.tg_chat, text)));
    }
    return { id };
  },

  // the patient cancels an application no doctor has accepted yet; its booked time frees up
  async cancel_consult(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.patient_id !== me.id) throw new Fail(403, "forbidden");
    const r = await q("update app_consults set status = 'cancelled', closed_at = now() where id = $1 and status = 'new' returning n, doc", [c.id]);
    if (!r.rows[0]) throw new Fail(409, "closed");
    await sysNote(c.id, b.note);
    await reminders.forget(c.id);
    if (r.rows[0].doc) await notifyUser(r.rows[0].doc, "Shifokor: bemor ariza №" + r.rows[0].n + " ni bekor qildi.");
    return { ok: true };
  },

  // the patient moves their booked time to another free one of the same doctor: { id, slot }
  async reschedule(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.patient_id !== me.id) throw new Fail(403, "forbidden");
    if (c.status !== "new" && c.status !== "accepted") throw new Fail(409, "closed");
    const doc = c.doc || c.doctor_id;
    if (!doc) bad("slot");
    const slot = await slotFor(doc, b.slot);
    try { await q("update app_consults set slot_at = $2, slot_reminded = false where id = $1", [c.id, slot]); }
    catch (e) { if (e.code === "23505") throw new Fail(409, "slot_taken"); throw e; }
    await reminders.remindBefore(c.id, slot);
    await sysNote(c.id, b.note);
    await notifyUser(doc, "Shifokor: bemor ariza №" + c.n + " vaqtini o‘zgartirdi — " + slotUz(slot) + ". " + site.url() + "/#/consult/" + c.id);
    return { ok: true };
  },

  async message(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.status === "done" || c.status === "referred" || c.status === "cancelled") throw new Fail(409, "closed");
    let kind, name;
    if (c.patient_id === me.id) { kind = "p"; name = c.name; }
    else if (c.doctor_id === me.id) { kind = "d"; name = me.name; }
    else throw new Fail(403, "forbidden");
    if (kind === "d" && c.pay_status === "due") throw new Fail(409, "unpaid");   // the doctor replies once the patient has paid
    const body = str(b.body, 2000);
    const photo = b.photo ? photoOf(b.photo) : null;
    const voice = !photo && b.audio ? audioOf(b.audio) : null;
    if (!body && !photo && !voice) bad("body");
    let fileId = null;
    const file = photo || voice;
    if (file) {
      const like = voice ? "audio/%" : "image/%", max = voice ? MAX_VOICE : MAX_PHOTOS;
      if (Number((await q("select count(*) from app_files where consult_id = $1 and mime like $2", [c.id, like])).rows[0].count) >= max) throw new Fail(429, voice ? "voices" : "photos");
      fileId = (await q("insert into app_files (consult_id, sender, mime, data) values ($1, $2, $3, $4) returning id", [c.id, me.id, file.mime, file.data])).rows[0].id;
    }
    await q("insert into app_messages (consult_id, sender, kind, name, body, file_id) values ($1, $2, $3, $4, $5, $6)", [c.id, me.id, kind, name, body, fileId]);
    const what = photo ? "rasm yubordi" : voice ? "ovozli xabar yubordi" : kind === "d" ? "javob yozdi" : "yangi xabar yozdi";
    const link = site.url() + "/#/consult/" + c.id;
    if (kind === "d") {
      // an email only for the first reply in half an hour, so a long chat doesn't fill the inbox
      const mailNow = !c.mail_at || Date.now() - new Date(c.mail_at).getTime() > 30 * 60e3;
      const sent = await notifyUser(c.patient_id, "Shifokor: shifokor " + me.name + " " + what + " (ariza №" + c.n + "). " + link, { link, button: "Javobni ochish", mail: mailNow ? "Shifokor " + me.name + " sizga javob yozdi" : "",
        tgText: "👨‍⚕️ " + me.name + " · ariza №" + c.n + "\n\n" + (body || (photo ? "[rasm]" : "[ovozli xabar]")), kb: [[{ text: "✍️ Javob yozish", callback_data: "cr:" + c.id }, { text: "🌐 Saytda ochish", url: link }]] });
      if (sent && mailNow) await q("update app_consults set mail_at = now() where id = $1", [c.id]);
    } else if (c.doctor_id) await notifyUser(c.doctor_id, "Shifokor: bemor " + what + " (ariza №" + c.n + "). " + link, { link, button: "Arizani ochish",
      tgText: "🙂 " + c.name + " · ariza №" + c.n + "\n\n" + (body || (photo ? "[rasm]" : "[ovozli xabar]")), kb: [[{ text: "✍️ Javob yozish", callback_data: "cr:" + c.id }, { text: "🌐 Saytda ochish", url: link }]] });
    return { ok: true, file: fileId };
  },

  async accept(b, me) {
    requireRole(me, Role.Doctor);
    if (!UUID.test(String(b.id || ""))) bad("id");
    // the price is the doctor's price for this kind of consultation at the moment they accept it
    const c0 = (await q("select type from app_consults where id = $1", [b.id])).rows[0];
    const cp = c0 && ((me.profile || {}).cp || {})[c0.type];
    const price = cp === "" || cp == null || !isFinite(Number(cp)) ? null : Math.max(0, Math.round(Number(cp)));
    const due = P.ON && price > 0;
    const r = await q("update app_consults set status = 'accepted', doctor_id = $1, doctor_name = $2, price = $4, pay_status = $5 where id = $3 and status = 'new' and (doc is null or doc = $1) returning id, n, patient_id", [me.id, me.name, b.id, price, due ? "due" : "none"]);
    if (!r.rows[0]) throw new Fail(409, "taken");
    await sysNote(b.id, b.note);
    const link = site.url() + "/#/consult/" + b.id;
    await notifyUser(r.rows[0].patient_id, "Shifokor: shifokor " + me.name + " arizangizni qabul qildi (№" + r.rows[0].n + ")." + (due ? " Maslahat narxi " + P.sum(price) + " so‘m: to‘lovdan keyin shifokor javob beradi." : "") + " " + link, { link, button: "Arizani ochish", mail: "Shifokor " + me.name + " arizangizni qabul qildi" });
    return { ok: true };
  },

  async finish(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.doctor_id !== me.id || c.status !== "accepted") throw new Fail(403, "forbidden");
    const outcome = Math.round(Number(b.outcome));
    if (!(outcome >= 0 && outcome <= 2)) bad("outcome");
    await q("update app_consults set status = 'done', outcome = $2, closed_at = now() where id = $1", [c.id, outcome]);
    await sysNote(c.id, b.note);
    // the patient hears that the conclusion (xulosa) is ready, with the note itself in Telegram
    const link = site.url() + "/#/consult/" + c.id, note = str(b.note, 300);
    await notifyUser(c.patient_id, "Shifokor: shifokor " + me.name + " maslahatni yakunladi (ariza №" + c.n + ")." + (note ? "\n\n" + note : "") + "\n\nXulosa: " + link, { link, button: "Xulosani o‘qish", mail: "Shifokor " + me.name + " xulosa yozdi" });
    return { ok: true };
  },

  // The doctor read a new application and says an in-person visit is needed instead of an online one.
  // The application closes, nothing is charged, and the patient gets the doctor's advice. { id, advice, note }
  async refer(b, me) {
    requireRole(me, Role.Doctor);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const advice = str(b.advice, 1000);
    if (advice.length < 10) bad("advice");
    const r = await q("update app_consults set status = 'referred', doctor_id = $1, doctor_name = $2, closed_at = now() where id = $3 and status = 'new' and (doc is null or doc = $1) returning id, n, patient_id", [me.id, me.name, b.id]);
    if (!r.rows[0]) throw new Fail(409, "taken");
    await q("insert into app_messages (consult_id, sender, kind, name, body) values ($1, $2, 'd', $3, $4)", [b.id, me.id, me.name, advice]);
    await sysNote(b.id, b.note);
    await notifyUser(r.rows[0].patient_id, "Shifokor: shifokor " + me.name + " arizangizni o‘qib, yuzma-yuz ko‘rik kerakligini aytdi (№" + r.rows[0].n + "). To‘lov olinmaydi. Maslahatini o‘qing: " + site.url() + "/#/consult/" + b.id, { link: site.url() + "/#/consult/" + b.id, button: "Maslahatni o‘qish", mail: "Shifokor " + me.name + " arizangizga javob berdi" });
    return { ok: true };
  },

  // where the patient goes to pay for an accepted consultation: { id, provider: "payme" | "click", lang }
  async pay_link(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.patient_id !== me.id) throw new Fail(403, "forbidden");
    if (!P.payable(c)) throw new Fail(409, c.pay_status === "paid" ? "paid" : "closed");
    const url = P.link(c, b.provider, b.lang);
    if (!url) bad("provider");
    return { url };
  }
};

module.exports = { actions };
