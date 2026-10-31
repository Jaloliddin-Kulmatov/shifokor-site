// Medicines after a consultation, and home delivery.
// The doctor of the consultation writes what to take (app_consults.rx). The patient can ask for those medicines to be
// delivered (app_med_orders). A partner pharmacy arranged by the Shifokor team calls the patient with the price and
// time, and the patient pays on delivery: Shifokor takes no money for medicines. Admins move each request along:
// new → confirmed → on_way → delivered, or cancelled, and the patient gets a Telegram message at each step.

const STEPS = ["new", "confirmed", "on_way", "delivered", "cancelled"];
const STEP_UZ = { confirmed: "dorixona tasdiqladi, tez orada qo‘ng‘iroq qilinadi", on_way: "yo‘lda", delivered: "yetkazildi", cancelled: "bekor qilindi" };

module.exports = function ({ q, notifyUser, site, Fail, bad, need, UUID, str, isAdmin, phoneOf }) {
  // [{ name, how, days }]: up to 15 medicines, each with a name; how to take it and for how many days are optional
  function rxOf(v) {
    if (!Array.isArray(v) || v.length > 15) bad("rx");
    return v.map((m) => {
      const name = str(m && m.name, 120), days = m && m.days !== "" && m.days != null ? Math.round(Number(m.days)) : null;
      if (!name) bad("rx");
      if (days != null && !(days >= 1 && days <= 365)) bad("rx");
      return { name, how: str(m.how, 200), days };
    });
  }
  const regionOf = (v) => (/^UZ\d\d$/.test(String(v || "")) ? String(v) : bad("region"));

  const actions = {
    // the doctor of an accepted or finished consultation writes the medicine list: { id, rx: [{ name, how, days }] }
    async consult_rx(b, me) {
      need(me);
      if (me.role !== "doctor") throw new Fail(403, "forbidden");
      if (!UUID.test(String(b.id || ""))) bad("id");
      const rx = rxOf(b.rx);
      const r = await q("update app_consults set rx = $1::jsonb, rx_at = now() where id = $2 and doctor_id = $3 and status in ('accepted', 'done') returning n, patient_id", [JSON.stringify(rx), b.id, me.id]);
      if (!r.rows[0]) throw new Fail(409, "closed");
      if (rx.length && r.rows[0].patient_id) await notifyUser(r.rows[0].patient_id, "Shifokor: shifokor " + me.name + " №" + r.rows[0].n + " maslahat uchun dorilar ro‘yxatini yozdi. Ularni uyga yetkazib berishni so‘rashingiz mumkin: " + site() + "/#/consult/" + b.id);
      return { ok: true };
    },
    // the patient asks for delivery of the doctor's list: { id, region, address, phone, note }
    async med_order(b, me) {
      need(me);
      if (!UUID.test(String(b.id || ""))) bad("id");
      const c = (await q("select id, n, patient_id, rx from app_consults where id = $1", [b.id])).rows[0];
      if (!c) throw new Fail(404, "not_found");
      if (c.patient_id !== me.id) throw new Fail(403, "forbidden");
      if (!Array.isArray(c.rx) || !c.rx.length) throw new Fail(409, "no_rx");
      const address = str(b.address, 300);
      if (address.length < 5) bad("address");
      const phone = phoneOf(b.phone) || bad("phone");
      if ((await q("select 1 from app_med_orders where consult_id = $1 and status in ('new', 'confirmed', 'on_way')", [c.id])).rows[0]) throw new Fail(409, "open");
      const r = await q("insert into app_med_orders (consult_id, patient_id, patient_name, rx, region, address, phone, note) values ($1, $2, $3, $4::jsonb, $5, $6, $7, $8) returning id",
        [c.id, me.id, me.name, JSON.stringify(c.rx), regionOf(b.region), address, phone, str(b.note, 300) || null]);
      return { ok: true, id: r.rows[0].id };
    },
    // the patient changes their mind before the pharmacy confirms: { id }
    async med_order_cancel(b, me) {
      need(me);
      if (!UUID.test(String(b.id || ""))) bad("id");
      const r = await q("update app_med_orders set status = 'cancelled', updated_at = now() where id = $1 and patient_id = $2 and status = 'new' returning id", [b.id, me.id]);
      if (!r.rows[0]) throw new Fail(409, "closed");
      return { ok: true };
    },
    async admin_med_orders(b, me) {
      if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
      const orders = (await q("select o.id, o.consult_id, c.n, c.doctor_name, o.patient_name, o.rx, o.region, o.address, o.phone, o.note, o.status, o.created_at, o.updated_at from app_med_orders o join app_consults c on c.id = o.consult_id order by o.created_at desc limit 300")).rows;
      return { orders };
    },
    // { id, status: confirmed | on_way | delivered | cancelled }
    async admin_med_status(b, me) {
      if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
      if (!UUID.test(String(b.id || ""))) bad("id");
      const st = STEPS.includes(b.status) && b.status !== "new" ? b.status : bad("status");
      const r = await q("update app_med_orders set status = $2, updated_at = now() where id = $1 and status not in ('delivered', 'cancelled') returning patient_id, consult_id", [b.id, st]);
      if (!r.rows[0]) throw new Fail(409, "closed");
      if (r.rows[0].patient_id) await notifyUser(r.rows[0].patient_id, "Shifokor: dorilar buyurtmangiz — " + STEP_UZ[st] + ". " + site() + "/#/consult/" + r.rows[0].consult_id);
      return { ok: true };
    }
  };

  // the patient's own delivery requests, for their consultation pages
  async function sync(me) {
    return (await q("select id, consult_id, status, region, address, phone, note, created_at, updated_at from app_med_orders where patient_id = $1 order by created_at desc limit 50", [me.id])).rows;
  }
  return { actions, sync };
};
