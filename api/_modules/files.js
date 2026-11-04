// Photos and voice messages in a consultation: checked by their first bytes, stored in app_files, shown only to its patient and doctor.
const crypto = require("crypto");
const { q, migrate } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf, emailOf, tgOf, profileOf, today, dayOf } = require("../_core/validate");
const { sha, hashPw, checkPw, newSession, need, listEnv, isAdmin } = require("../_core/auth");
const { Role, requireRole, requireAdmin } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;
const N = require("./notify");
const { consultFor } = require("./consult-repo");

// A photo arrives as { data: base64 }. The type comes from the file's first bytes, not from what the browser says.
const MAX_PHOTOS = 20;   // per consultation
function photoOf(p) {
  const raw = p && typeof p.data === "string" && p.data.length <= 2200000 ? p.data.replace(/^data:[^,]*,/, "") : bad("photo");
  const data = Buffer.from(raw, "base64");
  if (data.length < 100 || data.length > 1600000) bad("photo");
  const mime = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff ? "image/jpeg"
    : data.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? "image/png"
    : data.slice(0, 4).toString("latin1") === "RIFF" && data.slice(8, 12).toString("latin1") === "WEBP" ? "image/webp" : bad("photo");
  return { mime, data };
}
// A voice message arrives as { data: base64 }, up to about two minutes. The type comes from the file's first bytes.
const MAX_VOICE = 30;   // per consultation
function audioOf(a) {
  const raw = a && typeof a.data === "string" && a.data.length <= 2200000 ? a.data.replace(/^data:[^,]*,/, "") : bad("audio");
  const data = Buffer.from(raw, "base64");
  if (data.length < 100 || data.length > 1600000) bad("audio");
  const mime = data.slice(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) ? "audio/webm"
    : data.slice(0, 4).toString("latin1") === "OggS" ? "audio/ogg"
    : data.slice(4, 8).toString("latin1") === "ftyp" ? "audio/mp4" : bad("audio");
  return { mime, data };
}

const actions = {
  // one photo from a consultation, for its patient, its doctor, or a doctor who may still accept it
  async file(b, me) {
    need(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const r = await q("select f.mime, f.data, c.patient_id, c.doctor_id, c.status, c.doc from app_files f join app_consults c on c.id = f.consult_id where f.id = $1", [b.id]);
    const f = r.rows[0];
    if (!f) throw new Fail(404, "not_found");
    const open = me.role === "doctor" && f.status === "new" && (!f.doc || f.doc === me.id);
    if (f.patient_id !== me.id && f.doctor_id !== me.id && !open) throw new Fail(403, "forbidden");
    return { mime: f.mime, data: f.data.toString("base64") };
  }
};

module.exports = { actions, photoOf, audioOf, MAX_PHOTOS, MAX_VOICE };
