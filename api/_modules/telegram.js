// The Telegram bot: linking a chat with /start, /stop, and the buttons in its messages.
const { q, migrate } = require("../_core/db");
const { sha } = require("../_core/auth");
const { send } = require("../_core/http");
const site = require("../_core/site");
const N = require("./notify");
const { O } = require("./services");
const { FOLLOW, followupAnswer } = require("./followups");
const BOT = require("./bot");

// Telegram calls POST /api/app?tg=hook for messages to the bot. "/start <code>" links the chat, "/stop" unlinks it.
async function telegramHook(req, res) {
  if (!N.TG || req.headers["x-telegram-bot-api-secret-token"] !== N.TG_SECRET) return send(res, 403, { error: "forbidden" });
  let u = req.body;
  if (typeof u === "string") { try { u = JSON.parse(u); } catch (e) { u = null; } }
  const cb = u && u.callback_query;
  if (cb) {
    try { await migrate(); if (!(await loginButton(cb)) && !(await BOT.botButton(cb)) && !(await O.hookButton(cb))) await followupButton(cb); } catch (e) { console.error("tg button", e && e.message); }
    return send(res, 200, { ok: true });
  }
  const m = u && u.message, chat = m && m.chat && m.chat.id, text = String((m && m.text) || "").trim();
  if (!chat || !m.chat || m.chat.type !== "private") return send(res, 200, { ok: true });
  try {
    await migrate();
    const start = /^\/start(?:\s+([A-Za-z0-9_-]{8,64}))?$/.exec(text);
    const login = start && start[1] && /^login_([A-Za-z0-9_-]{20,40})$/.exec(start[1]);
    if (login) await loginStart(login[1], m);
    else if (m.contact) await loginContact(m);
    else if (/^\/raqam$/i.test(text)) await askNumber(chat);
    else if (start && start[1] && (await O.hookStart(start[1], chat))) {
      // a family member of a pregnant woman linked their chat
    } else if (start && start[1]) {
      const r = await q("update app_users set tg_chat = $2, tg_code = null where tg_code = $1 and tg_code_at > now() - interval '1 hour' returning name", [sha(start[1]), chat]);
      await N.tgSend(chat, r.rows[0] ? "Ulandi, " + r.rows[0].name + ". Qabul va maslahat javoblari shu yerga keladi. O‘chirish uchun /stop yozing." : "Havola eskirgan. Shifokor saytida «Telegramni ulash» tugmasini qayta bosing.");
    } else if (/^\/stop$/.test(text)) {
      await q("update app_users set tg_chat = null where tg_chat = $1", [chat]);
      await O.hookStop(chat);
      await N.tgSend(chat, "Xabarnomalar o‘chirildi.");
    } else {
      await BOT.botMessage(m);   // the menu, Shifo_AI, answering in a consultation
    }
  } catch (e) { console.error("tg hook", e && e.message); }
  return send(res, 200, { ok: true });
}

