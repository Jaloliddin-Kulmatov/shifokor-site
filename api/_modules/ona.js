// Care for pregnant women and young mothers ("Onalar uchun").
// A woman saves her due date (or the first day of her last period) and, if she likes, her doctor and one family member.
// Every week Telegram asks how she feels; a danger sign tells her to call 103 or go to the maternity hospital,
// and her doctor and family member get a message. Check-up reminders follow the WHO schedule of 8 antenatal contacts.
// For six weeks after the birth the check-in also asks about the baby. Shifokor never diagnoses.

const WEEKS = [12, 20, 26, 30, 34, 36, 38, 40];   // WHO 2016: at least 8 antenatal contacts
const SIGNS = {   // Uzbek labels for Telegram; the site has its own copy in three languages
  bleed: "Qon ketish", head: "Kuchli bosh og‘rig‘i yoki ko‘z tinishi", swell: "Yuz yoki qo‘llar shishi", fever: "Isitma",
  move: "Bola kam qimirlayapti", belly: "Qorindagi kuchli og‘riq", water: "Suv kelishi", fit: "Tutqanoq yoki hushdan ketish", breath: "Nafas qisishi",
  bfever: "Chaqaloqda isitma", bfeed: "Chaqaloq emmayapti", byellow: "Chaqaloq sarg‘ayib ketdi", bbreath: "Chaqaloq qiynalib nafas olyapti", bfit: "Chaqaloqda tutqanoq"
};
const PREG = ["bleed", "head", "swell", "fever", "move", "belly", "water", "fit", "breath"];
const BORN = ["bleed", "fever", "head", "breath", "bfever", "bfeed", "byellow", "bbreath", "bfit"];
const DAY = 864e5;

