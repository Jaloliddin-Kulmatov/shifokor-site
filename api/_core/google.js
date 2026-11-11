// "Sign in with Google": the browser gets a signed ID token from Google and sends it here. The server checks
// Google's signature with Google's published keys, that the token is for this site (GOOGLE_CLIENT_ID) and still
// fresh, so a token can't be made up or taken from another site. Off until GOOGLE_CLIENT_ID is set.
//   GOOGLE_CLIENT_ID   the OAuth "Web application" client ID (…apps.googleusercontent.com); comma-separated for several
const crypto = require("crypto");
const { Fail } = require("./errors");

const ids = () => (process.env.GOOGLE_CLIENT_ID || "").split(",").map((x) => x.trim()).filter(Boolean);
const ISSUERS = ["accounts.google.com", "https://accounts.google.com"];

// Google's signing keys change every few days; they're kept for 6 hours, and fetched again for a key we don't know
let keys = null, keysAt = 0;
async function googleKeys(fresh) {
  if (!keys || fresh || Date.now() - keysAt > 6 * 3600e3) {
    const r = await fetch("https://www.googleapis.com/oauth2/v3/certs", { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error("google certs " + r.status);
    keys = (await r.json()).keys || [];
    keysAt = Date.now();
  }
  return keys;
}
const part = (s) => Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64");

// the token's claims (sub, email, email_verified, name, hd, …), or Fail 401 "google"
async function verifyGoogle(token) {
  const aud = ids();
  if (!aud.length) throw new Fail(503, "no_google");
  const t = typeof token === "string" ? token : "";
  const p = t.split(".");
  if (p.length !== 3 || t.length > 4096) throw new Fail(401, "google");
  let head, claims;
  try { head = JSON.parse(part(p[0]).toString("utf8")); claims = JSON.parse(part(p[1]).toString("utf8")); } catch (e) { throw new Fail(401, "google"); }
  if (head.alg !== "RS256" || !head.kid) throw new Fail(401, "google");
  let key = (await googleKeys(false)).find((k) => k.kid === head.kid);
  if (!key) key = (await googleKeys(true)).find((k) => k.kid === head.kid);
  if (!key) throw new Fail(401, "google");
  const signed = crypto.verify("RSA-SHA256", Buffer.from(p[0] + "." + p[1]), crypto.createPublicKey({ key, format: "jwk" }), part(p[2]));
  const now = Date.now() / 1000;
  if (!signed || !ISSUERS.includes(claims.iss) || !aud.includes(claims.aud) || !(claims.exp > now) || (claims.iat && claims.iat > now + 300) || !claims.sub) throw new Fail(401, "google");
  return claims;
}
// Google vouches for Gmail addresses and for its Workspace domains (hd): only those may sign in to an existing
// account that has the same email. Other addresses must sign in with their password first and link Google there.
const trustedEmail = (c) => (c.email_verified === true || c.email_verified === "true") && (/@(gmail|googlemail)\.com$/i.test(String(c.email || "")) || !!c.hd);
const verifiedEmail = (c) => (c.email_verified === true || c.email_verified === "true") && !!c.email;

module.exports = { googleOn: () => ids().length > 0, verifyGoogle, trustedEmail, verifiedEmail };
