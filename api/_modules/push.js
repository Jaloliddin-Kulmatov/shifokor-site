// Phone notifications (Web Push): the browser, or the Android app (Chrome inside), gives us a push address; we send a
// short encrypted notice to it whenever the user gets a notice anyway (a doctor replied, a call, a visit confirmed).
// Standard Web Push (RFC 8291 aes128gcm payload, RFC 8292 VAPID), done with Node's crypto, no extra packages.
// Off until VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are set (base64url P-256 keys).
const crypto = require("crypto");
const { q } = require("../_core/db");
const { bad } = require("../_core/errors");

const PUB = (process.env.VAPID_PUBLIC_KEY || "").trim();
const PRIV = (process.env.VAPID_PRIVATE_KEY || "").trim();
const SUBJECT = (process.env.VAPID_SUBJECT || "mailto:admin@shifokor.com").trim();
const ON = !!(PUB && PRIV);

const b64u = (b) => Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64");
// only the browsers' own push services: we never POST to an address someone made up
const HOSTS = /^(fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.push\.apple\.com|[a-z0-9.-]+\.notify\.windows\.com)$/;

let key = null;
function signingKey() {
  if (key) return key;
  const pub = unb64u(PUB);
  key = crypto.createPrivateKey({ key: { kty: "EC", crv: "P-256", d: b64u(unb64u(PRIV)), x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)) }, format: "jwk" });
  return key;
}
// VAPID: a short ES256 token for the push service's origin
function vapid(endpoint) {
  const aud = new URL(endpoint).origin;
  const head = b64u(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const body = b64u(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: SUBJECT }));
  const sig = crypto.sign("sha256", Buffer.from(head + "." + body), { key: signingKey(), dsaEncoding: "ieee-p1363" });
  return "vapid t=" + head + "." + body + "." + b64u(sig) + ", k=" + PUB;
}
// RFC 8291: encrypt the notice for this browser's keys
function encrypt(p256dh, auth, plain) {
  const ua = unb64u(p256dh), secret = unb64u(auth);
  const ecdh = crypto.createECDH("prime256v1"); ecdh.generateKeys();
  const as = ecdh.getPublicKey(), shared = ecdh.computeSecret(ua);
  const ikm = Buffer.from(crypto.hkdfSync("sha256", shared, secret, Buffer.concat([Buffer.from("WebPush: info\0"), ua, as]), 32));
  const salt = crypto.randomBytes(16);
  const cek = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\0"), 16));
  const nonce = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\0"), 12));
  const c = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const ct = Buffer.concat([c.update(Buffer.concat([Buffer.from(plain), Buffer.from([2])])), c.final(), c.getAuthTag()]);
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([as.length]), as, ct]);
}

// a notice to every phone or browser this user turned notifications on in; dead addresses are forgotten
async function pushUser(userId, note) {
  if (!ON || !userId) return false;
  const subs = (await q("select endpoint, p256dh, auth from app_push where user_id = $1 limit 10", [userId])).rows;
  if (!subs.length) return false;
  const body = JSON.stringify({ title: note.title || "Shifokor", body: String(note.body || "").slice(0, 300), url: note.url || "/#/account" });
  let ok = false;
  await Promise.all(subs.map(async (s) => {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 4000);
    try {
      const r = await fetch(s.endpoint, { method: "POST", signal: ctl.signal, headers: { Authorization: vapid(s.endpoint), TTL: "86400", Urgency: "high", "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream" }, body: encrypt(s.p256dh, s.auth, body) });
      if (r.status === 404 || r.status === 410) await q("delete from app_push where endpoint = $1", [s.endpoint]);
      else if (r.ok) ok = true;
      else console.error("push", r.status);
    } catch (e) { console.error("push", e.name); } finally { clearTimeout(timer); }
  }));
  return ok;
}

const actions = {
  async push_key() { return { key: ON ? PUB : "" }; },
  async push_sub(b, me) {
    if (!me) bad("auth");
    const s = b.sub || {}, k = s.keys || {};
    let u; try { u = new URL(String(s.endpoint || "")); } catch (e) { bad("endpoint"); }
    if (u.protocol !== "https:" || !HOSTS.test(u.hostname) || String(s.endpoint).length > 1000) bad("endpoint");
    if (!/^[A-Za-z0-9_-]{80,100}$/.test(String(k.p256dh || "")) || !/^[A-Za-z0-9_-]{16,30}$/.test(String(k.auth || ""))) bad("keys");
    await q("insert into app_push (user_id, endpoint, p256dh, auth) values ($1, $2, $3, $4) on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, created_at = now()", [me.id, s.endpoint, k.p256dh, k.auth]);
    return { ok: true };
  },
  async push_unsub(b, me) {
    if (!me) bad("auth");
    await q("delete from app_push where user_id = $1 and endpoint = $2", [me.id, String(b.endpoint || "")]);
    return { ok: true };
  }
};

module.exports = { actions, pushUser, ON };
