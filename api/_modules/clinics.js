// Clinics with branches and staff (after SuperFlow's tenants, branches and specialists).
// A clinic keeps its branches (name, region, address, phone, hours) and invites doctors by phone; the doctor accepts
// or declines in their panel, and can leave later. The clinic's calendar shows its doctors' booked times for the week,
// with the doctor and branch but no patient details.
const { q } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { UUID, str, opt, phoneOf } = require("../_core/validate");
const { need } = require("../_core/auth");
const { Role, requireRole } = require("../_core/roles");
const site = require("../_core/site");
const { notifyUser } = site;

const MAX_BRANCHES = 50, MAX_STAFF = 200;
const regionOf = (v) => (v == null || v === "" ? null : /^UZ\d\d$/.test(String(v)) ? String(v) : bad("region"));
async function ownBranch(clinicId, id) {
  if (id == null || id === "") return null;
  if (!UUID.test(String(id))) bad("branch");
  if (!(await q("select 1 from app_branches where id = $1 and clinic_id = $2", [id, clinicId])).rows[0]) bad("branch");
  return id;
}

const actions = {
  // add or change a branch: { id?, name, region, address, phone, hours }
  async branch_save(b, me) {
    requireRole(me, Role.Clinic);
    const name = str(b.name, 120) || bad("name");
    const phone = b.phone ? phoneOf(b.phone) : null;
    const v = [name, regionOf(b.region), opt(b.address, 300), phone, opt(b.hours, 120)];
    if (b.id) {
      if (!UUID.test(String(b.id))) bad("id");
      const r = await q("update app_branches set name = $3, region = $4, address = $5, phone = $6, hours = $7, updated_at = now() where id = $1 and clinic_id = $2 returning id", [b.id, me.id].concat(v));
      if (!r.rows[0]) throw new Fail(404, "not_found");
      return { id: b.id };
    }
    if (Number((await q("select count(*) from app_branches where clinic_id = $1", [me.id])).rows[0].count) >= MAX_BRANCHES) throw new Fail(429, "limit");
    const r = await q("insert into app_branches (clinic_id, name, region, address, phone, hours) values ($1, $2, $3, $4, $5, $6) returning id", [me.id].concat(v));
    return { id: r.rows[0].id };
  },
  async branch_delete(b, me) {
    requireRole(me, Role.Clinic);
    if (!UUID.test(String(b.id || ""))) bad("id");
    if (!(await q("delete from app_branches where id = $1 and clinic_id = $2 returning id", [b.id, me.id])).rows[0]) throw new Fail(404, "not_found");
    return { ok: true };
  },
  // invite a doctor by phone, optionally to a branch: { phone, branch }
  async staff_invite(b, me) {
    requireRole(me, Role.Clinic);
    const phone = phoneOf(b.phone) || bad("phone");
    const branch = await ownBranch(me.id, b.branch);
    if (Number((await q("select count(*) from app_staff where clinic_id = $1", [me.id])).rows[0].count) >= MAX_STAFF) throw new Fail(429, "limit");
    const doc = (await q("select id, role from app_users where phone = $1", [phone])).rows[0];
    if (doc && doc.role !== "doctor") throw new Fail(409, "not_doctor");
    if (doc && doc.id === me.id) bad("phone");
    let r;
    try { r = await q("insert into app_staff (clinic_id, doctor_id, phone, branch_id) values ($1, $2, $3, $4) returning id", [me.id, doc ? doc.id : null, phone, branch]); }
    catch (e) { if (e.code === "23505") throw new Fail(409, "exists"); throw e; }
    if (doc) await notifyUser(doc.id, "Shifokor: " + me.name + " sizni o‘z shifokorlari qatoriga taklif qildi. Qabul qilish yoki rad etish: " + site.url() + "/#/account");
    return { id: r.rows[0].id, found: !!doc };
  },
  // the doctor answers an invitation: { id, accept: true | false }
  async staff_answer(b, me) {
    requireRole(me, Role.Doctor);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const row = (await q("select s.id, s.clinic_id from app_staff s where s.id = $1 and s.status = 'invited' and (s.doctor_id = $2 or (s.doctor_id is null and s.phone = $3))", [b.id, me.id, me.phone || ""])).rows[0];
    if (!row) throw new Fail(404, "not_found");
    if (b.accept === true) await q("update app_staff set status = 'active', doctor_id = $2, answered_at = now() where id = $1", [row.id, me.id]);
    else await q("delete from app_staff where id = $1", [row.id]);
    await notifyUser(row.clinic_id, "Shifokor: " + me.name + (b.accept === true ? " taklifingizni qabul qildi." : " taklifingizni rad etdi."));
    return { ok: true };
  },
  // the clinic removes a doctor or an invitation, or the doctor leaves the clinic: { id }
  async staff_remove(b, me) {
    need(me);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const r = await q("delete from app_staff where id = $1 and (clinic_id = $2 or doctor_id = $2) returning clinic_id, doctor_id", [b.id, me.id]);
    if (!r.rows[0]) throw new Fail(404, "not_found");
    if (r.rows[0].doctor_id === me.id) await notifyUser(r.rows[0].clinic_id, "Shifokor: " + me.name + " klinikangiz shifokorlari ro‘yxatidan chiqdi.");
    return { ok: true };
  },
  // move a doctor to another branch (or none): { id, branch }
  async staff_branch(b, me) {
    requireRole(me, Role.Clinic);
    if (!UUID.test(String(b.id || ""))) bad("id");
    const branch = await ownBranch(me.id, b.branch);
    if (!(await q("update app_staff set branch_id = $3 where id = $1 and clinic_id = $2 returning id", [b.id, me.id, branch])).rows[0]) throw new Fail(404, "not_found");
    return { ok: true };
  },
  // the clinic's week: its doctors' booked online consultations, without patient details
  async clinic_calendar(b, me) {
    requireRole(me, Role.Clinic);
    const r = await q("select c.id, c.slot_at, c.status, c.type, s.doctor_id, d.name as doctor_name, s.branch_id from app_consults c join app_staff s on s.doctor_id = coalesce(c.doctor_id, c.doc) and s.clinic_id = $1 and s.status = 'active' join app_users d on d.id = s.doctor_id where c.slot_at > now() - interval '1 day' and c.slot_at < now() + interval '8 days' and c.status in ('new', 'accepted') order by c.slot_at", [me.id]);
    return { slots: r.rows.map((x) => ({ id: x.id, at: new Date(x.slot_at).getTime(), status: x.status, type: x.type, doctor_id: x.doctor_id, doctor_name: x.doctor_name, branch_id: x.branch_id })) };
  }
};

// for the page data: every clinic's branches and working doctors are public; a clinic also sees its invitations,
// a doctor sees the invitations waiting for them
async function sync(me) {
  const branches = (await q("select id, clinic_id, name, region, address, phone, hours from app_branches order by created_at")).rows;
  const staff = (await q("select id, clinic_id, doctor_id, branch_id from app_staff where status = 'active'")).rows;
  let mine = [], invites = [];
  if (me && me.role === "clinic") mine = (await q("select s.id, s.doctor_id, s.phone, s.branch_id, s.status, u.name as doctor_name from app_staff s left join app_users u on u.id = s.doctor_id where s.clinic_id = $1 order by s.created_at", [me.id])).rows;
  if (me && me.role === "doctor") invites = (await q("select s.id, s.clinic_id, s.branch_id, c.name as clinic_name, b.name as branch_name from app_staff s join app_users c on c.id = s.clinic_id left join app_branches b on b.id = s.branch_id where s.status = 'invited' and (s.doctor_id = $1 or (s.doctor_id is null and s.phone = $2))", [me.id, me.phone || ""])).rows;
  return { branches, staff, mine, invites };
}

module.exports = { actions, sync };
