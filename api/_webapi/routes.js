// REST API v1 (after SuperFlow's /api/v1 controllers): resource URLs over the same use cases as the action API.
// GET reads come from the same data the site loads; writes call the same actions, so the rules are identical.
// Errors use RFC 7807 problem details: { type, title: <code>, status }.
// Each route: [method, path with :params, action, (params, body, query) => action input, (result) => response]
const ROUTES = [
  ["POST", "/auth/signup", "signup", (p, b) => b],
  ["POST", "/auth/login", "login", (p, b) => b],
  ["POST", "/auth/logout", "logout", () => ({})],
  ["GET", "/me", "sync", () => ({}), (r) => ({ me: r.me })],
  ["GET", "/doctors", "sync", () => ({}), (r) => ({ doctors: r.users.filter((u) => u.role === "doctor") })],
  ["GET", "/clinics", "sync", () => ({}), (r) => ({ clinics: r.users.filter((u) => u.role === "clinic") })],
  ["GET", "/doctors/:id/slots", "slots", (p) => ({ doc: p.id })],
  ["GET", "/consultations", "sync", () => ({}), (r) => ({ consultations: r.consults })],
  ["POST", "/consultations", "create_consult", (p, b) => ({ c: b, notes: b.notes })],
  ["POST", "/consultations/:id/accept", "accept", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/consultations/:id/finish", "finish", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/consultations/:id/refer", "refer", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/consultations/:id/cancel", "cancel_consult", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/consultations/:id/reschedule", "reschedule", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/consultations/:id/messages", "message", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/consultations/:id/call", "call", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/consultations/:id/followup", "followup", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/consultations/:id/pay-link", "pay_link", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/consultations/:id/medicines", "consult_rx", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/consultations/:id/medicine-orders", "med_order", (p, b) => Object.assign({}, b, { id: p.id })],
  ["GET", "/appointments", "sync", () => ({}), (r) => ({ appointments: r.appts })],
  ["POST", "/appointments", "create_appt", (p, b) => ({ a: b })],
  ["POST", "/appointments/:id/confirm", "appt_confirm", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/appointments/:id/decline", "appt_decline", (p, b) => Object.assign({}, b, { id: p.id })],
  ["POST", "/appointments/:id/cancel", "appt_cancel", (p, b) => Object.assign({}, b, { id: p.id })],
  ["GET", "/reviews", "sync", () => ({}), (r) => ({ reviews: r.reviews })],
  ["POST", "/reviews", "review_create", (p, b) => b],
  ["POST", "/reviews/:id/reply", "review_reply", (p, b) => Object.assign({}, b, { id: p.id })],
  ["PUT", "/me/profile", "save_profile", (p, b) => b],
  ["POST", "/me/online", "set_online", (p, b) => b],
  ["POST", "/me/email/code", "email_code", () => ({})],
  ["POST", "/me/email/verify", "email_verify", (p, b) => b],
  ["GET", "/branches", "sync", () => ({}), (r) => ({ branches: r.clinics.branches })],
  ["POST", "/branches", "branch_save", (p, b) => Object.assign({}, b, { id: undefined })],
  ["PUT", "/branches/:id", "branch_save", (p, b) => Object.assign({}, b, { id: p.id })],
  ["DELETE", "/branches/:id", "branch_delete", (p) => ({ id: p.id })],
  ["GET", "/staff", "sync", () => ({}), (r) => ({ staff: r.clinics.mine, invites: r.clinics.invites })],
  ["POST", "/staff", "staff_invite", (p, b) => b],
  ["POST", "/staff/:id/answer", "staff_answer", (p, b) => Object.assign({}, b, { id: p.id })],
  ["PUT", "/staff/:id/branch", "staff_branch", (p, b) => Object.assign({}, b, { id: p.id })],
  ["DELETE", "/staff/:id", "staff_remove", (p) => ({ id: p.id })],
  ["GET", "/clinic/calendar", "clinic_calendar", () => ({})],
  ["GET", "/admin/users", "admin_list", () => ({})],
  ["POST", "/admin/users/:id/verify", "admin_verify", (p, b) => Object.assign({}, b, { id: p.id })],
  ["GET", "/admin/payouts", "admin_payouts", () => ({})],
  ["POST", "/admin/payouts", "admin_payout", (p, b) => b],
  ["GET", "/admin/medicine-orders", "admin_med_orders", () => ({})]
];

// "/consultations/abc/accept" → { route, params: { id: "abc" } }
function match(method, path) {
  const parts = path.replace(/\/+$/, "").split("/").filter(Boolean);
  for (const r of ROUTES) {
    if (r[0] !== method) continue;
    const want = r[1].split("/").filter(Boolean);
    if (want.length !== parts.length) continue;
    const params = {};
    if (want.every((w, i) => (w[0] === ":" ? ((params[w.slice(1)] = decodeURIComponent(parts[i])), true) : w === parts[i]))) return { route: r, params };
  }
  return null;
}

module.exports = { ROUTES, match };
