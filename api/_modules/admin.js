// Admin pages: checking doctors and clinics, importing doctors with invite links, setting up the Telegram bot.
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");
const { DEFAULT_PROFILE, userOut, newInvite } = require("./users");

const actions = {
  // ---------- checking clinics and doctors (admins only) ----------
  async admin_list(b, me) {
    requireAdmin(me);
    const r = await q("select id, role, name, email, phone, tg, profile, created_at, updated_at, verified_at, verified_fac, imported_at, claimed_at, invite_at, email_verified_at from app_users where role in ('clinic', 'doctor') order by verified_at nulls first, created_at desc limit 500");
    const rv = await q("select r.id, r.target_id, t.name as target_name, r.stars, r.body, r.author, r.hidden, r.created_at from app_reviews r join app_users t on t.id = r.target_id order by r.created_at desc limit 300");
    return { users: r.rows.map((u) => Object.assign(userOut(u), { email: u.email || "", phone: u.phone || "", created_at: u.created_at, verified_at: u.verified_at, invite_at: u.invite_at, email_verified: !!u.email_verified_at })), reviews: rv.rows, webhook: N.TG };
  },

  async admin_verify(b, me) {
    requireAdmin(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const ok = b.ok === true;
    const r = await q("update app_users set verified_at = case when $2::boolean then now() end, verified_fac = case when $2::boolean then profile->>'fac' end where id = $1 and role in ('clinic', 'doctor') returning id", [b.id, ok]);
    if (!r.rows[0]) throw new Fail(404, "not_found");
    await notifyUser(b.id, ok ? "Shifokor: hisobingiz tekshirildi va tasdiqlandi." + " " + site.url() + "/#/account" : "Shifokor: hisobingiz tasdiqlanmadi. Ma’lumotlarni tekshirib, qayta saqlang. " + site.url() + "/#/account");
    return { ok: true };
  },

  // ---------- importing doctors who agreed to be listed (admins) ----------
  // rows: [{ name, phone, email, profile }], at most 200. Each new doctor gets an invite link to claim the profile.
  async admin_import(b, me) {
    requireAdmin(me);
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
        out.push({ i, id: r.rows[0].id, url: site.url() + "/#/claim/" + token });
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
    requireAdmin(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const token = newInvite();
    const r = await q("update app_users set invite_hash = $2, invite_at = now() where id = $1 and imported_at is not null and claimed_at is null returning id", [b.id, sha(token)]);
    if (!r.rows[0]) throw new Fail(404, "not_found");
    return { url: site.url() + "/#/claim/" + token };
  },

  // a one-time link to set a new password, for someone who can't get a code (no Telegram, email or SMS yet)
  async admin_reset_link(b, me) {
    requireAdmin(me);
    // by account id (the check list) or by phone or email (anyone, patients included)
    let id = b.id;
    if (!id && b.contact) {
      const c = str(b.contact, 254);
      const row = c.includes("@") ? (await q("select id from app_users where email = $1", [c.toLowerCase()])).rows[0] : (await q("select id from app_users where phone = $1", [phoneOf(c)])).rows[0];
      if (!row) throw new Fail(404, "not_found");
      id = row.id;
    }
    if (!UUID.test(String(id || ""))) bad("id");
    if (!(await q("select 1 from app_users where id = $1", [id])).rows[0]) throw new Fail(404, "not_found");
    b = { id };
    const token = newInvite();
    await q("insert into app_pw_resets (user_id, link_hash, expires_at) values ($1, $2, now() + interval '3 days') on conflict (user_id) do update set link_hash = excluded.link_hash, code_hash = null, expires_at = excluded.expires_at, tries = 0, sent_at = now()", [b.id, sha(token)]);
    return { url: site.url() + "/#/reset/" + token };
  },

  // for a doctor who withdrew consent before claiming the profile
  async admin_remove_pending(b, me) {
    requireAdmin(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    if (!(await q("delete from app_users where id = $1 and imported_at is not null and claimed_at is null returning id", [b.id])).rows[0]) throw new Fail(404, "not_found");
    return { ok: true };
  },

  // points the bot at this deployment (the build does this too, when it can)
  async admin_tg_setup(b, me) {
    requireAdmin(me);
    if (!N.TG) throw new Fail(503, "no_tg");
    await N.tgApi("setWebhook", { url: site.url() + "/api/app?tg=hook", secret_token: N.TG_SECRET, allowed_updates: ["message", "callback_query"] });
    return { ok: true, bot: await N.tgBotName() };
  }
};

module.exports = { actions };
