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
  const r = await q("select u.id, u.role, u.name, u.email, u.phone, u.tg, u.profile, u.updated_at, u.verified_at, u.verified_fac, u.tg_chat, u.imported_at, u.claimed_at, u.online_until, u.photo_at from app_sessions s join app_users u on u.id = s.user_id where s.token_hash = $1 and s.expires_at > now()", [sha(m[1])]);
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
// pending: imported by an admin and the doctor hasn't opened their invite yet
const userOut = (u) => ({ id: u.id, role: u.role, name: u.name, phone: u.phone || "", tg: u.tg || "", profile: u.profile || {}, updated_at: u.updated_at, verified: isVerified(u), pending: !!u.imported_at && !u.claimed_at,
  online: u.online_until && new Date(u.online_until).getTime() > Date.now() ? u.online_until : null, photo: u.photo_at ? new Date(u.photo_at).getTime() : 0 });
// Admins are named only in the server's environment: ADMIN_EMAILS and/or ADMIN_PHONES, comma-separated.
const listEnv = (k) => (process.env[k] || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
const isAdmin = (me) => !!me && ((me.email && listEnv("ADMIN_EMAILS").includes(me.email)) || (me.phone && listEnv("ADMIN_PHONES").map((x) => x.replace(/\D/g, "")).includes(me.phone)));
let SITE = "";   // this deployment's address, for links in notices
const notifyUser = async (id, text) => { const r = (await q("select tg_chat from app_users where id = $1", [id])).rows[0]; return !!(r && r.tg_chat) && N.tgSend(r.tg_chat, text); };
const P = require("./_pay")({ q, notifyUser, site: () => SITE });
const O = require("./_ona")({ q, N, sha, crypto, site: () => SITE, today: () => today(), Fail, bad, need, UUID, str });
async function consultFor(me, id) {
  if (!UUID.test(String(id || ""))) bad("id");
  const r = await q("select * from app_consults where id = $1", [id]);
  if (!r.rows[0]) throw new Fail(404, "not_found");
  return r.rows[0];
}
// A photo arrives as { data: base64 }. The type comes from the file's first bytes, not from what the browser says.
const MAX_PHOTOS = 20;   // per consultation
function photoOf(p) {
  const raw = p && typeof p.data === "string" && p.data.length <= 2200000 ? p.data.replace(/^data:[^,]*,/, "") : bad("photo");
  const data = Buffer.from(raw, "base64");
  if (data.length < 100 || data.length > 1600000) bad("photo");
  const mime = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff ? "image/jpeg"
    : data.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? "image/png"
    : data.slice(0, 4).toString("latin1") === "RIFF" && data.slice(8, 12).toString("latin1") === "WEBP" ? "image/webp" : bad("photo");
  return { mime, data };
}
// Only the patient and the doctor of an accepted consultation can call; a finished one is closed.
async function callPeer(b, me) {
  need(me);
  const c = await consultFor(me, b.id);
  if (c.patient_id !== me.id && c.doctor_id !== me.id) throw new Fail(403, "forbidden");
  if (c.status !== "accepted") throw new Fail(409, "closed");
  if (c.pay_status === "due") throw new Fail(409, "unpaid");
  return c;
}
// Where the browsers find each other. STUN is enough on most networks; behind strict mobile or office networks
// the call needs a TURN relay, set in the server's environment (both optional):
//   TURN_URLS        comma-separated, e.g. "turn:turn.example.uz:3478,turns:turn.example.uz:5349"
//   TURN_SECRET      coturn's static-auth-secret: each user gets a password that expires in 12 hours
//   or TURN_USERNAME + TURN_CREDENTIAL   a fixed login, for a hosted TURN service
function iceServers(userId) {
  const list = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
  const urls = listEnv("TURN_URLS").filter((u) => /^turns?:/.test(u));
  const secret = (process.env.TURN_SECRET || "").trim();
  if (urls.length && secret) {
    const username = Math.floor(Date.now() / 1000 + 12 * 3600) + ":" + userId;
    list.push({ urls, username, credential: crypto.createHmac("sha1", secret).update(username).digest("base64") });
  } else if (urls.length && (process.env.TURN_USERNAME || "").trim()) {
    list.push({ urls, username: process.env.TURN_USERNAME.trim(), credential: (process.env.TURN_CREDENTIAL || "").trim() });
  }
  return list;
}
// An invite link's doctor: imported, not yet claimed, and the link is under 30 days old.
const INVITE_DAYS = 30;
const newInvite = () => crypto.randomBytes(24).toString("base64url");
async function invited(token) {
  const t = String(token || "");
  if (!/^[A-Za-z0-9_-]{30,40}$/.test(t)) throw new Fail(404, "invite");
  const u = (await q("select id, name, email, phone, profile from app_users where invite_hash = $1 and claimed_at is null and invite_at > now() - interval '" + INVITE_DAYS + " days'", [sha(t)])).rows[0];
  if (!u) throw new Fail(404, "invite");
  return u;
}

// What doctors earned from paid consultations and what they were paid. A doctor is owed their share (the price
// minus the platform's fee) for each paid consultation once it's finished; a refunded one doesn't count.
async function earnings(doctorId) {
  const only = doctorId ? " and doctor_id = $1" : "", args = doctorId ? [doctorId] : [];
  const e = await q(
    "select doctor_id, count(*) filter (where status = 'done')::int as done_n, coalesce(sum(price) filter (where status = 'done'), 0)::bigint as gross, " +
    "coalesce(sum(coalesce(fee, 0)) filter (where status = 'done'), 0)::bigint as fee, count(*) filter (where status <> 'done')::int as open_n, " +
    "coalesce(sum(price - coalesce(fee, 0)) filter (where status <> 'done'), 0)::bigint as open_net from app_consults where pay_status = 'paid' and doctor_id is not null" + only + " group by doctor_id", args);
  const p = await q("select doctor_id, coalesce(sum(amount), 0)::bigint as paid_out, max(paid_on) as last_paid from app_payouts where doctor_id is not null" + only + " group by doctor_id", args);
  const by = {};
  const row = (id) => by[id] || (by[id] = { id, done_n: 0, gross: 0, fee: 0, net: 0, open_n: 0, open_net: 0, paid_out: 0, balance: 0, last_paid: null });
  e.rows.forEach((r) => Object.assign(row(r.doctor_id), { done_n: r.done_n, gross: Number(r.gross), fee: Number(r.fee), open_n: r.open_n, open_net: Number(r.open_net) }));
  p.rows.forEach((r) => Object.assign(row(r.doctor_id), { paid_out: Number(r.paid_out), last_paid: r.last_paid }));
  Object.values(by).forEach((r) => { r.net = r.gross - r.fee; r.balance = r.net - r.paid_out; });
  return by;
}
// "How are you feeling?" two days after a consultation ends. Telegram asks with buttons; the consultation page asks too.
const FOLLOW = { better: "yaxshilandi", same: "o‘zgarmadi", worse: "yomonlashdi" };
async function followupAnswer(c, answer, note) {
  if (!FOLLOW[answer]) bad("answer");
  const r = await q("update app_consults set followup = $2, followup_answered_at = now(), followup_at = coalesce(followup_at, now()) where id = $1 and followup is null returning id, n, doctor_id", [c.id, answer]);
  if (!r.rows[0]) return false;
  await sysNote(c.id, str(note, 300) || "Bemor: ahvolim " + FOLLOW[answer] + ".");
  if (answer === "worse" && c.doctor_id) await notifyUser(c.doctor_id, "Shifokor: bemor maslahatdan keyin ahvoli yomonlashganini aytdi (ariza №" + c.n + "). " + SITE + "/#/consult/" + c.id);
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
async function sysNote(consultId, note) {
  const body = str(note, 300);
  if (body) await q("insert into app_messages (consult_id, kind, body) values ($1, 's', $2)", [consultId, body]);
}

// ---------- actions ----------
const ACTIONS = {
  async sync(b, me) {
    const pub = await q("select id, role, name, case when role = 'clinic' then phone end as phone, tg, profile, updated_at, verified_at, verified_fac, imported_at, claimed_at, online_until, photo_at from app_users where role in ('doctor', 'clinic') order by created_at");
    const users = pub.rows.map(userOut);
    let consults = [];
    let appts = [];
    let mine = null;
    let earned = null;
    let ona = { preg: null, mothers: [] };
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
        const ms = await q("select consult_id, kind, name, body, file_id, created_at from app_messages where consult_id = any($1::uuid[]) order by id", [consults.map((c) => c.id)]);
        const by = {};
        ms.rows.forEach((m) => { (by[m.consult_id] = by[m.consult_id] || []).push(m); });
        consults.forEach((c) => { c.messages = by[c.id] || []; });
      }
      appts = (await q("select * from app_appts where patient_id = $1 or clinic_id = $1 order by created_at desc limit 300", [me.id])).rows;
      ona = await O.sync(me);
      if (me.role === "doctor") {
        const e = (await earnings(me.id))[me.id];
        if (e) earned = Object.assign(e, { fee_pct: P.FEE, payouts: (await q("select amount, paid_on, ref from app_payouts where doctor_id = $1 order by paid_on desc, created_at desc limit 20", [me.id])).rows.map((r) => ({ amount: Number(r.amount), paid_on: r.paid_on, ref: r.ref || "" })) });
      }
    }
    // shown reviews for everyone; the author also sees their own (and which consultation or visit it was for)
    const reviews = (await q(
      "select id, target_id, stars, body, author, hidden, reply, replied_at, created_at, consult_id is not null as by_consult, patient_id = $1::uuid as mine, case when patient_id = $1::uuid then consult_id end as consult_id, case when patient_id = $1::uuid then appt_id end as appt_id from app_reviews where not hidden or patient_id = $1::uuid order by created_at desc limit 1000",
      [me ? me.id : null]
    )).rows;
    return { me: mine, users, consults, appts, reviews, notify: { tg: N.TG, sms: N.SMS }, pay: { payme: P.PAYME, click: P.CLICK }, earnings: earned, ona };
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
      if (e.code !== "23505") throw e;
      // a doctor the team already imported signs up by themselves: point them to their invite link instead
      const inv = (await q("select 1 from app_users where (phone = $1 or email = $2) and imported_at is not null and claimed_at is null", [phone, email])).rows[0];
      throw new Fail(409, inv ? "invited" : "exists");
    }
  },

  // ---------- invited doctors: the link an admin sent, then a password ----------
  async claim_info(b) {
    const u = await invited(b.token);
    const d = String(u.phone || "");
    return { name: u.name, phone: d ? "+" + d.slice(0, 5) + " ••• •• " + d.slice(-2) : "", email: u.email ? u.email.replace(/^(.).*(@.*)$/, "$1•••$2") : "", spec: (u.profile || {}).spec || "" };
  },
  async claim(b) {
    const u = await invited(b.token);
    const pw = typeof b.password === "string" ? b.password : "";
    if (pw.length < 6 || pw.length > 200) bad("password");
    const r = await q("update app_users set pw_hash = $2, claimed_at = now(), invite_hash = null, invite_at = null, updated_at = now() where id = $1 and claimed_at is null returning id", [u.id, hashPw(pw)]);
    if (!r.rows[0]) throw new Fail(404, "invite");
    return { token: await newSession(u.id) };
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
    // an imported doctor who hasn't claimed their profile yet can't answer, so the application goes to any doctor
    if (doc && !(await q("select 1 from app_users where id = $1 and role = 'doctor' and (imported_at is null or claimed_at is not null)", [doc])).rows[0]) doc = null;
    const asap = !doc && c.asap === true;   // "first available doctor": doctors online now are alerted, the first to accept takes it
    const r = await q(
      "insert into app_consults (patient_id, type, who, name, age, sex, phone, region, district, complaint, since, chronic, meds, allergy, spec, doc, asap) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) returning id, n",
      [me.id, type, who, name, age, sex, phone, opt(c.region, 20), opt(c.district, 20), complaint, since, opt(c.chronic, 500), opt(c.meds, 500), opt(c.allergy, 500), opt(c.spec, 20), doc, asap]
    );
    const id = r.rows[0].id;
    for (const note of (Array.isArray(b.notes) ? b.notes : []).slice(0, 3)) await sysNote(id, note);
    if (doc) await notifyUser(doc, "Shifokor: sizga yangi onlayn maslahat arizasi. " + SITE + "/#/consult/" + id);
    if (asap) {
      const on = await q("select tg_chat from app_users where role = 'doctor' and online_until > now() and tg_chat is not null and (imported_at is null or claimed_at is not null) and ($1::text is null or profile->>'spec' = $1 or profile->>'spec' = 'gp') limit 50", [opt(c.spec, 20)]);
      const text = "Shifokor: hozir maslahat kerak (ariza №" + r.rows[0].n + "). Birinchi qabul qilgan shifokor oladi. " + SITE + "/#/consult/" + id;
      await Promise.all(on.rows.map((d) => N.tgSend(d.tg_chat, text)));
    }
    return { id };
  },

  async message(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.status === "done" || c.status === "referred") throw new Fail(409, "closed");
    let kind, name;
    if (c.patient_id === me.id) { kind = "p"; name = c.name; }
    else if (c.doctor_id === me.id) { kind = "d"; name = me.name; }
    else throw new Fail(403, "forbidden");
    if (kind === "d" && c.pay_status === "due") throw new Fail(409, "unpaid");   // the doctor replies once the patient has paid
    const body = str(b.body, 2000);
    const photo = b.photo ? photoOf(b.photo) : null;
    if (!body && !photo) bad("body");
    let fileId = null;
    if (photo) {
      if (Number((await q("select count(*) from app_files where consult_id = $1", [c.id])).rows[0].count) >= MAX_PHOTOS) throw new Fail(429, "photos");
      fileId = (await q("insert into app_files (consult_id, sender, mime, data) values ($1, $2, $3, $4) returning id", [c.id, me.id, photo.mime, photo.data])).rows[0].id;
    }
    await q("insert into app_messages (consult_id, sender, kind, name, body, file_id) values ($1, $2, $3, $4, $5, $6)", [c.id, me.id, kind, name, body, fileId]);
    const what = photo ? "rasm yubordi" : kind === "d" ? "javob yozdi" : "yangi xabar yozdi";
    if (kind === "d") await notifyUser(c.patient_id, "Shifokor: shifokor " + me.name + " " + what + " (ariza №" + c.n + "). " + SITE + "/#/consult/" + c.id);
    else if (c.doctor_id) await notifyUser(c.doctor_id, "Shifokor: bemor " + what + " (ariza №" + c.n + "). " + SITE + "/#/consult/" + c.id);
    return { ok: true, file: fileId };
  },

  // one photo from a consultation, for its patient, its doctor, or a doctor who may still accept it
  async file(b, me) {
    need(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const r = await q("select f.mime, f.data, c.patient_id, c.doctor_id, c.status, c.doc from app_files f join app_consults c on c.id = f.consult_id where f.id = $1", [b.id]);
    const f = r.rows[0];
    if (!f) throw new Fail(404, "not_found");
    const open = me.role === "doctor" && f.status === "new" && (!f.doc || f.doc === me.id);
    if (f.patient_id !== me.id && f.doctor_id !== me.id && !open) throw new Fail(403, "forbidden");
    return { mime: f.mime, data: f.data.toString("base64") };
  },

  async accept(b, me) {
    need(me);
    if (me.role !== "doctor") throw new Fail(403, "forbidden");
    if (!UUID.test(String(b.id || ""))) bad("id");
    // the price is the doctor's price for this kind of consultation at the moment they accept it
    const c0 = (await q("select type from app_consults where id = $1", [b.id])).rows[0];
    const cp = c0 && ((me.profile || {}).cp || {})[c0.type];
    const price = cp === "" || cp == null || !isFinite(Number(cp)) ? null : Math.max(0, Math.round(Number(cp)));
    const due = P.ON && price > 0;
    const r = await q("update app_consults set status = 'accepted', doctor_id = $1, doctor_name = $2, price = $4, pay_status = $5 where id = $3 and status = 'new' and (doc is null or doc = $1) returning id, n, patient_id", [me.id, me.name, b.id, price, due ? "due" : "none"]);
    if (!r.rows[0]) throw new Fail(409, "taken");
    await sysNote(b.id, b.note);
    await notifyUser(r.rows[0].patient_id, "Shifokor: shifokor " + me.name + " arizangizni qabul qildi (№" + r.rows[0].n + ")." + (due ? " Maslahat narxi " + P.sum(price) + " so‘m: to‘lovdan keyin shifokor javob beradi." : "") + " " + SITE + "/#/consult/" + b.id);
    return { ok: true };
  },

  async call(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.doctor_id !== me.id || c.status !== "accepted") throw new Fail(403, "forbidden");
    if (c.pay_status === "due") throw new Fail(409, "unpaid");
    // pressing "call" again within two minutes rings the same call, so Telegram gets one notice
    const fresh = !c.call_at || Date.now() - new Date(c.call_at).getTime() > 120e3;
    await q("update app_consults set call = true, call_at = now() where id = $1", [c.id]);
    if (fresh) {
      await sysNote(c.id, b.note);
      await notifyUser(c.patient_id, "Shifokor: shifokor " + me.name + " sizga " + (c.type === "video" ? "video" : "audio") + " qo‘ng‘iroq qilmoqda (ariza №" + c.n + "). Qo‘shiling: " + SITE + "/#/consult/" + c.id);
    }
    return { ok: true };
  },

  // ---------- calls: set-up messages between the patient and the doctor of an accepted consultation ----------
  async signal(b, me) {
    const c = await callPeer(b, me);
    const kind = ["hello", "offer", "answer", "bye"].includes(b.kind) ? b.kind : bad("kind");
    const body = b.body == null ? "" : typeof b.body === "string" && b.body.length <= 20000 ? b.body : bad("body");
    await q("delete from app_signals where consult_id = $1 and created_at < now() - interval '10 minutes'", [c.id]);
    if (Number((await q("select count(*) from app_signals where consult_id = $1 and sender = $2 and created_at > now() - interval '1 minute'", [c.id, me.id])).rows[0].count) >= 40) throw new Fail(429, "slow");
    const r = await q("insert into app_signals (consult_id, sender, kind, body) values ($1, $2, $3, $4) returning id", [c.id, me.id, kind, body]);
    return { id: Number(r.rows[0].id) };
  },

  // the other side's messages after `after`; with after = -1 only the starting point and the relay servers
  async signals(b, me) {
    const c = await callPeer(b, me);
    const after = Math.round(Number(b.after));
    if (after < 0 || !isFinite(after)) {
      const last = (await q("select coalesce(max(id), 0) as id from app_signals where consult_id = $1", [c.id])).rows[0].id;
      return { last: Number(last), ice: iceServers(me.id) };
    }
    const r = await q("select id, kind, body from app_signals where consult_id = $1 and sender <> $2 and id > $3 and created_at > now() - interval '10 minutes' order by id limit 20", [c.id, me.id, after]);
    return { signals: r.rows.map((s) => ({ id: Number(s.id), kind: s.kind, body: s.body })) };
  },

  async finish(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.doctor_id !== me.id || c.status !== "accepted") throw new Fail(403, "forbidden");
    const outcome = Math.round(Number(b.outcome));
    if (!(outcome >= 0 && outcome <= 2)) bad("outcome");
    await q("update app_consults set status = 'done', outcome = $2, closed_at = now() where id = $1", [c.id, outcome]);
    await sysNote(c.id, b.note);
    return { ok: true };
  },

  // The doctor read a new application and says an in-person visit is needed instead of an online one.
  // The application closes, nothing is charged, and the patient gets the doctor's advice. { id, advice, note }
  async refer(b, me) {
    need(me);
    if (me.role !== "doctor") throw new Fail(403, "forbidden");
    if (!UUID.test(String(b.id || ""))) bad("id");
    const advice = str(b.advice, 1000);
    if (advice.length < 10) bad("advice");
    const r = await q("update app_consults set status = 'referred', doctor_id = $1, doctor_name = $2, closed_at = now() where id = $3 and status = 'new' and (doc is null or doc = $1) returning id, n, patient_id", [me.id, me.name, b.id]);
    if (!r.rows[0]) throw new Fail(409, "taken");
    await q("insert into app_messages (consult_id, sender, kind, name, body) values ($1, $2, 'd', $3, $4)", [b.id, me.id, me.name, advice]);
    await sysNote(b.id, b.note);
    await notifyUser(r.rows[0].patient_id, "Shifokor: shifokor " + me.name + " arizangizni o‘qib, yuzma-yuz ko‘rik kerakligini aytdi (№" + r.rows[0].n + "). To‘lov olinmaydi. Maslahatini o‘qing: " + SITE + "/#/consult/" + b.id);
    return { ok: true };
  },

  // the patient's answer to "how are you feeling?" on the site: { id, answer: better | same | worse, note }
  async followup(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    if (c.patient_id !== me.id) throw new Fail(403, "forbidden");
    if (c.status !== "done") throw new Fail(409, "closed");
    if (!(await followupAnswer(c, b.answer, b.note))) throw new Fail(409, "answered");
    return { ok: true };
  },

  // a doctor says they're online now, for 1, 2 or 4 hours; 0 turns it off. Patients asking for the
  // first available doctor reach doctors who are online.
  async set_online(b, me) {
    need(me);
    if (me.role !== "doctor") throw new Fail(403, "forbidden");
    const min = Math.round(Number(b.minutes));
    if (![0, 60, 120, 240].includes(min)) bad("minutes");
    const r = await q("update app_users set online_until = case when $2::int > 0 then now() + make_interval(mins => $2::int) end where id = $1 returning online_until", [me.id, min]);
    return { online: r.rows[0].online_until };
  },

  // a doctor's profile photo: { data } from the photo shrinker, or null to remove it
  async set_photo(b, me) {
    need(me);
    if (me.role !== "doctor") throw new Fail(403, "forbidden");
    if (b.photo == null) { await q("update app_users set photo = null, photo_at = null where id = $1", [me.id]); return { ok: true }; }
    const ph = photoOf(b.photo);
    if (ph.data.length > 200000) bad("photo");
    await q("update app_users set photo = $2, photo_at = now() where id = $1", [me.id, ph.data]);
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

  // ---------- reviews ----------
  async review_create(b, me) {
    need(me);
    const stars = Math.round(Number(b.stars));
    if (!(stars >= 1 && stars <= 5)) bad("stars");
    let row;
    if (b.consult) {
      if (!UUID.test(String(b.consult))) bad("id");
      row = (await q("select id, doctor_id as target from app_consults where id = $1 and patient_id = $2 and status = 'done' and doctor_id is not null", [b.consult, me.id])).rows[0];
    } else if (b.appt) {
      if (!UUID.test(String(b.appt))) bad("id");
      row = (await q("select id, clinic_id as target from app_appts where id = $1 and patient_id = $2 and status = 'confirmed' and day <= $3", [b.appt, me.id, today()])).rows[0];
    } else bad("id");
    if (!row) throw new Fail(403, "forbidden");
    const parts = String(me.name || "").trim().split(/\s+/);
    const author = b.anon ? "" : (parts[0] + (parts[1] ? " " + parts[1].charAt(0) + "." : "")).slice(0, 60);   // "Ali V."
    try {
      await q("insert into app_reviews (patient_id, target_id, consult_id, appt_id, stars, body, author) values ($1, $2, $3, $4, $5, $6, $7)", [me.id, row.target, b.consult ? row.id : null, b.appt ? row.id : null, stars, opt(b.body, 600), author]);
    } catch (e) {
      if (e.code === "23505") throw new Fail(409, "reviewed");
      throw e;
    }
    await notifyUser(row.target, "Shifokor: sizga yangi sharh, " + stars + " yulduz. " + SITE + "/#/account");
    return { ok: true };
  },
  // the doctor or clinic answers a review about them, once or by editing the answer
  async review_reply(b, me) {
    need(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const r = await q("update app_reviews set reply = $3, replied_at = case when $3::text is null then null else now() end where id = $1 and target_id = $2 returning id", [b.id, me.id, opt(b.reply, 400)]);
    if (!r.rows[0]) throw new Fail(403, "forbidden");
    return { ok: true };
  },
  async admin_review(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    if (!UUID.test(String(b.id || ""))) bad("id");
    await q("update app_reviews set hidden = $2 where id = $1", [b.id, b.hidden === true]);
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
    const r = await q("select id, role, name, email, phone, tg, profile, created_at, updated_at, verified_at, verified_fac, imported_at, claimed_at, invite_at from app_users where role in ('clinic', 'doctor') order by verified_at nulls first, created_at desc limit 500");
    const rv = await q("select r.id, r.target_id, t.name as target_name, r.stars, r.body, r.author, r.hidden, r.created_at from app_reviews r join app_users t on t.id = r.target_id order by r.created_at desc limit 300");
    return { users: r.rows.map((u) => Object.assign(userOut(u), { email: u.email || "", phone: u.phone || "", created_at: u.created_at, verified_at: u.verified_at, invite_at: u.invite_at })), reviews: rv.rows, webhook: N.TG };
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
  // ---------- importing doctors who agreed to be listed (admins) ----------
  // rows: [{ name, phone, email, profile }], at most 200. Each new doctor gets an invite link to claim the profile.
  async admin_import(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    const rows = Array.isArray(b.rows) ? b.rows : bad("rows");
    if (!rows.length || rows.length > 200) bad("rows");
    const out = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] && typeof rows[i] === "object" ? rows[i] : {};
      try {
        const name = str(row.name, 200) || bad("name");
        const phone = phoneOf(row.phone) || bad("phone");
        const email = emailOf(row.email);
        const profile = Object.assign({}, DEFAULT_PROFILE.doctor, profileOf(row.profile));
        const token = newInvite();
        const r = await q("insert into app_users (role, name, email, phone, pw_hash, profile, imported_at, invite_hash, invite_at) values ('doctor', $1, $2, $3, 'invite', $4, now(), $5, now()) returning id", [name, email, phone, profile, sha(token)]);
        out.push({ i, id: r.rows[0].id, url: SITE + "/#/claim/" + token });
      } catch (e) {
        if (e instanceof Fail) out.push({ i, error: e.code });
        else if (e && e.code === "23505") out.push({ i, error: "exists" });   // that phone or email already has an account
        else throw e;
      }
    }
    return { results: out };
  },
  // a fresh link for an imported doctor who hasn't claimed yet (links are shown once and last 30 days)
  async admin_invite(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    if (!UUID.test(String(b.id || ""))) bad("id");
    const token = newInvite();
    const r = await q("update app_users set invite_hash = $2, invite_at = now() where id = $1 and imported_at is not null and claimed_at is null returning id", [b.id, sha(token)]);
    if (!r.rows[0]) throw new Fail(404, "not_found");
    return { url: SITE + "/#/claim/" + token };
  },
  // for a doctor who withdrew consent before claiming the profile
  async admin_remove_pending(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    if (!UUID.test(String(b.id || ""))) bad("id");
    if (!(await q("delete from app_users where id = $1 and imported_at is not null and claimed_at is null returning id", [b.id])).rows[0]) throw new Fail(404, "not_found");
    return { ok: true };
  },

  // ---------- paying doctors (admins) ----------
  async admin_payouts(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    const by = await earnings(null), ids = Object.keys(by);
    const us = ids.length ? (await q("select id, name, phone, email from app_users where id = any($1::uuid[])", [ids])).rows : [];
    const doctors = us.map((u) => Object.assign(by[u.id], { name: u.name, phone: u.phone || "", email: u.email || "" })).sort((x, y) => y.balance - x.balance);
    const payouts = (await q("select id, doctor_id, doctor_name, amount, paid_on, ref, note, created_at from app_payouts order by paid_on desc, created_at desc limit 300")).rows.map((r) => Object.assign(r, { amount: Number(r.amount) }));
    const paid = (await q("select n, paid_at, status, price, coalesce(fee, 0) as fee, pay_provider, pay_status, doctor_id, doctor_name from app_consults where pay_status in ('paid', 'refunded') order by paid_at desc limit 2000")).rows;
    return { fee_pct: P.FEE, doctors, payouts, paid };
  },
  // a transfer the admin already made to a doctor: { doctor, amount (so‘m), paid_on, ref, note }
  async admin_payout(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    if (!UUID.test(String(b.doctor || ""))) bad("id");
    const d = (await q("select id, name from app_users where id = $1 and role = 'doctor'", [b.doctor])).rows[0];
    if (!d) throw new Fail(404, "not_found");
    const amount = Math.round(Number(b.amount));
    if (!(amount > 0 && amount <= 1e10)) bad("amount");
    const day = String(b.paid_on || ""), ms = /^\d{4}-\d{2}-\d{2}$/.test(day) ? Date.parse(day + "T00:00:00Z") : NaN;
    if (isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== day || day > today() || ms < Date.now() - 400 * 864e5) bad("date");
    if (amount > ((await earnings(d.id))[d.id] || { balance: 0 }).balance) throw new Fail(409, "over");   // more than the doctor is owed: probably a typo
    await q("insert into app_payouts (doctor_id, doctor_name, amount, paid_on, ref, note, created_by) values ($1, $2, $3, $4, $5, $6, $7)", [d.id, d.name, amount, day, opt(b.ref, 100), opt(b.note, 300), me.id]);
    await notifyUser(d.id, "Shifokor: sizga " + P.sum(amount) + " so‘m o‘tkazildi (" + N.dayUz(day) + "). " + SITE + "/#/account");
    return { ok: true };
  },
  // removes a payout recorded by mistake
  async admin_payout_delete(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    if (!UUID.test(String(b.id || ""))) bad("id");
    if (!(await q("delete from app_payouts where id = $1 returning id", [b.id])).rows[0]) throw new Fail(404, "not_found");
    return { ok: true };
  },
  // points the bot at this deployment (the build does this too, when it can)
  async admin_tg_setup(b, me) {
    if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
    if (!N.TG) throw new Fail(503, "no_tg");
    await N.tgApi("setWebhook", { url: SITE + "/api/app?tg=hook", secret_token: N.TG_SECRET, allowed_updates: ["message", "callback_query"] });
    return { ok: true, bot: await N.tgBotName() };
  }
};

