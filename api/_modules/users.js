// Accounts: sign-up, invites, sign-in, profiles, "online now", doctor photos, Telegram linking.
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");
const { photoOf } = require("./files");
const { send } = require("../_core/http");

const DEFAULT_PROFILE = {
  doctor: { spec: "gp", modes: ["in", "on"], langs: ["uz"], work: [], svc: [] },   // online consultations are on from the start, so patients can apply at once
  clinic: { ctype: "clinic", own: "s", svc: [] },
  patient: {}
};
// A clinic's check covers the hospital it claimed at the time; claiming another one needs a new check.
const isVerified = (u) => !!u.verified_at && (u.role !== "clinic" || (u.verified_fac || "") === String((u.profile || {}).fac || ""));
// pending: imported by an admin and the doctor hasn't opened their invite yet
const userOut = (u) => ({ id: u.id, role: u.role, name: u.name, phone: u.phone || "", tg: u.tg || "", profile: u.profile || {}, updated_at: u.updated_at, verified: isVerified(u), pending: !!u.imported_at && !u.claimed_at,
  online: u.online_until && new Date(u.online_until).getTime() > Date.now() ? u.online_until : null, photo: u.photo_at ? new Date(u.photo_at).getTime() : 0 });
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

const actions = {
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

  // a doctor says they're online now, for 1, 2 or 4 hours; 0 turns it off. Patients asking for the
  // first available doctor reach doctors who are online.
  async set_online(b, me) {
    requireRole(me, Role.Doctor);
    const min = Math.round(Number(b.minutes));
    if (![0, 60, 120, 240].includes(min)) bad("minutes");
    const r = await q("update app_users set online_until = case when $2::int > 0 then now() + make_interval(mins => $2::int) end where id = $1 returning online_until", [me.id, min]);
    return { online: r.rows[0].online_until };
  },

  // a doctor's profile photo: { data } from the photo shrinker, or null to remove it
  async set_photo(b, me) {
    requireRole(me, Role.Doctor);
    if (b.photo == null) { await q("update app_users set photo = null, photo_at = null where id = $1", [me.id]); return { ok: true }; }
    const ph = photoOf(b.photo);
    if (ph.data.length > 200000) bad("photo");
    await q("update app_users set photo = $2, photo_at = now() where id = $1", [me.id, ph.data]);
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
  }
};

module.exports = { actions, DEFAULT_PROFILE, isVerified, userOut, newInvite, invited, doctorPhoto };
