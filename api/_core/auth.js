// Sessions and passwords. Signed-in requests send "Authorization: Bearer <token>"; the database keeps only its hash.
const crypto = require("crypto");
const { q } = require("./db");
const { Fail } = require("./errors");

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
// Admins are named only in the server's environment: ADMIN_EMAILS and/or ADMIN_PHONES, comma-separated.
const listEnv = (k) => (process.env[k] || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
const isAdmin = (me) => !!me && ((me.email && listEnv("ADMIN_EMAILS").includes(me.email)) || (me.phone && listEnv("ADMIN_PHONES").map((x) => x.replace(/\D/g, "")).includes(me.phone)));

module.exports = { sha, hashPw, checkPw, newSession, whoAmI, need, listEnv, isAdmin };
