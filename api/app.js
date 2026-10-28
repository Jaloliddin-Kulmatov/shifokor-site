// Shifokor server API (Vercel function). The only place that reads the database connection string.
// POST /api/app with JSON { action, ... }; signed-in requests send "Authorization: Bearer <token>".
const { Pool, types } = require("pg");
const crypto = require("crypto");
const SCHEMA = require("./_schema");
const N = require("./_notify");

types.setTypeParser(1082, (v) => v);   // keep "date" columns as YYYY-MM-DD strings, not local-midnight Date objects

// pg lets a connection-string sslmode override the ssl option below, so strip it and set TLS here.
const RAW = (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || "").trim();
const CONN = RAW.replace(/([?&])sslmode=[^&]*&?/i, "$1").replace(/[?&]$/, "");
const LOCAL = /@(localhost|127\.0\.0\.1)[:/]/.test(CONN);

let pool = null;
let migrated = null;
function db() {
  if (!pool) pool = new Pool({ connectionString: CONN, ssl: LOCAL ? false : { rejectUnauthorized: false }, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 8000 });
  return pool;
}
const q = (text, params) => db().query(text, params);

function migrate() {
  if (!migrated) {
    migrated = (async () => {
      const client = await db().connect();
      try {
        await client.query("begin");
        await client.query("select pg_advisory_xact_lock(7431001)");
        await client.query(SCHEMA);
        await client.query("commit");
      } catch (e) {
        await client.query("rollback").catch(() => {});
        throw e;
      } finally {
        client.release();
      }
    })().catch((e) => { migrated = null; throw e; });
  }
  return migrated;
}

