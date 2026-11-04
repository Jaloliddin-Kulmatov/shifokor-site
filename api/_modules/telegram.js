// The Telegram bot: linking a chat with /start, /stop, and the buttons in its messages.
const { q, migrate } = require("../_core/db");
const { sha } = require("../_core/auth");
const { send } = require("../_core/http");
const site = require("../_core/site");
const N = require("./notify");
const { O } = require("./services");
const { FOLLOW, followupAnswer } = require("./followups");

// Telegram calls POST /api/app?tg=hook for messages to the bot. "/start <code>" links the chat, "/stop" unlinks it.
async function telegramHook(req, res) {
  if (!N.TG || req.headers["x-telegram-bot-api-secret-token"] !== N.TG_SECRET) return send(res, 403, { error: "forbidden" });
  let u = req.body;
  if (typeof u === "string") { try { u = JSON.parse(u); } catch (e) { u = null; } }
  const cb = u && u.callback_query;
  if (cb) {
    try { await migrate(); if (!(await O.hookButton(cb))) await followupButton(cb); } catch (e) { console.error("tg button", e && e.message); }
    return send(res, 200, { ok: true });
  }
  const m = u && u.message, chat = m && m.chat && m.chat.id, text = String((m && m.text) || "").trim();
  if (!chat || !m.chat || m.chat.type !== "private") return send(res, 200, { ok: true });
  try {
    await migrate();
    const start = /^\/start(?:\s+([A-Za-z0-9_-]{8,64}))?$/.exec(text);
    if (start && start[1] && (await O.hookStart(start[1], chat))) {
      // a family member of a pregnant woman linked their chat
    } else if (start && start[1]) {
      const r = await q("update app_users set tg_chat = $2, tg_code = null where tg_code = $1 and tg_code_at > now() - interval '1 hour' returning name", [sha(start[1]), chat]);
      await N.tgSend(chat, r.rows[0] ? "Ulandi, " + r.rows[0].name + ". Qabul va maslahat javoblari shu yerga keladi. O‘chirish uchun /stop yozing." : "Havola eskirgan. Shifokor saytida «Telegramni ulash» tugmasini qayta bosing.");
    } else if (/^\/stop$/.test(text)) {
      await q("update app_users set tg_chat = null where tg_chat = $1", [chat]);
      await O.hookStop(chat);
      await N.tgSend(chat, "Xabarnomalar o‘chirildi.");
    } else {
      await N.tgSend(chat, "Bu Shifokor xabarnomalari boti. Ulash uchun saytda «Telegramni ulash» tugmasini bosing.");
    }
  } catch (e) { console.error("tg hook", e && e.message); }
  return send(res, 200, { ok: true });
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
