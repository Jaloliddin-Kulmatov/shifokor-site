// The Telegram bot's own menu: what the site shows, in the chat, in Uzbek, Russian or English. A person whose chat is
// linked to their account books doctors, chats with them, sees their requests and clinic visits, asks Shifo_AI and
// follows "Onalar uchun". An unlinked chat shares its number to link or open an account.
// Doctors are shown as photo cards with ◀️ ▶️ (one message, edited in place); sections open with a picture.
// Free text goes to Shifo_AI, or into a consultation's chat while one is open.
const { AsyncLocalStorage } = require("async_hooks");
const { q } = require("../_core/db");
const { tgOf, today } = require("../_core/validate");
const site = require("../_core/site");
const N = require("./notify");
const { T, tr, pickLang, LABEL } = require("./bot-i18n");

// ---------- language: chosen in the bot (profile.tgl), else the Telegram app's language ----------
const CTX = new AsyncLocalStorage();
const MEM = new Map();   // the choice of a chat that has no account yet (best effort, this server instance only)
const lang = () => (CTX.getStore() || {}).lang || "uz";
const t = (k, ...a) => tr(lang(), k, ...a);
const langOf = (u, from, chat) => (u && u.profile && T[u.profile.tgl] ? u.profile.tgl : MEM.get(chat) || pickLang(from && from.language_code));
const setLang = (l) => { const s = CTX.getStore(); if (s) s.lang = l; };
const SPECS = Object.keys(T.uz.spec);
const specName = (k) => t("spec")[k] || "";
const ICON = { gp: "👨‍👩‍👧", therapist: "🩺", pediatrics: "👶", gyn: "🤰", cardio: "❤️", neuro: "🧠", surgery: "🏥", dental: "🦷", ent: "👂", eye: "👁", derm: "🧴", uro: "💧", endo: "🩸", psych: "🧘" };

// ---------- small helpers ----------
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cut = (s, n) => { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const url = (path) => site.url() + path;
const open = (text, path) => ({ inline_keyboard: [[{ text, url: url(path) }]] });
const send = (chat, text, markup) => N.tgSend(chat, cut(text, 3900), Object.assign({ parse_mode: "HTML" }, markup ? { reply_markup: markup } : {}));
const within = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);
// a picture with a caption; if Telegram can't fetch the picture, the same words as a message
async function photo(chat, img, caption, markup) {
  try { if (await within(N.tgApi("sendPhoto", Object.assign({ chat_id: chat, photo: img, caption: cut(caption, 1020), parse_mode: "HTML" }, markup ? { reply_markup: markup } : {})), 6000)) return true; }
  catch (e) { console.error("tg photo", e.message); }
  return send(chat, caption, markup);
}
const BANNER = { hello: "/img/doctor-phone-1200.jpg", book: "/img/doctor-video-call-1200.jpg", find: "/img/doctor-desk-1200.jpg", ai: "/img/nukus-phone-1200.jpg", ona: "/img/pregnancy-1200.jpg", visits: "/img/elderly-visit-1200.jpg" };
const banner = (k) => url(BANNER[k]);

const menuKb = () => ({ keyboard: [[t("m_book"), t("m_ai")], [t("m_cons"), t("m_visits")], [t("m_find"), t("m_ona")], [t("m_site"), t("m_lang")]], resize_keyboard: true, is_persistent: true });
const MENU = { keyboard: [[T.uz.m_book, T.uz.m_ai], [T.uz.m_cons, T.uz.m_visits], [T.uz.m_find, T.uz.m_ona], [T.uz.m_site, T.uz.m_lang]], resize_keyboard: true, is_persistent: true };
const CHAT_KB = () => ({ keyboard: [[t("chat_exit")]], resize_keyboard: true, is_persistent: true });
const LANG_KB = { inline_keyboard: [[{ text: "🇺🇿 O‘zbekcha", callback_data: "ln:uz" }, { text: "🇷🇺 Русский", callback_data: "ln:ru" }, { text: "🇬🇧 English", callback_data: "ln:en" }]] };

