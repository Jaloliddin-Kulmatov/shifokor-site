// Reading a consultation and writing the short system notes in its chat (shared by consultations, calls, follow-ups).
const { q } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str } = require("../_core/validate");

async function consultFor(me, id) {
  if (!UUID.test(String(id || ""))) bad("id");
  const r = await q("select * from app_consults where id = $1", [id]);
  if (!r.rows[0]) throw new Fail(404, "not_found");
  return r.rows[0];
}
async function sysNote(consultId, note) {
  const body = str(note, 300);
  if (body) await q("insert into app_messages (consult_id, kind, body) values ($1, 's', $2)", [consultId, body]);
}

module.exports = { consultFor, sysNote };