Object.assign(ACTIONS, O.actions);   // "Onalar uchun": pregnancy profile, check-ins, family member

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
      if (k[2] === "worse") await N.tgSend(chat, "Shifokoringizga qayta yozing yoki yaqin shifoxonaga boring: " + SITE + "/#/consult/" + c.id + "\nKo‘krak og‘rig‘i, nafas qisishi, hushdan ketish yoki kuchli qon ketish bo‘lsa, darhol 103 ga qo‘ng‘iroq qiling.");
    } else reply = "Javob allaqachon yuborilgan.";
  }
  await N.tgApi("answerCallbackQuery", { callback_query_id: cb.id, text: reply }).catch(() => {});
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

// a doctor's public profile photo, cached by browsers; the page asks with ?v=<time it changed>
async function doctorPhoto(res, id) {
  try {
    await migrate();
    const r = (await q("select photo from app_users where id = $1 and role = 'doctor' and photo is not null", [id])).rows[0];
    if (!r) return send(res, 404, { error: "not_found" });
    res.statusCode = 200;
    res.setHeader("Content-Type", r.photo[0] === 0x89 ? "image/png" : r.photo[0] === 0x52 ? "image/webp" : "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.end(r.photo);
  } catch (e) { console.error("photo", e && e.message); return send(res, 500, { error: "server" }); }
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
    const photo = /[?&]photo=([0-9a-f-]{36})\b/i.exec(req.url || "");
    if (photo && CONN) return doctorPhoto(res, photo[1]);
    // Vercel runs this once a day (vercel.json). It only sends what's due, so an extra call does no harm;
    // with CRON_SECRET set, only Vercel's own call is accepted.
    if (/[?&]cron=daily\b/.test(req.url || "") && CONN) {
      const secret = (process.env.CRON_SECRET || "").trim();
      if (secret && req.headers.authorization !== "Bearer " + secret) return send(res, 401, { error: "auth" });
      try { await migrate(); return send(res, 200, { ok: true, followups: await sendFollowups(), ona: await O.daily() }); }
      catch (e) { console.error("cron", e && e.message); return send(res, 500, { error: "server" }); }
    }
    if (!CONN) return send(res, 200, { ok: true, database: false });
    try { await migrate(); return send(res, 200, { ok: true, database: true, connected: true }); }
    catch (e) { console.error("db check", e && e.code, e && e.message); return send(res, 200, { ok: true, database: true, connected: false, reason: reasonOf(e) }); }
  }
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  if (!CONN) return send(res, 503, { error: "no_database" });
  SITE = "https://" + String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  if (/[?&]tg=hook\b/.test(req.url || "")) return telegramHook(req, res);
  // calls from Payme's and Click's servers; both expect HTTP 200 with their own error format
  const pay = /[?&]pay=(payme|click)\b/.exec(req.url || "");
  if (pay) {
    let pb = req.body;
    if (typeof pb === "string") { try { pb = pay[1] === "payme" ? JSON.parse(pb) : Object.fromEntries(new URLSearchParams(pb)); } catch (e) { pb = null; } }
    try { await migrate(); }
    catch (e) { return send(res, 200, pay[1] === "payme" ? { error: { code: -32400, message: { uz: "Tizim xatosi", ru: "Системная ошибка", en: "System error" } }, id: pb && pb.id != null ? pb.id : null } : { error: -7, error_note: "Failed to update user" }); }
    return send(res, 200, pay[1] === "payme" ? await P.payme(req, pb) : await P.click(pb));
  }
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