const when = (at) => { const d = new Date(new Date(at).getTime() + 5 * 3600e3); return t("date", d.getUTCDate(), t("months")[d.getUTCMonth()]) + ", " + d.toISOString().slice(11, 16); };
const day = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s)); return m ? t("date", Number(m[3]), t("months")[Number(m[2]) - 1]) : ""; };
const dayLabel = (ms) => { const d = new Date(ms + 5 * 3600e3); return t("days")[d.getUTCDay()] + ", " + t("date", d.getUTCDate(), t("months")[d.getUTCMonth()]); };
const money = (n) => t("sum", String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "));
const priceOf = (p, type) => { const v = ((p && p.cp) || {})[type]; return v === "" || v == null || !isFinite(Number(v)) ? null : Math.max(0, Math.round(Number(v))); };
const rows = (btns, n) => { const out = []; for (let i = 0; i < btns.length; i += n) out.push(btns.slice(i, i + n)); return out; };

const userOf = async (chat) => (await q("select id, role, name, email, phone, profile, tg_chat, tg_state from app_users where tg_chat = $1 order by updated_at desc limit 1", [chat])).rows[0] || null;
const setState = (id, state) => q("update app_users set tg_state = $2, tg_state_at = now() where id = $1", [id, state]);

async function menu(chat, u) {
  if (!u) {
    await photo(chat, banner("hello"), t("welcome"), LANG_KB);
    return send(chat, t("welcome_new"), { keyboard: [[{ text: t("share"), request_contact: true }]], resize_keyboard: true, is_persistent: true, input_field_placeholder: t("share_ph") });
  }
  return photo(chat, banner("hello"), t("hello", esc(u.name)) + "\n\n" + t("welcome").split("\n\n")[1], menuKb());
}
function langPicker(chat) { return send(chat, t("lang_q"), LANG_KB); }

// a shared contact with no sign-in waiting: link this chat to the account with that number, or open a patient account
async function linkContact(m) {
  return CTX.run({ lang: pickLang(m.from && m.from.language_code) }, async () => {
    const chat = m.chat.id, f = m.from || {}, phone = String(m.contact.phone_number || "").replace(/\D/g, "");
    const linked = await userOf(chat);
    setLang(langOf(linked, f, chat));
    if (!/^998\d{9}$/.test(phone)) return send(chat, t("uz_only", url("/#/register")), { remove_keyboard: true });
    if (linked && !linked.phone) {
      const taken = (await q("select 1 from app_users where phone = $1 and id <> $2", [phone, linked.id])).rows[0];
      if (!taken) { await q("update app_users set phone = $2 where id = $1", [linked.id, phone]); return send(chat, t("phone_saved"), menuKb()); }
    }
    if (linked && linked.phone === phone) return send(chat, t("phone_had"), menuKb());
    let u = (await q("select id, name, imported_at, claimed_at from app_users where phone = $1", [phone])).rows[0];
    if (u && u.imported_at && !u.claimed_at) return send(chat, t("claim"), { remove_keyboard: true });
    if (u) await q("update app_users set tg_chat = $2, profile = profile || jsonb_build_object('tgl', coalesce(profile->>'tgl', $3::text), 'tgm3', 1) where id = $1", [u.id, chat, lang()]);
    else {
      const name = [f.first_name, f.last_name].filter(Boolean).join(" ").slice(0, 200) || "Bemor";
      let tg = null; try { tg = f.username ? tgOf(f.username) : null; } catch (e) {}
      u = (await q("insert into app_users (role, name, phone, tg, pw_hash, profile, tg_chat) values ('patient', $1, $2, $3, 'telegram', jsonb_build_object('tgl', $5::text, 'tgm3', 1), $4) returning id, name", [name, phone, tg, chat, lang()])).rows[0];
    }
    await send(chat, t("linked", esc(u.name)), menuKb());
    return true;
  });
}

// ---------- requests and visits ----------
async function myConsults(chat, u) {
  const doc = u.role === "doctor";
  const r = (await q("select id, n, status, type, doctor_name, name, created_at from app_consults where " + (doc ? "doctor_id = $1" : "patient_id = $1") + " order by created_at desc limit 8", [u.id])).rows;
  if (!r.length) return doc ? send(chat, t("c_none_doc"), open(t("c_open_reqs"), "/#/account/requests"))
    : send(chat, t("c_none"), { inline_keyboard: [[{ text: t("c_book_online"), callback_data: "bk:on" }], [{ text: t("c_dont_know"), callback_data: "bk:ai" }]] });
  return send(chat, "<b>" + (doc ? t("c_list_doc") : t("c_list")) + "</b>\n\n" + r.map((c) => "№" + c.n + " · " + (t("cs")[c.status] || c.status) + (doc ? " · " + esc(c.name) : c.doctor_name ? " · " + esc(c.doctor_name) : "")).join("\n") + "\n\n" + t("c_pick"),
    { inline_keyboard: r.map((c) => [{ text: "№" + c.n + " — " + cut(doc ? c.name : c.doctor_name || t("c_waiting"), 30), callback_data: "cv:" + c.id }]) });
}

async function showConsult(chat, u, id) {
  const c = (await q("select * from app_consults where id = $1 and (patient_id = $2 or doctor_id = $2)", [id, u.id])).rows[0];
  if (!c) return send(chat, t("c_nf"));
  const ms = (await q("select kind, name, body, file_id, f.mime from app_messages m left join app_files f on f.id = m.file_id where m.consult_id = $1 order by m.id desc limit 6", [c.id])).rows.reverse();
  const lines = ms.map((m) => (m.kind === "s" ? "ℹ️ " : m.kind === "d" ? "👨‍⚕️ " : "🙂 ") + esc(cut(m.body || (m.mime && m.mime.indexOf("audio") === 0 ? t("voice") : m.file_id ? t("photo") : ""), 400)));
  const last = c.status === "done" ? (await q("select body from app_messages where consult_id = $1 and kind = 's' order by id desc limit 1", [c.id])).rows[0] : null;
  const text = "<b>" + t("c_req") + " №" + c.n + "</b> · " + (t("cs")[c.status] || c.status) + "\n" + (c.type === "video" ? t("c_video") : t("c_text")) + (c.doctor_name ? " · " + esc(c.doctor_name) : "") +
    (c.slot_at ? "\n🗓 " + when(c.slot_at) : c.want_at ? "\n🗓 " + t("c_pref") + ": " + when(c.want_at) : "") + "\n\n" + (lines.length ? lines.join("\n") : t("c_nomsg")) +
    (last && last.body ? "\n\n📝 <b>" + t("c_concl") + ":</b> " + esc(cut(last.body, 900)) : "");
  const can = (c.status === "accepted" || (c.status === "new" && u.id === c.patient_id)) && !(u.id === c.doctor_id && c.pay_status === "due");
  const kb = (can ? [[{ text: u.id === c.patient_id && c.status === "new" ? t("c_add") : t("c_chat"), callback_data: "cr:" + c.id }]] : []).concat([[{ text: t("c_site"), url: url("/#/consult/" + c.id) }]]);
  return send(chat, text, { inline_keyboard: kb });
}

async function myVisits(chat, u) {
  const col = u.role === "clinic" ? "clinic_id" : u.role === "doctor" ? "doctor_id" : "patient_id";
  const r = (await q("select n, clinic_name, day, part, appt_time, status, name from app_appts where " + col + " = $1 order by day desc limit 8", [u.id])).rows;
  if (!r.length) return u.role === "patient" ? photo(chat, banner("visits"), t("v_none"), { inline_keyboard: [[{ text: t("v_book"), callback_data: "bk:in" }], [{ text: t("v_online"), callback_data: "bk:on" }]] }) : send(chat, t("v_none"));
  return send(chat, "<b>" + t("v_list") + "</b>\n\n" + r.map((a) => "№" + a.n + " · " + esc(u.role === "patient" ? a.clinic_name : a.name) + "\n   " + day(a.day) + ", " + (a.appt_time ? t("v_at", a.appt_time) : a.part === "am" ? t("am") : t("pm")) + " · " + (t("ap")[a.status] || a.status)).join("\n\n"), open(t("open_site"), "/#/account/visits"));
}

// ---------- doctors as photo cards ----------
// the site's sample doctors (made up, marked "namuna", can't be booked) fill a specialty until real doctors join;
// read once from site/samples.js; their drawn avatars are PNGs in site/img/doc/
let SAMPLES = null;
function samplesOf(spec) {
  if (!SAMPLES) {
    SAMPLES = [];
    try {
      const sb = { window: {} };
      require("vm").runInNewContext(require("fs").readFileSync(require("path").join(__dirname, "../../site/samples.js"), "utf8"), sb, { timeout: 2000 });
      SAMPLES = ((sb.window.SHIFOKOR_SAMPLES || {}).d || []).filter((d) => d.role === "doctor" && d.profile).map((d) => ({ id: d.id, name: d.name, profile: d.profile, sample: true }));
    } catch (e) { console.error("samples", e.message); }
  }
  return SAMPLES.filter((d) => d.profile.spec === spec);
}
const REGION = { UZ03: ["Andijon", "Андижан", "Andijan"], UZ06: ["Buxoro", "Бухара", "Bukhara"], UZ08: ["Jizzax", "Джизак", "Jizzakh"], UZ30: ["Farg‘ona", "Фергана", "Fergana"], UZ10: ["Qashqadaryo", "Кашкадарья", "Kashkadarya"], UZ33: ["Xorazm", "Хорезм", "Khorezm"], UZ14: ["Namangan", "Наманган", "Namangan"], UZ12: ["Navoiy", "Навои", "Navoi"], UZ35: ["Qoraqalpog‘iston", "Каракалпакстан", "Karakalpakstan"], UZ18: ["Samarqand", "Самарканд", "Samarkand"], UZ22: ["Surxondaryo", "Сурхандарья", "Surkhandarya"], UZ24: ["Sirdaryo", "Сырдарья", "Syrdarya"], UZ27: ["Toshkent viloyati", "Ташкентская обл.", "Tashkent region"], UZ26: ["Toshkent", "Ташкент", "Tashkent"] };
const regionName = (code) => (REGION[code] || [])[{ uz: 0, ru: 1, en: 2 }[lang()]] || "";

async function cardsOf(spec) {
  const real = (await q("select id, name, profile, verified_at, photo_at from app_users where role = 'doctor' and profile->>'spec' = $1 and (imported_at is null or claimed_at is not null) order by verified_at is null, updated_at desc limit 10", [spec])).rows;
  return real.concat(samplesOf(spec).slice(0, Math.max(0, 12 - real.length)));
}
const cardImg = (d) => d.sample ? url("/img/doc/" + d.id + ".png") : d.photo_at ? url("/api/app?photo=" + d.id + "&v=" + new Date(d.photo_at).getTime()) : url("/img/doc/_doc.png");
function cardText(d, spec, hasReal) {
  const p = d.profile || {}, cp = [["text", "💬 " + t("d_chat")], ["video", "📹 " + t("d_video")]].map(([k, l]) => { const v = priceOf(p, k); return v == null ? "" : l + " " + (v === 0 ? t("d_free") : money(v)); }).filter(Boolean);
  const langs = (p.langs || []).map((l) => t("d_langs")[l]).filter(Boolean);
  return "<b>" + esc(d.name) + "</b>" + (d.sample ? "\n<i>" + t("d_sample") + "</i>" : d.verified_at ? "  " + t("d_verified") : "") +
    "\n\n" + (ICON[spec] || "🩺") + " " + specName(spec) + (p.years ? " · " + t("d_years", p.years) : "") +
    (cp.length ? "\n" + cp.join(" · ") : "") +
    (langs.length || p.region ? "\n" + [langs.length ? "🗣 " + langs.join(", ") : "", regionName(p.region) ? "📍 " + regionName(p.region) : ""].filter(Boolean).join(" · ") : "") +
    (p.bio && (!d.sample || lang() === "uz") ? "\n\n" + esc(cut(p.bio, 260)) : "") +   /* sample bios are written in Uzbek only */
    (!hasReal && d.sample ? "\n\nℹ️ " + t("d_soon") : "");
}
function cardKb(d, spec, i, n) {
  const nav = n > 1 ? [[{ text: "◀️", callback_data: "dc:" + spec + ":" + ((i - 1 + n) % n) }, { text: (i + 1) + " / " + n, callback_data: "dn" }, { text: "▶️", callback_data: "dc:" + spec + ":" + ((i + 1) % n) }]] : [];
  const act = d.sample ? [[{ text: t("d_profile"), url: url("/#/doc/" + d.id) }]] : [[{ text: t("d_book"), callback_data: "bd:" + d.id }, { text: t("d_profile"), url: url("/shifokor/" + d.id) }]];
  return { inline_keyboard: nav.concat(act, [[{ text: t("d_any", specName(spec)), callback_data: "ba:" + spec }], [{ text: t("d_back"), callback_data: "dsl" }]]) };
}
// one card; with msg (the card message being looked at) it changes that message in place
async function showCard(chat, spec, i, msg) {
  const list = await cardsOf(spec);
  if (!list.length) return send(chat, t("d_none", specName(spec)), { inline_keyboard: [[{ text: t("d_any", specName(spec)), callback_data: "ba:" + spec }], [{ text: t("d_back"), callback_data: "dsl" }]] });
  i = Math.max(0, Math.min(list.length - 1, i | 0));
  const d = list[i], hasReal = list.some((x) => !x.sample), caption = cardText(d, spec, hasReal), kb = cardKb(d, spec, i, list.length);
  if (msg) {
    try { if (await within(N.tgApi("editMessageMedia", { chat_id: chat, message_id: msg, media: { type: "photo", media: cardImg(d), caption: cut(caption, 1020), parse_mode: "HTML" }, reply_markup: kb }), 6000)) return true; }
    catch (e) { if (/not modified/i.test(e.message)) return true; console.error("tg card", e.message); }
  }
  return photo(chat, cardImg(d), caption, kb);
}
const specKb = () => ({ inline_keyboard: rows(SPECS.map((k) => ({ text: ICON[k] + " " + specName(k), callback_data: "ds:" + k })), 2) });
const specPicker = (chat) => photo(chat, banner("find"), "<b>" + t("d_q") + "</b>", specKb());

// ---------- Shifo_AI in the chat; a linked user's last few messages give it context (kept in tg_state) ----------
async function ai(chat, u, text) {
  const AI = require("./ai").actions;
  let hist = [];
  if (u && /^ai:/.test(u.tg_state || "")) { try { hist = JSON.parse(u.tg_state.slice(3)); } catch (e) { hist = []; } }
  hist = hist.concat([{ role: "user", content: cut(text, 800) }]).slice(-6);
  let a;
  try { a = await AI.ai_find({ messages: hist, lang: lang(), _ip: "tg:" + chat }, u); }
  catch (e) { return send(chat, e.code === "limit" ? t("ai_limit") : t("ai_fail"), u ? menuKb() : null); }
  if (u) await setState(u.id, "ai:" + JSON.stringify(hist.concat([{ role: "assistant", content: cut(a.reply, 800) }]).slice(-6)));
  if (a.emergency) return send(chat, "🚨 " + esc(a.reply) + "\n\n<b>" + t("ai_103") + "</b>", u ? menuKb() : null);
  if (a.spec && T.uz.spec[a.spec]) { await send(chat, "🤖 " + esc(a.reply) + "\n\n" + t("ai_fits", specName(a.spec))); return showCard(chat, a.spec, 0); }
  return send(chat, "🤖 " + esc(a.reply) + "\n\n<i>" + t("ai_note") + "</i>", u ? menuKb() : null);
}

async function ona(chat, u) {
  const p = (await q("select due_date, born_on, reminded_week from app_preg where user_id = $1", [u.id])).rows[0];
  if (!p) return photo(chat, banner("ona"), t("o_intro"), open(t("o_open"), "/#/ona"));
  const days = Math.round((Date.parse(String(p.due_date).slice(0, 10)) - Date.parse(today())) / 864e5), week = Math.floor((280 - days) / 7);   // as the site counts it
  const next = [12, 20, 26, 30, 34, 36, 38, 40].find((w) => w >= week);
  const text = p.born_on ? t("o_post") : t("o_week", week, day(p.due_date)) + (next ? "\n" + t("o_next", next) : "");
  return photo(chat, banner("ona"), text + "\n\n" + t("o_q"), { inline_keyboard: [[{ text: t("o_ok"), callback_data: "pc:" + u.id + ":ok" }], [{ text: t("o_bad"), callback_data: "pc:" + u.id + ":bad" }], [{ text: t("open_site"), url: url("/#/ona") }]] });
}

// ---------- booking from the bot: the same rules as the site (create_consult, create_appt) ----------
// The steps keep their choices in tg_state as "bk:" + JSON: { f: "c", doc, spec, type, slot } for an online consultation,
// { f: "v", place, day, part, time } for a visit; "wait" says which typed answer comes next.
const bkGet = (u) => { try { return /^bk:/.test(u.tg_state || "") ? JSON.parse(u.tg_state.slice(3)) : null; } catch (e) { return null; } };
const bkSet = (u, st) => { u.tg_state = st ? "bk:" + JSON.stringify(st) : null; return setState(u.id, u.tg_state); };

async function bookStart(chat, u) {
  if (!u) return menu(chat, null);
  await bkSet(u, null);
  return photo(chat, banner("book"), t("b_how"), { inline_keyboard: [[{ text: t("b_on"), callback_data: "bk:on" }], [{ text: t("b_in"), callback_data: "bk:in" }], [{ text: t("c_dont_know"), callback_data: "bk:ai" }]] });
}
async function bookDoctor(chat, u, id) {
  const d = (await q("select id, name, profile from app_users where id = $1 and role = 'doctor' and (imported_at is null or claimed_at is not null)", [id])).rows[0];
  if (!d || !((d.profile || {}).modes || []).includes("on")) return send(chat, t("b_not_on"));
  await bkSet(u, { f: "c", doc: d.id });
  const kinds = [["text", t("b_chat")], ["video", t("b_video")]].filter(([k]) => priceOf(d.profile, k) != null);
  const offer = kinds.length ? kinds : [["text", t("b_chat")], ["video", t("b_video")]];
  return send(chat, "👨‍⚕️ <b>" + esc(d.name) + "</b> · " + specName((d.profile || {}).spec) + "\n\n" + t("b_type"), { inline_keyboard: [offer.map(([k, l]) => { const p = priceOf(d.profile, k); return { text: l + (p != null ? " · " + (p === 0 ? t("d_free") : money(p)) : ""), callback_data: "bt:" + k }; })] });
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
  if (!f) { st.slot = 0; st.wait = "text"; await bkSet(u, st); return send(chat, t("b_no_hours") + "\n\n" + t("b_write"), { inline_keyboard: [[{ text: t("cancel"), callback_data: "bk:x" }]] }); }
  if (!f.length) return send(chat, t("b_no_slots"), { inline_keyboard: [[{ text: t("b_other_doc"), callback_data: "bk:on" }]] });
  return send(chat, t("b_day"), { inline_keyboard: rows(f.slice(0, 9).map((x) => ({ text: dayLabel(x.day) + " (" + x.slots.length + ")", callback_data: "bday:" + x.day })), 3) });
}
async function bookTimes(chat, u, st, d0) {
  const f = (await freeSlots(st.doc)) || [], d = f.find((x) => x.day === d0);
  if (!d) return bookDays(chat, u, st);
  return send(chat, t("b_time", dayLabel(d0)), { inline_keyboard: rows(d.slots.slice(0, 24).map((ms) => ({ text: when(ms).split(", ")[1], callback_data: "bsl:" + ms })), 4).concat([[{ text: t("b_other_day"), callback_data: "bk:days" }]]) });
}
async function bookConfirm(chat, u, st) {
  const d = st.doc ? (await q("select name, profile from app_users where id = $1", [st.doc])).rows[0] || { name: "", profile: {} } : { name: t("b_any_name", specName(st.spec) || "—"), profile: {} };
  const p = priceOf(d.profile, st.type);
  return send(chat, t("b_check") + "\n\n👨‍⚕️ " + esc(d.name) + "\n" + (st.type === "video" ? t("b_video") : t("b_chat")) + (p != null ? " · " + (p === 0 ? t("d_free") : money(p)) : "") + "\n🗓 " + (st.slot ? when(st.slot) : t("b_agree")) + "\n✍️ " + esc(cut(st.text, 300)) + (p ? "\n\n" + t("b_pay") : ""),
    { inline_keyboard: [[{ text: t("b_send"), callback_data: "bk:ok" }], [{ text: t("cancel"), callback_data: "bk:x" }]] });
}
async function bookSend(chat, u, st) {
  const C = require("./consults").actions;
  try {
    const r = await C.create_consult({ c: { type: st.type, who: "self", name: u.name, phone: "", complaint: st.text, since: 1, doc: st.doc || "", spec: st.spec || "", asap: !st.doc, slot: st.slot ? new Date(st.slot).toISOString() : "" } }, u);
    await bkSet(u, null);
    return send(chat, t("b_sent", st.slot ? when(st.slot) : ""), { inline_keyboard: [[{ text: t("c_chat"), callback_data: "cr:" + r.id }], [{ text: t("b_view"), callback_data: "cv:" + r.id }]] });
  } catch (e) {
    if (e.code === "slot_taken" || e.code === "slot") { st.slot = 0; await bkSet(u, st); await send(chat, t("b_taken")); return bookDays(chat, u, st); }
    return send(chat, e.code === "complaint" ? t("b_more") : t("b_fail"), open(t("b_site"), "/#/consult"));
  }
}
// in person: a clinic or a doctor's own office → a day (Monday to Saturday) → morning or afternoon → an hour if they like → reason → confirm
async function bookPlaces(chat, u) {
  const { isVerified } = require("./users");
  const r = (await q("select id, role, name, profile, verified_at, verified_fac from app_users where (role = 'clinic' or (role = 'doctor' and profile->'office'->>'on' = 'true')) and verified_at is not null order by (profile->>'region') = $1 desc nulls last, name limit 30", [((u.profile || {}).region) || ""])).rows
    .filter((x) => isVerified(x) && (x.role === "clinic" || (x.profile.office && String(x.profile.office.addr || "").trim()))).slice(0, 10);
  if (!r.length) return photo(chat, banner("visits"), t("p_none"), open(t("p_see"), "/#/find"));
  return photo(chat, banner("visits"), t("p_where"), { inline_keyboard: r.map((x) => [{ text: (x.role === "doctor" ? "👨‍⚕️ " + cut(x.name, 26) + " (" + t("p_office") + ")" : "🏥 " + cut(x.name, 34)), callback_data: "bp:" + x.id }]) });
}
function visitDays() {
  const out = [], day0 = Date.parse(today());
  for (let i = 1; out.length < 9 && i <= 30; i++) { const d = new Date(day0 + i * 864e5); if (d.getUTCDay() !== 0) out.push(d.toISOString().slice(0, 10)); }
  return out;
}
async function visitConfirm(chat, u, st) {
  const pl = (await q("select name, role, profile from app_users where id = $1", [st.place])).rows[0] || { name: "" };
  return send(chat, t("b_check") + "\n\n" + (pl.role === "doctor" ? "👨‍⚕️ " + esc(pl.name) + " (" + t("p_office") + ": " + esc(cut(((pl.profile || {}).office || {}).addr, 80)) + ")" : "🏥 " + esc(pl.name)) + "\n🗓 " + day(st.day) + ", " + (st.part === "am" ? t("am") : t("pm")) + (st.time ? " (" + t("p_about", st.time) + ")" : "") + (st.reason ? "\n✍️ " + esc(cut(st.reason, 300)) : "") + "\n\n" + t("p_confirm", pl.role),
    { inline_keyboard: [[{ text: t("b_send"), callback_data: "bv:ok" }], [{ text: t("cancel"), callback_data: "bk:x" }]] });
}
async function visitSend(chat, u, st) {
  if (!u.phone) return send(chat, t("p_phone"), { keyboard: [[{ text: t("share"), request_contact: true }]], resize_keyboard: true, is_persistent: true });
  const A = require("./appts").actions;
  try {
    await A.create_appt({ a: { clinic: st.place, day: st.day, part: st.part, time: st.time || "", who: "self", name: u.name, phone: u.phone, reason: st.reason || "" } }, u);
    await bkSet(u, null);
    return send(chat, t("p_sent", day(st.day), st.part === "am" ? t("am") : t("pm")), menuKb());
  } catch (e) {
    const why = (t("p_err") || {})[e.code];
    return send(chat, why || t("b_fail"), why ? menuKb() : open(t("p_site"), "/#/find"));
  }
}
// the booking buttons; true when handled
async function bookButton(chat, u, data, msg) {
  const k = /^(bk|bs|bd|ba|bt|bday|bsl|bp|bvd|bvp|bvt|bv):([A-Za-z0-9:_-]{1,40})$/.exec(data);
  if (!k) return false;
  if (!u) { await menu(chat, null); return true; }
  const [, a, v] = k, st = bkGet(u) || {};
  if (a === "bk" && v === "start") { await bookStart(chat, u); return true; }
  if (a === "bk" && v === "x") { await bkSet(u, null); await send(chat, t("cancelled"), menuKb()); return true; }
  if (a === "bk" && v === "on") { await bkSet(u, null); await specPicker(chat); return true; }
  if (a === "bk" && v === "ai") { await bkSet(u, null); await setState(u.id, "ai:[]"); await send(chat, t("ai_dk"), menuKb()); return true; }
  if (a === "bk" && v === "in") { await bkSet(u, null); await bookPlaces(chat, u); return true; }
  if (a === "bs" && T.uz.spec[v]) { await showCard(chat, v, 0); return true; }
  if (a === "bd" && /^[0-9a-f-]{36}$/.test(v)) { await bookDoctor(chat, u, v); return true; }
  if (a === "ba" && T.uz.spec[v]) { await bkSet(u, { f: "c", doc: "", spec: v }); await send(chat, t("b_any", specName(v)), { inline_keyboard: [[{ text: t("b_chat"), callback_data: "bt:text" }, { text: t("b_video"), callback_data: "bt:video" }]] }); return true; }
  if (st.f === "c") {
    if (a === "bt" && (v === "text" || v === "video")) {
      st.type = v;
      if (!st.doc) { st.slot = 0; st.wait = "text"; await bkSet(u, st); await send(chat, t("b_write_any"), { inline_keyboard: [[{ text: t("cancel"), callback_data: "bk:x" }]] }); return true; }
      await bkSet(u, st); await bookDays(chat, u, st); return true;
    }
    if (a === "bk" && v === "days") { await bookDays(chat, u, st); return true; }
    if (a === "bday" && /^\d{10,14}$/.test(v)) { await bookTimes(chat, u, st, Number(v)); return true; }
    if (a === "bsl" && /^\d{10,14}$/.test(v)) { st.slot = Number(v); st.wait = "text"; await bkSet(u, st); await send(chat, "🗓 " + when(st.slot) + "\n\n" + t("b_write"), { inline_keyboard: [[{ text: t("cancel"), callback_data: "bk:x" }]] }); return true; }
    if (a === "bk" && v === "ok" && st.text && st.type) { await bookSend(chat, u, st); return true; }
  }
  if (a === "bp" && /^[0-9a-f-]{36}$/.test(v)) { await bkSet(u, { f: "v", place: v }); await send(chat, t("p_day"), { inline_keyboard: rows(visitDays().map((d) => ({ text: dayLabel(Date.parse(d) + 7 * 3600e3), callback_data: "bvd:" + d.replace(/-/g, "") })), 3) }); return true; }
  if (st.f === "v") {
    if (a === "bvd" && /^\d{8}$/.test(v)) { st.day = v.slice(0, 4) + "-" + v.slice(4, 6) + "-" + v.slice(6); await bkSet(u, st); await send(chat, t("p_part"), { inline_keyboard: [[{ text: t("p_am"), callback_data: "bvp:am" }, { text: t("p_pm"), callback_data: "bvp:pm" }]] }); return true; }
    if (a === "bvp" && (v === "am" || v === "pm")) { st.part = v; await bkSet(u, st); const hrs = v === "am" ? ["08:00", "09:00", "10:00", "11:00", "12:00"] : ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]; await send(chat, t("p_hour"), { inline_keyboard: rows(hrs.map((h) => ({ text: h, callback_data: "bvt:" + h.replace(":", "") })), 3).concat([[{ text: t("p_any"), callback_data: "bvt:any" }]]) }); return true; }
    if (a === "bvt" && (v === "any" || /^\d{4}$/.test(v))) { st.time = v === "any" ? "" : v.slice(0, 2) + ":" + v.slice(2); st.wait = "reason"; await bkSet(u, st); await send(chat, t("p_reason"), { inline_keyboard: [[{ text: t("p_skip"), callback_data: "bv:skip" }], [{ text: t("cancel"), callback_data: "bk:x" }]] }); return true; }
    if (a === "bv" && v === "skip") { st.reason = ""; st.wait = ""; await bkSet(u, st); await visitConfirm(chat, u, st); return true; }
    if (a === "bv" && v === "ok" && st.day && st.part) { await visitSend(chat, u, st); return true; }
  }
  await send(chat, t("stale"), { inline_keyboard: [[{ text: t("m_book"), callback_data: "bk:start" }]] });
  return true;
}
// typed answers during booking; true when handled
async function bookText(chat, u, text) {
  const st = bkGet(u);
  if (!st || !st.wait) return false;
  if (st.wait === "text") {
    if (text.length < 5) { await send(chat, t("b_min")); return true; }
    st.text = text.slice(0, 1500); st.wait = ""; await bkSet(u, st); await bookConfirm(chat, u, st); return true;
  }
  if (st.wait === "reason") { st.reason = text.slice(0, 500); st.wait = ""; await bkSet(u, st); await visitConfirm(chat, u, st); return true; }
  return false;
}

