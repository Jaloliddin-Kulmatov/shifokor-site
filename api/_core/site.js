// This deployment's address (for links in notices) and Telegram notices to a user who linked their chat.
const { q } = require("./db");
const N = require("../_modules/notify");

let SITE = "";
const url = () => SITE;
// set from each request: the address the visitor used
function fromRequest(req) { SITE = "https://" + String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim(); }
// A notice to one user: Telegram when they linked it (with an "Ochish" button when o.link is given); otherwise, when
// o.mail (the subject) is given, an email to the account's address. False when nothing could be sent.
async function notifyUser(id, text, o) {
  o = o || {};
  const r = (await q("select tg_chat, email from app_users where id = $1", [id])).rows[0];
  if (!r) return false;
  // phones and browsers with notifications on get it too (never blocks the rest)
  try { await require("../_modules/push").pushUser(id, { title: "Shifokor", body: String(text).replace(/^Shifokor:\s*/, ""), url: o.link ? String(o.link).replace(/^https?:\/\/[^/]+/, "") || "/#/account" : "/#/account" }); } catch (e) { console.error("push", e && e.message); }
  const tgText = o.tgText || text;
  if (r.tg_chat && (await N.tgSend(r.tg_chat, tgText, o.kb ? { reply_markup: { inline_keyboard: o.kb } } : o.link ? { reply_markup: { inline_keyboard: [[{ text: o.button || "Ochish", url: o.link }]] } } : null))) return true;
  if (o.mail && r.email && N.MAIL) return N.mail(r.email, o.mail, text + (o.link && text.indexOf(o.link) < 0 ? "\n\n" + o.link : "") + "\n\nShifokor · shifokor.com");
  return false;
}

module.exports = { url, fromRequest, notifyUser };