// ---------- helpers ----------
class Fail extends Error { constructor(status, code) { super(code); this.status = status; this.code = code; } }
const bad = (code) => { throw new Fail(400, code || "invalid"); };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const opt = (v, max) => str(v, max) || null;
function phoneOf(v) {
  if (!v) return null;
  let d = String(v).replace(/\D/g, "");
  if (d.length === 9) d = "998" + d;
  if (!/^998\d{9}$/.test(d)) bad("phone");
  return d;
}
function emailOf(v) {
  const e = str(v, 254).toLowerCase();
  if (!e) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) bad("email");
  return e;
}
function tgOf(v) {
  const t = str(v, 40).replace(/^@/, "");
  if (!t) return null;
  if (!/^[A-Za-z0-9_]{5,32}$/.test(t)) bad("tg");
  return "@" + t;
}
function profileOf(v) {
  const p = v && typeof v === "object" && !Array.isArray(v) ? v : {};
  if (JSON.stringify(p).length > 20000) bad("profile");
  return p;
}
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
function hashPw(pw) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 64);
  return "scrypt$" + salt.toString("base64") + "$" + h.toString("base64");
}
function checkPw(pw, stored) {
  const parts = String(stored || "").split("$");
  const salt = parts[0] === "scrypt" ? Buffer.from(parts[1], "base64") : crypto.randomBytes(16);
  const want = parts[0] === "scrypt" ? Buffer.from(parts[2], "base64") : crypto.randomBytes(64);
  const got = crypto.scryptSync(String(pw || ""), salt, 64);
  return parts[0] === "scrypt" && want.length === got.length && crypto.timingSafeEqual(want, got);
}
async function newSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  await q("delete from app_sessions where user_id = $1 and expires_at < now()", [userId]);
  await q("insert into app_sessions (token_hash, user_id, expires_at) values ($1, $2, now() + interval '30 days')", [sha(token), userId]);
  return token;
}
async function whoAmI(req) {
  const m = /^Bearer\s+([A-Za-z0-9_-]{20,100})$/.exec(req.headers.authorization || "");
  if (!m) return null;
  const r = await q("select u.id, u.role, u.name, u.email, u.phone, u.tg, u.profile, u.updated_at, u.verified_at, u.verified_fac, u.tg_chat from app_sessions s join app_users u on u.id = s.user_id where s.token_hash = $1 and s.expires_at > now()", [sha(m[1])]);
  return r.rows[0] ? Object.assign(r.rows[0], { tokenHash: sha(m[1]) }) : null;
}
const need = (me) => { if (!me) throw new Fail(401, "auth"); return me; };
const DEFAULT_PROFILE = {
  doctor: { spec: "gp", modes: ["in"], langs: ["uz"], work: [], svc: [] },
  clinic: { ctype: "clinic", own: "s", svc: [] },
  patient: {}
};
// A clinic's check covers the hospital it claimed at the time; claiming another one needs a new check.
const isVerified = (u) => !!u.verified_at && (u.role !== "clinic" || (u.verified_fac || "") === String((u.profile || {}).fac || ""));
const userOut = (u) => ({ id: u.id, role: u.role, name: u.name, phone: u.phone || "", tg: u.tg || "", profile: u.profile || {}, updated_at: u.updated_at, verified: isVerified(u) });
// Admins are named only in the server's environment: ADMIN_EMAILS and/or ADMIN_PHONES, comma-separated.
const listEnv = (k) => (process.env[k] || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
const isAdmin = (me) => !!me && ((me.email && listEnv("ADMIN_EMAILS").includes(me.email)) || (me.phone && listEnv("ADMIN_PHONES").map((x) => x.replace(/\D/g, "")).includes(me.phone)));
let SITE = "";   // this deployment's address, for links in notices
const notifyUser = async (id, text) => { const r = (await q("select tg_chat from app_users where id = $1", [id])).rows[0]; return !!(r && r.tg_chat) && N.tgSend(r.tg_chat, text); };
async function consultFor(me, id) {
  if (!UUID.test(String(id || ""))) bad("id");
  const r = await q("select * from app_consults where id = $1", [id]);
  if (!r.rows[0]) throw new Fail(404, "not_found");
  return r.rows[0];
}
async function sysNote(consultId, note) {
  const body = str(note, 300);
  if (body) await q("insert into app_messages (consult_id, kind, body) values ($1, 's', $2)", [consultId, body]);
}

// ---------- actions ----------
const ACTIONS = {
  async sync(b, me) {
    const pub = await q("select id, role, name, case when role = 'clinic' then phone end as phone, tg, profile, updated_at, verified_at, verified_fac from app_users where role in ('doctor', 'clinic') order by created_at");
    const users = pub.rows.map(userOut);
    let consults = [];
    let appts = [];
    let mine = null;
    if (me) {
      mine = Object.assign(userOut(me), { email: me.email || "", phone: me.phone || "", tg_linked: !!me.tg_chat, admin: isAdmin(me) });
      const i = users.findIndex((u) => u.id === me.id);
      if (i > -1) users[i] = mine; else users.push(mine);
      const cs = await q(
        "select * from app_consults where patient_id = $1 or doctor_id = $1 or (status = 'new' and $2::boolean and (doc is null or doc = $1)) order by created_at desc limit 200",
        [me.id, me.role === "doctor"]
      );
      consults = cs.rows;
      if (consults.length) {
        const ms = await q("select consult_id, kind, name, body, created_at from app_messages where consult_id = any($1::uuid[]) order by id", [consults.map((c) => c.id)]);
        const by = {};
        ms.rows.forEach((m) => { (by[m.consult_id] = by[m.consult_id] || []).push(m); });
        consults.forEach((c) => { c.messages = by[c.id] || []; });
      }
      appts = (await q("select * from app_appts where patient_id = $1 or clinic_id = $1 order by created_at desc limit 300", [me.id])).rows;
    }
    return { me: mine, users, consults, appts, notify: { tg: N.TG, sms: N.SMS } };
  },

  async signup(b) {
    const role = ["patient", "doctor", "clinic"].includes(b.role) ? b.role : bad("role");
    const name = str(b.name, 200) || bad("name");
    const email = emailOf(b.email);
    const phone = phoneOf(b.phone);
    if (!email && !phone) bad("contact");
    const tg = tgOf(b.tg);
    const pw = typeof b.password === "string" ? b.password : "";
    if (pw.length < 6 || pw.length > 200) bad("password");
    try {
      const r = await q("insert into app_users (role, name, email, phone, tg, pw_hash, profile) values ($1, $2, $3, $4, $5, $6, $7) returning id", [role, name, email, phone, tg, hashPw(pw), DEFAULT_PROFILE[role]]);
      return { token: await newSession(r.rows[0].id) };
    } catch (e) {
      if (e.code === "23505") throw new Fail(409, "exists");
      throw e;
    }
  },

  async login(b) {
    const id = str(b.id, 254);
    let row = null;
    if (id.includes("@")) row = (await q("select id, pw_hash from app_users where email = $1", [id.toLowerCase()])).rows[0];
    else {
      let d = id.replace(/\D/g, "");
      if (d.length === 9) d = "998" + d;
      if (d) row = (await q("select id, pw_hash from app_users where phone = $1", [d])).rows[0];
    }
    const ok = checkPw(b.password, row && row.pw_hash);   // always runs scrypt, so timing doesn't reveal unknown accounts
    if (!row || !ok) throw new Fail(401, "login");
    return { token: await newSession(row.id) };
  },

  async logout(b, me) {
    if (me) await q("delete from app_sessions where token_hash = $1", [me.tokenHash]);
    return { ok: true };
  },

  async delete_account(b, me) {
    need(me);
    await q("delete from app_users where id = $1", [me.id]);
    return { ok: true };
  },

  async save_profile(b, me) {
    need(me);
    const name = str(b.name, 200) || bad("name");
    const email = emailOf(b.email);
    const phone = phoneOf(b.phone);
    if (!email && !phone) bad("contact");
    const prof = profileOf(b.profile), was = me.profile || {};
    const recheck = name !== me.name || String(prof.lic || "") !== String(was.lic || "") || (me.role === "clinic" && String(prof.fac || "") !== String(was.fac || ""));
    try {
      await q("update app_users set name = $2, email = $3, phone = $4, tg = $5, profile = $6, verified_at = case when $7::boolean then null else verified_at end, updated_at = now() where id = $1", [me.id, name, email, phone, tgOf(b.tg), prof, recheck]);
    } catch (e) {
      if (e.code === "23505") throw new Fail(409, "exists");
      throw e;
    }
    return { ok: true };
  },

  async create_consult(b, me) {
    need(me);
    const c = b.c || {};
    const type = ["text", "audio", "video"].includes(c.type) ? c.type : bad("type");
    const who = ["self", "child", "other"].includes(c.who) ? c.who : "self";
    const name = str(c.name, 200) || bad("name");
    const age = c.age === "" || c.age == null ? null : Math.round(Number(c.age));
    if (age != null && !(age >= 0 && age <= 130)) bad("age");
    const sex = c.sex === "m" ? "m" : "f";
    const phone = phoneOf(c.phone) || bad("phone");
    const complaint = str(c.complaint, 1500);
    if (complaint.length < 10) bad("complaint");
    const since = Math.min(4, Math.max(0, Math.round(Number(c.since) || 0)));
    let doc = UUID.test(String(c.doc || "")) ? c.doc : null;
    if (doc && !(await q("select 1 from app_users where id = $1 and role = 'doctor'", [doc])).rows[0]) doc = null;
    const r = await q(
      "insert into app_consults (patient_id, type, who, name, age, sex, phone, region, district, complaint, since, chronic, meds, allergy, spec, doc) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) returning id",
      [me.id, type, who, name, age, sex, phone, opt(c.region, 20), opt(c.district, 20), complaint, since, opt(c.chronic, 500), opt(c.meds, 500), opt(c.allergy, 500), opt(c.spec, 20), doc]
    );
    const id = r.rows[0].id;
    for (const note of (Array.isArray(b.notes) ? b.notes : []).slice(0, 3)) await sysNote(id, note);
    if (doc) await notifyUser(doc, "Shifokor: sizga yangi onlayn maslahat arizasi. " + SITE + "/#/consult/" + id);
    return { id };
  },

  async message(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.status === "done") throw new Fail(409, "closed");
    let kind, name;
    if (c.patient_id === me.id) { kind = "p"; name = c.name; }
    else if (c.doctor_id === me.id) { kind = "d"; name = me.name; }
    else throw new Fail(403, "forbidden");
    const body = str(b.body, 2000) || bad("body");
    await q("insert into app_messages (consult_id, sender, kind, name, body) values ($1, $2, $3, $4, $5)", [c.id, me.id, kind, name, body]);
    if (kind === "d") await notifyUser(c.patient_id, "Shifokor: shifokor " + me.name + " javob yozdi (ariza №" + c.n + "). " + SITE + "/#/consult/" + c.id);
    else if (c.doctor_id) await notifyUser(c.doctor_id, "Shifokor: bemor yangi xabar yozdi (ariza №" + c.n + "). " + SITE + "/#/consult/" + c.id);
    return { ok: true };
  },

  async accept(b, me) {
    need(me);
    if (me.role !== "doctor") throw new Fail(403, "forbidden");
    if (!UUID.test(String(b.id || ""))) bad("id");
    const r = await q("update app_consults set status = 'accepted', doctor_id = $1, doctor_name = $2 where id = $3 and status = 'new' and (doc is null or doc = $1) returning id, n, patient_id", [me.id, me.name, b.id]);
    if (!r.rows[0]) throw new Fail(409, "taken");
    await sysNote(b.id, b.note);
    await notifyUser(r.rows[0].patient_id, "Shifokor: shifokor " + me.name + " arizangizni qabul qildi (№" + r.rows[0].n + "). " + SITE + "/#/consult/" + b.id);
    return { ok: true };
  },

  async call(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.doctor_id !== me.id || c.status !== "accepted") throw new Fail(403, "forbidden");
    await q("update app_consults set call = true where id = $1", [c.id]);
    await sysNote(c.id, b.note);
    return { ok: true };
  },

  async finish(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.doctor_id !== me.id || c.status !== "accepted") throw new Fail(403, "forbidden");
    const outcome = Math.round(Number(b.outcome));
    if (!(outcome >= 0 && outcome <= 2)) bad("outcome");
    await q("update app_consults set status = 'done', outcome = $2 where id = $1", [c.id, outcome]);
    await sysNote(c.id, b.note);
    return { ok: true };
  },

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
    const who = a.who === "other" ? "other" : "self";
    const name = str(a.name, 200) || bad("name");
    const phone = phoneOf(a.phone) || bad("phone");
    const open = (await q("select count(*)::int as n, count(*) filter (where clinic_id = $2 and day = $3)::int as same from app_appts where patient_id = $1 and status in ('new', 'confirmed') and day >= $4", [me.id, clinic.id, day, today()])).rows[0];
    if (open.same) throw new Fail(409, "dup");
    if (open.n >= 5) throw new Fail(429, "limit");
    const r = await q(
      "insert into app_appts (patient_id, clinic_id, clinic_name, fac, day, part, who, name, phone, spec, reason) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id, n",
      [me.id, clinic.id, clinic.name, opt(a.fac, 40), day, part, who, name, phone, opt(a.spec, 20), opt(a.reason, 500)]
    );
    if (clinic.tg_chat) await N.tgSend(clinic.tg_chat, "Shifokor: yangi qabul so‘rovi №" + r.rows[0].n + ". " + name + ", " + N.dayUz(day) + ", " + (part === "am" ? "ertalab" : "tushdan keyin") + ". " + SITE + "/#/account");
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
    return { ok: true };
  },

  // ---------- Telegram notices ----------
  // returns a t.me link; opening it and pressing Start links this account's chat (see telegramHook)
  async tg_link(b, me) {
    need(me);
    if (!N.TG) throw new Fail(503, "no_tg");
    const code = crypto.randomBytes(12).toString("base64url");
    await q("update app_users set tg_code = $2, tg_code_at = now() where id = $1", [me.id, sha(code)]);
    return { url: "https://t.me/" + (await N.tgBotName()) + "?start=" + code };
  },
  async tg_unlink(b, me) {
    need(me);
    await q("update app_users set tg_chat = null where id = $1", [me.id]);
    return { ok: true };
  },

  // ---------- checking clinics and doctors (admins only) ----------
  async admin_list(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    const r = await q("select id, role, name, email, phone, tg, profile, created_at, updated_at, verified_at, verified_fac from app_users where role in ('clinic', 'doctor') order by verified_at nulls first, created_at desc limit 500");
    return { users: r.rows.map((u) => Object.assign(userOut(u), { email: u.email || "", phone: u.phone || "", created_at: u.created_at, verified_at: u.verified_at })), webhook: N.TG };
  },
  async admin_verify(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    if (!UUID.test(String(b.id || ""))) bad("id");
    const ok = b.ok === true;
    const r = await q("update app_users set verified_at = case when $2::boolean then now() end, verified_fac = case when $2::boolean then profile->>'fac' end where id = $1 and role in ('clinic', 'doctor') returning id", [b.id, ok]);
    if (!r.rows[0]) throw new Fail(404, "not_found");
    await notifyUser(b.id, ok ? "Shifokor: hisobingiz tekshirildi va tasdiqlandi." + " " + SITE + "/#/account" : "Shifokor: hisobingiz tasdiqlanmadi. Ma’lumotlarni tekshirib, qayta saqlang. " + SITE + "/#/account");
    return { ok: true };
  },
  // points the bot at this deployment (the build does this too, when it can)
  async admin_tg_setup(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    if (!N.TG) throw new Fail(503, "no_tg");
    await N.tgApi("setWebhook", { url: SITE + "/api/app?tg=hook", secret_token: N.TG_SECRET, allowed_updates: ["message"] });
    return { ok: true, bot: await N.tgBotName() };
  }
};

