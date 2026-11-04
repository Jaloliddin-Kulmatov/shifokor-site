// Shifokor server API (Vercel function): the entry point, like SuperFlow's WebApi project. It only routes; the work
// lives in layers under api/ (folders starting with "_" are not separate functions):
//   _core/     database and migration, errors, input checks, sessions, roles, the site address, HTTP helpers
//   _modules/  one module per area: users, consultations, booked times, files, calls, follow-ups, clinic visits,
//              reviews, payouts, admin, Telegram, payments (Payme, Click), "Onalar uchun", medicines, notices
//   _worker/   the job queue and its jobs (reminders an hour before a booked consultation)
//   _webapi/   the REST API v1 routes
// Two ways in, with the same rules behind them:
//   POST /api/app { action, ... }      the site's own calls (unchanged)
//   /api/v1/...                         REST, e.g. GET /api/v1/doctors, POST /api/v1/consultations/:id/accept
// Signed-in requests send "Authorization: Bearer <token>".
const { migrate, CONN } = require("./_core/db");
const { Fail, reasonOf } = require("./_core/errors");
const { whoAmI } = require("./_core/auth");
const { send, problem, bodyOf } = require("./_core/http");
const site = require("./_core/site");
const { P, O, M } = require("./_modules/services");
const users = require("./_modules/users");
const { sendSlotReminders } = require("./_modules/slots");
const { sendFollowups } = require("./_modules/followups");
const { telegramHook } = require("./_modules/telegram");
const jobs = require("./_worker/jobs");
require("./_worker/reminders");   // registers its jobs
const v1 = require("./_webapi/routes");

// every use case by name, from each module
const ACTIONS = Object.assign({},
  require("./_modules/sync").actions,
  users.actions,
  require("./_modules/consults").actions,
  require("./_modules/slots").actions,
  require("./_modules/files").actions,
  require("./_modules/calls").actions,
  require("./_modules/followups").actions,
  require("./_modules/appts").actions,
  require("./_modules/reviews").actions,
  require("./_modules/payouts").actions,
  require("./_modules/admin").actions,
  require("./_modules/clinics").actions,
  M.actions,   // medicine lists and home delivery requests
  O.actions    // "Onalar uchun": pregnancy profile, check-ins, family member
);

// a cron call is allowed when CRON_SECRET isn't set, or when it carries it
const cronOk = (req) => { const s = (process.env.CRON_SECRET || "").trim(); return !s || req.headers.authorization === "Bearer " + s; };

async function restApi(req, res, path) {
  const m = v1.match(req.method, path);
  if (path === "/jobs/tick" && (req.method === "POST" || req.method === "GET")) {
    if (!cronOk(req)) return problem(res, 401, "auth");
    try { await migrate(); return send(res, 200, { ok: true, ran: await jobs.tick(100) }); } catch (e) { console.error("tick", e && e.message); return problem(res, 500, "server"); }
  }
  if (!m) return problem(res, 404, "not_found");
  const [, , name, input, output] = m.route;
  const query = Object.fromEntries(new URL(req.url, "http://x").searchParams);
  try {
    await migrate();
    await jobs.maybeTick();
    const me = await whoAmI(req);
    const result = await ACTIONS[name](input(m.params, bodyOf(req) || {}, query), me);
    return send(res, name === "create_consult" || name === "create_appt" || name === "review_create" || name === "signup" ? 201 : 200, output ? output(result) : result);
  } catch (e) {
    if (e instanceof Fail) return problem(res, e.status, e.code);
    console.error("api v1 error", name, e && e.message);
    return problem(res, 500, "server");
  }
}

module.exports = async function handler(req, res) {
  const url = req.url || "";
  // REST: /api/v1/... reaches here through the rewrite in vercel.json (?v1=<path>)
  const rest = /[?&]v1=([^&]*)/.exec(url) || /^\/api\/v1(\/[^?]*)/.exec(url);
  if (rest) {
    if (!CONN) return problem(res, 503, "no_database");
    site.fromRequest(req);
    return restApi(req, res, "/" + decodeURIComponent(rest[1]).replace(/^\/+/, ""));
  }
  if (req.method === "GET") {
    const photo = /[?&]photo=([0-9a-f-]{36})\b/i.exec(url);
    if (photo && CONN) return users.doctorPhoto(res, photo[1]);
    // Vercel runs this once a day (vercel.json). It only sends what's due, so an extra call does no harm.
    if (/[?&]cron=daily\b/.test(url) && CONN) {
      if (!cronOk(req)) return send(res, 401, { error: "auth" });
      try { await migrate(); return send(res, 200, { ok: true, followups: await sendFollowups(), reminders: await sendSlotReminders(), ona: await O.daily(), jobs: await jobs.tick(200) }); }
      catch (e) { console.error("cron", e && e.message); return send(res, 500, { error: "server" }); }
    }
    if (!CONN) return send(res, 200, { ok: true, database: false });
    try { await migrate(); return send(res, 200, { ok: true, database: true, connected: true }); }
    catch (e) { console.error("db check", e && e.code, e && e.message); return send(res, 200, { ok: true, database: true, connected: false, reason: reasonOf(e) }); }
  }
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  if (!CONN) return send(res, 503, { error: "no_database" });
  site.fromRequest(req);
  if (/[?&]tg=hook\b/.test(url)) return telegramHook(req, res);
  // calls from Payme's and Click's servers; both expect HTTP 200 with their own error format
  const pay = /[?&]pay=(payme|click)\b/.exec(url);
  if (pay) {
    let pb = req.body;
    if (typeof pb === "string") { try { pb = pay[1] === "payme" ? JSON.parse(pb) : Object.fromEntries(new URLSearchParams(pb)); } catch (e) { pb = null; } }
    try { await migrate(); }
    catch (e) { return send(res, 200, pay[1] === "payme" ? { error: { code: -32400, message: { uz: "Tizim xatosi", ru: "Системная ошибка", en: "System error" } }, id: pb && pb.id != null ? pb.id : null } : { error: -7, error_note: "Failed to update user" }); }
    return send(res, 200, pay[1] === "payme" ? await P.payme(req, pb) : await P.click(pb));
  }
  const body = bodyOf(req);
  if (!body) return send(res, 400, { error: "invalid" });
  const action = Object.prototype.hasOwnProperty.call(ACTIONS, body.action) ? ACTIONS[body.action] : null;
  if (!action) return send(res, 400, { error: "action" });
  try {
    await migrate();
    await jobs.maybeTick();
    const me = await whoAmI(req);
    return send(res, 200, await action(body, me));
  } catch (e) {
    if (e instanceof Fail) return send(res, e.status, { error: e.code });
    console.error("api error", body.action, e && e.message);
    return send(res, 500, { error: "server" });
  }
};
