// Sign-in, codes and email/phone confirmation, against a fake database (test/stub-db.js). Run: npm test
process.env.RESEND_API_KEY = "test";   // email "sends" go to the fake fetch below
const test = require("node:test");
const assert = require("node:assert/strict");
const db = require("./stub-db");
const { hashPw, pwOk, sha } = require("../api/_core/auth");
const T = require("../api/_core/throttle");
const site = require("../api/_core/site");
const users = require("../api/_modules/users").actions;

let mails = [];
global.fetch = async (url, o) => { mails.push(JSON.parse(o.body)); return { ok: true, status: 200, text: async () => "" }; };
site.fromRequest({ headers: { host: "shifokor.test" } });
const fails = async (p, code) => { await assert.rejects(p, (e) => e.code === code); };

test("password rule: 8+ characters, not common, not one repeated character", () => {
  assert.equal(pwOk("short12"), false);
  assert.equal(pwOk("12345678"), false);
  assert.equal(pwOk("Password"), false);
  assert.equal(pwOk("aaaaaaaaaa"), false);
  assert.equal(pwOk("x".repeat(201)), false);
  assert.equal(pwOk(12345678), false);
  assert.equal(pwOk("tog'-yo'li 7"), true);
});

test("sign-in keys: phone written any way, email in any case", () => {
  assert.equal(T.idKey("+998 90 123-45-67"), "id:998901234567");
  assert.equal(T.idKey("901234567"), "id:998901234567");
  assert.equal(T.idKey(" Ali@Mail.UZ "), "id:ali@mail.uz");
  assert.deepEqual(T.keysOf("901234567", "1.2.3.4"), ["id:998901234567", "ip:1.2.3.4"]);
  assert.equal(T.ipOf({ headers: { "x-forwarded-for": "5.6.7.8, 10.0.0.1" } }), "5.6.7.8");
});

test("login: a wrong password counts a failure for the account and the address", async () => {
  const stored = hashPw("right-password");
  db.on((sql) => (/from app_users where phone/.test(sql) ? [{ id: "u1", pw_hash: stored }] : []));
  await fails(users.login({ id: "901234567", password: "wrong-password", _ip: "1.2.3.4" }), "login");
  assert.ok(db.ran(/insert into app_throttle/));
  assert.ok(!db.ran(/insert into app_sessions/));
});

test("login: a locked account is refused before the password is checked", async () => {
  db.on((sql) => (/from app_throttle where k = any/.test(sql) ? [{ "?column?": 1 }] : []));
  await fails(users.login({ id: "901234567", password: "right-password", _ip: "1.2.3.4" }), "locked");
  assert.ok(!db.ran(/from app_users/));
});

test("login: the right password signs in and clears the account's count", async () => {
  const stored = hashPw("right-password");
  db.on((sql) => (/from app_users where email/.test(sql) ? [{ id: "u1", pw_hash: stored }] : []));
  const r = await users.login({ id: "ALI@mail.uz", password: "right-password", _ip: "1.2.3.4" });
  assert.match(r.token, /^[A-Za-z0-9_-]{40,}$/);
  assert.ok(db.ran(/delete from app_throttle/));
});

test("signup refuses a weak password", async () => {
  db.on(() => []);
  await fails(users.signup({ role: "patient", name: "Ali", email: "ali@mail.uz", password: "123456" }), "password");
  await fails(users.signup({ role: "patient", name: "Ali", email: "ali@mail.uz", password: "12345678" }), "password");
});