// ---------- chat inside a request ----------
async function openChat(chat, u, id) {
  const c = (await q("select id, n, status, patient_id, doctor_id, doctor_name, pay_status from app_consults where id = $1 and (patient_id = $2 or doctor_id = $2)", [id, u.id])).rows[0];
  const can = c && (c.status === "accepted" || (c.status === "new" && c.patient_id === u.id));
  if (!can) return send(chat, c && (c.status === "done" || c.status === "referred" || c.status === "cancelled") ? t("ch_closed") : t("ch_cant"));
  if (c.doctor_id === u.id && c.pay_status === "due") return send(chat, t("ch_unpaid_doc"));
  await setState(u.id, "reply:" + c.id);
  const ms = (await q("select kind, body from app_messages where consult_id = $1 and body <> '' order by id desc limit 4", [c.id])).rows.reverse();
  const who = c.patient_id === u.id ? (c.doctor_name ? "👨‍⚕️ " + esc(c.doctor_name) : t("ch_wait")) : t("ch_patient");
  return send(chat, t("ch_head", c.n, who) + (ms.length ? "\n\n" + ms.map((m) => (m.kind === "s" ? "ℹ️ " : m.kind === "d" ? "👨‍⚕️ " : "🙂 ") + esc(cut(m.body, 300))).join("\n") : "") + "\n\n" + t("ch_hint"), CHAT_KB());
}