// a visit request's patient: Telegram if they linked it, otherwise an SMS to the phone on the request
async function tellPatient(a, text) {
  if (await notifyUser(a.patient_id, text)) return;
  await N.sms(a.phone, text);
}

// Telegram calls POST /api/app?tg=hook for messages to the bot. "/start <code>" links the chat, "/stop" unlinks it.
async function telegramHook(req, res) {
  if (!N.TG || req.headers["x-telegram-bot-api-secret-token"] !== N.TG_SECRET) return send(res, 403, { error: "forbidden" });
  let u = req.body;
  if (typeof u === "string") { try { u = JSON.parse(u); } catch (e) { u = null; } }
  const m = u && u.message, chat = m && m.chat && m.chat.id, text = String((m && m.text) || "").trim();
  if (!chat || !m.chat || m.chat.type !== "private") return send(res, 200, { ok: true });
  try {
    await migrate();
    const start = /^\/start(?:\s+([A-Za-z0-9_-]{8,64}))?$/.exec(text);
    if (start && start[1]) {
      const r = await q("update app_users set tg_chat = $2, tg_code = null where tg_code = $1 and tg_code_at > now() - interval '1 hour' returning name", [sha(start[1]), chat]);
      await N.tgSend(chat, r.rows[0] ? "Ulandi, " + r.rows[0].name + ". Qabul va maslahat javoblari shu yerga keladi. O‘chirish uchun /stop yozing." : "Havola eskirgan. Shifokor saytida «Telegramni ulash» tugmasini qayta bosing.");
    } else if (/^\/stop$/.test(text)) {
      await q("update app_users set tg_chat = null where tg_chat = $1", [chat]);
      await N.tgSend(chat, "Xabarnomalar o‘chirildi.");
    } else {
      await N.tgSend(chat, "Bu Shifokor xabarnomalari boti. Ulash uchun saytda «Telegramni ulash» tugmasini bosing.");
    }
  } catch (e) { console.error("tg hook", e && e.message); }
  return send(res, 200, { ok: true });
}

