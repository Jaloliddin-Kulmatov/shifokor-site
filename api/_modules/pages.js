// Pages with their own address, for Google and for link previews in Telegram (which don't run the page's script):
//   /shifokor/<id>  a doctor     /klinika/<id>  a clinic     /sitemap.xml  every doctor's and clinic's page
// The page is the site's own index.html with this doctor's or clinic's title, description, preview image and
// structured data put in its <head>; the script then shows the profile as usual.
const { q } = require("../_core/db");
const site = require("../_core/site");

const SPEC = { gp: "Oila shifokori", therapist: "Terapevt", pediatrics: "Pediatr", gyn: "Ginekolog", cardio: "Kardiolog", neuro: "Nevrolog", surgery: "Jarroh", dental: "Stomatolog", ent: "LOR shifokori", eye: "Ko‘z shifokori", derm: "Dermatolog", uro: "Urolog", endo: "Endokrinolog", psych: "Psixolog" };
const REGION = { UZ03: "Andijon", UZ06: "Buxoro", UZ08: "Jizzax", UZ30: "Farg‘ona", UZ10: "Qashqadaryo", UZ33: "Xorazm", UZ14: "Namangan", UZ12: "Navoiy", UZ35: "Qoraqalpog‘iston", UZ18: "Samarqand", UZ22: "Surxondaryo", UZ24: "Sirdaryo", UZ27: "Toshkent viloyati", UZ26: "Toshkent" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clip = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

// the site's index.html, fetched from this deployment and kept for five minutes
let shell = null, shellAt = 0;
async function indexHtml() {
  if (shell && Date.now() - shellAt < 300e3) return shell;
  const r = await fetch(site.url() + "/index.html", { headers: { "x-shifokor-page": "1" } });
  if (!r.ok) throw new Error("index " + r.status);
  shell = await r.text(); shellAt = Date.now();
  return shell;
}

function withHead(html, m) {
  const head = '<base href="/">\n' +
    "<title>" + esc(m.title) + "</title>\n" +
    '<meta name="description" content="' + esc(m.desc) + '">\n' +
    '<link rel="canonical" href="' + esc(m.url) + '">\n' +
    '<meta property="og:type" content="profile">\n<meta property="og:title" content="' + esc(m.title) + '">\n<meta property="og:description" content="' + esc(m.desc) + '">\n' +
    '<meta property="og:url" content="' + esc(m.url) + '">\n<meta property="og:image" content="' + esc(m.image) + '">\n<meta name="twitter:card" content="summary_large_image">\n' +
    '<script type="application/ld+json">' + JSON.stringify(m.ld).replace(/</g, "\\u003c") + "</script>\n";
  return html
    .replace(/<title>[\s\S]*?<\/title>\n?/, "")
    .replace(/<meta name="description"[^>]*>\n?/, "")
    .replace(/<meta property="og:[a-z]+"[^>]*>\n?/g, "")
    .replace(/<meta name="viewport"[^>]*>\n?/, (v) => v + head);
}

async function profilePage(res, kind, id) {
  const base = site.url();
  let html;
  try { html = await indexHtml(); } catch (e) { console.error("page shell", e.message); res.statusCode = 302; res.setHeader("Location", "/"); return res.end(); }
  const u = UUID.test(String(id || "")) ? (await q("select id, role, name, profile, photo_at from app_users where id = $1 and role = $2 and (imported_at is null or claimed_at is not null)", [id, kind])).rows[0] : null;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  if (!u) { res.statusCode = 200; return res.end(html.replace(/<meta name="viewport"[^>]*>\n?/, (v) => v + '<base href="/">\n')); }
  const p = u.profile || {}, place = REGION[p.region] || "";
  const r = (await q("select count(*)::int as n, coalesce(avg(stars), 0)::float as avg from app_reviews where target_id = $1 and not hidden", [u.id])).rows[0] || { n: 0, avg: 0 };
  const path = (kind === "doctor" ? "/shifokor/" : "/klinika/") + u.id;
  let m;
  if (kind === "doctor") {
    const spec = p.spec === "other" ? p.spec_other || "Shifokor" : SPEC[p.spec] || "Shifokor";
    const bits = [spec, p.years ? p.years + " yillik tajriba" : "", place, r.n ? "★ " + r.avg.toFixed(1) + " (" + r.n + " sharh)" : ""].filter(Boolean).join(" · ");
    m = { title: u.name + " — " + spec + (place ? ", " + place : "") + " | Shifokor", desc: clip(bits + ". " + (p.bio || "Onlayn maslahat: chat, audio va video qo‘ng‘iroq. Narx oldindan ma’lum."), 200),
      image: u.photo_at ? base + "/api/app?photo=" + u.id + "&v=" + new Date(u.photo_at).getTime() : base + "/img/doctor-video-call-1200.jpg",
      ld: Object.assign({ "@context": "https://schema.org", "@type": "Physician", name: u.name, medicalSpecialty: spec, url: base + path, address: place ? { "@type": "PostalAddress", addressRegion: place, addressCountry: "UZ" } : undefined },
        r.n ? { aggregateRating: { "@type": "AggregateRating", ratingValue: r.avg.toFixed(1), reviewCount: r.n } } : {}) };
  } else {
    m = { title: u.name + (place ? " — " + place : "") + " | Shifokor", desc: clip([place, p.addr, p.hours, r.n ? "★ " + r.avg.toFixed(1) + " (" + r.n + " sharh)" : ""].filter(Boolean).join(" · ") + ". " + (p.about || "Qabulga onlayn yoziling."), 200),
      image: base + "/img/doctor-desk-1200.jpg",
      ld: Object.assign({ "@context": "https://schema.org", "@type": "MedicalClinic", name: u.name, url: base + path, address: { "@type": "PostalAddress", streetAddress: p.addr || undefined, addressRegion: place || undefined, addressCountry: "UZ" }, openingHours: p.hours || undefined },
        r.n ? { aggregateRating: { "@type": "AggregateRating", ratingValue: r.avg.toFixed(1), reviewCount: r.n } } : {}) };
  }
  m.url = base + path;
  res.statusCode = 200;
  return res.end(withHead(html, m));
}

async function sitemap(res) {
  const base = site.url();
  const rows = (await q("select id, role, updated_at from app_users where role in ('doctor', 'clinic') and (imported_at is null or claimed_at is not null) order by updated_at desc limit 45000")).rows;
  const urls = ['<url><loc>' + base + "/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>"].concat(rows.map((u) =>
    "<url><loc>" + base + (u.role === "doctor" ? "/shifokor/" : "/klinika/") + u.id + "</loc><lastmod>" + new Date(u.updated_at).toISOString().slice(0, 10) + "</lastmod></url>"));
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
  return res.end('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join("\n") + "\n</urlset>\n");
}

module.exports = { profilePage, sitemap };
