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

// what a doctor or clinic may fill in at sign-up (the rest of the profile is filled in later)
const SIGNUP_KEYS = {
  doctor: ["spec", "spec_other", "years", "lic", "edu", "bio", "region", "district", "langs", "sex", "work", "modes"],
  clinic: ["ctype", "own", "region", "district", "addr", "hours", "lic", "about", "contact", "contact_role"],
  patient: ["region", "district"]
};
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
async function resetLink(token) {
  const t = String(token || "");
  if (!/^[A-Za-z0-9_-]{30,40}$/.test(t)) throw new Fail(404, "reset");
  const u = (await q("select u.id, u.name from app_pw_resets r join app_users u on u.id = r.user_id where r.link_hash = $1 and r.expires_at > now()", [sha(t)])).rows[0];
  if (!u) throw new Fail(404, "reset");
  return u;
}
async function setNewPassword(userId, pw) {
  await q("update app_users set pw_hash = $2, updated_at = now() where id = $1", [userId, hashPw(pw)]);
  await q("delete from app_sessions where user_id = $1", [userId]);
  await q("delete from app_pw_resets where user_id = $1", [userId]);
  return { token: await newSession(userId) };
}
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
      const given = profileOf(b.profile), prof = Object.assign({}, DEFAULT_PROFILE[role]);
      SIGNUP_KEYS[role].forEach((k) => { if (given[k] !== undefined && given[k] !== "") prof[k] = given[k]; });
      const r = await q("insert into app_users (role, name, email, phone, tg, pw_hash, profile) values ($1, $2, $3, $4, $5, $6, $7) returning id", [role, name, email, phone, tg, hashPw(pw), prof]);
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

  // ---------- a forgotten password ----------
  // { id: phone or email } → a code by every channel this account has; { sent: [...] } names them (empty for an
  // unknown account too, so the answer doesn't tell who is registered)
  async pw_forgot(b) {
    const id = str(b.id, 254);
    let u = null;
    if (id.includes("@")) u = (await q("select id, email, phone, tg_chat from app_users where email = $1", [id.toLowerCase()])).rows[0];
    else { let d = id.replace(/\D/g, ""); if (d.length === 9) d = "998" + d; if (/^998\d{9}$/.test(d)) u = (await q("select id, email, phone, tg_chat from app_users where phone = $1", [d])).rows[0]; else bad("id"); }
    if (!u) return { sent: [] };
    const last = (await q("select sent_at from app_pw_resets where user_id = $1 and code_hash is not null", [u.id])).rows[0];
    if (last && Date.now() - new Date(last.sent_at).getTime() < 60e3) throw new Fail(429, "wait");
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    await q("insert into app_pw_resets (user_id, code_hash, expires_at) values ($1, $2, now() + interval '30 minutes') on conflict (user_id) do update set code_hash = excluded.code_hash, link_hash = null, expires_at = excluded.expires_at, tries = 0, sent_at = now()", [u.id, sha(u.id + ":" + code)]);
    const text = "Shifokor: parolni tiklash kodi " + code + " (30 daqiqa). Код для смены пароля: " + code + ". Agar siz so‘ramagan bo‘lsangiz, e’tibor bermang.";
    const sent = [];
    if (u.tg_chat && (await N.tgSend(u.tg_chat, text))) sent.push("tg");
    if (u.email && (await N.mail(u.email, "Shifokor: parolni tiklash kodi " + code, text, '<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#14302f"><h2 style="margin:0 0 12px">Shifokor</h2><p>Parolni tiklash kodi / Код для смены пароля / Password reset code:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0">' + code + '</p><p style="color:#5b6b6a">Kod 30 daqiqa amal qiladi. Agar siz so‘ramagan bo‘lsangiz, bu xatga e’tibor bermang.</p></div>'))) sent.push("email");
    if (!sent.length && u.phone && N.SMS && (await N.sms(u.phone, text))) sent.push("sms");
    if (!sent.length) await q("delete from app_pw_resets where user_id = $1", [u.id]);
    return { sent };
  },
  // { id, code, password } → signed in with the new password; every other session ends
  async pw_reset(b) {
    const id = str(b.id, 254), code = String(b.code || "").replace(/\D/g, "");
    if (code.length !== 6) bad("code");
    const pw = typeof b.password === "string" ? b.password : "";
    if (pw.length < 6 || pw.length > 200) bad("password");
    let u = null;
    if (id.includes("@")) u = (await q("select id from app_users where email = $1", [id.toLowerCase()])).rows[0];
    else { let d = id.replace(/\D/g, ""); if (d.length === 9) d = "998" + d; u = (await q("select id from app_users where phone = $1", [d])).rows[0]; }
    if (!u) throw new Fail(410, "expired");
    const r = (await q("update app_pw_resets set tries = tries + 1 where user_id = $1 and code_hash is not null returning code_hash, expires_at, tries", [u.id])).rows[0];
    if (!r || new Date(r.expires_at).getTime() < Date.now()) throw new Fail(410, "expired");
    if (r.tries > 5) throw new Fail(429, "tries");
    if (r.code_hash !== sha(u.id + ":" + code)) throw new Fail(400, "code");
    return setNewPassword(u.id, pw);
  },
  // the one-time link an admin made: { token } → who it's for, { token, password } → signed in
  async pw_link_info(b) { const u = await resetLink(b.token); return { name: u.name }; },
  async pw_link(b) {
    const u = await resetLink(b.token);
    const pw = typeof b.password === "string" ? b.password : "";
    if (pw.length < 6 || pw.length > 200) bad("password");
    return setNewPassword(u.id, pw);
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
      await q("update app_users set name = $2, email = $3, phone = $4, tg = $5, profile = $6, verified_at = case when $7::boolean then null else verified_at end, email_verified_at = case when email is distinct from $3 then null else email_verified_at end, updated_at = now() where id = $1", [me.id, name, email, phone, tgOf(b.tg), prof, recheck]);
    } catch (e) {
      if (e.code === "23505") throw new Fail(409, "exists");
      throw e;
    }
    return { ok: true };
  },

  // ---------- confirming the account's email with a 6-digit code ----------
  async email_code(b, me) {
    need(me);
    if (!me.email) bad("email");
    if (me.email_verified_at) return { verified: true };
    if (!N.MAIL) throw new Fail(503, "no_mail");
    const last = (await q("select sent_at from app_email_codes where user_id = $1", [me.id])).rows[0];
    if (last && Date.now() - new Date(last.sent_at).getTime() < 60e3) throw new Fail(429, "wait");
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    await q("insert into app_email_codes (user_id, email, code_hash, expires_at) values ($1, $2, $3, now() + interval '30 minutes') on conflict (user_id) do update set email = excluded.email, code_hash = excluded.code_hash, expires_at = excluded.expires_at, tries = 0, sent_at = now()", [me.id, me.email, sha(me.id + ":" + code)]);
    const text = "Shifokor: emailingizni tasdiqlash kodi " + code + ". Kod 30 daqiqa amal qiladi.\nКод подтверждения email: " + code + "\nYour Shifokor email code: " + code + "\n\nAgar siz ro‘yxatdan o‘tmagan bo‘lsangiz, bu xatni e’tiborsiz qoldiring.";
    const html = '<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#14302f"><h2 style="margin:0 0 12px">Shifokor</h2><p>Emailingizni tasdiqlash kodi / Код подтверждения / Your code:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0">' + code + '</p><p style="color:#5b6b6a">Kod 30 daqiqa amal qiladi. Agar siz ro‘yxatdan o‘tmagan bo‘lsangiz, bu xatni e’tiborsiz qoldiring.</p></div>';
    if (!(await N.mail(me.email, "Shifokor: tasdiqlash kodi " + code, text, html))) { await q("delete from app_email_codes where user_id = $1", [me.id]); throw new Fail(502, "mail"); }
    return { sent: true };
  },
  async email_verify(b, me) {
    need(me);
    const code = String(b.code || "").replace(/\D/g, "");
    if (code.length !== 6) bad("code");
    const r = (await q("update app_email_codes set tries = tries + 1 where user_id = $1 returning email, code_hash, expires_at, tries", [me.id])).rows[0];
    if (!r || r.email !== me.email || new Date(r.expires_at).getTime() < Date.now()) throw new Fail(410, "expired");
    if (r.tries > 5) throw new Fail(429, "tries");
    if (r.code_hash !== sha(me.id + ":" + code)) throw new Fail(400, "code");
    await q("update app_users set email_verified_at = now() where id = $1 and email = $2", [me.id, r.email]);
    await q("delete from app_email_codes where user_id = $1", [me.id]);
    return { verified: true };
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