module.exports = function ({ q, N, sha, crypto, site, today, Fail, bad, need, UUID, str }) {
  const dayMs = (d) => Date.parse(String(d).slice(0, 10) + "T00:00:00Z");
  const weekOf = (due) => Math.floor((280 - Math.round((dayMs(due) - dayMs(today())) / DAY)) / 7);
  const afterBirth = (p) => !!p.born_on && dayMs(today()) - dayMs(p.born_on) <= 42 * DAY;
  const label = (codes) => codes.map((c) => SIGNS[c]).join(", ");
  const mine = async (me) => (await q("select * from app_preg where user_id = $1", [need(me).id])).rows[0] || null;
  function dateOf(v) {
    const s = String(v || ""), ms = /^\d{4}-\d{2}-\d{2}$/.test(s) ? dayMs(s) : NaN;
    if (isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== s) bad("date");
    return s;
  }

  // a check-in, from the site or a Telegram button; danger signs reach her doctor and family member at once
  async function record(p, name, signs) {
    const week = p.born_on ? null : weekOf(p.due_date);
    await q("insert into app_preg_checks (user_id, week, signs) values ($1, $2, $3)", [p.user_id, week, signs]);
    await q("update app_preg set checked_at = now() where user_id = $1", [p.user_id]);
    if (!signs.length) return false;
    const when = p.born_on ? "tug‘ruqdan keyin" : week + "-hafta";
    if (p.doctor_id) {
      const d = (await q("select tg_chat from app_users where id = $1", [p.doctor_id])).rows[0];
      if (d && d.tg_chat) await N.tgSend(d.tg_chat, "Shifokor: bemoringiz " + name + " (" + when + ") xavfli belgi belgiladi: " + label(signs) + ". Iltimos, u bilan bog‘laning.");
    }
    if (p.family_chat) await N.tgSend(p.family_chat, "Shifokor: " + name + " (" + when + ") xavfli belgi belgiladi: " + label(signs) + ". Iltimos, unga darhol qo‘ng‘iroq qiling. Kerak bo‘lsa, 103.");
    return true;
  }

  const actions = {
    // { due } or { lmp } (first day of the last period: due = +280 days), optional { doctor }
    async preg_save(b, me) {
      need(me);
      let due = b.lmp ? new Date(dayMs(dateOf(b.lmp)) + 280 * DAY).toISOString().slice(0, 10) : dateOf(b.due);
      const d = (dayMs(due) - dayMs(today())) / DAY;
      if (d < -60 || d > 300) bad("date");
      let doctor = UUID.test(String(b.doctor || "")) ? b.doctor : null;
      if (doctor && !(await q("select 1 from app_users where id = $1 and role = 'doctor'", [doctor])).rows[0]) doctor = null;
      await q("insert into app_preg (user_id, due_date, doctor_id) values ($1, $2, $3) on conflict (user_id) do update set due_date = $2, doctor_id = $3, updated_at = now()", [me.id, due, doctor]);
      return { ok: true, due };
    },
    // { signs: [codes] }; an empty list means "all is well"
    async preg_check(b, me) {
      const p = await mine(me); if (!p) throw new Fail(404, "not_found");
      const allowed = p.born_on ? BORN : PREG;
      const signs = Array.isArray(b.signs) ? [...new Set(b.signs.map(String))] : [];
      if (signs.some((c) => !allowed.includes(c))) bad("signs");
      return { urgent: await record(p, me.name, signs) };
    },
    // a Telegram link the woman sends to one family member; pressing Start in the bot links their chat
    async preg_family(b, me) {
      const p = await mine(me); if (!p) throw new Fail(404, "not_found");
      if (!N.TG) throw new Fail(503, "no_tg");
      const name = str(b.name, 80) || bad("name");
      const code = "fam_" + crypto.randomBytes(12).toString("base64url");
      await q("update app_preg set family_name = $2, family_code = $3, family_code_at = now(), family_chat = null where user_id = $1", [me.id, name, sha(code)]);
      return { url: "https://t.me/" + (await N.tgBotName()) + "?start=" + code };
    },
    async preg_family_off(b, me) {
      const p = await mine(me); if (!p) throw new Fail(404, "not_found");
      await q("update app_preg set family_chat = null, family_code = null, family_name = null where user_id = $1", [me.id]);
      return { ok: true };
    },
    // the baby was born: { date }, or { date: "" } to undo
    async preg_born(b, me) {
      const p = await mine(me); if (!p) throw new Fail(404, "not_found");
      const born = b.date ? dateOf(b.date) : null;
      if (born && (born > today() || dayMs(today()) - dayMs(born) > 365 * DAY)) bad("date");
      await q("update app_preg set born_on = $2, updated_at = now() where user_id = $1", [me.id, born]);
      return { ok: true };
    },
    async preg_delete(b, me) {
      need(me);
      await q("delete from app_preg_checks where user_id = $1", [me.id]);
      await q("delete from app_preg where user_id = $1", [me.id]);
      return { ok: true };
    }
  };

  // what the signed-in user sees: her own pregnancy, or a doctor's pregnant patients
  async function sync(me) {
    const out = { preg: null, mothers: [] };
    const p = (await q("select p.due_date, p.born_on, p.doctor_id, p.family_name, p.family_chat is not null as family_linked, p.family_code is not null as family_waiting, p.checked_at, d.name as doctor_name from app_preg p left join app_users d on d.id = p.doctor_id where p.user_id = $1", [me.id])).rows[0];
    if (p) out.preg = Object.assign(p, { checks: (await q("select week, signs, created_at from app_preg_checks where user_id = $1 order by created_at desc limit 12", [me.id])).rows });
    if (me.role === "doctor") {
      out.mothers = (await q("select u.name, u.phone, p.due_date, p.born_on, (select signs from app_preg_checks c where c.user_id = p.user_id order by created_at desc limit 1) as last_signs, (select created_at from app_preg_checks c where c.user_id = p.user_id order by created_at desc limit 1) as last_at from app_preg p join app_users u on u.id = p.user_id where p.doctor_id = $1 order by p.due_date limit 200", [me.id])).rows;
    }
    return out;
  }

  // daily: the weekly check-in and check-up reminders, by Telegram
  async function daily() {
    if (!N.TG) return 0;
    const rows = (await q("select p.*, u.name, u.tg_chat from app_preg p join app_users u on u.id = p.user_id where u.tg_chat is not null and (p.born_on is null or p.born_on > now() - interval '42 days') and p.due_date > now() - interval '60 days' and (p.asked_at is null or p.asked_at < now() - interval '6 days 12 hours') limit 200")).rows;
    let sent = 0;
    for (const p of rows) {
      const week = weekOf(p.due_date), born = !!p.born_on;
      if (!p.checked_at || Date.now() - new Date(p.checked_at).getTime() > 6 * DAY) {
        const text = born ? "Shifokor: tug‘ruqdan keyin o‘zingiz va chaqaloq qandaysiz?" : "Shifokor: " + week + "-hafta. Bugun o‘zingizni qanday his qilyapsiz?";
        await N.tgApi("sendMessage", { chat_id: p.tg_chat, text, reply_markup: { inline_keyboard: [[{ text: "Hammasi yaxshi", callback_data: "pc:" + p.user_id + ":ok" }], [{ text: "Xavotirli belgi bor", callback_data: "pc:" + p.user_id + ":bad" }]] } }).then(() => sent++, (e) => console.error("ona ask", e.message));
      }
      const due = born ? 0 : WEEKS.find((w) => week >= w - 1 && week <= w && p.reminded_week < w) || 0;
      if (due) await N.tgSend(p.tg_chat, "Shifokor: " + due + "-hafta ko‘rigi vaqti keldi. Poliklinikangizga yoki shifokoringizga yoziling: " + site() + "/#/ona");
      await q("update app_preg set asked_at = now(), reminded_week = greatest(reminded_week, $2) where user_id = $1", [p.user_id, due]);
    }
    return sent;
  }

  // Telegram: "/start fam_<code>" links a family member; returns true when it was such a code
  async function hookStart(code, chat) {
    if (!/^fam_/.test(code)) return false;
    const r = await q("update app_preg p set family_chat = $2, family_code = null from app_users u where u.id = p.user_id and p.family_code = $1 and p.family_code_at > now() - interval '7 days' returning u.name", [sha(code), chat]);
    await N.tgSend(chat, r.rows[0] ? "Siz " + r.rows[0].name + "ning oila a’zosi sifatida ulandingiz. Xavfli belgi belgilansa, shu yerga xabar keladi. O‘chirish uchun /stop yozing." : "Havola eskirgan. Undan yangi havola so‘rang.");
    return true;
  }
  async function hookStop(chat) { await q("update app_preg set family_chat = null where family_chat = $1", [chat]); }

  // Telegram buttons: pc:<user>:ok | pc:<user>:bad | ps:<user>:<sign>; only her own linked chat can answer
  async function hookButton(cb) {
    const k = /^(pc|ps):([0-9a-f-]{36}):([a-z]{2,8})$/.exec(String(cb.data || "")), chat = cb.message && cb.message.chat && cb.message.chat.id;
    if (!k) return false;
    const p = chat && (await q("select p.*, u.name from app_preg p join app_users u on u.id = p.user_id where p.user_id = $1 and u.tg_chat = $2", [k[2], chat])).rows[0];
    let reply = "";
    if (p && k[1] === "pc" && k[3] === "ok") {
      await record(p, p.name, []); reply = "Rahmat! Yaxshi kunlar.";
      await N.tgApi("editMessageText", { chat_id: chat, message_id: cb.message.message_id, text: cb.message.text + "\nJavobingiz: hammasi yaxshi." }).catch(() => {});
    } else if (p && k[1] === "pc" && k[3] === "bad") {
      const list = p.born_on ? BORN : PREG;
      await N.tgApi("sendMessage", { chat_id: chat, text: "Qaysi belgi bor? Bittasini tanlang:", reply_markup: { inline_keyboard: list.map((c) => [{ text: SIGNS[c], callback_data: "ps:" + p.user_id + ":" + c }]) } }).catch(() => {});
    } else if (p && k[1] === "ps" && SIGNS[k[3]]) {
      await record(p, p.name, [k[3]]); reply = "Xabar berildi.";
      await N.tgSend(chat, "Bu xavfli belgi bo‘lishi mumkin. Darhol 103 ga qo‘ng‘iroq qiling yoki tug‘ruqxonaga boring." + (p.doctor_id || p.family_chat ? " Shifokoringiz va oilangizga xabar berdik." : ""));
    }
    await N.tgApi("answerCallbackQuery", { callback_query_id: cb.id, text: reply }).catch(() => {});
    return true;
  }

  return { actions, sync, daily, hookStart, hookStop, hookButton, WEEKS };
};
