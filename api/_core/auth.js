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
  const r = await q("select u.id, u.role, u.name, u.email, u.phone, u.tg, u.profile, u.updated_at, u.verified_at, u.verified_fac, u.tg_chat, u.email_verified_at, u.phone_verified_at, u.imported_at, u.claimed_at, u.online_until, u.photo_at, u.google_sub, u.pw_hash like 'scrypt$%' as has_pw from app_sessions s join app_users u on u.id = s.user_id where s.token_hash = $1 and s.expires_at > now()", [sha(m[1])]);
  return r.rows[0] ? Object.assign(r.rows[0], { tokenHash: sha(m[1]) }) : null;
}
// A new password: 8 to 200 characters, not one of the passwords people guess first, not one character repeated.
// (Older 6- and 7-character passwords still sign in; the rule applies when a password is set.)
const COMMON = new Set(("12345678 123456789 1234567890 12345678910 87654321 11111111 00000000 88888888 99999999 12341234 11223344 "
  + "password password1 password123 passw0rd qwerty123 qwertyui qwertyuiop 1q2w3e4r 1q2w3e4r5t 1qaz2wsx zaq12wsx asdfghjk "
  + "abcd1234 abc12345 iloveyou sunshine princess football baseball welcome1 admin123 letmein1 superman starwars "
  + "shifokor shifokor1 shifokor123 tashkent toshkent uzbekistan o'zbekiston parol123 parolparol 998998998 99899899").split(" "));
const pwOk = (pw) => typeof pw === "string" && pw.length >= 8 && pw.length <= 200 && !COMMON.has(pw.toLowerCase()) && !/^(.)\1+$/.test(pw);
const need = (me) => { if (!me) throw new Fail(401, "auth"); return me; };
// Admins are named only in the server's environment: ADMIN_EMAILS and/or ADMIN_PHONES, comma-separated.
const listEnv = (k) => (process.env[k] || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
const isAdmin = (me) => !!me && ((me.email && listEnv("ADMIN_EMAILS").includes(me.email)) || (me.phone && listEnv("ADMIN_PHONES").map((x) => x.replace(/\D/g, "")).includes(me.phone)));

module.exports = { sha, hashPw, checkPw, pwOk, newSession, whoAmI, need, listEnv, isAdmin };
