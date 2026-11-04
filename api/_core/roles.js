// Roles and who may do what, in one place (after SuperFlow's roles.ts). Admin is not a role of its own:
// an admin is a patient, doctor or clinic account named in ADMIN_EMAILS / ADMIN_PHONES.
const { Fail } = require("./errors");
const { need, isAdmin } = require("./auth");

const Role = Object.freeze({ Patient: "patient", Doctor: "doctor", Clinic: "clinic" });
const ROLES = Object.values(Role);

// throws 401 when signed out and 403 when the account has another role
function requireRole(me, ...roles) {
  need(me);
  if (!roles.includes(me.role)) throw new Fail(403, "forbidden");
  return me;
}
function requireAdmin(me) {
  if (!isAdmin(need(me))) throw new Fail(403, "forbidden");
  return me;
}

// the policies, by name, for the site and for new endpoints
const can = {
  acceptConsultations: (me) => !!me && me.role === Role.Doctor,
  writeMedicines: (me) => !!me && me.role === Role.Doctor,
  answerVisitRequests: (me) => !!me && me.role === Role.Clinic,
  bookVisits: (me) => !!me && me.role !== Role.Clinic,
  replyToReviews: (me) => !!me && (me.role === Role.Doctor || me.role === Role.Clinic),
  admin: (me) => isAdmin(me)
};

module.exports = { Role, ROLES, requireRole, requireAdmin, can };
