// Shifokor server API (Vercel function). The only place that reads the database connection string.
// POST /api/app with JSON { action, ... }; signed-in requests send "Authorization: Bearer <token>".
const { Pool } = require("pg");
const crypto = require("crypto");
const SCHEMA = require("./_schema");

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
  const r = await q("select u.id, u.role, u.name, u.email, u.phone, u.tg, u.profile, u.updated_at from app_sessions s join app_users u on u.id = s.user_id where s.token_hash = $1 and s.expires_at > now()", [sha(m[1])]);
  return r.rows[0] ? Object.assign(r.rows[0], { tokenHash: sha(m[1]) }) : null;
}
const need = (me) => { if (!me) throw new Fail(401, "auth"); return me; };
const DEFAULT_PROFILE = {
  doctor: { spec: "gp", modes: ["in"], langs: ["uz"], work: [], svc: [] },
  clinic: { ctype: "clinic", own: "s", svc: [] },
  patient: {}
};
const userOut = (u) => ({ id: u.id, role: u.role, name: u.name, phone: u.phone || "", tg: u.tg || "", profile: u.profile || {}, updated_at: u.updated_at });
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
    const pub = await q("select id, role, name, case when role = 'clinic' then phone end as phone, tg, profile, updated_at from app_users where role in ('doctor', 'clinic') order by created_at");
    const users = pub.rows.map(userOut);
    let consults = [];
    let mine = null;
    if (me) {
      mine = Object.assign(userOut(me), { email: me.email || "", phone: me.phone || "" });
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
    }
    return { me: mine, users, consults };
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
    try {
      await q("update app_users set name = $2, email = $3, phone = $4, tg = $5, profile = $6, updated_at = now() where id = $1", [me.id, name, email, phone, tgOf(b.tg), profileOf(b.profile)]);
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
    return { ok: true };
  },

  async accept(b, me) {
    need(me);
    if (me.role !== "doctor") throw new Fail(403, "forbidden");
    if (!UUID.test(String(b.id || ""))) bad("id");
    const r = await q("update app_consults set status = 'accepted', doctor_id = $1, doctor_name = $2 where id = $3 and status = 'new' and (doc is null or doc = $1) returning id", [me.id, me.name, b.id]);
    if (!r.rows[0]) throw new Fail(409, "taken");
    await sysNote(b.id, b.note);
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
  }
};

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") return send(res, 200, { ok: true, database: Boolean(CONN) });
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  if (!CONN) return send(res, 503, { error: "no_database" });
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
