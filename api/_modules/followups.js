// "How are you feeling?" two days after a consultation ends: Telegram buttons and the consultation page.
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

// "How are you feeling?" two days after a consultation ends. Telegram asks with buttons; the consultation page asks too.
const FOLLOW = { better: "yaxshilandi", same: "o‘zgarmadi", worse: "yomonlashdi" };
async function followupAnswer(c, answer, note) {
  if (!FOLLOW[answer]) bad("answer");
  const r = await q("update app_consults set followup = $2, followup_answered_at = now(), followup_at = coalesce(followup_at, now()) where id = $1 and followup is null returning id, n, doctor_id", [c.id, answer]);
  if (!r.rows[0]) return false;
  await sysNote(c.id, str(note, 300) || "Bemor: ahvolim " + FOLLOW[answer] + ".");
  if (answer === "worse" && c.doctor_id) await notifyUser(c.doctor_id, "Shifokor: bemor maslahatdan keyin ahvoli yomonlashganini aytdi (ariza №" + c.n + "). " + site.url() + "/#/consult/" + c.id);
  return true;
}
async function sendFollowups() {
  const r = await q("update app_consults set followup_at = now() where id in (select id from app_consults where status = 'done' and followup_at is null and closed_at < now() - interval '2 days' and closed_at > now() - interval '9 days' order by closed_at limit 100) returning id, n, patient_id, doctor_name");
  if (!N.TG || !r.rows.length) return r.rows.length;
  const chats = (await q("select id, tg_chat from app_users where id = any($1::uuid[]) and tg_chat is not null", [r.rows.map((c) => c.patient_id)])).rows;
  const chatOf = Object.fromEntries(chats.map((u) => [u.id, u.tg_chat]));
  for (let i = 0; i < r.rows.length; i += 20) {
    await Promise.all(r.rows.slice(i, i + 20).filter((c) => chatOf[c.patient_id]).map((c) => N.tgApi("sendMessage", {
      chat_id: chatOf[c.patient_id],
      text: "Shifokor: " + (c.doctor_name || "shifokor") + " bilan maslahatdan keyin qalaysiz? (ariza №" + c.n + ")",
      reply_markup: { inline_keyboard: [[{ text: "Yaxshilandi", callback_data: "fu:" + c.id + ":better" }], [{ text: "O‘zgarmadi", callback_data: "fu:" + c.id + ":same" }], [{ text: "Yomonlashdi", callback_data: "fu:" + c.id + ":worse" }]] }
    }).catch((e) => console.error("followup", e.message))));
  }
  return r.rows.length;
}

const actions = {
  // the patient's answer to "how are you feeling?" on the site: { id, answer: better | same | worse, note }
  async followup(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.patient_id !== me.id) throw new Fail(403, "forbidden");
    if (c.status !== "done") throw new Fail(409, "closed");
    if (!(await followupAnswer(c, b.answer, b.note))) throw new Fail(409, "answered");
    return { ok: true };
  }
};

module.exports = { actions, FOLLOW, followupAnswer, sendFollowups };