// ---------- entry points ----------
// a text message that wasn't a sign-in or a link code
function botMessage(m) {
  return CTX.run({ lang: pickLang(m.from && m.from.language_code) }, async () => {
    const chat = m.chat.id, text = String(m.text || "").trim(), u = await userOf(chat);
    setLang(langOf(u, m.from, chat));
    const key = LABEL[text];
    if (/^\/(start|menu)$/.test(text)) { if (u) await setState(u.id, null); return menu(chat, u); }
    if (/^\/(lang|til|language|язык)$/i.test(text) || key === "m_lang") return langPicker(chat);
    if (/^\/cancel$/.test(text) || key === "cancel" || key === "chat_exit") { if (u) await setState(u.id, null); return send(chat, key === "chat_exit" ? t("chat_left") : t("cancelled"), u ? menuKb() : null); }
    // people who still have an older keyboard get the new one (photos, languages) once
    if (u && !(u.profile || {}).tgm3) {
      await q("update app_users set profile = profile || '{\"tgm3\": 1}'::jsonb where id = $1", [u.id]); u.profile = Object.assign({}, u.profile, { tgm3: 1 });
      if (!/^reply:/.test(u.tg_state || "")) await send(chat, t("menu_new"), menuKb());
    }
    if (!u) return text ? ai(chat, null, text) : menu(chat, null);
    if (key === "m_book" || text === "/yozilish") return bookStart(chat, u);
    if (key === "m_cons" || text === "/arizalar") { await setState(u.id, null); return myConsults(chat, u); }
    if (key === "m_visits" || text === "/qabullar") { await setState(u.id, null); return myVisits(chat, u); }
    if (key === "m_find" || text === "/shifokorlar") { await setState(u.id, null); return specPicker(chat); }
    if (key === "m_ai" || text === "/ai") { await setState(u.id, "ai:[]"); return photo(chat, banner("ai"), t("ai_start"), menuKb()); }
    if (key === "m_ona" || text === "/ona") { await setState(u.id, null); return ona(chat, u); }
    if (key === "m_site") return send(chat, t("site_h"), { inline_keyboard: [[{ text: "shifokor.com", url: url("/") }]] });
    if (text && (await bookText(chat, u, text))) return true;   /* the problem or the visit reason, during booking */
    const reply = /^reply:([0-9a-f-]{36})$/.exec(u.tg_state || "");
    if (reply && text) {
      const C = require("./consults").actions;
      try { await C.message({ id: reply[1], body: text }, u); return send(chat, t("ch_sent"), CHAT_KB()); }
      catch (e) { await setState(u.id, null); return send(chat, e.code === "closed" ? t("ch_closed") : e.code === "unpaid" ? t("ch_unpaid") : t("b_fail"), menuKb()); }
    }
    if (text) return ai(chat, u, text);
    return send(chat, t("photo_site"), reply ? CHAT_KB() : menuKb());
  });
}

