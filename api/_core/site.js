// This deployment's address (for links in notices) and Telegram notices to a user who linked their chat.
const { q } = require("./db");
const N = require("../_modules/notify");

let SITE = "";
const url = () => SITE;
// set from each request: the address the visitor used
function fromRequest(req) { SITE = "https://" + String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim(); }
const notifyUser = async (id, text) => { const r = (await q("select tg_chat from app_users where id = $1", [id])).rows[0]; return !!(r && r.tg_chat) && N.tgSend(r.tg_chat, text); };

module.exports = { url, fromRequest, notifyUser };