// ---------- signing in to the site with Telegram ----------
// The site opened t.me/<bot>?start=login_<code>. The bot asks for the phone number (Telegram's own "share contact"
// button, so it's the person's real number) or offers to continue without it; either one confirms the code.
// The number button is a reply-keyboard button (Telegram only shares a contact from those), sent as the LAST message
// and kept open, because Telegram Desktop folds away a keyboard that an earlier message brought. "Raqam tugmasi
// ko‘rinmayaptimi?" and /raqam send it again.
const LOGIN_KB = { keyboard: [[{ text: "📱 Raqamni yuborish va kirish", request_contact: true }]], resize_keyboard: true, one_time_keyboard: false, is_persistent: true, input_field_placeholder: "Pastdagi tugmani bosing" };
const askNumber = (chat) => N.tgSend(chat, "📱 Raqamingizni yuborish uchun pastdagi «📱 Raqamni yuborish va kirish» tugmasini bosing.\n\nTugma ko‘rinmasa: kompyuterda yozish maydonining o‘ng tomonidagi ⌨️ belgisini, telefonda klaviatura yonidagi to‘rt nuqtali belgini bosing.", { reply_markup: LOGIN_KB });
async function loginStart(code, m) {
  const chat = m.chat.id, f = m.from || {};
  await q("delete from app_tg_logins where created_at < now() - interval '1 day'");
  const name = [f.first_name, f.last_name].filter(Boolean).join(" ").slice(0, 200) || null;
  const r = await q("insert into app_tg_logins (code_hash, chat_id, tg_name, tg_user) values ($1, $2, $3, $4) on conflict (code_hash) do nothing returning id", [sha(code), chat, name, f.username ? String(f.username).slice(0, 40) : null]);
  if (!r.rows[0]) return N.tgSend(chat, "Bu havola allaqachon ishlatilgan. Saytda «Telegram orqali kirish» tugmasini qayta bosing.");
  await N.tgSend(chat, "Shifokor saytiga kirish.\n\nRaqamingiz bo‘yicha hisobingizni topamiz, yangi bo‘lsangiz, hisob ochamiz. Xabarnomalar ham shu yerga keladi.\n\nAgar siz hozir saytda «Telegram orqali kirish»ni bosmagan bo‘lsangiz, hech narsani bosmang.",
    { reply_markup: { inline_keyboard: [[{ text: "Raqamsiz kirish", callback_data: "lg:" + r.rows[0].id }], [{ text: "📱 Raqam tugmasi ko‘rinmayaptimi?", callback_data: "lk:" + r.rows[0].id }]] } });
  await askNumber(chat);
}
const done = (chat) => N.tgSend(chat, "✅ Tasdiqlandi. Saytga qayting: u o‘zi ochiladi.\n\nBot menyusi pastda: arizalar, qabullar, shifokorlar va Shifo_AI.", { reply_markup: BOT.MENU });
// the person's own contact (not someone else's card) confirms their newest waiting sign-in
async function loginContact(m) {
  const chat = m.chat.id, c = m.contact;
  if (!c || !m.from || c.user_id !== m.from.id) return N.tgSend(chat, "Iltimos, o‘z raqamingizni «📱 Raqamni yuborish va kirish» tugmasi bilan yuboring.");
  const phone = String(c.phone_number || "").replace(/\D/g, "");
  const r = await q("update app_tg_logins set phone = $2, confirmed_at = now() where id = (select id from app_tg_logins where chat_id = $1 and confirmed_at is null and created_at > now() - interval '10 minutes' order by created_at desc limit 1) returning id", [chat, /^[0-9]{7,15}$/.test(phone) ? phone : null]);
  if (!r.rows[0]) return BOT.linkContact(m);   // no sign-in waiting: link this chat to an account from the bot itself
  return done(chat);
}
async function loginButton(cb) {
  const chat = cb.message && cb.message.chat && cb.message.chat.id;
  if (/^lk:[0-9a-f-]{36}$/.test(String(cb.data || ""))) {
    await N.tgApi("answerCallbackQuery", { callback_query_id: cb.id, text: "Pastdagi tugmani bosing" }).catch(() => {});
    if (chat) await askNumber(chat);
    return true;
  }
  const k = /^lg:([0-9a-f-]{36})$/.exec(String(cb.data || ""));
  if (!k) return false;
  const r = chat ? await q("update app_tg_logins set confirmed_at = now() where id = $1 and chat_id = $2 and confirmed_at is null and created_at > now() - interval '10 minutes' returning id", [k[1], chat]) : { rows: [] };
  await N.tgApi("answerCallbackQuery", { callback_query_id: cb.id, text: r.rows[0] ? "Tasdiqlandi" : "So‘rov eskirgan" }).catch(() => {});
  if (r.rows[0]) await done(chat);
  return true;
}

// A follow-up button pressed in Telegram: only the patient's own linked chat can answer.
async function followupButton(cb) {
  const k = /^fu:([0-9a-f-]{36}):(better|same|worse)$/.exec(String(cb.data || "")), chat = cb.message && cb.message.chat && cb.message.chat.id;
  let reply = "";
  if (k && chat) {
    const c = (await q("select c.id, c.n, c.status, c.doctor_id, c.patient_id from app_consults c join app_users p on p.id = c.patient_id where c.id = $1 and p.tg_chat = $2", [k[1], chat])).rows[0];
    if (c && c.status === "done" && (await followupAnswer(c, k[2], ""))) {
      reply = "Rahmat!";
      await N.tgApi("editMessageText", { chat_id: chat, message_id: cb.message.message_id, text: cb.message.text + "\nJavobingiz: " + FOLLOW[k[2]] + "." }).catch(() => {});
      if (k[2] === "worse") await N.tgSend(chat, "Shifokoringizga qayta yozing yoki yaqin shifoxonaga boring: " + site.url() + "/#/consult/" + c.id + "\nKo‘krak og‘rig‘i, nafas qisishi, hushdan ketish yoki kuchli qon ketish bo‘lsa, darhol 103 ga qo‘ng‘iroq qiling.");
    } else reply = "Javob allaqachon yuborilgan.";
  }
  await N.tgApi("answerCallbackQuery", { callback_query_id: cb.id, text: reply }).catch(() => {});
}

module.exports = { telegramHook };