// buttons under the bot's messages; true when handled (other prefixes belong to telegram.js and the programs)
function botButton(cb) {
  const data = String(cb.data || ""), chat = cb.message && cb.message.chat && cb.message.chat.id, msg = cb.message && cb.message.message_id;
  if (!chat || !/^(bk|bs|bd|ba|bt|bday|bsl|bp|bvd|bvp|bvt|bv|cv|cr|ds|dc|dn|dsl|ln):?/.test(data)) return Promise.resolve(false);
  return CTX.run({ lang: pickLang(cb.from && cb.from.language_code) }, async () => {
    await N.tgApi("answerCallbackQuery", { callback_query_id: cb.id }).catch(() => {});
    const u = await userOf(chat);
    setLang(langOf(u, cb.from, chat));
    const ln = /^ln:(uz|ru|en)$/.exec(data);
    if (ln) {
      setLang(ln[1]);
      if (u) { await q("update app_users set profile = profile || jsonb_build_object('tgl', $2::text, 'tgm3', 1) where id = $1", [u.id, ln[1]]); u.profile = Object.assign({}, u.profile, { tgl: ln[1], tgm3: 1 }); }
      else MEM.set(chat, ln[1]);
      await send(chat, t("lang_ok"), u ? menuKb() : { keyboard: [[{ text: t("share"), request_contact: true }]], resize_keyboard: true, is_persistent: true, input_field_placeholder: t("share_ph") });
      return true;
    }
    if (data === "dn") return true;
    if (data === "dsl") { await specPicker(chat); return true; }
    const dc = /^dc:([a-z]{2,12}):(\d{1,3})$/.exec(data);
    if (dc) { if (T.uz.spec[dc[1]]) await showCard(chat, dc[1], Number(dc[2]), msg); return true; }
    const k = /^(cv|cr|ds):([a-z0-9-]{2,36})$/.exec(data);
    if (k && k[1] === "ds") { if (T.uz.spec[k[2]]) await showCard(chat, k[2], 0); return true; }
    if (!k) return bookButton(chat, u, data, msg);
    if (!u) { await menu(chat, null); return true; }
    if (k[1] === "cv") await showConsult(chat, u, k[2]);
    else await openChat(chat, u, k[2]);
    return true;
  });
}

module.exports = { botMessage, botButton, linkContact, MENU };
