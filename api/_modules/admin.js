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
    return { users: r.rows.map((u) => Object.assign(userOut(u), { email: u.email || "", phone: u.phone || "", created_at: u.created_at, verified_at: u.verified_at, invite_at: u.invite_at, email_verified: !!u.email_verified_at })), reviews: rv.rows, docs: await require("./docs").allMeta(), webhook: N.TG };
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

  // the numbers for the admin's overview page: accounts, requests, visits, money, Shifo_AI, the last 14 days
  async admin_stats(b, me) {
    requireAdmin(me);
    const rows = async (sql) => (await q(sql)).rows;
    const [users, cons, ctype, appts, money, rv, ai, push, spec, region, d1, d2, d3, recent] = await Promise.all([
      rows("select role, count(*)::int as n, count(*) filter (where created_at > now() - interval '7 days')::int as week, count(*) filter (where verified_at is not null)::int as verified, count(*) filter (where tg is not null and tg <> '')::int as tg from app_users group by role"),
      rows("select status, count(*)::int as n from app_consults group by status"),
      rows("select type, count(*)::int as n from app_consults group by type"),
      rows("select status, count(*)::int as n from app_appts group by status"),
      rows("select count(*) filter (where pay_status = 'paid')::int as n, coalesce(sum(price) filter (where pay_status = 'paid'), 0)::bigint as paid, coalesce(sum(fee) filter (where pay_status = 'paid'), 0)::bigint as fee from app_consults"),
      rows("select count(*)::int as n, coalesce(round(avg(stars)::numeric, 1), 0)::float as avg from app_reviews where not hidden"),
      rows("select coalesce(sum(n), 0)::int as n, coalesce(sum(n) filter (where day > current_date - 7), 0)::int as week from app_ai_use"),
      rows("select count(*)::int as n from app_push"),
      rows("select spec, count(*)::int as n from app_consults where spec is not null and spec <> '' group by spec order by 2 desc limit 6"),
      rows("select region, count(*)::int as n from app_consults where region is not null and region <> '' group by region order by 2 desc limit 6"),
      rows("select created_at::date::text as day, count(*)::int as n from app_users where created_at > current_date - 13 group by 1"),
      rows("select created_at::date::text as day, count(*)::int as n from app_consults where created_at > current_date - 13 group by 1"),
      rows("select created_at::date::text as day, count(*)::int as n from app_appts where created_at > current_date - 13 group by 1"),
      rows("select id, role, name, created_at from app_users order by created_at desc limit 12")
    ]);
    const days = [];
    const by = (list) => Object.fromEntries(list.map((r) => [r.day, r.n]));
    const u = by(d1), c = by(d2), a = by(d3);
    for (let i = 13; i >= 0; i--) {
      const day = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      days.push({ day, users: u[day] || 0, consults: c[day] || 0, appts: a[day] || 0 });
    }
    return { users, consults: cons, types: ctype, appts, money: money[0], reviews: rv[0], ai: ai[0], push: push[0].n, spec, region, days, recent };
  },

  // removes an account for good, with everything that belongs to it (requests, chats, visits, reviews). Not an admin's.
  async admin_delete_user(b, me) {
    requireAdmin(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    if (b.id === me.id) bad("self");
    const u = (await q("select id, email, phone from app_users where id = $1", [b.id])).rows[0];
    if (!u) throw new Fail(404, "not_found");
    if (isAdmin(u)) bad("admin");
    await q("delete from app_users where id = $1", [b.id]);
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
