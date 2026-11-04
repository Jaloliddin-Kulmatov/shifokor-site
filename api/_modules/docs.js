// Licence and diploma documents a doctor or clinic uploads for the checking team: a photo (JPEG, PNG, WebP) or a PDF,
// checked by its first bytes. Only the owner and admins can open them; nothing here is shown on the public site.
const { q } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str } = require("../_core/validate");
const { need, isAdmin } = require("../_core/auth");
const { Role, requireRole } = require("../_core/roles");

const KINDS = ["licence", "diploma", "certificate", "clinic_licence", "other"];
const MAX_DOCS = 8, MAX_BYTES = 1600000;
function fileOf(b) {
  const raw = typeof b.data === "string" && b.data.length <= 2200000 ? b.data.replace(/^data:[^,]*,/, "") : bad("file");
  const data = Buffer.from(raw, "base64");
  if (data.length < 100 || data.length > MAX_BYTES) bad("file");
  const mime = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff ? "image/jpeg"
    : data.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? "image/png"
    : data.slice(0, 4).toString("latin1") === "RIFF" && data.slice(8, 12).toString("latin1") === "WEBP" ? "image/webp"
    : data.slice(0, 5).toString("latin1") === "%PDF-" ? "application/pdf" : bad("file");
  return { mime, data };
}
const meta = "id, user_id, kind, name, mime, octet_length(data) as size, created_at";

const actions = {
  // { kind, name, data: base64 } → { id }
  async doc_upload(b, me) {
    requireRole(me, Role.Doctor, Role.Clinic);
    const kind = KINDS.includes(b.kind) ? b.kind : bad("kind");
    const f = fileOf(b);
    if (Number((await q("select count(*) from app_docs where user_id = $1", [me.id])).rows[0].count) >= MAX_DOCS) throw new Fail(429, "limit");
    const r = await q("insert into app_docs (user_id, kind, name, mime, data) values ($1, $2, $3, $4, $5) returning id", [me.id, kind, str(b.name, 120) || null, f.mime, f.data]);
    return { id: r.rows[0].id };
  },
  async doc_delete(b, me) {
    need(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    if (!(await q("delete from app_docs where id = $1 and user_id = $2 returning id", [b.id, me.id])).rows[0]) throw new Fail(404, "not_found");
    return { ok: true };
  },
  // the owner's list; an admin may ask for anyone's: { user }
  async docs(b, me) {
    need(me);
    const who = b.user && isAdmin(me) ? b.user : me.id;
    if (!UUID.test(String(who))) bad("user");
    return { docs: (await q("select " + meta + " from app_docs where user_id = $1 order by created_at", [who])).rows };
  },
  // one file, for its owner or an admin
  async doc_file(b, me) {
    need(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const d = (await q("select user_id, mime, data from app_docs where id = $1", [b.id])).rows[0];
    if (!d) throw new Fail(404, "not_found");
    if (d.user_id !== me.id && !isAdmin(me)) throw new Fail(403, "forbidden");
    return { mime: d.mime, data: d.data.toString("base64") };
  }
};

// for the admin's check list: every doctor's and clinic's documents, without the files
async function allMeta() { return (await q("select " + meta + " from app_docs order by created_at")).rows; }

module.exports = { actions, allMeta, KINDS };
