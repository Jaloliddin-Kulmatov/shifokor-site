// Worker: a small job queue in the database (after SuperFlow's Hangfire jobs). A job has a kind, a time to run and a
// payload; `tick` runs the ones that are due. It runs from the daily job, from /api/v1/jobs/tick (an outside scheduler
// can call it every few minutes), and opportunistically on API requests, at most once a minute per server instance.
// A job being run is leased for 5 minutes, so a crash leaves it to be tried again; after 5 tries it stays failed.
const { q } = require("../_core/db");

const KINDS = {};
function register(kind, fn) { KINDS[kind] = fn; }

// one pending job per (kind, ref): scheduling again replaces the earlier time
async function schedule(kind, runAt, payload, ref) {
  if (ref) await q("delete from app_jobs where kind = $1 and ref = $2 and done_at is null", [kind, String(ref)]);
  await q("insert into app_jobs (kind, run_at, payload, ref) values ($1, $2, $3::jsonb, $4)", [kind, new Date(runAt).toISOString(), JSON.stringify(payload || {}), ref ? String(ref) : null]);
}
async function cancel(kind, ref) { await q("delete from app_jobs where kind = $1 and ref = $2 and done_at is null", [kind, String(ref)]); }

async function tick(limit) {
  const due = (await q("update app_jobs set tries = tries + 1, run_at = now() + interval '5 minutes' where id in (select id from app_jobs where done_at is null and run_at <= now() and tries < 5 order by run_at limit $1 for update skip locked) returning id, kind, payload", [limit || 50])).rows;
  let ok = 0;
  for (const j of due) {
    try {
      if (!KINDS[j.kind]) throw new Error("unknown kind " + j.kind);
      await KINDS[j.kind](j.payload || {});
      await q("update app_jobs set done_at = now(), last_error = null where id = $1", [j.id]);
      ok++;
    } catch (e) {
      await q("update app_jobs set last_error = $2 where id = $1", [j.id, String((e && e.message) || e).slice(0, 300)]).catch(() => {});
      console.error("job", j.kind, e && e.message);
    }
  }
  return ok;
}
let lastTick = 0;
async function maybeTick() {
  if (Date.now() - lastTick < 60e3) return;
  lastTick = Date.now();
  try { await tick(20); } catch (e) { console.error("tick", e && e.message); }
}

module.exports = { register, schedule, cancel, tick, maybeTick };
