// Is an email address worth sending to? Checked when someone signs up or changes their email:
//   - the domain must receive mail: it has MX records that aren't the "null MX" (RFC 7505) → else Fail 400 "email_domain"
//   - it isn't a throwaway inbox (mailinator and the like) → else Fail 400 "email_temp"
// This catches typos (gmial.com) and made-up domains (asd@asd.qwe). It can't tell whether the mailbox itself exists:
// only the confirmation code proves that. A DNS problem on our side never blocks anyone.
const dns = require("dns").promises;
const { Fail } = require("./errors");

const TEMP = new Set(("mailinator.com mailinator.net guerrillamail.com guerrillamail.net guerrillamail.org guerrillamailblock.com sharklasers.com grr.la "
  + "10minutemail.com 10minutemail.net 20minutemail.com temp-mail.org temp-mail.io tempmail.com tempmail.net tempmailo.com tempr.email tempail.com "
  + "yopmail.com yopmail.net yopmail.fr trashmail.com trashmail.net trashmail.de getnada.com nada.email dispostable.com maildrop.cc fakeinbox.com "
  + "throwawaymail.com mintemail.com mohmal.com emailondeck.com discard.email mailnesia.com spamgourmet.com moakt.com mailcatch.com mytemp.email "
  + "burnermail.io inboxkitten.com 33mail.com mailpoof.com tmpmail.org tmpmail.net emailfake.com fakemail.net mail.tm tmail.ws spambox.us").split(" "));

const cache = new Map();   // domain → { ok, code, at }, for an hour
const within = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error("timeout"), { code: "ETIMEOUT" })), ms))]);

async function domainTakesMail(domain) {
  try {
    const mx = await within(dns.resolveMx(domain), 3000);
    return mx.some((r) => r && r.exchange && r.exchange !== ".");
  } catch (e) {
    if (e.code === "ENOTFOUND" || e.code === "ENODATA" || e.code === "ENONAME" || e.code === "NXDOMAIN") return false;
    return true;   // timeout or a DNS failure here: let them through, the confirmation code still checks
  }
}

// throws Fail 400 "email_domain" / "email_temp"; returns nothing when the address is fine (or empty)
async function checkEmail(email) {
  if (!email) return;
  const domain = String(email).split("@").pop().toLowerCase();
  if (TEMP.has(domain)) throw new Fail(400, "email_temp");
  const hit = cache.get(domain);
  let ok = hit && Date.now() - hit.at < 3600e3 ? hit.ok : null;
  if (ok === null) { ok = await domainTakesMail(domain); if (cache.size > 5000) cache.clear(); cache.set(domain, { ok, at: Date.now() }); }
  if (!ok) throw new Fail(400, "email_domain");
}

module.exports = { checkEmail, TEMP };