// Uzbekistan is UTC+5 all year. Requests may be made for today and the next 30 days.
const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
function dayOf(v) {
  const s = String(v || "");
  const ms = /^\d{4}-\d{2}-\d{2}$/.test(s) ? Date.parse(s + "T00:00:00Z") : NaN;
  if (isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== s) bad("date");
  const max = new Date(Date.parse(today() + "T00:00:00Z") + 30 * 864e5).toISOString().slice(0, 10);
  if (s < today() || s > max) bad("date");
  return s;
}

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

// Turns a connection failure into a short reason without exposing the connection string or password.
function reasonOf(e) {
  const code = (e && e.code) || "", msg = String((e && e.message) || "");
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return "host_not_found: check the host part of DATABASE_URL";
  if (code === "ENETUNREACH" || code === "EHOSTUNREACH" || /ENETUNREACH|EHOSTUNREACH/.test(msg)) return "network_unreachable: this is probably Supabase's direct (IPv6) connection; use the Transaction pooler string";
  if (code === "ECONNREFUSED") return "connection_refused: check the host and port";
  if (code === "ETIMEDOUT" || /timeout/i.test(msg)) return "timeout: the database didn't answer; check the host and port";
  if (code === "28P01" || /password authentication failed/i.test(msg)) return "wrong_password: check the password in DATABASE_URL (percent-encode special characters)";
  if (/tenant or user not found/i.test(msg)) return "wrong_user: for the pooler the user must be postgres.<project-ref>, copied as-is from Supabase";
  if (code === "3D000") return "database_not_found: the database name at the end of DATABASE_URL is wrong";
  if (/ssl|certificate/i.test(msg)) return "ssl: secure connection failed";
  if (/^(42|23)/.test(code)) return "schema: creating the tables failed (" + code + ")";
  return "unknown" + (code ? " (" + code + ")" : "");
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    if (!CONN) return send(res, 200, { ok: true, database: false });
    try { await migrate(); return send(res, 200, { ok: true, database: true, connected: true }); }
    catch (e) { console.error("db check", e && e.code, e && e.message); return send(res, 200, { ok: true, database: true, connected: false, reason: reasonOf(e) }); }
  }
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  if (!CONN) return send(res, 503, { error: "no_database" });
  SITE = "https://" + String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  if (/[?&]tg=hook\b/.test(req.url || "")) return telegramHook(req, res);
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== "object") return send(res, 400, { error: "invalid" });
  const action = Object.prototype.hasOwnProperty.call(ACTIONS, body.action) ? ACTIONS[body.action] : null;
  if (!action) return send(res, 400, { error: "action" });
  try {
    await migrate();
    const me = await whoAmI(req);
    return send(res, 200, await action(body, me));
  } catch (e) {
    if (e instanceof Fail) return send(res, e.status, { error: e.code });
    console.error("api error", body.action, e && e.message);
    return send(res, 500, { error: "server" });
  }
};
