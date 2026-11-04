// Audio and video calls: who may call, the relay servers, and the short set-up messages between two browsers.
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");
const { consultFor, sysNote } = require("./consult-repo");

// Only the patient and the doctor of an accepted consultation can call; a finished one is closed.
async function callPeer(b, me) {
  need(me);
  const c = await consultFor(me, b.id);
  if (c.patient_id !== me.id && c.doctor_id !== me.id) throw new Fail(403, "forbidden");
  if (c.status !== "accepted") throw new Fail(409, "closed");
  if (c.pay_status === "due") throw new Fail(409, "unpaid");
  return c;
}
// Where the browsers find each other. STUN is enough on most networks; behind strict mobile or office networks
// the call needs a TURN relay, set in the server's environment (both optional):
//   TURN_URLS        comma-separated, e.g. "turn:turn.example.uz:3478,turns:turn.example.uz:5349"
//   TURN_SECRET      coturn's static-auth-secret: each user gets a password that expires in 12 hours
//   or TURN_USERNAME + TURN_CREDENTIAL   a fixed login, for a hosted TURN service
function iceServers(userId) {
  const list = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
  const urls = listEnv("TURN_URLS").filter((u) => /^turns?:/.test(u));
  const secret = (process.env.TURN_SECRET || "").trim();
  if (urls.length && secret) {
    const username = Math.floor(Date.now() / 1000 + 12 * 3600) + ":" + userId;
    list.push({ urls, username, credential: crypto.createHmac("sha1", secret).update(username).digest("base64") });
  } else if (urls.length && (process.env.TURN_USERNAME || "").trim()) {
    list.push({ urls, username: process.env.TURN_USERNAME.trim(), credential: (process.env.TURN_CREDENTIAL || "").trim() });
  }
  return list;
}

const actions = {
  async call(b, me) {
    need(me);
    const c = await consultFor(me, b.id);
    // either side of an accepted consultation can start a call; the other gets a Telegram notice and a ringing banner
    const by = c.doctor_id === me.id ? "d" : c.patient_id === me.id ? "p" : null;
    if (!by || c.status !== "accepted") throw new Fail(403, "forbidden");
    if (c.pay_status === "due") throw new Fail(409, "unpaid");
    // pressing "call" again within two minutes rings the same call, so Telegram gets one notice
    const fresh = !c.call_at || Date.now() - new Date(c.call_at).getTime() > 120e3;
    await q("update app_consults set call = true, call_at = now(), call_by = case when $2::boolean then $3 else coalesce(call_by, $3) end where id = $1", [c.id, fresh, by]);
    if (fresh) {
      await sysNote(c.id, b.note);
      const media = c.type === "video" ? "video" : "audio";
      if (by === "d") await notifyUser(c.patient_id, "Shifokor: shifokor " + me.name + " sizga " + media + " qo‘ng‘iroq qilmoqda (ariza №" + c.n + "). Qo‘shiling: " + site.url() + "/#/consult/" + c.id);
      else if (c.doctor_id) await notifyUser(c.doctor_id, "Shifokor: bemor " + c.name + " sizga " + media + " qo‘ng‘iroq qilmoqda (ariza №" + c.n + "). Qo‘shiling: " + site.url() + "/#/consult/" + c.id);
    }
    return { ok: true };
  },

  // ---------- calls: set-up messages between the patient and the doctor of an accepted consultation ----------
  async signal(b, me) {
    const c = await callPeer(b, me);
    const kind = ["hello", "offer", "answer", "bye"].includes(b.kind) ? b.kind : bad("kind");
    const body = b.body == null ? "" : typeof b.body === "string" && b.body.length <= 20000 ? b.body : bad("body");
    await q("delete from app_signals where consult_id = $1 and created_at < now() - interval '10 minutes'", [c.id]);
    if (Number((await q("select count(*) from app_signals where consult_id = $1 and sender = $2 and created_at > now() - interval '1 minute'", [c.id, me.id])).rows[0].count) >= 40) throw new Fail(429, "slow");
    const r = await q("insert into app_signals (consult_id, sender, kind, body) values ($1, $2, $3, $4) returning id", [c.id, me.id, kind, body]);
    return { id: Number(r.rows[0].id) };
  },

  // the other side's messages after `after`; with after = -1 only the starting point and the relay servers
  async signals(b, me) {
    const c = await callPeer(b, me);
    const after = Math.round(Number(b.after));
    if (after < 0 || !isFinite(after)) {
      const last = (await q("select coalesce(max(id), 0) as id from app_signals where consult_id = $1", [c.id])).rows[0].id;
      return { last: Number(last), ice: iceServers(me.id) };
    }
    const r = await q("select id, kind, body from app_signals where consult_id = $1 and sender <> $2 and id > $3 and created_at > now() - interval '10 minutes' order by id limit 20", [c.id, me.id, after]);
    return { signals: r.rows.map((s) => ({ id: Number(s.id), kind: s.kind, body: s.body })) };
  }
};

module.exports = { actions, callPeer, iceServers };
