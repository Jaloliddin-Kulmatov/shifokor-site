// The Telegram bot's own menu: what the site shows, in the chat. A person whose chat is linked to their account sees
// their applications (status, the doctor's replies, the conclusion) and can answer in them, their clinic visits,
// doctors by specialty, Shifo_AI and "Onalar uchun". An unlinked chat shares its number to link or open an account.
// Free text goes to Shifo_AI, or into a consultation after "✍️ Javob yozish".
const { q } = require("../_core/db");
const { tgOf, today } = require("../_core/validate");
const site = require("../_core/site");
const N = require("./notify");

const MENU = { keyboard: [["📋 Arizalarim", "🏥 Qabullarim"], ["👨‍⚕️ Shifokor topish", "🤖 Shifo_AI"], ["🤰 Onalar uchun", "🌐 Saytni ochish"]], resize_keyboard: true, is_persistent: true };
const SPEC = { gp: "Oila shifokori", therapist: "Terapevt", pediatrics: "Pediatr", gyn: "Ginekolog", cardio: "Kardiolog", neuro: "Nevrolog", surgery: "Jarroh", dental: "Stomatolog", ent: "LOR shifokori", eye: "Ko‘z shifokori", derm: "Dermatolog", uro: "Urolog", endo: "Endokrinolog", psych: "Psixolog" };
const CS_ST = { new: "⏳ shifokor kutilmoqda", accepted: "💬 jarayonda", done: "✅ yakunlangan", referred: "🏥 yuzma-yuz ko‘rik tavsiya etildi", cancelled: "✖️ bekor qilingan" };
const AP_ST = { new: "⏳ tasdiq kutilmoqda", confirmed: "✅ tasdiqlandi", declined: "✖️ rad etildi", cancelled: "✖️ bekor qilingan" };
const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];
const when = (at) => { const d = new Date(new Date(at).getTime() + 5 * 3600e3); return d.getUTCDate() + "-" + MONTHS[d.getUTCMonth()] + ", " + d.toISOString().slice(11, 16); };
const day = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s)); return m ? Number(m[3]) + "-" + MONTHS[Number(m[2]) - 1] : ""; };
const cut = (s, n) => { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const url = (path) => site.url() + path;
const open = (text, path) => ({ inline_keyboard: [[{ text, url: url(path) }]] });
const send = (chat, text, markup) => N.tgSend(chat, cut(text, 3900), markup ? { reply_markup: markup } : null);

const userOf = async (chat) => (await q("select id, role, name, email, phone, profile, tg_chat, tg_state from app_users where tg_chat = $1 order by updated_at desc limit 1", [chat])).rows[0] || null;
const setState = (id, state) => q("update app_users set tg_state = $2, tg_state_at = now() where id = $1", [id, state]);

async function menu(chat, u) {
  if (!u) return send(chat, "Assalomu alaykum! Bu Shifokor boti: arizalaringiz, shifokor javoblari, qabullar va Shifo_AI shu yerda.\n\nBoshlash uchun pastdagi tugma bilan raqamingizni yuboring: hisobingizni topamiz yoki yangisini ochamiz.", { keyboard: [[{ text: "📱 Raqamni yuborish", request_contact: true }]], resize_keyboard: true, one_time_keyboard: true });
  return send(chat, "Assalomu alaykum, " + u.name + "! Kerakli bo‘limni tanlang. Savolingizni shunchaki yozsangiz, Shifo_AI javob beradi.", MENU);
}

// a shared contact with no sign-in waiting: link this chat to the account with that number, or open a patient account
async function linkContact(m) {
  const chat = m.chat.id, f = m.from || {}, phone = String(m.contact.phone_number || "").replace(/\D/g, "");
  if (!/^998\d{9}$/.test(phone)) return send(chat, "Hozircha faqat O‘zbekiston raqamlari (+998) bilan ishlaymiz. Saytda email bilan ro‘yxatdan o‘tishingiz mumkin: " + url("/#/register"), { remove_keyboard: true });
  let u = (await q("select id, name, imported_at, claimed_at from app_users where phone = $1", [phone])).rows[0];
  if (u && u.imported_at && !u.claimed_at) return send(chat, "Siz uchun shifokor profili tayyorlangan. Shifokor jamoasi yuborgan havolani oching.", { remove_keyboard: true });
  if (u) await q("update app_users set tg_chat = $2 where id = $1", [u.id, chat]);
  else {
    const name = [f.first_name, f.last_name].filter(Boolean).join(" ").slice(0, 200) || "Bemor";
    let tg = null; try { tg = f.username ? tgOf(f.username) : null; } catch (e) {}
    u = (await q("insert into app_users (role, name, phone, tg, pw_hash, profile, tg_chat) values ('patient', $1, $2, $3, 'telegram', '{}', $4) returning id, name", [name, phone, tg, chat])).rows[0];
  }
  await send(chat, "✅ Ulandi, " + u.name + ". Xabarnomalar shu yerga keladi. Saytga kirish uchun u yerda «Telegram orqali kirish»ni bosing.", MENU);
  return true;
}

async function myConsults(chat, u) {
  const doc = u.role === "doctor";
  const r = (await q("select id, n, status, type, doctor_name, name, created_at from app_consults where " + (doc ? "doctor_id = $1" : "patient_id = $1") + " order by created_at desc limit 8", [u.id])).rows;
  if (!r.length) return send(chat, doc ? "Sizda hali qabul qilingan ariza yo‘q." : "Sizda hali ariza yo‘q. Shifokorga yozish uchun saytda ariza yuboring.", open(doc ? "Arizalarni ochish" : "Ariza yuborish", doc ? "/#/account/requests" : "/#/consult"));
  return send(chat, (doc ? "Bemorlaringiz arizalari:" : "Arizalaringiz:") + "\n\n" + r.map((c) => "№" + c.n + " · " + (CS_ST[c.status] || c.status) + (doc ? " · " + c.name : c.doctor_name ? " · " + c.doctor_name : "")).join("\n") + "\n\nBatafsil ko‘rish uchun tanlang:",
    { inline_keyboard: r.map((c) => [{ text: "№" + c.n + " — " + cut(doc ? c.name : c.doctor_name || "shifokor kutilmoqda", 30), callback_data: "cv:" + c.id }]) });
}

async function showConsult(chat, u, id) {
  const c = (await q("select * from app_consults where id = $1 and (patient_id = $2 or doctor_id = $2)", [id, u.id])).rows[0];
  if (!c) return send(chat, "Ariza topilmadi.");
  const ms = (await q("select kind, name, body, file_id, f.mime from app_messages m left join app_files f on f.id = m.file_id where m.consult_id = $1 order by m.id desc limit 6", [c.id])).rows.reverse();
  const lines = ms.map((m) => (m.kind === "s" ? "ℹ️ " : m.kind === "d" ? "👨‍⚕️ " : "🙂 ") + cut(m.body || (m.mime && m.mime.indexOf("audio") === 0 ? "[ovozli xabar]" : m.file_id ? "[rasm]" : ""), 400));
  const last = c.status === "done" ? (await q("select body from app_messages where consult_id = $1 and kind = 's' order by id desc limit 1", [c.id])).rows[0] : null;
  const text = "Ariza №" + c.n + " · " + (CS_ST[c.status] || c.status) + "\n" + (c.type === "video" ? "Video maslahat" : "Matnli maslahat") + (c.doctor_name ? " · " + c.doctor_name : "") +
    (c.slot_at ? "\n🗓 " + when(c.slot_at) : c.want_at ? "\n🗓 Qulay vaqt: " + when(c.want_at) : "") + "\n\n" + (lines.length ? lines.join("\n") : "Hali xabar yo‘q.") +
    (last && last.body ? "\n\n📝 Xulosa: " + cut(last.body, 900) : "");
  const can = c.status === "accepted" && !(u.id === c.doctor_id && c.pay_status === "due");
  const kb = (can ? [[{ text: "✍️ Javob yozish", callback_data: "cr:" + c.id }]] : []).concat([[{ text: "🌐 Saytda ochish (rasm, qo‘ng‘iroq)", url: url("/#/consult/" + c.id) }]]);
  return send(chat, text, { inline_keyboard: kb });
}

async function myVisits(chat, u) {
  const col = u.role === "clinic" ? "clinic_id" : u.role === "doctor" ? "doctor_id" : "patient_id";
  const r = (await q("select n, clinic_name, day, part, appt_time, status, name from app_appts where " + col + " = $1 order by day desc limit 8", [u.id])).rows;
  if (!r.length) return send(chat, "Klinikaga yozilishlar hali yo‘q.", open("Klinikaga yozilish", "/#/find"));
  return send(chat, "Klinikaga yozilishlar:\n\n" + r.map((a) => "№" + a.n + " · " + (u.role === "patient" ? a.clinic_name : a.name) + "\n   " + day(a.day) + ", " + (a.appt_time ? "soat " + a.appt_time : a.part === "am" ? "ertalab" : "tushdan keyin") + " · " + (AP_ST[a.status] || a.status)).join("\n\n"), open("Saytda ochish", "/#/account/visits"));
}

function specButtons() {
  const keys = Object.keys(SPEC), rows = [];
  for (let i = 0; i < keys.length; i += 2) rows.push(keys.slice(i, i + 2).map((k) => ({ text: SPEC[k], callback_data: "ds:" + k })));
  return { inline_keyboard: rows };
}
async function doctors(chat, spec, intro) {
  const r = (await q("select id, name, profile, verified_at from app_users where role = 'doctor' and profile->>'spec' = $1 order by verified_at is null, updated_at desc limit 6", [spec])).rows;
  const price = (p) => { const c = (p && p.cp) || {}, v = ["text", "video"].map((k) => c[k]).filter((x) => x !== "" && x != null && isFinite(Number(x))).map(Number); return v.length ? (Math.min(...v) === 0 ? "bepul" : String(Math.min(...v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so‘mdan") : ""; };
  const head = (intro ? intro + "\n\n" : "") + SPEC[spec] + ":";
  if (!r.length) return send(chat, head + " hozircha saytda yo‘q.", open("Barcha shifokorlar", "/#/doctors"));
  return send(chat, head + "\n\n" + r.map((d) => "• " + d.name + (d.verified_at ? " ✔️" : "") + (d.profile && d.profile.years ? " · " + d.profile.years + " yil tajriba" : "") + (price(d.profile) ? " · " + price(d.profile) : "")).join("\n"),
    { inline_keyboard: r.map((d) => [{ text: cut(d.name, 40), url: url("/shifokor/" + d.id) }]).concat([[{ text: "📝 Ariza yuborish", url: url("/#/consult?s=" + spec) }]]) });
}

// Shifo_AI in the chat; a linked user's last few messages give it context (kept in tg_state)
async function ai(chat, u, text) {
  const AI = require("./ai").actions;
  let hist = [];
  if (u && /^ai:/.test(u.tg_state || "")) { try { hist = JSON.parse(u.tg_state.slice(3)); } catch (e) { hist = []; } }
  hist = hist.concat([{ role: "user", content: cut(text, 800) }]).slice(-6);
  let a;
  try { a = await AI.ai_find({ messages: hist, lang: "uz", _ip: "tg:" + chat }, u); }
  catch (e) { return send(chat, e.code === "limit" ? "Bugungi savollar soni tugadi. Ertaga yana yozing yoki saytdan shifokor tanlang." : "Shifo_AI hozir javob bera olmadi. Birozdan keyin qayta urinib ko‘ring.", u ? MENU : null); }
  if (u) await setState(u.id, "ai:" + JSON.stringify(hist.concat([{ role: "assistant", content: cut(a.reply, 800) }]).slice(-6)));
  if (a.emergency) return send(chat, "🚨 " + a.reply + "\n\nTez yordam: 103", u ? MENU : null);
  if (a.spec && SPEC[a.spec]) return doctors(chat, a.spec, "🤖 " + a.reply);
  return send(chat, "🤖 " + a.reply + "\n\nShifo_AI tashxis qo‘ymaydi va dori yozmaydi.", u ? MENU : null);
}

async function ona(chat, u) {
  const p = (await q("select due_date, born_on, reminded_week from app_preg where user_id = $1", [u.id])).rows[0];
  if (!p) return send(chat, "«Onalar uchun»: har hafta holatingizni so‘raymiz, 8 ta ko‘rikdan oldin eslatamiz, xavfli belgi bo‘lsa shifokoringiz va oilangizga xabar beramiz.\n\nBoshlash uchun saytda tug‘ish sanasini kiriting.", open("Onalar uchun", "/#/ona"));
  const days = Math.round((Date.parse(String(p.due_date).slice(0, 10)) - Date.parse(today())) / 864e5), week = Math.floor((280 - days) / 7);   // as the site counts it
  const next = [12, 20, 26, 30, 34, 36, 38, 40].find((w) => w >= week);
  const text = p.born_on ? "Tug‘ruqdan keyingi davr. Xavfli belgi bo‘lsa, darhol belgilang." : "🤰 " + week + "-hafta. Tug‘ish sanasi: " + day(p.due_date) + "." + (next ? "\nKeyingi ko‘rik: " + next + "-hafta." : "");
  return send(chat, text + "\n\nHozir o‘zingizni qanday his qilyapsiz?", { inline_keyboard: [[{ text: "Hammasi yaxshi", callback_data: "pc:" + u.id + ":ok" }], [{ text: "Xavotirli belgi bor", callback_data: "pc:" + u.id + ":bad" }], [{ text: "Saytda ochish", url: url("/#/ona") }]] });
}

// a text message that wasn't a sign-in or a link code; true when handled
async function botMessage(m) {
  const chat = m.chat.id, text = String(m.text || "").trim(), u = await userOf(chat);
  if (/^\/(start|menu)$/.test(text)) { if (u) await setState(u.id, null); return menu(chat, u); }
  if (/^\/cancel$/.test(text) || text === "❌ Bekor qilish") { if (u) await setState(u.id, null); return send(chat, "Bekor qilindi.", u ? MENU : null); }
  if (!u) return text ? ai(chat, null, text) : menu(chat, null);
  if (text === "📋 Arizalarim" || text === "/arizalar") { await setState(u.id, null); return myConsults(chat, u); }
  if (text === "🏥 Qabullarim" || text === "/qabullar") { await setState(u.id, null); return myVisits(chat, u); }
  if (text === "👨‍⚕️ Shifokor topish" || text === "/shifokorlar") { await setState(u.id, null); return send(chat, "Qaysi mutaxassis kerak?", specButtons()); }
  if (text === "🤖 Shifo_AI" || text === "/ai") { await setState(u.id, "ai:[]"); return send(chat, "🤖 Muammoingizni oddiy so‘zlar bilan yozing, masalan: «2 kundan beri boshim og‘riyapti». Mos shifokorni topib beraman.", MENU); }
  if (text === "🤰 Onalar uchun" || text === "/ona") { await setState(u.id, null); return ona(chat, u); }
  if (text === "🌐 Saytni ochish") return send(chat, "Shifokor sayti:", { inline_keyboard: [[{ text: "shifokor.com", url: url("/") }]] });
  const reply = /^reply:([0-9a-f-]{36})$/.exec(u.tg_state || "");
  if (reply && text) {
    const C = require("./consults").actions;
    try { await C.message({ id: reply[1], body: text }, u); await setState(u.id, null); return send(chat, "✅ Yuborildi.", { inline_keyboard: [[{ text: "Arizani ko‘rish", callback_data: "cv:" + reply[1] }]] }); }
    catch (e) { await setState(u.id, null); return send(chat, e.code === "closed" ? "Bu maslahat yopilgan." : e.code === "unpaid" ? "Bemor hali to‘lov qilmagan." : "Yuborib bo‘lmadi. Saytda urinib ko‘ring.", MENU); }
  }
  if (text) return ai(chat, u, text);
  return send(chat, "Rasm va ovozli xabarni saytdagi chatda yuboring.", MENU);
}

// menu buttons under a message: cv (show an application), cr (answer in it), ds (doctors of a specialty); true when handled
async function botButton(cb) {
  const k = /^(cv|cr|ds):([a-z0-9-]{2,36})$/.exec(String(cb.data || "")), chat = cb.message && cb.message.chat && cb.message.chat.id;
  if (!k || !chat) return false;
  await N.tgApi("answerCallbackQuery", { callback_query_id: cb.id }).catch(() => {});
  if (k[1] === "ds") { if (SPEC[k[2]]) await doctors(chat, k[2]); return true; }
  const u = await userOf(chat);
  if (!u) { await menu(chat, null); return true; }
  if (k[1] === "cv") await showConsult(chat, u, k[2]);
  else {
    const c = (await q("select id, n, status from app_consults where id = $1 and (patient_id = $2 or doctor_id = $2)", [k[2], u.id])).rows[0];
    if (!c || c.status !== "accepted") await send(chat, "Bu arizaga hozir yozib bo‘lmaydi.");
    else { await setState(u.id, "reply:" + c.id); await send(chat, "✍️ №" + c.n + " uchun xabaringizni yozing. Bekor qilish: /cancel", { keyboard: [["❌ Bekor qilish"]], resize_keyboard: true, one_time_keyboard: true }); }
  }
  return true;
}

module.exports = { botMessage, botButton, linkContact, MENU };
