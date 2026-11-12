// The Telegram bot's own menu: what the site shows, in the chat. A person whose chat is linked to their account sees
// their applications (status, the doctor's replies, the conclusion) and can answer in them, their clinic visits,
// doctors by specialty, Shifo_AI and "Onalar uchun". An unlinked chat shares its number to link or open an account.
// Free text goes to Shifo_AI, or into a consultation after "✍️ Javob yozish".
const { q } = require("../_core/db");
const { tgOf, today } = require("../_core/validate");
const site = require("../_core/site");
const N = require("./notify");

const MENU = { keyboard: [["📝 Shifokorga yozilish", "🤖 Shifo_AI"], ["📋 Arizalarim", "🏥 Qabullarim"], ["👨‍⚕️ Shifokor topish", "🤰 Onalar uchun"], ["🌐 Saytni ochish"]], resize_keyboard: true, is_persistent: true };
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
  if (!u) return send(chat, "Assalomu alaykum! Bu Shifokor boti: arizalaringiz, shifokor javoblari, qabullar va Shifo_AI shu yerda.\n\nBoshlash uchun pastdagi tugma bilan raqamingizni yuboring: hisobingizni topamiz yoki yangisini ochamiz.", { keyboard: [[{ text: "📱 Raqamni yuborish", request_contact: true }]], resize_keyboard: true, is_persistent: true, input_field_placeholder: "Pastdagi tugmani bosing" });
  return send(chat, "Assalomu alaykum, " + u.name + "! Kerakli bo‘limni tanlang. Savolingizni shunchaki yozsangiz, Shifo_AI javob beradi.", MENU);
}

// a shared contact with no sign-in waiting: link this chat to the account with that number, or open a patient account
async function linkContact(m) {
  const chat = m.chat.id, f = m.from || {}, phone = String(m.contact.phone_number || "").replace(/\D/g, "");
  if (!/^998\d{9}$/.test(phone)) return send(chat, "Hozircha faqat O‘zbekiston raqamlari (+998) bilan ishlaymiz. Saytda email bilan ro‘yxatdan o‘tishingiz mumkin: " + url("/#/register"), { remove_keyboard: true });
  const linked = await userOf(chat);
  if (linked && !linked.phone) {
    const taken = (await q("select 1 from app_users where phone = $1 and id <> $2", [phone, linked.id])).rows[0];
    if (!taken) { await q("update app_users set phone = $2 where id = $1", [linked.id, phone]); return send(chat, "✅ Raqamingiz saqlandi. Endi klinikaga yozilishingiz mumkin.", MENU); }
  }
  if (linked && linked.phone === phone) return send(chat, "Bu raqam hisobingizga allaqachon ulangan.", MENU);
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
    { inline_keyboard: r.map((d) => [{ text: "👤 " + cut(d.name, 30), url: url("/shifokor/" + d.id) }, { text: "📝 Yozilish", callback_data: "bd:" + d.id }]) });
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

// ---------- booking from the bot: the same rules as the site (create_consult, create_appt) ----------
// The steps keep their choices in tg_state as "bk:" + JSON: { f: "c", doc, type, slot } for an online consultation,
// { f: "v", place, day, part, time } for a visit; "wait" says which typed answer comes next.
const bkGet = (u) => { try { return /^bk:/.test(u.tg_state || "") ? JSON.parse(u.tg_state.slice(3)) : null; } catch (e) { return null; } };
const bkSet = (u, st) => { u.tg_state = st ? "bk:" + JSON.stringify(st) : null; return setState(u.id, u.tg_state); };
const sum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so‘m";
const priceOf = (p, type) => { const v = ((p && p.cp) || {})[type]; return v === "" || v == null || !isFinite(Number(v)) ? null : Math.max(0, Math.round(Number(v))); };
const rows = (btns, n) => { const out = []; for (let i = 0; i < btns.length; i += n) out.push(btns.slice(i, i + n)); return out; };
const DAYS = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];
const dayLabel = (ms) => { const d = new Date(ms + 5 * 3600e3); return DAYS[d.getUTCDay()] + ", " + d.getUTCDate() + "-" + MONTHS[d.getUTCMonth()]; };