test("email confirmation: the code email carries a one-tap link that confirms", async () => {
  let row = null;
  db.on((sql, p) => {
    if (/insert into app_email_codes/.test(sql)) { row = { user_id: p[0], email: p[1], link_hash: p[3], expires_at: new Date(Date.now() + 60e3) }; return; }
    if (/where link_hash = \$1/.test(sql)) return row && row.link_hash === p[0] ? [row] : [];
    if (/update app_users set email_verified_at/.test(sql)) return p[1] === "a@b.uz" ? [{ id: p[0] }] : [];
  });
  mails = [];
  await users.email_code({}, { id: "u1", email: "a@b.uz" });
  const link = /#\/confirm\/([A-Za-z0-9_-]+)/.exec(mails[0].html);
  assert.ok(link, "the email has the confirm button");
  await fails(users.email_link({ token: "z".repeat(32) }), "expired");
  await fails(users.email_link({ token: "<script>" }), "expired");
  assert.deepEqual(await users.email_link({ token: link[1] }), { verified: true });
});

test("the password-reset email has no confirm link", async () => {
  db.on((sql) => (/from app_users where email/.test(sql) ? [{ id: "u1", email: "a@b.uz", phone: null, tg_chat: null }] : []));
  mails = [];
  await users.pw_forgot({ id: "a@b.uz" });
  assert.ok(!/confirm/.test(mails[0].html));
});

test("code sign-in: a code by email, then signed in; the email counts as confirmed", async () => {
  let saved = null;
  db.on((sql, p) => {
    if (/from app_users where email/.test(sql)) return [{ id: "u1", email: "a@b.uz", phone: null, tg_chat: null }];
    if (/insert into app_login_codes/.test(sql)) { saved = { channel: p[2], dest: p[3], code_hash: p[4], expires_at: new Date(Date.now() + 60e3), tries: 0 }; return; }
    if (/update app_login_codes set tries/.test(sql)) { saved.tries++; return [saved]; }
  });
  mails = [];
  assert.deepEqual(await users.code_send({ id: "a@b.uz", _ip: "1.1.1.1" }), { sent: "email" });
  const code = /(\d{6})/.exec(mails[0].text)[1];
  assert.equal(saved.code_hash, sha("u1:" + code));
  await fails(users.code_login({ id: "a@b.uz", code: code === "000000" ? "111111" : "000000", _ip: "1.1.1.1" }), "code");
  const r = await users.code_login({ id: "a@b.uz", code, _ip: "1.1.1.1" });
  assert.ok(r.token);
  assert.ok(db.ran(/update app_users set email_verified_at/));
});

test("code sign-in: an unknown account gets the same empty answer", async () => {
  db.on(() => []);
  assert.deepEqual(await users.code_send({ id: "nobody@b.uz", _ip: "1.1.1.1" }), { sent: "" });
});

test("code sign-in: an imported doctor must use the invite link first", async () => {
  db.on((sql) => (/from app_users where phone/.test(sql) ? [{ id: "u1", phone: "998901234567", imported_at: new Date(), claimed_at: null }] : []));
  await fails(users.code_send({ id: "901234567" }), "invited");
});

test("phone by Telegram: only the account's own number confirms it", async () => {
  const me = { id: "u1", phone: "998901234567" };
  const login = (phone) => db.on((sql) => (/from app_tg_logins/.test(sql) ? [{ id: "l1", confirmed_at: new Date(), phone }] : []));
  login(null); await fails(users.tg_phone({ code: "c".repeat(24) }, me), "phone_none");
  login("998907777777"); await fails(users.tg_phone({ code: "c".repeat(24) }, me), "phone_other");
  login("998901234567"); assert.deepEqual(await users.tg_phone({ code: "c".repeat(24) }, me), { status: "ok" });
  assert.ok(db.ran(/set phone_verified_at = now\(\)/));
});

test("changing the phone or email in the profile clears its confirmation", async () => {
  db.on(() => []);
  await users.save_profile({ name: "Ali", email: "a@b.uz", phone: "998901234567", profile: {} }, { id: "u1", role: "patient", name: "Ali", profile: {} });
  const upd = db.sql.find((s) => /update app_users set name/.test(s));
  assert.match(upd, /phone_verified_at = case when phone is distinct from \$4 then null/);
  assert.match(upd, /email_verified_at = case when email is distinct from \$3 then null/);
});
