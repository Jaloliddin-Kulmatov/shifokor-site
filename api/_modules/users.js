// Accounts: sign-up, invites, sign-in, profiles, "online now", doctor photos, Telegram linking.
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, pwOk, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");
const { photoOf } = require("./files");
const { send } = require("../_core/http");
const G = require("../_core/google");
const T = require("../_core/throttle");
const { checkEmail } = require("../_core/emailcheck");

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
// the account for a phone number or email as typed at sign-in (a 9-digit number gets 998 in front)
async function byLogin(id, cols) {
  const s = String(id || "").trim();
  if (s.includes("@")) return (await q("select " + cols + " from app_users where email = $1", [s.toLowerCase()])).rows[0] || null;
  let d = s.replace(/\D/g, "");
  if (d.length === 9) d = "998" + d;
  return /^998\d{9}$/.test(d) ? (await q("select " + cols + " from app_users where phone = $1", [d])).rows[0] || null : null;
}
const sixDigits = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");
const codeHtml = (title, code, note) => '<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#14302f"><h2 style="margin:0 0 12px">Shifokor</h2><p>' + title + '</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0">' + code + '</p><p style="color:#5b6b6a">' + note + "</p></div>";
// a code that was sent: { channel, dest, code_hash, expires_at, tries } after counting this try, or Fail
async function useCode(userId, purpose, code) {
  const r = (await q("update app_login_codes set tries = tries + 1 where user_id = $1 and purpose = $2 returning channel, dest, code_hash, expires_at, tries", [userId, purpose])).rows[0];
  if (!r || new Date(r.expires_at).getTime() < Date.now()) throw new Fail(410, "expired");
  if (r.tries > 5) throw new Fail(429, "tries");
  return r.code_hash === sha(userId + ":" + code) ? r : null;
}
async function saveCode(userId, purpose, channel, dest, code) {
  await q("insert into app_login_codes (user_id, purpose, channel, dest, code_hash, expires_at) values ($1, $2, $3, $4, $5, now() + interval '10 minutes') on conflict (user_id) do update set purpose = excluded.purpose, channel = excluded.channel, dest = excluded.dest, code_hash = excluded.code_hash, expires_at = excluded.expires_at, tries = 0, sent_at = now()", [userId, purpose, channel, dest, sha(userId + ":" + code)]);
}
async function codeTooSoon(userId) {
  const last = (await q("select sent_at from app_login_codes where user_id = $1", [userId])).rows[0];
  if (last && Date.now() - new Date(last.sent_at).getTime() < 60e3) throw new Fail(429, "wait");
}

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
    if (!pwOk(pw)) bad("password");
    await checkEmail(email);   // a domain that takes mail, not a throwaway inbox
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
    if (!pwOk(pw)) bad("password");
    const r = await q("update app_users set pw_hash = $2, claimed_at = now(), invite_hash = null, invite_at = null, updated_at = now() where id = $1 and claimed_at is null returning id", [u.id, hashPw(pw)]);
    if (!r.rows[0]) throw new Fail(404, "invite");
    return { token: await newSession(u.id) };
  },

  async login(b) {
    const id = str(b.id, 254);
    const keys = T.keysOf(id, b._ip);
    await T.check(keys);   // 5 wrong passwords for one account, or 30 from one address, wait 15 minutes
    let row = null;
    if (id.includes("@")) row = (await q("select id, pw_hash from app_users where email = $1", [id.toLowerCase()])).rows[0];
    else {
      let d = id.replace(/\D/g, "");
      if (d.length === 9) d = "998" + d;
      if (d) row = (await q("select id, pw_hash from app_users where phone = $1", [d])).rows[0];
    }
    const ok = checkPw(b.password, row && row.pw_hash);   // always runs scrypt, so timing doesn't reveal unknown accounts
    if (!row || !ok) { await T.fail(keys, { id: 5, ip: 30 }); throw new Fail(401, "login"); }
    await T.clear(keys.filter((k) => k.indexOf("id:") === 0));
    return { token: await newSession(row.id) };
  },

  // ---------- "Sign in with Telegram" ----------
  // { code } the site made and sent to the bot; for a new account also role, profile, name; account when the
  // person picks one of several. Answers { status: "wait" } until they confirm in Telegram, then signs in to the
  // account linked to that chat or with that Telegram-verified phone, links the chat for notices, or makes a new one.
  async tg_login(b) {
    const code = String(b.code || "");
    if (!/^[A-Za-z0-9_-]{20,40}$/.test(code)) bad("code");
    const l = (await q("select * from app_tg_logins where code_hash = $1 and created_at > now() - interval '10 minutes' and used_at is null", [sha(code)])).rows[0];
    if (!l || !l.confirmed_at) return { status: "wait", started: !!l };
    const phone = l.phone && /^998\d{9}$/.test(l.phone) ? l.phone : null;
    const found = (await q("select id, role, name, phone, imported_at, claimed_at from app_users where tg_chat = $1 or ($2::text is not null and phone = $2) order by updated_at desc limit 5", [l.chat_id, phone])).rows;
    let u = found.length === 1 ? found[0] : found.find((x) => x.id === b.account);
    if (found.length > 1 && !u) return { status: "choose", accounts: found.map((x) => ({ id: x.id, role: x.role, name: x.name })) };
    if (u) {
      if (u.imported_at && !u.claimed_at) throw new Fail(409, "invited");   // the team's invite link comes first
      await q("update app_users set tg_chat = $2, phone = coalesce(phone, $3), updated_at = now() where id = $1", [u.id, l.chat_id, phone && !u.phone && !found.some((x) => x.id !== u.id && x.phone === phone) ? phone : null]);
      if (phone) await q("update app_users set phone_verified_at = coalesce(phone_verified_at, now()) where id = $1 and phone = $2", [u.id, phone]);   // Telegram vouched for it
      await q("update app_tg_logins set used_at = now() where id = $1", [l.id]);
      return { token: await newSession(u.id) };
    }
    if (!b.role) return { status: "new", name: l.tg_name || "" };
    const role = ["patient", "doctor", "clinic"].includes(b.role) ? b.role : bad("role");
    const name = str(b.name, 200) || (role !== "clinic" ? str(l.tg_name, 200) : "") || bad("name");   // a clinic's name isn't the person's
    const given = profileOf(b.profile), prof = Object.assign({}, DEFAULT_PROFILE[role]);
    SIGNUP_KEYS[role].forEach((k) => { if (given[k] !== undefined && given[k] !== "") prof[k] = given[k]; });
    try {
      const r = await q("insert into app_users (role, name, phone, tg, pw_hash, profile, tg_chat, phone_verified_at) values ($1, $2, $3, $4, 'telegram', $5, $6, case when $3::text is not null then now() end) returning id", [role, name, phone, l.tg_user ? tgOf(l.tg_user) : null, prof, l.chat_id]);
      await q("update app_tg_logins set used_at = now() where id = $1", [l.id]);
      return { token: await newSession(r.rows[0].id), created: true };
    } catch (e) {
      if (e.code === "23505") throw new Fail(409, "exists");
      throw e;
    }
  },

  // ---------- "Sign in with Google" ----------
  // { credential: Google's ID token, and for a new account: role, profile, phone, tg }. Signs in to the account
  // linked to that Google account, or to the one with the same Google-verified email; without either, makes a
  // new account when a role is given, otherwise answers 404 "google_new" so the site can send them to sign-up.
  async google(b) {
    const c = await G.verifyGoogle(b.credential);
    let u = (await q("select id from app_users where google_sub = $1", [c.sub])).rows[0];
    if (u) return { token: await newSession(u.id) };
    const email = G.verifiedEmail(c) ? String(c.email).toLowerCase() : null;
    if (email) {
      u = (await q("select id, imported_at, claimed_at from app_users where email = $1", [email])).rows[0];
      if (u && u.imported_at && !u.claimed_at) throw new Fail(409, "invited");   // the team's invite link comes first: it asks for their consent
      if (u && !G.trustedEmail(c)) throw new Fail(409, "google_exists");
      if (u) {
        await q("update app_users set google_sub = $2, email_verified_at = coalesce(email_verified_at, now()) where id = $1 and google_sub is null", [u.id, c.sub]);
        return { token: await newSession(u.id) };
      }
    }
    if (!b.role) throw new Fail(404, "google_new");
    const role = ["patient", "doctor", "clinic"].includes(b.role) ? b.role : bad("role");
    const name = str(b.name, 200) || (role !== "clinic" ? str(c.name, 200) : "") || bad("name");   // a clinic's name isn't the person's
    if (!email) bad("contact");
    const given = profileOf(b.profile), prof = Object.assign({}, DEFAULT_PROFILE[role]);
    SIGNUP_KEYS[role].forEach((k) => { if (given[k] !== undefined && given[k] !== "") prof[k] = given[k]; });
    try {
      const r = await q("insert into app_users (role, name, email, phone, tg, pw_hash, profile, google_sub, email_verified_at) values ($1, $2, $3, $4, $5, 'google', $6, $7, now()) returning id", [role, name, email, phoneOf(b.phone), tgOf(b.tg), prof, c.sub]);
      return { token: await newSession(r.rows[0].id), created: true };
    } catch (e) {
      if (e.code === "23505") throw new Fail(409, "exists");   // the phone belongs to another account
      throw e;
    }
  },
  // a signed-in person adds "Sign in with Google" to their account
  async google_link(b, me) {
    need(me);
    const c = await G.verifyGoogle(b.credential);
    const other = (await q("select id from app_users where google_sub = $1", [c.sub])).rows[0];
    if (other && other.id !== me.id) throw new Fail(409, "google_taken");
    await q("update app_users set google_sub = $2 where id = $1", [me.id, c.sub]);
    return { ok: true };
  },
  async google_unlink(b, me) {
    need(me);
    if (!me.has_pw) throw new Fail(409, "google_only");   // without a password there'd be no way back in
    await q("update app_users set google_sub = null where id = $1", [me.id]);
    return { ok: true };
  },

  // ---------- signing in with a 6-digit code instead of a password ----------
  // { id: phone or email } → a code by the account's Telegram chat, else SMS to its phone, else its email.
  // { sent: "tg" | "sms" | "email" }, or "" for an unknown account or one with no way to reach it (the same answer).
  async code_send(b) {
    const id = str(b.id, 254);
    const keys = T.keysOf(id, b._ip);
    await T.check(keys);
    const u = await byLogin(id, "id, email, phone, tg_chat, imported_at, claimed_at");
    if (!u) { await T.fail(keys.filter((k) => k.indexOf("ip:") === 0), { ip: 30 }); return { sent: "" }; }
    if (u.imported_at && !u.claimed_at) throw new Fail(409, "invited");   // the team's invite link comes first
    await codeTooSoon(u.id);
    const code = sixDigits();
    const text = "Shifokor: kirish kodi " + code + " (10 daqiqa). Код для входа: " + code + ". Sign-in code: " + code + ".\nKodni hech kimga aytmang. Agar siz so‘ramagan bo‘lsangiz, e’tibor bermang.";
    let channel = "", dest = null;
    if (u.tg_chat && (await N.tgSend(u.tg_chat, text))) channel = "tg";
    else if (u.phone && N.SMS && (await N.sms(u.phone, text))) { channel = "sms"; dest = u.phone; }
    else if (u.email && N.MAIL && (await N.mail(u.email, "Shifokor: kirish kodi " + code, text, codeHtml("Kirish kodi / Код для входа / Sign-in code:", code, "Kod 10 daqiqa amal qiladi. Kodni hech kimga aytmang.")))) { channel = "email"; dest = u.email; }
    if (!channel) return { sent: "" };
    await saveCode(u.id, "login", channel, dest, code);
    return { sent: channel };
  },
  // { id, code } → signed in. A code that came by SMS or email also confirms that number or address.
  async code_login(b) {
    const id = str(b.id, 254), code = String(b.code || "").replace(/\D/g, "");
    if (code.length !== 6) bad("code");
    const keys = T.keysOf(id, b._ip);
    await T.check(keys);
    const u = await byLogin(id, "id");
    if (!u) throw new Fail(410, "expired");
    const r = await useCode(u.id, "login", code);
    if (!r) { await T.fail(keys, { id: 5, ip: 30 }); throw new Fail(400, "code"); }
    await q("delete from app_login_codes where user_id = $1", [u.id]);
    if (r.channel === "sms") await q("update app_users set phone_verified_at = coalesce(phone_verified_at, now()) where id = $1 and phone = $2", [u.id, r.dest]);
    if (r.channel === "email") await q("update app_users set email_verified_at = coalesce(email_verified_at, now()) where id = $1 and email = $2", [u.id, r.dest]);
    await T.clear(keys.filter((k) => k.indexOf("id:") === 0));
    return { token: await newSession(u.id) };
  },

  // ---------- confirming the account's phone ----------
  // by SMS code (when Eskiz is set up) …
  async phone_code(b, me) {
    need(me);
    if (!me.phone) bad("phone");
    if (me.phone_verified_at) return { verified: true };
    if (!N.SMS) throw new Fail(503, "no_sms");
    await codeTooSoon(me.id);
    const code = sixDigits();
    if (!(await N.sms(me.phone, "Shifokor: telefonni tasdiqlash kodi " + code + " (10 daqiqa). Kodni hech kimga aytmang."))) throw new Fail(502, "sms");
    await saveCode(me.id, "phone", "sms", me.phone, code);
    return { sent: true };
  },
  async phone_verify(b, me) {
    need(me);
    const code = String(b.code || "").replace(/\D/g, "");
    if (code.length !== 6) bad("code");
    const r = await useCode(me.id, "phone", code);
    if (!r) throw new Fail(400, "code");
    if (r.dest !== me.phone) throw new Fail(410, "expired");   // the number was changed since
    await q("update app_users set phone_verified_at = now() where id = $1 and phone = $2", [me.id, r.dest]);
    await q("delete from app_login_codes where user_id = $1", [me.id]);
    return { verified: true };
  },
  // … or by Telegram's own contact button: the site opened the bot with a code, as for "Sign in with Telegram".
  // { code } → { status: "wait" } until the person shares their number there; it must be this account's number.
  async tg_phone(b, me) {
    need(me);
    const code = String(b.code || "");
    if (!/^[A-Za-z0-9_-]{20,40}$/.test(code)) bad("code");
    const l = (await q("select * from app_tg_logins where code_hash = $1 and created_at > now() - interval '10 minutes' and used_at is null", [sha(code)])).rows[0];
    if (!l || !l.confirmed_at) return { status: "wait", started: !!l };
    await q("update app_tg_logins set used_at = now() where id = $1", [l.id]);
    if (!l.phone) throw new Fail(409, "phone_none");   // they continued without sharing it
    if (l.phone !== me.phone) throw new Fail(409, "phone_other");
    await q("update app_users set phone_verified_at = now() where id = $1 and phone = $2", [me.id, l.phone]);
    return { status: "ok" };
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
    if (!pwOk(pw)) bad("password");
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
    if (!pwOk(pw)) bad("password");
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
    if (email && email !== me.email) await checkEmail(email);   // only a new address is checked
    const prof = profileOf(b.profile), was = me.profile || {};
    const recheck = name !== me.name || String(prof.lic || "") !== String(was.lic || "") || (me.role === "clinic" && String(prof.fac || "") !== String(was.fac || ""));
    try {
      await q("update app_users set name = $2, email = $3, phone = $4, tg = $5, profile = $6, verified_at = case when $7::boolean then null else verified_at end, email_verified_at = case when email is distinct from $3 then null else email_verified_at end, phone_verified_at = case when phone is distinct from $4 then null else phone_verified_at end, updated_at = now() where id = $1", [me.id, name, email, phone, tgOf(b.tg), prof, recheck]);
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
    const link = crypto.randomBytes(24).toString("base64url");   // one tap in the email confirms too, on any device
    await q("insert into app_email_codes (user_id, email, code_hash, link_hash, expires_at) values ($1, $2, $3, $4, now() + interval '30 minutes') on conflict (user_id) do update set email = excluded.email, code_hash = excluded.code_hash, link_hash = excluded.link_hash, expires_at = excluded.expires_at, tries = 0, sent_at = now()", [me.id, me.email, sha(me.id + ":" + code), sha(link)]);
    const url = site.url() + "/#/confirm/" + link;
    const text = "Shifokor: emailingizni tasdiqlash kodi " + code + ". Kod 30 daqiqa amal qiladi.\nКод подтверждения email: " + code + "\nYour Shifokor email code: " + code + "\n\nBir bosishda tasdiqlash / Подтвердить одним нажатием / Confirm with one tap:\n" + url + "\n\nAgar siz ro‘yxatdan o‘tmagan bo‘lsangiz, bu xatni e’tiborsiz qoldiring.";
    const html = '<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#14302f"><h2 style="margin:0 0 12px">Shifokor</h2><p>Emailingizni tasdiqlash kodi / Код подтверждения / Your code:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0">' + code + '</p><p style="margin:0 0 16px"><a href="' + url + '" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700">Tasdiqlash · Подтвердить · Confirm</a></p><p style="color:#5b6b6a">Kod 30 daqiqa amal qiladi. Agar siz ro‘yxatdan o‘tmagan bo‘lsangiz, bu xatni e’tiborsiz qoldiring.</p></div>';
    if (!(await N.mail(me.email, "Shifokor: tasdiqlash kodi " + code, text, html))) { await q("delete from app_email_codes where user_id = $1", [me.id]); throw new Fail(N.mailBlocked() ? 503 : 502, N.mailBlocked() ? "no_mail" : "mail"); }
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
  // the one-tap link from the email: the token proves the mailbox, so no sign-in is needed (it may be opened on another device)
  async email_link(b) {
    const t = String(b.token || "");
    if (!/^[A-Za-z0-9_-]{30,40}$/.test(t)) throw new Fail(410, "expired");
    const r = (await q("select user_id, email, expires_at from app_email_codes where link_hash = $1", [sha(t)])).rows[0];
    if (!r || new Date(r.expires_at).getTime() < Date.now()) throw new Fail(410, "expired");
    const u = await q("update app_users set email_verified_at = now() where id = $1 and email = $2 returning id", [r.user_id, r.email]);
    if (!u.rows[0]) throw new Fail(410, "expired");   // the email was changed since
    await q("delete from app_email_codes where user_id = $1", [r.user_id]);
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