async function bookStart(chat, u) {
  if (!u) return menu(chat, null);
  await bkSet(u, null);
  return send(chat, "Qanday yozilasiz?", { inline_keyboard: [[{ text: "💻 Onlayn maslahat (chat yoki video)", callback_data: "bk:on" }], [{ text: "🏥 Yuzma-yuz qabul (klinika yoki shifokor kabineti)", callback_data: "bk:in" }]] });
}
// online: specialty → doctor → chat or video → day and time from the doctor's hours → the problem → confirm
async function bookDoctors(chat, spec) {
  const r = (await q("select id, name, profile, verified_at from app_users where role = 'doctor' and profile->>'spec' = $1 and profile->'modes' ? 'on' and (imported_at is null or claimed_at is not null) order by verified_at is null, updated_at desc limit 8", [spec])).rows;
  if (!r.length) return send(chat, SPEC[spec] + ": hozircha onlayn maslahat beradigan shifokor yo‘q.", { inline_keyboard: [[{ text: "Boshqa mutaxassis", callback_data: "bk:on" }]] });
  return send(chat, SPEC[spec] + " — shifokorni tanlang:", { inline_keyboard: r.map((d) => { const p = [priceOf(d.profile, "text"), priceOf(d.profile, "video")].filter((x) => x != null); return [{ text: cut(d.name, 28) + (d.verified_at ? " ✔️" : "") + (p.length ? " · " + (Math.min(...p) === 0 ? "bepul" : sum(Math.min(...p))) : ""), callback_data: "bd:" + d.id }]; }) });
}
async function bookDoctor(chat, u, id) {
  const d = (await q("select id, name, profile from app_users where id = $1 and role = 'doctor' and (imported_at is null or claimed_at is not null)", [id])).rows[0];
  if (!d || !((d.profile || {}).modes || []).includes("on")) return send(chat, "Bu shifokor hozir onlayn maslahat bermaydi.");
  await bkSet(u, { f: "c", doc: d.id });
  const kinds = [["text", "💬 Chat"], ["video", "📹 Video"]].filter(([k]) => priceOf(d.profile, k) != null);
  const offer = kinds.length ? kinds : [["text", "💬 Chat"], ["video", "📹 Video"]];
  return send(chat, "👨‍⚕️ " + d.name + " · " + (SPEC[(d.profile || {}).spec] || "") + "\n\nMaslahat turini tanlang:", { inline_keyboard: [offer.map(([k, t]) => { const p = priceOf(d.profile, k); return { text: t + (p != null ? " · " + (p === 0 ? "bepul" : sum(p)) : ""), callback_data: "bt:" + k }; })] });
}
// the doctor's free slots in the next 14 days, by Tashkent day: [{ day, slots: [ms] }]
async function freeSlots(doc) {
  const S = require("./slots");
  const p = ((await q("select profile from app_users where id = $1", [doc])).rows[0] || {}).profile, h = S.hoursOf(p);
  if (!h) return null;
  const taken = new Set((await q("select slot_at from app_consults where doc = $1 and slot_at > now() and status in ('new', 'accepted')", [doc])).rows.map((x) => new Date(x.slot_at).getTime()));
  const day0 = Math.floor((Date.now() + S.TK) / 864e5) * 864e5 - S.TK, out = [];
  for (let i = 0; i < 15; i++) {
    const d = day0 + i * 864e5, wd = new Date(d + S.TK).getUTCDay() || 7;
    if (!h.days.includes(wd)) continue;
    const slots = [];
    for (let m = h.from; m + h.len <= h.to; m += h.len) { const ms = d + m * 60e3; if (ms >= Date.now() + 30 * 60e3 && ms <= Date.now() + 14 * 864e5 && !taken.has(ms)) slots.push(ms); }
    if (slots.length) out.push({ day: d, slots });
  }
  return out;
}
async function bookDays(chat, u, st) {
  const f = await freeSlots(st.doc);
  if (!f) { st.slot = 0; st.wait = "text"; await bkSet(u, st); return send(chat, "Bu shifokor ish vaqtini kiritmagan: vaqtni u bilan chatda kelishasiz.\n\n✍️ Muammongizni qisqacha yozing (masalan: «3 kundan beri yo‘tal va isitma»).", { inline_keyboard: [[{ text: "❌ Bekor qilish", callback_data: "bk:x" }]] }); }
  if (!f.length) return send(chat, "Yaqin 14 kunda bo‘sh vaqt qolmagan. Boshqa shifokorni tanlang.", { inline_keyboard: [[{ text: "Boshqa shifokor", callback_data: "bk:on" }]] });
  return send(chat, "🗓 Kunni tanlang (Toshkent vaqti):", { inline_keyboard: rows(f.slice(0, 9).map((x) => ({ text: dayLabel(x.day) + " (" + x.slots.length + ")", callback_data: "bday:" + x.day })), 3) });
}
async function bookTimes(chat, u, st, day) {
  const f = (await freeSlots(st.doc)) || [], d = f.find((x) => x.day === day);
  if (!d) return bookDays(chat, u, st);
  return send(chat, "⏰ " + dayLabel(day) + " — vaqtni tanlang:", { inline_keyboard: rows(d.slots.slice(0, 24).map((ms) => ({ text: when(ms).split(", ")[1], callback_data: "bsl:" + ms })), 4).concat([[{ text: "← Boshqa kun", callback_data: "bk:days" }]]) });
}
async function bookConfirm(chat, u, st) {
  const d = (await q("select name, profile from app_users where id = $1", [st.doc])).rows[0] || { name: "", profile: {} };
  const p = priceOf(d.profile, st.type);
  return send(chat, "Tekshiring:\n\n👨‍⚕️ " + d.name + "\n" + (st.type === "video" ? "📹 Video maslahat" : "💬 Chat maslahat") + (p != null ? " · " + (p === 0 ? "bepul" : sum(p)) : "") + "\n🗓 " + (st.slot ? when(st.slot) : "vaqtni shifokor bilan kelishasiz") + "\n✍️ " + cut(st.text, 300) + (p ? "\n\nTo‘lov shifokor arizani qabul qilgach." : ""),
    { inline_keyboard: [[{ text: "✅ Yuborish", callback_data: "bk:ok" }], [{ text: "❌ Bekor qilish", callback_data: "bk:x" }]] });
}
async function bookSend(chat, u, st) {
  const C = require("./consults").actions;
  try {
    const r = await C.create_consult({ c: { type: st.type, who: "self", name: u.name, phone: "", complaint: st.text, since: 1, doc: st.doc, slot: st.slot ? new Date(st.slot).toISOString() : "" } }, u);
    await bkSet(u, null);
    return send(chat, "✅ Ariza yuborildi" + (st.slot ? " — " + when(st.slot) : "") + ". Shifokor qabul qilsa yoki javob yozsa, shu yerga xabar keladi.", { inline_keyboard: [[{ text: "Arizani ko‘rish", callback_data: "cv:" + r.id }]] });
  } catch (e) {
    if (e.code === "slot_taken" || e.code === "slot") { st.slot = 0; await bkSet(u, st); await send(chat, "Bu vaqt hozirgina band bo‘ldi. Boshqa vaqtni tanlang."); return bookDays(chat, u, st); }
    return send(chat, e.code === "complaint" ? "Muammoni biroz batafsilroq yozing." : "Yuborib bo‘lmadi. Saytda urinib ko‘ring.", open("Saytda ariza yuborish", "/#/consult"));
  }
}
// in person: a clinic or a doctor's own office → a day (Monday to Saturday) → morning or afternoon → an hour if they like → reason → confirm
async function bookPlaces(chat, u) {
  const { isVerified } = require("./users");
  const r = (await q("select id, role, name, profile, verified_at, verified_fac from app_users where (role = 'clinic' or (role = 'doctor' and profile->'office'->>'on' = 'true')) and verified_at is not null order by (profile->>'region') = $1 desc nulls last, name limit 30", [((u.profile || {}).region) || ""])).rows
    .filter((x) => isVerified(x) && (x.role === "clinic" || (x.profile.office && String(x.profile.office.addr || "").trim()))).slice(0, 10);
  if (!r.length) return send(chat, "Hozircha botda yozilish mumkin bo‘lgan klinika yo‘q.", open("Klinikalarni ko‘rish", "/#/find"));
  return send(chat, "🏥 Qayerga yozilasiz?", { inline_keyboard: r.map((x) => [{ text: (x.role === "doctor" ? "👨‍⚕️ " + cut(x.name, 26) + " (kabinet)" : "🏥 " + cut(x.name, 34)), callback_data: "bp:" + x.id }]) });
}
function visitDays() {
  const out = [], day0 = Date.parse(today());
  for (let i = 1; out.length < 9 && i <= 30; i++) { const d = new Date(day0 + i * 864e5); if (d.getUTCDay() !== 0) out.push(d.toISOString().slice(0, 10)); }
  return out;
}
async function visitConfirm(chat, u, st) {
  const pl = (await q("select name, role, profile from app_users where id = $1", [st.place])).rows[0] || { name: "" };
  return send(chat, "Tekshiring:\n\n" + (pl.role === "doctor" ? "👨‍⚕️ " + pl.name + " (kabinet: " + cut(((pl.profile || {}).office || {}).addr, 80) + ")" : "🏥 " + pl.name) + "\n🗓 " + day(st.day) + ", " + (st.part === "am" ? "ertalab" : "tushdan keyin") + (st.time ? " (taxminan " + st.time + ")" : "") + (st.reason ? "\n✍️ " + cut(st.reason, 300) : "") + "\n\nAniq soatni " + (pl.role === "doctor" ? "shifokor" : "klinika") + " tasdiqlaydi.",
    { inline_keyboard: [[{ text: "✅ Yuborish", callback_data: "bv:ok" }], [{ text: "❌ Bekor qilish", callback_data: "bk:x" }]] });
}
async function visitSend(chat, u, st) {
  if (!u.phone) return send(chat, "Klinika siz bilan bog‘lanishi uchun telefon raqamingiz kerak. Pastdagi tugma bilan yuboring, keyin «✅ Yuborish»ni qayta bosing.", { keyboard: [[{ text: "📱 Raqamni yuborish", request_contact: true }]], resize_keyboard: true, is_persistent: true });
  const A = require("./appts").actions;
  try {
    await A.create_appt({ a: { clinic: st.place, day: st.day, part: st.part, time: st.time || "", who: "self", name: u.name, phone: u.phone, reason: st.reason || "" } }, u);
    await bkSet(u, null);
    return send(chat, "✅ Qabul so‘rovi yuborildi: " + day(st.day) + ", " + (st.part === "am" ? "ertalab" : "tushdan keyin") + ". Aniq soat tasdiqlansa, shu yerga xabar keladi.", MENU);
  } catch (e) {
    const why = { dup: "Shu kunga bu joyga allaqachon yozilgansiz.", limit: "Ochiq so‘rovlaringiz ko‘p (5 ta). Avvalgilarini kuting yoki bekor qiling.", unverified: "Bu joy hali tekshirilmagan.", date: "Bu kunni tanlab bo‘lmaydi, boshqa kun tanlang." }[e.code];
    return send(chat, why || "Yuborib bo‘lmadi. Saytda urinib ko‘ring.", why ? MENU : open("Saytda yozilish", "/#/find"));
  }
}
// the booking buttons; true when handled
async function bookButton(chat, u, data) {
  const k = /^(bk|bs|bd|bt|bday|bsl|bp|bvd|bvp|bvt|bv):([A-Za-z0-9:_-]{1,40})$/.exec(data);
  if (!k) return false;
  if (!u) { await menu(chat, null); return true; }
  const [, a, v] = k, st = bkGet(u) || {};
  if (a === "bk" && v === "x") { await bkSet(u, null); await send(chat, "Bekor qilindi.", MENU); return true; }
  if (a === "bk" && v === "on") { await bkSet(u, null); await send(chat, "Qaysi mutaxassis kerak? Bilmasangiz, «🤖 Shifo_AI» ga muammoingizni yozing.", { inline_keyboard: rows(Object.keys(SPEC).map((s2) => ({ text: SPEC[s2], callback_data: "bs:" + s2 })), 2) }); return true; }
  if (a === "bk" && v === "in") { await bkSet(u, null); await bookPlaces(chat, u); return true; }
  if (a === "bs" && SPEC[v]) { await bookDoctors(chat, v); return true; }
  if (a === "bd" && /^[0-9a-f-]{36}$/.test(v)) { await bookDoctor(chat, u, v); return true; }
  if (st.f === "c") {
    if (a === "bt" && (v === "text" || v === "video")) { st.type = v; await bkSet(u, st); await bookDays(chat, u, st); return true; }
    if (a === "bk" && v === "days") { await bookDays(chat, u, st); return true; }
    if (a === "bday" && /^\d{10,14}$/.test(v)) { await bookTimes(chat, u, st, Number(v)); return true; }
    if (a === "bsl" && /^\d{10,14}$/.test(v)) { st.slot = Number(v); st.wait = "text"; await bkSet(u, st); await send(chat, "🗓 " + when(st.slot) + "\n\n✍️ Endi muammongizni qisqacha yozing (masalan: «3 kundan beri yo‘tal va isitma»).", { inline_keyboard: [[{ text: "❌ Bekor qilish", callback_data: "bk:x" }]] }); return true; }
    if (a === "bk" && v === "ok" && st.text && st.type) { await bookSend(chat, u, st); return true; }
  }
  if (a === "bp" && /^[0-9a-f-]{36}$/.test(v)) { await bkSet(u, { f: "v", place: v }); await send(chat, "🗓 Qaysi kun? (yakshanba dam olish)", { inline_keyboard: rows(visitDays().map((d) => ({ text: dayLabel(Date.parse(d) + 7 * 3600e3), callback_data: "bvd:" + d.replace(/-/g, "") })), 3) }); return true; }
  if (st.f === "v") {
    if (a === "bvd" && /^\d{8}$/.test(v)) { st.day = v.slice(0, 4) + "-" + v.slice(4, 6) + "-" + v.slice(6); await bkSet(u, st); await send(chat, "Kunning qaysi qismi?", { inline_keyboard: [[{ text: "🌅 Ertalab", callback_data: "bvp:am" }, { text: "🌇 Tushdan keyin", callback_data: "bvp:pm" }]] }); return true; }
    if (a === "bvp" && (v === "am" || v === "pm")) { st.part = v; await bkSet(u, st); const hrs = v === "am" ? ["08:00", "09:00", "10:00", "11:00", "12:00"] : ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]; await send(chat, "Qulay soat bormi? (aniq soatni klinika tasdiqlaydi)", { inline_keyboard: rows(hrs.map((h) => ({ text: h, callback_data: "bvt:" + h.replace(":", "") })), 3).concat([[{ text: "Farqi yo‘q", callback_data: "bvt:any" }]]) }); return true; }
    if (a === "bvt" && (v === "any" || /^\d{4}$/.test(v))) { st.time = v === "any" ? "" : v.slice(0, 2) + ":" + v.slice(2); st.wait = "reason"; await bkSet(u, st); await send(chat, "✍️ Qabul sababini qisqacha yozing yoki o‘tkazib yuboring.", { inline_keyboard: [[{ text: "O‘tkazib yuborish", callback_data: "bv:skip" }], [{ text: "❌ Bekor qilish", callback_data: "bk:x" }]] }); return true; }
    if (a === "bv" && v === "skip") { st.reason = ""; st.wait = ""; await bkSet(u, st); await visitConfirm(chat, u, st); return true; }
    if (a === "bv" && v === "ok" && st.day && st.part) { await visitSend(chat, u, st); return true; }
  }
  await send(chat, "Bu tugma eskirgan. Qaytadan boshlang.", { inline_keyboard: [[{ text: "📝 Shifokorga yozilish", callback_data: "bk:start" }]] });
  return true;
}
// typed answers during booking; true when handled
async function bookText(chat, u, text) {
  const st = bkGet(u);
  if (!st || !st.wait) return false;
  if (st.wait === "text") {
    if (text.length < 5) { await send(chat, "Biroz batafsilroq yozing (kamida 5 harf)."); return true; }
    st.text = text.slice(0, 1500); st.wait = ""; await bkSet(u, st); await bookConfirm(chat, u, st); return true;
  }
  if (st.wait === "reason") { st.reason = text.slice(0, 500); st.wait = ""; await bkSet(u, st); await visitConfirm(chat, u, st); return true; }
  return false;
}

