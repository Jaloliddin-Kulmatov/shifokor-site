// Jobs about booked times: an hour before a booked consultation, Telegram reminds the patient and the doctor.
const { q } = require("../_core/db");
const site = require("../_core/site");
const { notifyUser } = site;
const jobs = require("./jobs");
const { slotUz } = require("../_modules/slots");

const HOUR = 3600e3;
jobs.register("slot_soon", async ({ id, at }) => {
  const c = (await q("select id, n, status, slot_at, patient_id, coalesce(doctor_id, doc) as doctor_id from app_consults where id = $1", [id])).rows[0];
  // moved, cancelled or finished since it was scheduled: nothing to say
  if (!c || !c.slot_at || new Date(c.slot_at).getTime() !== Number(at) || (c.status !== "new" && c.status !== "accepted")) return;
  const when = slotUz(c.slot_at);
  await notifyUser(c.patient_id, "Shifokor: 1 soatdan keyin onlayn maslahat — " + when + " (ariza №" + c.n + "). " + site.url() + "/#/consult/" + c.id);
  if (c.doctor_id) await notifyUser(c.doctor_id, "Shifokor: 1 soatdan keyin onlayn maslahat — " + when + " (ariza №" + c.n + "). " + site.url() + "/#/consult/" + c.id);
});

// called when a time is booked or moved; a time less than an hour away gets no reminder
async function remindBefore(consultId, slotIso) {
  const at = new Date(slotIso).getTime();
  if (at - HOUR > Date.now()) await jobs.schedule("slot_soon", at - HOUR, { id: consultId, at }, consultId);
  else await jobs.cancel("slot_soon", consultId);
}
const forget = (consultId) => jobs.cancel("slot_soon", consultId);

module.exports = { remindBefore, forget };
