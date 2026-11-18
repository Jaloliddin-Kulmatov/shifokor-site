// Too many failed tries: counted per key ("id:<email or phone>", "ip:<address>") in app_throttle. A key that fails
// `max` times within 15 minutes is locked for 15 minutes; a success clears the account's count.
const { q } = require("./db");
const { Fail } = require("./errors");

const WINDOW = "15 minutes";
// the caller's address, set by the router (never taken from the request body)
const ipOf = (req) => String((req && req.headers && (req.headers["x-real-ip"] || req.headers["x-forwarded-for"])) || "").split(",")[0].trim().slice(0, 64);
// sign-in keys for an identifier the person typed: the same normalisation as the account lookup
function idKey(id) {
  const s = String(id || "").trim().toLowerCase();
  if (s.includes("@")) return "id:" + s;
  let d = s.replace(/\D/g, "");
  if (d.length === 9) d = "998" + d;
  return d ? "id:" + d : "";
}
const keysOf = (id, ip) => [idKey(id), ip ? "ip:" + ip : ""].filter(Boolean);

// Fail 429 "locked" when any key is locked now
async function check(keys) {
  if (!keys.length) return;
  const r = await q("select 1 from app_throttle where k = any($1) and locked_until > now() limit 1", [keys]);
  if (r.rows[0]) throw new Fail(429, "locked");
}
// one failure for each key; limits: { id: 5, ip: 30 } by the key's prefix
async function fail(keys, limits) {
  for (const k of keys) {
    const max = (limits || {})[k.slice(0, k.indexOf(":"))] || 5;
    await q(`insert into app_throttle (k, n, first_at) values ($1, 1, now())
      on conflict (k) do update set
        n = case when app_throttle.first_at < now() - interval '${WINDOW}' then 1 else app_throttle.n + 1 end,
        first_at = case when app_throttle.first_at < now() - interval '${WINDOW}' then now() else app_throttle.first_at end`, [k]);
    await q(`update app_throttle set locked_until = now() + interval '${WINDOW}', n = 0, first_at = now() where k = $1 and n >= $2`, [k, max]);
  }
  if (Math.random() < 0.05) await q("delete from app_throttle where first_at < now() - interval '1 day' and (locked_until is null or locked_until < now())");
}
async function clear(keys) { if (keys.length) await q("delete from app_throttle where k = any($1)", [keys]); }

module.exports = { ipOf, idKey, keysOf, check, fail, clear };