// a text message that wasn't a sign-in or a link code; true when handled
async function botMessage(m) {
  const chat = m.chat.id, text = String(m.text || "").trim(), u = await userOf(chat);
  if (/^\/(start|menu)$/.test(text)) { if (u) await setState(u.id, null); return menu(chat, u); }
  if (/^\/cancel$/.test(text) || text === "❌ Bekor qilish") { if (u) await setState(u.id, null); return send(chat, "Bekor qilindi.", u ? MENU : null); }
  if (!u) return text ? ai(chat, null, text) : menu(chat, null);
  if (text === "📝 Shifokorga yozilish" || text === "/yozilish") return bookStart(chat, u);
  if (text === "📋 Arizalarim" || text === "/arizalar") { await setState(u.id, null); return myConsults(chat, u); }
  if (text === "🏥 Qabullarim" || text === "/qabullar") { await setState(u.id, null); return myVisits(chat, u); }
  if (text === "👨‍⚕️ Shifokor topish" || text === "/shifokorlar") { await setState(u.id, null); return send(chat, "Qaysi mutaxassis kerak?", specButtons()); }
  if (text === "🤖 Shifo_AI" || text === "/ai") { await setState(u.id, "ai:[]"); return send(chat, "🤖 Muammoingizni oddiy so‘zlar bilan yozing, masalan: «2 kundan beri boshim og‘riyapti». Mos shifokorni topib beraman.", MENU); }
  if (text === "🤰 Onalar uchun" || text === "/ona") { await setState(u.id, null); return ona(chat, u); }
  if (text === "🌐 Saytni ochish") return send(chat, "Shifokor sayti:", { inline_keyboard: [[{ text: "shifokor.com", url: url("/") }]] });
  if (text && (await bookText(chat, u, text))) return true;   /* the problem or the visit reason, during booking */
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
  const data = String(cb.data || ""), chat = cb.message && cb.message.chat && cb.message.chat.id;
  if (chat && /^(bk|bs|bd|bt|bday|bsl|bp|bvd|bvp|bvt|bv):/.test(data)) {
    await N.tgApi("answerCallbackQuery", { callback_query_id: cb.id }).catch(() => {});
    const bu = await userOf(chat);
    if (data === "bk:start") { await bookStart(chat, bu); return true; }
    return bookButton(chat, bu, data);
  }
  const k = /^(cv|cr|ds):([a-z0-9-]{2,36})$/.exec(data);
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
