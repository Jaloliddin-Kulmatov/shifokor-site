// Partnership requests from the "Hamkorlik" page (#/partners): clinics, doctors, pharmacies, laboratories, insurers,
// employers and others who want to work with Shifokor. Each request is kept for the admins (shown on the admin's
// overview) and sent at once to every admin who linked Telegram, and by email when email is set up.
const crypto = require("crypto");
const { q } = require("../_core/db");
const { Fail, bad } = require("../_core/errors");
const { str, opt, emailOf } = require("../_core/validate");
const { listEnv } = require("../_core/auth");
const N = require("./notify");

const KINDS = ["clinic", "doctor", "pharmacy", "lab", "insurance", "employer", "gov", "other"];
const KIND_UZ = { clinic: "Klinika", doctor: "Shifokor", pharmacy: "Dorixona", lab: "Laboratoriya", insurance: "Sug‘urta", employer: "Ish beruvchi", gov: "Davlat / NNT", other: "Boshqa" };

async function tellAdmins(text) {
  const emails = listEnv("ADMIN_EMAILS"), phones = listEnv("ADMIN_PHONES").map((x) => x.replace(/\D/g, ""));
  if (!emails.length && !phones.length) return;
  const r = await q("select tg_chat from app_users where tg_chat is not null and (lower(email) = any($1::text[]) or phone = any($2::text[]))", [emails, phones]);
  await Promise.all(r.rows.map((x) => N.tgSend(x.tg_chat, text)));
  if (N.MAIL) await Promise.all(emails.map((e) => N.mail(e, "Shifokor: yangi hamkorlik so‘rovi", text)));
}

const actions = {
  async partner_lead(b) {
    const kind = KINDS.includes(b.kind) ? b.kind : bad("kind");
    const name = str(b.name, 120) || bad("name");
    const org = opt(b.org, 160);
    const phone = String(b.phone || "").replace(/[^\d+]/g, "").slice(0, 20);
    let email = null; try { email = b.email ? emailOf(b.email) : null; } catch (e) { bad("email"); }
    if (!email && phone.replace(/\D/g, "").length < 7) bad("contact");
    const city = opt(b.city, 80);
    const note = opt(b.note, 1000);
    // a few per hour from one address, so the form can't be used to flood the admins
    const ipHash = crypto.createHash("sha256").update("lead:" + String(b._ip || "")).digest("hex").slice(0, 32);
    if (Number((await q("select count(*) from app_leads where ip_hash = $1 and created_at > now() - interval '1 hour'", [ipHash])).rows[0].count) >= 5) throw new Fail(429, "wait");
    await q("insert into app_leads (kind, name, org, phone, email, city, note, ip_hash) values ($1, $2, $3, $4, $5, $6, $7, $8)", [kind, name, org, phone || null, email, city, note, ipHash]);
    await tellAdmins("🤝 Yangi hamkorlik so‘rovi\n\n" + KIND_UZ[kind] + (org ? ": " + org : "") + "\n👤 " + name + (phone ? "\n📞 " + phone : "") + (email ? "\n✉️ " + email : "") + (city ? "\n📍 " + city : "") + (note ? "\n\n" + note : "")).catch((e) => console.error("lead notify", e.message));
    return { ok: true };
  }
};

module.exports = { actions, KINDS };
