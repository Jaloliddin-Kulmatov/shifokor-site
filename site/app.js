(function () {
  /* Set this to the Telegram bot or account name (without @) once it exists. Join forms then open a prefilled message there. */
  var CONFIG = { telegram: "" };

  var $ = function (id) { return document.getElementById(id); };
  var all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var num = function (n) { var x = Number(n).toLocaleString("en-US"); return lang === "en" ? x : x.replace(/,/g, "\u00a0"); };   /* 50 000 in Uzbek and Russian */
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  /* ---------------- icons ---------------- */
  var ICONS = {
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    camera: '<path d="M4 8h3.5l2-3h5l2 3H20v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    hosp: '<rect x="4" y="7" width="16" height="14" rx="2"/><path d="M12 10v6M9 13h6M9 7V4h6v3"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
    siren: '<path d="M7 18v-5a5 5 0 0110 0v5M5 18h14M12 3v2M4.5 6.5l1.4 1.4M19.5 6.5l-1.4 1.4"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/>',
    nav: '<path d="M3 11l18-8-8 18-2-8z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5M8 7h7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    bell: '<path d="M6 17V11a6 6 0 0112 0v6l2 2H4z"/><path d="M10 21a2 2 0 004 0"/>',
    free: '<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
    chat: '<path d="M4 5h16v11H8l-4 4z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>',
    star: '<path d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5L12 16.6l-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/>'
  };
  var ic = function (n) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + "</svg>"; };

  /* ---------------- copy and state ---------------- */
  var T = window.SHIFOKOR_T;
  var lang = "en";
  try { var sl = localStorage.getItem("shifokor-lang"); lang = sl && T[sl] ? sl : "uz"; } catch (e) {}
  var L = function () { return T[lang]; };
  var unit = function () { return lang === "ru" ? "сум" : lang === "uz" ? "so‘m" : "soums"; };

  var S = { mode: "in" };                                   /* search form mode */
  var F = { cov: false, max: 0, lang: "", sort: "soon" };    /* result filters */
  var cal = {};                                             /* calendar paging per clinic */
  var modal = null;                                         /* open drawer */
  var cancelAsk = null;                                     /* visit awaiting cancel confirmation */
  var PREF = { size: "n", theme: "auto", map: "" };
  try { Object.assign(PREF, JSON.parse(localStorage.getItem("shifokor-prefs")) || {}); } catch (e) {}
  function applyPrefs() {
    var r = document.documentElement;
    r.classList.toggle("big-text", PREF.size === "l");
    if (PREF.theme === "auto") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", PREF.theme);
  }
  function savePrefs() { try { localStorage.setItem("shifokor-prefs", JSON.stringify(PREF)); } catch (e) {} applyPrefs(); }
  applyPrefs();
  var mapOn = PREF.map ? PREF.map === "on" : window.innerWidth > 760, pendingMap = null, mapInst = null, markers = {};
  var DS = { pid: "p1", day: 0 };                           /* clinic workspace */
  var AS = { step: 1, f: { sp: "dental" }, pick: null, done: null };   /* village assist */

  var K = { bookings: "shifokor-bookings", status: "shifokor-status", prices: "shifokor-prices", conf: "shifokor-conf", reports: "shifokor-reports" };
  var store = {
    get: function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var bookings = function () { return store.get(K.bookings, []); };
  var saveBookings = function (l) { store.set(K.bookings, l); };
  var BE = window.SB || null;   /* server connection from backend.js, or null in demo mode */
  function beMsg(t, x) { var c = (x && x.code) || ""; return { exists: t.e_exists, login: t.e_login, email: t.e_email, phone: t.e_phone, tg: t.e_tg, password: t.e_pw, name: t.e_name, contact: t.e_contact, date: t.e_ap_date, limit: t.e_ap_limit, dup: t.e_ap_dup, clinic: t.e_ap_clinic, time: t.e_ap_time, closed: t.e_ap_closed, doctor: t.e_ap_doc, unverified: t.e_ap_unv, no_tg: t.nt_off, forbidden: t.adm_forbidden, reviewed: t.e_reviewed, stars: t.e_stars, photos: t.e_photos, photo: t.ph_bad, slow: t.e_slow, unpaid: t.e_unpaid, paid: t.e_paid, invited: t.e_invited, invite: t.im_bad_link, advice: t.rf2_err, answered: t.e_answered, slot_taken: t.sl_taken, slot: t.sl_bad, voices: t.vo_many, audio: t.vo_bad, open: t.rx_open, address: t.rx_err_fill, region: t.rx_err_fill }[c] || t.be_err; }
  if (BE) ["en", "uz", "ru"].forEach(function (l) { T[l].acc_demo = T[l].be_online; T[l].cs_demo = T[l].be_online; });

  /* ---------------- sample directory ---------------- */
  var tm = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
  var tmShort = ["09:00", "09:40", "10:20", "11:00", "11:40", "14:00", "14:40", "15:20", "16:00", "16:40"];
  var evening = ["18:00", "18:30", "19:00", "19:30", "20:00"];
  var P = [
    { id: "p1", lat: 40.3855, lng: 71.7865, sp: "dental", ch: "A", area: "c", langs: ["uz", "ru"], conf: 2, times: tm, svc: [{ k: "dental_consult", p: 200000 }, { k: "dental_clean", p: 250000 }, { k: "dental_xray", p: 80000 }] },
    { id: "p2", lat: 40.4000, lng: 71.7810, sp: "dental", ch: "B", area: "n", langs: ["uz", "ru", "en"], conf: 5, times: tmShort, onTimes: evening, svc: [{ k: "dental_consult", p: 180000 }, { k: "dental_clean", p: 220000 }, { k: "dental_fu", p: 100000, o: 1 }] },
    { id: "p3", lat: 40.3830, lng: 71.7800, sp: "diag", ch: "C", area: "c", langs: ["uz", "ru"], conf: 1, times: tm, svc: [{ k: "us", p: 150000 }, { k: "blood", p: 120000 }, { k: "ecg", p: 90000 }] },
    { id: "p4", lat: 40.3690, lng: 71.7860, sp: "diag", ch: "D", area: "s", langs: ["uz", "ru"], conf: 12, times: tmShort, svc: [{ k: "us", p: 140000 }, { k: "blood", p: 110000 }, { k: "ecg", p: 85000 }] },
    { id: "p5", lat: 40.3875, lng: 71.7790, sp: "lab", ch: "E", area: "c", langs: ["uz", "ru"], conf: 3, times: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00"], svc: [{ k: "blood", p: 100000 }] },
    { id: "p6", lat: 40.3965, lng: 71.7925, sp: "ent", ch: "F", area: "n", langs: ["uz", "ru"], conf: 4, times: tmShort, onTimes: evening, svc: [{ k: "ent_consult", p: 160000 }, { k: "ent_online", p: 120000, o: 1 }] },
    { id: "p7", lat: 40.3860, lng: 71.8040, sp: "eye", ch: "G", area: "e", langs: ["uz", "ru", "en"], conf: 6, times: tm, svc: [{ k: "eye_exam", p: 130000 }] },
    { id: "p8", lat: 40.3820, lng: 71.7890, sp: "gp", ch: "H", area: "c", langs: ["uz", "ru", "en"], conf: 1, times: tm, onTimes: evening, svc: [{ k: "gp_consult", p: 0, c: 1 }, { k: "gp_online", p: 80000, o: 1 }] }
  ];
  var byId = function (id) { return P.filter(function (p) { return p.id === id; })[0]; };
  var pname = function (p) { return L().nm[p.sp] + " " + p.ch; };
  var hasOnline = function (p) { return p.svc.some(function (s) { return s.o; }); };
  var hasCov = function (p) { return p.svc.some(function (s) { return s.c; }); };
  var svcsFor = function (p, mode) { return p.svc.filter(function (s) { return mode === "on" ? !!s.o : !s.o; }); };
  var svcOf = function (p, k) { return p.svc.filter(function (s) { return s.k === k; })[0] || p.svc[0]; };
  function priceOf(p, s) { var o = store.get(K.prices, {}); return o[p.id] && o[p.id][s.k] != null ? o[p.id][s.k] : s.p; }
  var priceTxt = function (p, s) { return s.c ? L().free_t : num(priceOf(p, s)) + " " + unit(); };

  /* ---------------- dates and slots ---------------- */
  var HORIZON = 14;
  function today0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function dayAt(off) { var d = today0(); d.setDate(d.getDate() + off); return d; }
  function days() { var out = []; for (var i = 0; i < HORIZON; i++) out.push(dayAt(i)); return out; }
  var iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var fromIso = function (s) { return new Date(s + "T00:00:00"); };
  var at = function (d, t) { var x = new Date(d); x.setHours(+t.slice(0, 2), +t.slice(3)); return x; };
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  var UZ_WD = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"], UZ_MO = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];
  function fmt(d, o) {
    if (lang === "uz") {
      var parts = [];
      if (o.weekday) parts.push(UZ_WD[d.getDay()]);
      if (o.day && o.month) parts.push(d.getDate() + "-" + UZ_MO[d.getMonth()]); else if (o.month) parts.push(UZ_MO[d.getMonth()]); else if (o.day) parts.push(String(d.getDate()));
      if (o.year) parts.push(String(d.getFullYear()));
      return parts.join(", ");
    }
    try { return new Intl.DateTimeFormat(L().loc, o).format(d); } catch (e) { return new Intl.DateTimeFormat("en-GB", o).format(d); } }
  var whenTxt = function (d, t) { return fmt(d, { weekday: "short", day: "numeric", month: "short" }) + ", " + t; };
  function confOf(p) { var o = store.get(K.conf, {}); if (o[p.id]) return Math.max(0, Math.round((today0() - fromIso(o[p.id])) / 864e5)); return p.conf; }
  var confDate = function (p) { return fmt(dayAt(-confOf(p)), { day: "numeric", month: "short" }); };

  var sampleTaken = function (p, d, t, mode) { return hash(p.id + iso(d) + t + mode) % 100 < 38; };
  var stMap = function () { return store.get(K.status, {}); };
  function bookingStatus(b, map) { if (b.st === "cancelled") return "cancelled"; var o = (map || stMap())["b" + b.id]; return (o && o.st) || "booked"; }
  function slotList(p, mode, d) {
    if (d.getDay() === 0) return null;
    var times = mode === "on" ? (p.onTimes || []) : p.times, now = Date.now(), di = iso(d);
    var mine = bookings().filter(function (b) { return b.p === p.id && b.d === di && b.st !== "cancelled"; }).map(function (b) { return b.t; });
    return times.filter(function (t) { return at(d, t) - now > 3600e3 && !sampleTaken(p, d, t, mode) && mine.indexOf(t) < 0; });
  }
  var isFree = function (p, mode, di, t) { var s = slotList(p, mode, fromIso(di)); return !!s && s.indexOf(t) > -1; };
  function nextFree(p, mode) { var ds = days(); for (var i = 0; i < ds.length; i++) { var s = slotList(p, mode, ds[i]); if (s && s.length) return { d: ds[i], t: s[0] }; } return null; }

  /* ---------------- calendar ---------------- */
  function calHTML(p, mode, ctx) {
    var t = L(), st = cal[p.id] || (cal[p.id] = { off: 0, more: false }), n = 6, cap = st.more ? 99 : 4, extra = false;
    var cols = days().slice(st.off, st.off + n).map(function (d) {
      var s = slotList(p, mode, d), body;
      if (s === null) body = '<div class="dx">' + t.closed + "</div>";
      else if (!s.length) body = '<div class="dx">–</div>';
      else { if (s.length > cap) extra = true; body = s.slice(0, cap).map(function (x) { return '<button type="button" class="sb" data-ctx="' + (ctx || "page") + '" data-p="' + p.id + '" data-d="' + iso(d) + '" data-time="' + x + '" data-m="' + mode + '" aria-label="' + esc(whenTxt(d, x)) + '">' + x + "</button>"; }).join(""); }
      return '<div class="dcol"><div class="dh"><span>' + fmt(d, { weekday: "short" }) + "</span><b>" + d.getDate() + "</b></div>" + body + "</div>";
    }).join("");
    return '<div class="calw"><button type="button" class="calnav" data-p="' + p.id + '" data-dir="-1" aria-label="‹"' + (st.off <= 0 ? " disabled" : "") + '>‹</button><div class="cols" style="--n:' + n + '">' + cols + '</div><button type="button" class="calnav" data-p="' + p.id + '" data-dir="1" aria-label="›"' + (st.off >= HORIZON - n ? " disabled" : "") + '>›</button></div>' +
      (extra || st.more ? '<button type="button" class="calmore" data-p="' + p.id + '" data-act="more">' + (st.more ? t.fewer : t.more) + "</button>" : "");
  }

  /* ---------------- search ---------------- */
  function parseHash() {
    var deep = !location.hash && /^\/(shifokor|klinika)\/([A-Za-z0-9_-]+)\/?$/.exec(location.pathname);
    var h = deep ? (deep[1] === "shifokor" ? "/doc/" : "/c/") + deep[2] : location.hash.replace(/^#/, "") || "/", q = {}, i = h.indexOf("?");
    if (i > -1) { h.slice(i + 1).split("&").forEach(function (kv) { var a = kv.split("="); if (a[0]) q[decodeURIComponent(a[0])] = decodeURIComponent((a[1] || "").replace(/\+/g, " ")); }); h = h.slice(0, i); }
    return { path: h, q: q };
  }
  var qs = function (o) { return Object.keys(o).filter(function (k) { return o[k]; }).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(o[k]); }).join("&"); };

  function runSearch(q) {
    var t = L(), mode = q.m === "on" ? "on" : "in", text = (q.q || "").trim().toLowerCase();
    var list = P.filter(function (p) {
      if (q.a && p.area !== q.a) return false;
      if (q.s && p.sp !== q.s) return false;
      if (q.v && !p.svc.some(function (x) { return x.k === q.v; })) return false;
      if (q.c && !hasCov(p)) return false;
      if (mode === "on" && !hasOnline(p)) return false;
      if (text) { var hay = [t.sp[p.sp], pname(p)].concat(p.svc.map(function (x) { return t.sv[x.k]; })).join(" ").toLowerCase(); if (hay.indexOf(text) < 0) return false; }
      return true;
    }).map(function (p) {
      var pool = svcsFor(p, mode), lead = pool[0];
      pool.forEach(function (x) { if (q.v && x.k === q.v) lead = x; if (text && t.sv[x.k].toLowerCase().indexOf(text) > -1) lead = x; });
      return { p: p, lead: lead || p.svc[0], mode: mode, nf: nextFree(p, mode), conf: confOf(p) };
    }).filter(function (r) {
      if (F.cov && !hasCov(r.p)) return false;
      if (F.max && priceOf(r.p, r.lead) > F.max) return false;
      if (F.lang && r.p.langs.indexOf(F.lang) < 0) return false;
      return true;
    });
    var hidden = list.filter(function (r) { return r.conf > 14; }).length;
    list = list.filter(function (r) { return r.conf <= 14; });
    var key = function (r) { return F.sort === "price" ? priceOf(r.p, r.lead) : (r.nf ? at(r.nf.d, r.nf.t).getTime() : 9e15); };
    list.sort(function (a, b) { var fa = a.conf <= 7 ? 0 : 1, fb = b.conf <= 7 ? 0 : 1; return fa - fb || key(a) - key(b); });
    return { list: list, hidden: hidden };
  }

  /* ---------------- shared pieces ---------------- */
  function searchForm(q) {
    var t = L(), mode = q && q.m ? q.m : S.mode;
    var opts = '<option value="">' + t.s_all + "</option>" + Object.keys(t.ar).map(function (k) { return '<option value="' + k + '"' + (q && q.a === k ? " selected" : "") + ">" + t.ar[k] + "</option>"; }).join("");
    var names = Object.keys(t.sp).map(function (k) { return t.sp[k]; }).concat(Object.keys(t.sv).map(function (k) { return t.sv[k]; }));
    return '<form class="sform" id="sform" role="search"><div class="seg" id="smode" role="group"><button type="button" data-m="in" aria-pressed="' + (mode !== "on") + '">' + ic("pin") + t.tab_in + '</button><button type="button" data-m="on" aria-pressed="' + (mode === "on") + '">' + ic("video") + t.tab_on + "</button></div>" +
      '<div class="srow"><div class="sf"><label for="sq">' + t.s_what + '</label><input id="sq" name="q" list="sugg" autocomplete="off" placeholder="' + esc(t.s_ph) + '" value="' + esc((q && q.q) || "") + '"><datalist id="sugg">' + names.map(function (n) { return '<option value="' + esc(n) + '">'; }).join("") + "</datalist></div>" +
      '<div class="sf"><label for="sa">' + t.s_where + '</label><select id="sa">' + opts + '</select></div><button class="btn big" type="submit">' + ic("search") + t.s_go + "</button></div></form>";
  }
  var badgeSt = function (st) { var cls = st === "done" ? "ok" : st === "noshow" || st === "cancelled" ? "risk" : st === "confirmed" ? "" : "plain"; return '<span class="badge ' + cls + '">' + L().st[st] + "</span>"; };
  var confLine = function (p) { var c = confOf(p); return '<span class="confline' + (c > 7 ? " old" : "") + '">' + L().conf_ago(c) + "</span>"; };
  var steps = function (list) { return '<div class="steps">' + list[0].map(function (h, i) { return '<div class="step"><h3>' + h + "</h3><p>" + list[1][i] + "</p></div>"; }).join("") + "</div>"; };


  /* ---------------- illustrations ---------------- */
  var ART = '<defs><clipPath id="cpChapan"><path d="M62 352C60 286 70 226 100 214C130 226 140 286 138 352Z"/></clipPath><clipPath id="cpDress"><path d="M296 352C296 290 304 232 332 220C360 232 368 290 368 352Z"/></clipPath></defs><path d="M58 300C18 220 62 112 170 82C280 52 402 102 410 212C420 322 322 372 220 368C132 366 88 352 58 300Z" fill="rgba(255,255,255,0.08)"/><circle cx="338" cy="104" r="44" fill="#3CC4C0" opacity=".28"/><circle cx="84" cy="120" r="10" fill="#FFFFFF" opacity=".16"/><circle cx="380" cy="250" r="6" fill="#FFFFFF" opacity=".2"/><ellipse cx="226" cy="370" rx="180" ry="11" fill="rgba(0,0,0,0.2)"/><g><rect x="82" y="338" width="12" height="26" rx="4" fill="#4A4A52"/><rect x="106" y="338" width="12" height="26" rx="4" fill="#4A4A52"/><ellipse cx="88" cy="366" rx="12" ry="5" fill="#3A2A22"/><ellipse cx="112" cy="366" rx="12" ry="5" fill="#3A2A22"/><path d="M74 238C66 262 68 282 72 300" stroke="#1F5F8B" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M62 352C60 286 70 226 100 214C130 226 140 286 138 352Z" fill="#1F5F8B"/><g clip-path="url(#cpChapan)" opacity=".9"><path d="M78 220L72 352M92 214L89 352M108 214L111 352M122 220L128 352" stroke="#F2C14E" stroke-width="3"/><rect x="58" y="282" width="84" height="8" fill="#7A3B2E"/></g><path d="M96 214L100 236L104 214Z" fill="#E8E4DE"/><circle cx="72" cy="304" r="6" fill="#C98B6B"/><path d="M126 238C138 262 140 280 146 296" stroke="#1F5F8B" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M150 298L158 366" stroke="#6B4A2E" stroke-width="5" stroke-linecap="round"/><path d="M141 293Q149 284 155 296" stroke="#6B4A2E" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="148" cy="300" r="6" fill="#C98B6B"/><rect x="93" y="200" width="14" height="16" fill="#C98B6B"/><circle cx="100" cy="188" r="22" fill="#C98B6B"/><path d="M79 192C81 214 92 224 100 224C108 224 119 214 121 192C112 203 88 203 79 192Z" fill="#ECE8E2"/><path d="M92 200Q100 196 108 200" stroke="#ECE8E2" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M77 181C77 162 88 153 100 153C112 153 123 162 123 181Z" fill="#161616"/><ellipse cx="88" cy="170" rx="5" ry="2.4" fill="#F4F1EA" transform="rotate(-30 88 170)"/><ellipse cx="100" cy="165" rx="5" ry="2.4" fill="#F4F1EA"/><ellipse cx="112" cy="170" rx="5" ry="2.4" fill="#F4F1EA" transform="rotate(30 112 170)"/><path d="M89 187Q92.5 184 96 187M104 187Q107.5 184 111 187" stroke="#2B2120" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M95 206Q100 209.5 105 206" stroke="#8A4B37" stroke-width="2" fill="none" stroke-linecap="round"/></g><g><rect x="200" y="298" width="16" height="66" rx="6" fill="#1F3A44"/><rect x="224" y="298" width="16" height="66" rx="6" fill="#1F3A44"/><ellipse cx="207" cy="366" rx="12" ry="5" fill="#10242A"/><ellipse cx="233" cy="366" rx="12" ry="5" fill="#10242A"/><path d="M178 302C176 240 186 196 220 186C254 196 264 240 262 302L250 312H190Z" fill="#FFFFFF"/><path d="M206 190L220 224L234 190Z" fill="#0A7F83"/><path d="M206 190L214 252M234 190L226 252" stroke="#D3E0E1" stroke-width="2"/><rect x="238" y="232" width="14" height="10" rx="2" fill="#E6F2F2"/><path d="M243 226V238" stroke="#0A7F83" stroke-width="2.4" stroke-linecap="round"/><path d="M254 212C262 240 262 262 256 284" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" fill="none"/><circle cx="256" cy="289" r="7" fill="#E0A98A"/><path d="M210 196C204 226 214 240 222 244C232 240 238 226 232 196" stroke="#2B3A40" stroke-width="3" fill="none"/><circle cx="222" cy="249" r="5" fill="#9FB3B8" stroke="#2B3A40" stroke-width="2"/><path d="M186 214C176 240 180 262 202 268" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" fill="none"/><g transform="rotate(-10 214 264)"><rect x="192" y="238" width="42" height="54" rx="7" fill="#0D4245"/><rect x="197" y="244" width="32" height="36" rx="3" fill="#3CC4C0"/><path d="M202 252H222M202 260H216M202 268H220" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/></g><circle cx="204" cy="268" r="7" fill="#E0A98A"/><rect x="213" y="174" width="14" height="16" fill="#E0A98A"/><circle cx="226" cy="114" r="12" fill="#2B2120"/><circle cx="220" cy="156" r="26" fill="#E0A98A"/><path d="M194 158C191 128 209 118 222 118C241 118 251 133 246 154C238 140 222 136 205 146C200 150 197 154 194 158Z" fill="#2B2120"/><circle cx="211" cy="159" r="2.6" fill="#2B2120"/><circle cx="229" cy="159" r="2.6" fill="#2B2120"/><circle cx="205" cy="167" r="4" fill="#F29C8A" opacity=".45"/><circle cx="235" cy="167" r="4" fill="#F29C8A" opacity=".45"/><path d="M212 169Q220 176 228 169" stroke="#8A4B37" stroke-width="2.4" fill="none" stroke-linecap="round"/></g><g><ellipse cx="318" cy="366" rx="11" ry="5" fill="#3A2A22"/><ellipse cx="346" cy="366" rx="11" ry="5" fill="#3A2A22"/><path d="M302 240C294 262 294 282 300 298" stroke="#E07A5F" stroke-width="13" stroke-linecap="round" fill="none"/><path d="M296 352C296 290 304 232 332 220C360 232 368 290 368 352Z" fill="#E07A5F"/><g clip-path="url(#cpDress)"><path d="M292 296l9-9 9 9 9-9 9 9 9-9 9 9 9-9 9 9 9-9" stroke="#FFE0A3" stroke-width="3.2" fill="none"/><path d="M292 322l9-9 9 9 9-9 9 9 9-9 9 9 9-9 9 9 9-9" stroke="#5B3E8E" stroke-width="3.2" fill="none"/></g><circle cx="300" cy="302" r="6" fill="#F1C7A5"/><path d="M362 240C372 262 376 280 384 296" stroke="#E07A5F" stroke-width="13" stroke-linecap="round" fill="none"/><path d="M305 202C303 168 318 159 332 159C348 159 361 169 359 202C357 216 350 224 344 228H320C312 222 307 214 305 202Z" fill="#5B3E8E"/><circle cx="309" cy="208" r="2" fill="#FFFFFF" opacity=".7"/><circle cx="355" cy="208" r="2" fill="#FFFFFF" opacity=".7"/><circle cx="316" cy="221" r="2" fill="#FFFFFF" opacity=".7"/><circle cx="348" cy="221" r="2" fill="#FFFFFF" opacity=".7"/><circle cx="332" cy="196" r="21" fill="#F1C7A5"/><path d="M311 189C313 171 323 167 332 167C342 167 352 172 353 189C344 180 321 180 311 189Z" fill="#5B3E8E"/><circle cx="325" cy="198" r="2.3" fill="#2B2120"/><circle cx="339" cy="198" r="2.3" fill="#2B2120"/><circle cx="320" cy="205" r="3.4" fill="#F29C8A" opacity=".45"/><circle cx="344" cy="205" r="3.4" fill="#F29C8A" opacity=".45"/><path d="M326 206Q332 211 338 206" stroke="#8A4B37" stroke-width="2.2" fill="none" stroke-linecap="round"/></g><g><rect x="384" y="344" width="9" height="20" rx="3" fill="#2F4F6F"/><rect x="396" y="344" width="9" height="20" rx="3" fill="#2F4F6F"/><ellipse cx="388" cy="366" rx="7" ry="4" fill="#3A2A22"/><ellipse cx="401" cy="366" rx="7" ry="4" fill="#3A2A22"/><path d="M378 350C378 322 384 306 394 302C404 306 410 322 410 350Z" fill="#3CC4C0"/><path d="M383 314C381 306 383 301 386 299" stroke="#3CC4C0" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="386" cy="300" r="5.5" fill="#F1C7A5"/><circle cx="394" cy="287" r="14" fill="#E0A98A"/><path d="M380 286C380 272 388 268 394 268C402 268 409 274 408 286C402 279 388 279 380 286Z" fill="#2B2120"/><circle cx="390" cy="289" r="1.7" fill="#2B2120"/><circle cx="398" cy="289" r="1.7" fill="#2B2120"/><path d="M390 295Q394 298.5 398 295" stroke="#8A4B37" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>';
  /* a photo from site/img in two widths (Unsplash, free licence); lazy unless it's at the top of the page */
  function photo(name, alt, sizes, cls, eager) {
    var b = "img/"; return '<img class="' + (cls || "") + '" src="' + b + name + '-1200.jpg" srcset="' + b + name + "-640.jpg 640w, " + b + name + '-1200.jpg 1200w" sizes="' + sizes + '" alt="' + esc(alt) + '"' + (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
  }
  /* phone pictures of the app (after Doctor Anywhere): drawn in HTML, so they follow the language and the doctors on the site */
  var AVC = ["#0A7F83", "#C2613F", "#5B6CC9", "#A34F8C"];
  function phoneDocs() { return realFirst(withSamples().filter(function (u) { return u.role === "doctor"; }), "rating").slice(0, 3); }
  function phn(inner, cls) { return '<div class="phn' + (cls ? " " + cls : "") + '" aria-hidden="true"><div class="scr">' + inner + "</div></div>"; }
  function phAv(u, i) { return '<span class="pav2" style="background:' + AVC[i % 4] + '">' + esc(initials(u.name)) + "</span>"; }
  function phFind() {
    var t = L(), ds = phoneDocs();
    return phn('<div class="pbar"><img src="icon.svg?v=3" alt=""><b>Shifokor</b></div><div class="psearch">' + ic("search") + "<span>" + t.ph_search + '</span></div><div class="pchips"><span class="on">' + t.docsp.pediatrics + "</span><span>" + t.docsp.gyn + "</span><span>" + t.docsp.gp + "</span></div>" +
      ds.map(function (u, i) { var r = ratingOf(u.id); return '<div class="pdoc">' + phAv(u, i) + "<div><b>" + esc(u.name) + "</b><small>" + esc(specName(u.profile || {})) + "</small>" + (r.n ? '<i class="pst">★ ' + avgTxt(r.avg) + "</i>" : "") + "</div></div>"; }).join("") +
      '<div class="pbtn">' + t.ph_steps[0][1] + "</div>");
  }
  function phChat() {
    var t = L(), d = phoneDocs()[0];
    return phn('<div class="pbar chat">' + (d ? phAv(d, 0) + "<div><b>" + esc(d.name) + "</b><small>" + t.ph_online + "</small></div>" : "") + '</div><div class="pmsgs"><div class="pb me">' + t.ph_pt + '</div><div class="pmsgph me">' + ic("camera") + "</div>" +
      '<div class="pb">' + t.ph_doc + '</div></div><div class="pin2"><span>' + t.ph_type + "</span>" + ic("mic") + "</div>");
  }
  function phCall(big) {
    var t = L(), d = phoneDocs()[0];
    return phn(photo("doctor-desk", "", big ? "260px" : "160px", "pphoto") + '<div class="ptop"><b>' + (d ? esc(d.name) : "") + "</b><small>" + t.cs_types.video[0] + ' · 04:12</small></div><div class="pself"></div>' +
      '<div class="pctl"><i>' + ic("mic") + "</i><i>" + ic("video") + "</i><i>" + ic("camera") + '</i><i class="end">' + ic("phone") + "</i></div>", "pcall" + (big ? " big" : ""));
  }
  function phHome() {
    var t = L(), tiles = [["video", t.ph_tiles[0]], ["search", t.ph_tiles[1]], ["tag", t.ph_tiles[2]], ["heart", t.ph_tiles[3]]];
    return phn('<div class="pbar"><img src="icon.svg?v=3" alt=""><b>Shifokor</b></div><p class="phello">' + t.ph_hello + '</p><div class="ptiles">' + tiles.map(function (x) { return "<span><i>" + ic(x[0]) + "</i>" + x[1] + "</span>"; }).join("") + "</div>" +
      '<b class="psub">' + t.nav_consult + '</b><div class="pcards"><span>' + ic("chat") + "<b>" + t.docsp.gp + "</b><small>" + t.cs_types.text[0] + "</small></span><span>" + ic("video") + "<b>" + t.ph_spec + "</b><small>" + t.cs_types.video[0] + "</small></span></div>" +
      '<div class="pbanner">' + ic("heart") + "<span>" + t.ona_home_h + "</span></div>");
  }
  /* when an online consultation helps: one slide per group of patients, with arrows, dots and swipe */
  function whenSlider() {
    var t = L(), links = ["#/doctors?" + qs({ s: "pediatrics" }), "#/doctors?" + qs({ s: "therapist" }), "#/ona", "#/doctors?" + qs({ s: "psych" })];
    var imgs = ["ped-baby", "elderly-visit", "pregnancy", "psychologist"];
    return '<div class="wrap pad sliderwrap"><div class="sechead"><h2>' + t.sl_h + '</h2><div class="slnav"><button type="button" class="slbtn" data-sl="prev" aria-label="' + esc(t.sl_prev) + '">‹</button><button type="button" class="slbtn" data-sl="next" aria-label="' + esc(t.sl_next) + '">›</button></div></div>' +
      '<div class="slider" id="slider" tabindex="0" aria-roledescription="carousel">' + t.sl.map(function (x, i) { return '<section class="slide s' + i + '" aria-roledescription="slide" aria-label="' + (i + 1) + " / " + t.sl.length + '"><div class="sltext"><span class="eyebrow">' + x[0] + "</span><h3>" + x[1] + "</h3><p>" + x[2] + '</p><ul class="slex">' + x[3].map(function (e) { return "<li>" + ic("check") + "<span>" + e + "</span></li>"; }).join("") + '</ul><a class="btn" href="' + links[i] + '">' + x[4] + " →</a></div>" + photo(imgs[i], x[5], "(max-width: 760px) 90vw, 520px", "slimg") + "</section>"; }).join("") + "</div>" +
      '<div class="sldots">' + t.sl.map(function (x, i) { return '<button type="button" data-sl="' + i + '" aria-label="' + esc(x[0]) + '"' + (i === 0 ? ' aria-current="true"' : "") + "></button>"; }).join("") + '</div><p class="fine" style="margin-top:8px">' + t.sl_em + "</p></div>";
  }
  function slideTo(i) { var el = $("slider"); if (!el) return; var n = el.children.length; i = (i + n) % n; el.scrollTo({ left: el.children[i].offsetLeft - el.offsetLeft, behavior: "smooth" }); }
  var slideAt = function () { var el = $("slider"); return el ? Math.round(el.scrollLeft / el.clientWidth) : 0; };
  /* next slide every 7 seconds, unless the visitor is using the slider or asked for less motion */
  setInterval(function () { var el = $("slider"); if (!el || el.matches(":hover") || el.contains(document.activeElement) || document.hidden || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return; slideTo(slideAt() + 1); }, 7000);
  document.addEventListener("scroll", function (e) { if (!e.target || e.target.id !== "slider") return; var i = slideAt(); [].forEach.call(document.querySelectorAll(".sldots button"), function (b, k) { if (k === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); }); }, true);
  function heroPhones() {
    var t = L(), shots = [phFind(), phChat(), phCall(false)];
    return '<div class="phones">' + shots.map(function (x, i) { return '<figure class="phstep">' + x + "<figcaption><small>" + t.ph_steps[i][0] + "</small>" + t.ph_steps[i][1] + "</figcaption></figure>"; }).join("") + "</div>";
  }
  function heroArt() {
    var t = L();
    return '<div class="art">' + photo("doctor-video-call", t.img_hero, "(max-width: 960px) 90vw, 500px", "art-photo", true) +
      '<div class="art-chip c1"><i>' + ic("shield") + "</i><span><small>" + t.hf_chip1[0] + "</small>" + t.hf_chip1[1] + "</span></div>" +
      '<div class="art-chip c2"><i>' + ic("chat") + "</i><span><small>" + t.nav_consult + "</small>" + t.cs_types.text[0] + " · " + t.cs_types.video[0] + "</span></div>" +
      '<div class="art-chip c3"><i>' + ic("tag") + "</i><span>" + t.hf_chip3 + "</span></div></div>";
  }
  var SKIN = ["#F1C7A5", "#E0A98A", "#C98B6B", "#A8704F"], HAIR = ["#2B2120", "#4A3428", "#1E1A1A", "#6B4A35"], AVBG = ["#D9F0EC", "#FBE3D6", "#DCEBFA", "#ECE4F7"];
  function avatar(p) {
    var h = hash(p.id + "av"), sk = SKIN[h % 4], hr = HAIR[(h >> 3) % 4], bg = AVBG[(h >> 5) % 4], style = (h >> 7) % 3;
    var back = style === 2 ? '<path d="M19 36c-3-15 4-23 13-23s16 8 13 23l-3 5H22z" fill="' + hr + '"/>' : "";
    var front = style === 0 ? '<path d="M21 28c0-9 5-13 11-13s11 4 11 13c-3-5-7-7-11-7s-8 2-11 7z" fill="' + hr + '"/>'
      : style === 1 ? '<path d="M21 29c-1-10 5-14 11-14s12 4 11 14c-2-6-7-8-11-8s-9 2-11 8z" fill="' + hr + '"/><circle cx="32" cy="13.5" r="5" fill="' + hr + '"/>'
      : '<path d="M22 27c1-7 5-10 10-10s9 3 10 10c-3-4-6-5-10-5s-7 1-10 5z" fill="' + hr + '"/>';
    return '<div class="avatar" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="' + bg + '"/>' + back +
      '<path d="M9 66c2-12 10-18 23-18s21 6 23 18z" fill="#FFFFFF"/><path d="M27 48.5l5 8 5-8z" fill="#0A7F83"/><path d="M24 50c-1.5 6 2 9.5 6 9.5" stroke="#2B3A40" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<rect x="28" y="39" width="8" height="10" fill="' + sk + '"/><circle cx="32" cy="30" r="11" fill="' + sk + '"/>' + front +
      '<circle cx="28" cy="31" r="1.3" fill="#2B2120"/><circle cx="36" cy="31" r="1.3" fill="#2B2120"/><path d="M28.5 35.2q3.5 3 7 0" stroke="#8A4B37" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg><span class="lt">' + p.ch + "</span></div>";
  }
  function phoneMock() {
    var t = L(), p1 = byId("p1"), nf = nextFree(p1, "in"), when = nf ? whenTxt(nf.d, nf.t) : "";
    return '<div class="phone-wrap"><div class="phone" aria-hidden="true"><div class="ph-top"><span class="ph-av"><svg viewBox="0 0 32 32"><rect width="32" height="32" rx="16" fill="#0A7F83"/><path d="M16 9v14M9 16h14" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/></svg></span><div><b>' + t.ph_bot + "</b><small>Telegram</small></div></div>" +
      '<div class="ph-body"><div class="bub">' + esc(t.tg_msg(t.sv.dental_consult, pname(p1), when)) + '</div><div class="bub">' + esc(t.ph_rem(t.sv.dental_consult)) + '<div class="bub-btns"><span>' + t.v_move + "</span><span>" + t.v_cancel + '</span></div></div><div class="bub me">' + esc(t.ph_me) + "</div></div></div>" +
      '<div class="phone-cap"><span class="sample">' + t.sample + "</span><h3>" + t.ph_h + "</h3><p>" + t.ph_p + "</p></div></div>";
  }

  /* ---------------- home ---------------- */
  function viewHome() {
    var t = L();
    var live = users().filter(function (u) { return u.role === "doctor" && onlineNow(u); });
    var regSel = REG.slice().sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); });
    /* one box for a complaint or a name, the region, and Search (as on Zocdoc); the rest folds away */
    var form = '<form class="hfform" id="hfform" role="search"><div class="hfmain"><div class="sf hfq"><label for="hf-q">' + t.ds_name + '</label><div class="inico">' + ic("search") + '<input id="hf-q" class="pinput" placeholder="' + esc(t.ds_name_ph) + '" autocomplete="off"></div></div>' +
      '<div class="sf"><label for="hf-r">' + t.f_region + '</label><select id="hf-r"><option value="">' + t.all_regions + "</option>" + regSel.map(function (r) { return '<option value="' + r.code + '">' + esc(nmL(r)) + "</option>"; }).join("") + '</select></div><button class="btn big" type="submit">' + t.hf_go + "</button></div>" +
      '<details class="hfmorefil"><summary>' + t.hf_more + '</summary><div class="hfrow2"><div class="sf"><label for="hf-s">' + t.hf_spec + '</label><select id="hf-s"><option value="">' + t.all_specs + "</option>" + DOC_SP.filter(function (k) { return k !== "other"; }).map(function (k) { return '<option value="' + k + '">' + t.docsp[k] + "</option>"; }).join("") + "</select></div>" +
      '<div class="sf"><label for="hf-lg">' + t.df_lang + '</label><select id="hf-lg"><option value="">' + t.df_any_lang + "</option>" + ["uz", "ru", "en", "kaa", "tg"].map(function (l) { return '<option value="' + l + '">' + esc(langName(l)) + "</option>"; }).join("") + "</select></div></div>" +
      '<div class="hfchips">' + [["hf-on", t.df_online], ["hf-fem", t.df_fem], ["hf-rate", t.hf_rated]].map(function (x) { return '<label class="chipchk"><input type="checkbox" id="' + x[0] + '"><span>' + x[1] + "</span></label>"; }).join("") + "</div></details>" +
      '<div class="hfquick"><span class="muted">' + t.hf_try + "</span>" + t.hf_tries.map(function (x) { return '<a href="#/doctors?' + qs({ q: x }) + '">' + esc(x) + "</a>"; }).join("") + "</div>" +
      '<div class="hfmore"><a class="btn light" href="#/consult?now=1">' + ic("video") + t.asap_now[0] + '</a><a class="hflink" href="#/prices">' + ic("tag") + t.hf_prices + "</a></div></form>";
    var score = function (r) { return (r.avg * r.n + 4 * 3) / (r.n + 3); };
    var docs = withSamples().filter(function (u) { return u.role === "doctor"; }).map(function (u) { return { u: u, r: ratingOf(u.id) }; }).filter(function (x) { return x.r.n > 0; })
      .sort(function (a, b) { return score(b.r) - score(a.r) || (a.u.sample ? 1 : 0) - (b.u.sample ? 1 : 0); }).slice(0, 6).map(function (x) { return x.u; });
    /* how it works: three steps beside a real photo */
    var howSec = '<div class="wrap pad howgrid"><figure class="howphoto">' + photo("doctor-phone", t.img_how, "(max-width: 760px) 90vw, 420px") + '</figure><div><h2>' + t.how_use_h + '</h2><ol class="howlist">' + t.how_f.map(function (x, i) { return '<li><span class="hn">0' + (i + 1) + "</span><div><b>" + x[0] + "</b><p>" + x[1] + "</p></div></li>"; }).join("") + '</ol><a class="btn" href="#/doctors">' + ic("search") + t.hf_go + "</a></div></div>";
    var prosSec = '<div class="band soft"><div class="wrap pad prosgrid"><figure class="shot prosph">' + photo("doctor-desk", t.pros_img, "(max-width: 760px) 90vw, 560px") + '</figure><div><span class="eyebrow">' + t.nv_pros + "</span><h2>" + t.pros_h + '</h2><p class="lead">' + t.pros_p + '</p><ul class="slex">' + t.pros_pts.map(function (e) { return "<li>" + ic("check") + "<span>" + e + "</span></li>"; }).join("") +
      '</ul><div class="btns"><a class="btn" href="#/register" data-regrole-link="doctor">' + t.reg_doc_cta + '</a><a class="btn ghost" href="#/register" data-regrole-link="clinic">' + t.reg_clinic_cta + "</a></div></div></div></div>";
    return '<div class="band deep homehero"><div class="wrap hero"><div><h1>' + t.hf_h1 + '</h1><p class="herotag">' + t.hero_tag + '</p><p class="sub">' + t.hf_sub + "</p>" + form + "</div>" + heroArt() + "</div></div>" +
      svcSection(8, true) +
      (live.length ? '<div class="wrap pad" style="padding-top:12px"><div class="sechead"><h2>' + t.hm_online_h + '</h2><a class="btn sm" href="#/consult?now=1">' + ic("chat") + t.hm_cta_now + '</a></div><div class="results" style="padding:14px 0 0">' + live.slice(0, 4).map(docCard).join("") + "</div></div>" : "") +
      '<div class="wrap pad" style="padding-top:12px"><div class="sechead"><div><h2>' + t.top_docs_h + '</h2><p class="lead" style="margin:4px 0 0">' + t.top_p + '</p></div><a class="btn ghost sm" href="#/doctors">' + t.new_docs_all + "</a></div>" +
        (docs.length ? '<div class="dtgrid">' + docs.map(docTile).join("") + "</div>" + (docs.some(function (u) { return u.sample; }) ? '<p class="fine" style="margin-top:10px">' + t.smp_dir + "</p>" : "") : '<p class="muted">' + t.top_none + "</p>") + "</div>" +
      howSec +
      '<div class="wrap tcards homepromise">' + t.tc.map(function (x, i) { return '<div class="tcard"><div class="tcimg t' + i + '">' + ic(["shield", "free", "check"][i]) + "</div><div><b>" + x[0] + "</b><p>" + x[1] + "</p></div></div>"; }).join("") + "</div>" +
      prosSec +
      '<div class="wrap pad"><h2>' + t.faq_short_h + '</h2><div class="faq">' + t.faq_f.map(function (q) { return "<details><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>"; }).join("") + "</div>" +
      '<p class="fine credits">' + t.ph_credit + "</p></div>";
  }
  /* ---------------- health services: one card per thing an ordinary person comes for ----------------
     Each card links to real content: the application form, the price list filtered to that service, or the clinics.
     The price is the lowest matching price, real doctors first; sample doctors only when there's no real one. */
  var SV = [
    { k: "online", img: "doctor-video-call", href: "#/consult", cp: true },
    { k: "results", img: "doctor-desk", href: "#/prices?q=natijasini", q: "natijasini" },
    { k: "pediatrics", img: "ped-baby", href: "#/consult?s=pediatrics", spec: "pediatrics" },
    { k: "pregnancy", img: "pregnancy", href: "#/ona", spec: "gyn" },
    { k: "chronic", img: "elderly-visit", href: "#/prices?q=nazorat", q: "nazorat" },
    { k: "meds", img: "doctor-phone", href: "#/prices?q=dorilarni", q: "dorilarni" },
    { k: "mental", img: "psychologist", href: "#/consult?s=psych", spec: "psych" },
    { k: "clinic", img: "nukus-phone", href: "#/find" }
  ];
  /* no "from … so'm" here: the cheapest price on the site (often a test account) said little about a real visit; each doctor's own price is on their profile */
  function svCard(it) {
    var c = L().sv_items[it.k];
    return '<a class="svcard" href="' + it.href + '"><div class="svphoto">' + photo(it.img, c[3], "(max-width: 600px) 40vw, (max-width: 1100px) 45vw, 300px") + '</div><div class="svtext"><h3>' + c[0] + "</h3><p>" + c[1] + '</p><span class="svfoot"><span></span><span class="carego">' + c[2] + " →</span></span></div></a>";
  }
  function svcSection(n, home) {
    var t = L(), cards = SV.slice(0, n).map(svCard).join("");
    return '<div class="wrap pad svwrap"><div class="sechead"><div><h2>' + t.sv_h + '</h2><p class="lead" style="margin:4px 0 0">' + t.sv_p + '</p></div><a class="btn ghost sm" href="' + (home ? "#/services" : "#/prices") + '">' + (home ? t.sv_more : t.sv_all) + '</a></div><div class="svgrid">' + cards + "</div>" +
      "</div>";
  }
  function viewServices() {
    var t = L();
    return pageHead(t.nv_services, t.sv_page_h, t.sv_page_p) + svcSection(SV.length, false) +
      '<div class="wrap pad" style="padding-top:8px"><h2>' + t.sv_spec_h + '</h2><div class="hfquick" style="margin-top:12px">' + DOC_SP.filter(function (k) { return k !== "other"; }).map(function (k) { return '<a href="#/doctors?' + qs({ s: k }) + '">' + t.docsp[k] + "</a>"; }).join("") + "</div>" +
      '<p class="note-box" style="margin-top:24px">' + t.sl_em + '</p><p class="fine credits">' + t.ph_credit + "</p></div>";
  }
  /* who needs help: four groups with a real photo each (the old slider, laid out as cards) */
  /* ---------------- Shifo_AI: a floating helper in the bottom-right corner, from a complaint in the person's own words
     to the right kind of doctor. The server (Groq) answers with a specialty and a service; the doctors shown come from
     this site's own list. The chat lives only in this page's memory. With no AI key, or if the AI fails, the
     everyday-complaint matcher below answers. It sits outside #app, so redrawing the page leaves it as it is. */
  var AI = { msgs: [], busy: false, complaint: "", open: false, lang: "" };
  var AI_EM = /ko.?kra[kg].{0,12}og|nafas.{0,16}qis|hushdan|боль в груд|одышк|обморок|chest pain|short of breath|faint/i;
  function aiLocal(text) {
    var t = L(); if (AI_EM.test(text)) return { content: t.ai_em, emergency: true };
    var k = symSpecs(norm(text))[0] || "";
    return { content: k ? t.ai_local(t.docsp[k]) : t.ai_local_none, spec: k, local: true };
  }
  function aiSend(text) {
    var t = L(); text = String(text || "").trim(); if (AI.busy || text.length < 3) return;
    AI.msgs.push({ role: "user", content: text }); AI.busy = true; AI.open = true; aiDraw("");
    var done = function (m) { AI.msgs.push(Object.assign({ role: "assistant" }, m)); AI.busy = false; aiDraw(); };
    if (!BE) { done(aiLocal(text)); return; }
    BE.aiFind(AI.msgs.slice(-8).map(function (m) { return { role: m.role, content: m.content }; }), lang).then(function (a) { done({ content: a.reply, spec: a.spec, service: a.service, inperson: a.inperson, emergency: a.emergency }); },
      function (x) { done(x && x.code === "limit" ? { content: t.ai_limit } : aiLocal(text)); });
  }
  function aiDoc(u) {
    var t = L(), m = cpMin(u);
    return '<a class="aidoc" href="#/doc/' + u.id + '">' + avatarOf(u, "sm") + "<span><b>" + esc(u.name) + "</b><small>" + esc(specName(u.profile || {})) + (m != null ? " · " + (m === 0 ? t.free_c : esc(t.cp_from(num(m) + " " + unit()))) : "") + "</small></span>" + (u.sample ? smpBadge() : u.verified ? vBadge(u) : "") + "</a>";
  }
  function aiResult(m) {
    var t = L();
    if (m.emergency) return '<div class="aiem">' + ic("phone") + "<span>" + t.ai_em_note + '</span><a class="btn danger sm" href="tel:103">103</a></div>';
    var sv = m.service && m.service !== "online" && SV.filter(function (x) { return x.k === m.service; })[0], out = "";
    if (m.spec) {
      var docs = realFirst(withSamples().filter(function (u) { return u.role === "doctor" && (u.profile || {}).spec === m.spec; }), "rating").slice(0, 3);
      out += '<p class="aihead">' + esc(t.ai_found(t.docsp[m.spec])) + "</p>" + docs.map(aiDoc).join("");
    }
    var btns = (m.spec ? '<button class="btn sm" type="button" data-aiask="' + m.spec + '">' + ic("chat") + t.ai_ask + '</button><a class="btn ghost sm" href="#/doctors?' + qs({ s: m.spec }) + '">' + t.ai_all + "</a>" : "") +
      (sv ? '<a class="btn ghost sm" href="' + sv.href + '">' + t.sv_items[sv.k][0] + "</a>" : "") + (m.inperson ? '<a class="btn ghost sm" href="#/find">' + ic("hosp") + t.ai_clinics + "</a>" : "");
    return out + (btns ? '<div class="aibtns">' + btns + "</div>" : "");
  }
  /* shown to patients and visitors on the public pages; not in the panels, to doctors and clinics, or during a call */
  var aiShown = function () { var u = me(); return !PANEL && !(u && u.role !== "patient") && !(window.ShifokorCall && ShifokorCall.active()); };
  function aiDraw(keep) {
    var box = $("shifoai"); if (!box) { box = document.createElement("div"); box.id = "shifoai"; document.body.appendChild(box); }
    var t = L(), inp = $("ai-in"), val = keep != null ? keep : inp ? inp.value : "", had = !!inp && document.activeElement === inp;
    AI.lang = lang; box.hidden = !aiShown();
    var msgs = AI.msgs.map(function (m) { return m.role === "user" ? '<div class="aimsg me">' + esc(m.content) + "</div>" : '<div class="aimsg ai">' + esc(m.content) + "</div>" + aiResult(m); }).join("");
    var hello = '<div class="aimsg ai">' + t.ai_hello + '</div><div class="aichips">' + t.ai_tries.map(function (x) { return '<button type="button" class="chip" data-aitry="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div>";
    box.innerHTML = (AI.open ? '<section class="aip" id="aip" role="dialog" aria-label="Shifo_AI"><header class="aiph"><span class="aifab-ic">' + ic("chat") + "</span><div><b>Shifo_AI</b><small>" + t.ai_sub + "</small></div>" +
        (AI.msgs.length ? '<button type="button" class="aix" data-act="aireset" title="' + esc(t.ai_new) + '" aria-label="' + esc(t.ai_new) + '">↺</button>' : "") + '<button type="button" class="aix" data-act="aiclose" aria-label="' + esc(t.ai_close) + '">×</button></header>' +
        '<div class="aimsgs" aria-live="polite">' + hello + msgs + (AI.busy ? '<div class="aimsg ai aiwait">' + t.ai_wait + "</div>" : "") + "</div>" +
        '<form class="aiform" id="aiform" novalidate><label class="vh" for="ai-in">' + t.ai_label + '</label><textarea id="ai-in" rows="2" maxlength="800" placeholder="' + esc(t.ai_ph) + '"></textarea><button class="btn sm" type="submit"' + (AI.busy ? " disabled" : "") + ">" + t.ai_send + "</button></form>" +
        '<p class="aifine"><span class="ainote-l">' + t.ai_note + '</span><span class="ainote-s">' + t.ai_note_s + '</span> <b><a href="tel:103">' + t.ai_em_short + "</a></b></p></section>" : "") +
      '<button type="button" class="aifab' + (AI.open ? " on" : "") + '" data-act="aiopen" aria-expanded="' + AI.open + '" aria-controls="aip"><span class="aifab-ic">' + ic("chat") + "</span><b>Shifo_AI</b></button>";
    document.body.classList.toggle("has-ai", !box.hidden);
    document.body.classList.toggle("ai-lock", !box.hidden && AI.open && aiPhone());
    var ni = $("ai-in"); if (ni) { ni.value = val; if ((had || keep === "") && !(aiPhone() && keep === "" && !had && !AI.msgs.length)) ni.focus(); }
    var ml = box.querySelector(".aimsgs"); if (ml) ml.scrollTop = ml.scrollHeight;
  }
  /* on a phone the open chat fills the screen; it follows the visible area, so the box stays above the keyboard */
  var aiPhone = function () { return !!(window.matchMedia && matchMedia("(max-width: 600px)").matches); };
  if (window.visualViewport) {
    var aiVv = function () { var v = window.visualViewport, r = document.documentElement.style; r.setProperty("--vvh", v.height + "px"); r.setProperty("--vvt", v.offsetTop + "px"); var ml = document.querySelector(".aimsgs"); if (ml && AI.open) ml.scrollTop = ml.scrollHeight; };
    window.visualViewport.addEventListener("resize", aiVv); window.visualViewport.addEventListener("scroll", aiVv); aiVv();
  }
  /* phones: the main functions in a bar at the bottom of the screen, with Shifo_AI in the middle (it replaces the
     floating button there). Only on the public pages, for patients and visitors. */
  function tbDraw() {
    var t = L(), u = me(), p = current ? current.path : "/", bar = $("tabbar");
    if (!bar) { bar = document.createElement("nav"); bar.id = "tabbar"; bar.className = "tabbar"; document.body.appendChild(bar); }
    var on = function (x) { return x === "home" ? p === "/" : x === "docs" ? p === "/doctors" || p.indexOf("/doc/") === 0 || p === "/services" : x === "cs" ? p === "/consult" || p.indexOf("/consult/") === 0 : x === "me" ? p === "/login" || p === "/register" : false; };
    var item = function (k, href, icon, label) { return '<a href="' + href + '" class="tbi"' + (on(k) ? ' aria-current="page"' : "") + ">" + ic(icon) + "<span>" + label + "</span></a>"; };
    bar.setAttribute("aria-label", t.tb_label);
    bar.hidden = !aiShown();
    bar.innerHTML = item("home", "#/", "home", t.tb_home) + item("docs", "#/doctors", "search", t.tb_docs) +
      '<button type="button" class="tbi tbai" data-act="aiopen" aria-expanded="' + AI.open + '"><i>' + ic("chat") + "</i><span>Shifo_AI</span></button>" +
      item("cs", "#/consult?now=1", "video", t.tb_consult) + item("me", u ? "#/account" : "#/login", "user", u ? t.tb_me : t.tb_login);
    document.body.classList.toggle("has-tab", !bar.hidden);
  }
  /* after each page draw: redraw only when the language or the visibility changed, so typing and scrolling stay put */
  function aiSync() { var box = $("shifoai"); if (!box || AI.lang !== lang || box.hidden === aiShown()) aiDraw(); }

  /* ---------------- test call (#/calltest): try a LiveKit video call between two devices, with no consultation ---------------- */
  var CT = { st: null, loading: false };
  function ctLoad() {
    if (!BE || CT.loading) return; CT.loading = true;
    BE.callStatus().then(function (j) { CT.st = j; }, function () { CT.st = { livekit: false, ok: false, why: "net" }; }).then(function () { CT.loading = false; if (current.path.indexOf("/calltest") === 0) render(true); });
  }
  function viewCallTest(code) {
    var t = L(), u = me(); code = String(code || "").toUpperCase();
    if (BE && !CT.st) ctLoad();
    var st = !BE ? '<p class="note-box">' + t.ct_demo + "</p>" : !CT.st ? '<p class="muted">' + t.ct_checking + "</p>" : CT.st.ok ? '<p class="ctstate ok">' + ic("check") + t.ct_ok + "</p>" : '<p class="ctstate bad">' + ic("siren") + (CT.st.livekit ? esc(t.ct_bad(CT.st.why)) : t.ct_off) + "</p>";
    var link = location.origin + location.pathname + "#/calltest/" + code, body;
    if (!u) body = '<div class="dcard"><p>' + t.ct_login + '</p><div class="btns"><a class="btn" href="#/login">' + t.go_login + '</a><a class="btn ghost" href="#/register">' + t.go_reg + "</a></div></div>";
    else if (code) body = '<div class="dcard"><h2>' + esc(t.ct_room(code)) + '</h2><p class="muted">' + t.ct_share + '</p><div class="ctlink"><input id="ct-link" readonly value="' + esc(link) + '" aria-label="' + esc(t.ct_room(code)) + '"><button class="btn ghost sm" type="button" data-act="ctcopy">' + t.ct_copy + "</button></div>" +
      '<div class="btns" style="margin-top:14px"><button class="btn" type="button" data-ctjoin="video">' + ic("video") + t.ct_join_v + '</button><button class="btn ghost" type="button" data-ctjoin="audio">' + ic("mic") + t.ct_join_a + "</button></div></div>";
    else body = '<div class="dcard"><h2>' + t.ct_new_h + '</h2><p class="muted">' + t.ct_new_p + '</p><button class="btn" type="button" data-act="ctnew">' + ic("video") + t.ct_new + "</button></div>";
    return pageHead(t.ct_eyebrow, t.ct_h, t.ct_p) + '<div class="wrap pad" style="max-width:760px">' + st + body +
      '<h2 class="subh" style="margin-top:26px">' + t.ct_how + '</h2><ol class="ctsteps">' + t.ct_steps.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol></div>";
  }

  /* ---------------- results ---------------- */
  function card(r) {
    var t = L(), p = r.p, lead = r.lead, nf = r.nf, link = "#/p/" + p.id + (r.mode === "on" ? "?m=on" : "");
    var badges = '<span class="badge">' + ic("shield") + t.ver + "</span>" + (hasOnline(p) ? '<span class="badge plain">' + ic("video") + t.online_b + "</span>" : "") + (lead.c ? '<span class="badge">' + t.cov + "</span>" : "");
    return '<article class="rcard" data-id="' + p.id + '"><div class="info"><div class="who">' + avatar(p) + '<div><h3><a href="' + link + '">' + esc(pname(p)) + '</a></h3><div class="spec">' + t.sp[p.sp] + '</div><div class="badges">' + badges + "</div></div></div>" +
      '<div class="meta">' + ic("pin") + t.ar[p.area] + " · " + p.langs.map(function (l) { return t.lg[l]; }).join(", ") + "</div>" +
      '<div class="svcline"><b>' + t.sv[lead.k] + '</b><span class="pr' + (lead.c ? " cov" : "") + ' nums">' + priceTxt(p, lead) + "</span></div>" + confLine(p) +
      '<div class="nextfree">' + (nf ? t.next_free + ": <b>" + whenTxt(nf.d, nf.t) + "</b>" : t.none_free) + '</div></div><div class="cal"><div class="calmeta"><span>' + t.times_for + (r.mode === "on" ? " · " + t.mode_on : "") + '</span><a href="' + link + '">' + t.view + "</a></div>" + calHTML(p, r.mode) + "</div></article>";
  }
  function viewSearch(q) {
    var t = L(), out = runSearch(q), res = out.list, mode = q.m === "on" ? "on" : "in", maxes = [0, 100000, 150000, 200000];
    pendingMap = res;
    var title = q.s ? t.sp[q.s] : q.v ? t.sv[q.v] : q.c ? t.cov_short : q.q ? esc(q.q) : q.a ? t.br_fergana + ", " + t.ar[q.a] : "";
    var filters = '<div class="filters"><button class="chip" type="button" data-f="online" aria-pressed="' + (mode === "on") + '">' + ic("video") + t.f_online + '</button><button class="chip" type="button" data-f="cov" aria-pressed="' + F.cov + '">' + t.f_cov + "</button>" +
      '<label class="sel">' + t.f_price + ' <select id="fprice">' + maxes.map(function (m) { return '<option value="' + m + '"' + (F.max === m ? " selected" : "") + ">" + (m ? num(m) : t.f_any) + "</option>"; }).join("") + "</select></label>" +
      '<label class="sel">' + t.f_lang + ' <select id="flang"><option value="">' + t.f_any + "</option>" + ["uz", "ru", "en"].map(function (l) { return '<option value="' + l + '"' + (F.lang === l ? " selected" : "") + ">" + t.lg[l] + "</option>"; }).join("") + "</select></label>" +
      '<label class="sel">' + t.f_sort + ' <select id="fsort"><option value="soon"' + (F.sort === "soon" ? " selected" : "") + ">" + t.sort_soon + '</option><option value="price"' + (F.sort === "price" ? " selected" : "") + ">" + t.sort_price + "</option></select></label></div>";
    return '<div class="band deep searchbar"><div class="wrap">' + searchForm(q) + '</div></div><div class="wrap">' + filters +
      '<div class="rhead"><h1>' + (title ? title + " · " : "") + t.r_count(res.length) + '</h1><span class="sample">' + t.sample + '</span></div><p class="rnote">' + t.rank_note + (out.hidden ? " " + t.stale_hidden(out.hidden) : "") + "</p>" +
      '<div class="rlayout"><div class="results">' + (res.length ? res.map(card).join("") : '<div class="empty">' + t.r_none + '<p style="margin-top:14px"><button class="btn ghost" type="button" data-f="clear">' + t.r_clear + "</button></p></div>") + "</div>" +
      '<aside class="mapcol"><button class="btn ghost sm mapbtn" type="button" data-act="togglemap" aria-expanded="' + mapOn + '">' + (mapOn ? t.map_hide : t.map_show) + '</button><div id="map" class="map' + (mapOn ? "" : " off") + '" role="region" aria-label="' + t.p_loc + '"></div><p class="fine">' + t.map_note + "</p></aside></div></div>";
  }

  /* ---------------- profile ---------------- */
  function viewProfile(id, q) {
    var t = L(), p = byId(id); if (!p) return viewHome();
    var mode = q.m === "on" && hasOnline(p) ? "on" : "in", times = p.times, nf = nextFree(p, mode);
    pendingMap = [{ p: p, mode: mode, nf: nf, solo: true }];
    var rows = p.svc.map(function (s) { return "<tr><td>" + t.sv[s.k] + (s.o ? ' <span class="badge plain">' + t.online_b + "</span>" : "") + '</td><td class="n">' + (s.c ? '<span class="badge">' + t.cov + "</span>" : priceTxt(p, s)) + '</td><td class="n muted">' + confDate(p) + "</td></tr>"; }).join("");
    var seg = hasOnline(p) ? '<div class="seg" id="pmode" role="group" style="margin-bottom:12px"><button type="button" data-m="in" aria-pressed="' + (mode === "in") + '">' + ic("pin") + t.tab_in + '</button><button type="button" data-m="on" aria-pressed="' + (mode === "on") + '">' + ic("video") + t.tab_on + "</button></div>" : "";
    return '<div class="wrap"><a class="back" href="#/search">‹ ' + t.back + '</a><div class="pf"><div><div class="who">' + avatar(p) + "<div><h1>" + esc(pname(p)) + '</h1><div class="spec">' + t.sp[p.sp] + " · " + t.ar[p.area] + '</div><div class="badges"><span class="badge">' + ic("shield") + t.ver + "</span>" + (hasOnline(p) ? '<span class="badge plain">' + ic("video") + t.online_b + "</span>" : "") + '<span class="sample">' + t.sample + "</span></div></div></div>" +
      '<div class="sect"><h2>' + t.p_serv + '</h2><div class="tablewrap"><table><thead><tr><th>' + t.p_svc + '</th><th class="n">' + t.p_price + '</th><th class="n">' + t.p_conf + "</th></tr></thead><tbody>" + rows + '</tbody></table></div><p style="margin-top:10px">' + confLine(p) + "</p></div>" +
      '<div class="sect"><h2>' + t.p_info + '</h2><dl class="kv"><dt>' + t.p_area + "</dt><dd>" + t.ar[p.area] + ", " + t.br_fergana + "</dd><dt>" + t.p_hours + "</dt><dd>" + t.hours(times[0], times[times.length - 1]) + "</dd><dt>" + t.p_langs + "</dt><dd>" + p.langs.map(function (l) { return t.lg[l]; }).join(", ") + "</dd><dt>" + t.p_vis + "</dt><dd>" + (hasOnline(p) ? t.vt_on : t.vt_in) + '</dd></dl><p class="muted" style="margin-top:14px;font-size:.92rem">' + t.p_ver_note + '</p><p style="margin-top:10px"><button class="linkbtn" type="button" data-act="report" data-p="' + p.id + '">' + t.p_report + "</button></p></div>" +
      '<div class="sect"><h2>' + t.p_loc + '</h2><div id="map" class="map small" role="region" aria-label="' + t.p_loc + '"></div><p class="fine" style="margin-top:8px">' + t.map_note + "</p></div></div>" +
      '<aside class="stick"><h2>' + t.p_book + "</h2>" + seg + (nf ? '<div class="nextfree" style="margin-bottom:12px">' + t.next_free + ": <b>" + whenTxt(nf.d, nf.t) + "</b></div>" : "") + calHTML(p, mode) + "</aside></div></div>";
  }

  /* ---------------- my visits ---------------- */
  function visitRow(b, map) {
    var t = L(), p = byId(b.p), d = fromIso(b.d), st = bookingStatus(b, map), up = st !== "cancelled" && st !== "done" && st !== "noshow" && at(d, b.t) > Date.now();
    var acts = up ? '<button class="btn ghost sm" type="button" data-act="move" data-bid="' + b.id + '">' + t.v_move + '</button><button class="btn ghost sm" type="button" data-act="askcancel" data-bid="' + b.id + '">' + t.v_cancel + "</button>" + (b.m === "on" ? '<button class="btn sm" type="button" data-act="room" data-bid="' + b.id + '">' + ic("video") + t.v_join + "</button>" : "") : "";
    var ask = cancelAsk === b.id ? '<div class="confirm-row"><b>' + t.v_cancel_q + '</b><button class="btn danger sm" type="button" data-act="docancel" data-bid="' + b.id + '">' + t.v_yes_cancel + '</button><button class="btn ghost sm" type="button" data-act="keep">' + t.v_keep + "</button></div>" : "";
    var sub = esc(pname(p)) + " · " + b.t + (b.m === "on" ? " · " + t.mode_on : "") + (b.by ? "<br>" + esc(t.v_for(b.name)) + " · " + t.v_assist_b : "");
    return '<div class="visit' + (up ? "" : " past") + '"><div class="date"><span>' + fmt(d, { weekday: "short" }) + "</span><b>" + d.getDate() + "</b><span>" + fmt(d, { month: "short" }) + '</span></div><div><h3>' + t.sv[b.k] + " " + badgeSt(st) + '</h3><div class="muted" style="font-size:.92rem">' + sub + '</div></div><div class="acts">' + acts + "</div>" + ask + "</div>";
  }
  function viewVisits() {
    var t = L(), map = stMap(), list = bookings().slice().sort(function (a, b) { return (a.d + a.t) < (b.d + b.t) ? -1 : 1; });
    var up = list.filter(function (b) { var s = bookingStatus(b, map); return s !== "cancelled" && s !== "done" && s !== "noshow" && at(fromIso(b.d), b.t) > Date.now(); });
    var past = list.filter(function (b) { return up.indexOf(b) < 0; }).reverse();
    var smp = ' <span class="sample">' + t.sample + "</span>";
    var body = (up.length ? '<div class="subh">' + t.v_up + smp + '</div><div class="visits">' + up.map(function (b) { return visitRow(b, map); }).join("") + "</div>" : "") + (past.length ? '<div class="subh">' + t.v_past + smp + '</div><div class="visits">' + past.map(function (b) { return visitRow(b, map); }).join("") + "</div>" : "");
    var mu = me(), mine = consults().filter(function (c) { return !c.userId || (mu && mu.id === c.userId); }).sort(function (a, b) { return b.at - a.at; });
    var aps = apSort(appts().filter(function (a) { return mu ? a.userId === mu.id : !a.userId; }));
    markSeen(aps.map(function (a) { return [a.id, apKey(a)]; }));
    var tip = BE && mu && !mu.tgLinked && BE.notify().tg && aps.length ? '<div class="note-box" style="margin-top:14px">' + t.nt_tip + ' <button class="btn sm" type="button" data-act="tglink" style="margin-left:6px">' + ic("chat") + t.nt_link + "</button>" + (NT_WAIT ? '<p class="fine" style="margin:8px 0 0">' + t.nt_wait + "</p>" : "") + "</div>" : "";
    body = '<div class="sechead" style="margin-top:8px"><div class="subh" style="margin:18px 0 4px">' + t.ap_mine_h + '</div><a class="btn ghost sm" href="#/find">' + ic("hosp") + t.ap_find + "</a></div>" + tip + (aps.length ? '<div class="visits">' + aps.map(function (a) { return apRow(a, false); }).join("") + "</div>" : '<p class="muted">' + t.ap_none + "</p>") +
      '<div class="sechead" style="margin-top:8px"><div class="subh" style="margin:28px 0 4px">' + t.cs_mine_h + '</div><a class="btn ghost sm" href="#/consult">' + ic("plus") + t.cs_new_btn + "</a></div>" + (mine.length ? '<div class="visits">' + mine.map(csRow).join("") + "</div>" : '<p class="muted">' + t.cs_none + "</p>") + body;
    return '<div class="wrap pad" style="max-width:900px"><div class="sechead"><div><h1 style="font-size:clamp(1.8rem,1.4rem + 2vw,2.6rem)">' + t.v_h + '</h1><p class="lead">' + t.ap_visits_p + "</p></div></div>" + body + "</div>";
  }

  /* ---------------- for clinics ---------------- */
  function viewClinics() {
    var t = L();
    return '<div class="band deep"><div class="wrap hero" style="grid-template-columns:minmax(0,1fr)"><div><div class="eyebrow">' + t.pro_eye + "</div><h1>" + t.pro_h + '</h1><p class="sub">' + t.pro_p + '</p><p style="margin-top:26px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn light big" href="#/dashboard">' + t.d_open + '</a><button class="btn ghost big" style="color:var(--deep-ink);border-color:var(--deep-line)" type="button" data-scroll="join">' + t.pro_b + "</button></p></div></div></div>" +
      '<div class="wrap pad"><div class="tools">' + t.tl_h.map(function (h, i) { return '<div class="tool"><div class="icobox">' + ic(["cal", "tag", "bell", "home", "check", "shield"][i]) + "</div><h3>" + h + "</h3><p>" + t.tl_p[i] + "</p></div>"; }).join("") + "</div></div>" +
      '<div class="wrap" style="padding-bottom:clamp(48px,7vw,96px)"><div class="cta-band"><div><h2>' + t.d_open + "</h2><p>" + t.d_open_p + '</p></div><div class="btns"><a class="btn light big" href="#/dashboard">' + t.nav_dash + " →</a></div></div></div>" +
      '<div class="band alt"><div class="wrap pad split"><div><h2>' + t.ob_h + "</h2>" + steps([t.ob_hh, t.ob_p]) + '</div><div class="box"><h3>' + t.trust_h + '</h3><ul class="list">' + t.trust.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div></div></div>" +
      '<div class="wrap pad split"><div><span class="soon">' + t.vil_tag + "</span><h2>" + t.vil_h + '</h2></div><div><p class="lead" style="margin-top:0">' + t.vil_p + '</p><p style="margin-top:18px"><a class="btn ghost" href="#/assist">' + ic("home") + t.as_cta + "</a></p></div></div>" +
      '<div class="band alt"><div class="wrap pad join" id="join">' + joinIntro() + joinForm("clinic") + "</div></div>";
  }

  /* ---------------- clinic workspace ---------------- */
  function defaultSt(d, t, h) { return at(d, t) < Date.now() ? (h % 11 === 0 ? "noshow" : "done") : (h % 3 === 0 ? "confirmed" : "booked"); }
  function agenda(p, d, map) {
    var out = [], di = iso(d); map = map || stMap();
    if (d.getDay() !== 0) ["in", "on"].forEach(function (mode) {
      var svs = svcsFor(p, mode); if (!svs.length) return;
      (mode === "on" ? (p.onTimes || []) : p.times).forEach(function (t) {
        if (!sampleTaken(p, d, t, mode)) return;
        var h = hash(p.id + di + t + mode);
        out.push({ key: p.id + "|" + di + "|" + t + "|" + mode, t: t, mode: mode, k: svs[h % svs.length].k, who: L().d_sample_pt(1000 + h % 9000), st: defaultSt(d, t, h), d: d });
      });
    });
    bookings().forEach(function (b) { if (b.p === p.id && b.d === di) out.push({ key: "b" + b.id, bid: b.id, t: b.t, mode: b.m, k: b.k, who: b.name, phone: b.phone, by: b.by, st: "booked", cancelled: b.st === "cancelled", d: d }); });
    out.forEach(function (a) { var o = map[a.key]; if (o) { a.st = o.st || a.st; a.out = o.out; a.sum = o.sum; } if (a.cancelled) a.st = "cancelled"; });
    return out.sort(function (a, b) { return a.t < b.t ? -1 : 1; });
  }
  function setStatus(key, st, extra) { var m = stMap(); m[key] = Object.assign({}, m[key] || {}, { st: st }, extra || {}); store.set(K.status, m); }
  var maskPhone = function (ph) { var d = String(ph || "").replace(/\D/g, ""); return d.length > 4 ? "•••• " + d.slice(-4) : ""; };
  function apptRow(a) {
    var t = L(), past = at(a.d, a.t) < Date.now(), acts = "", k = ' data-key="' + esc(a.key) + '"';
    if (a.st === "booked") acts += '<button class="btn ghost sm" type="button" data-ag="confirm"' + k + ">" + t.a_confirm + "</button>";
    if (a.st === "booked" || a.st === "confirmed") {
      acts += a.mode === "on" ? '<button class="btn sm" type="button" data-ag="start"' + k + ">" + ic("video") + t.a_start + "</button>" : '<button class="btn ghost sm" type="button" data-ag="done"' + k + ">" + t.a_done + "</button>";
      if (past || a.mode !== "on") acts += '<button class="btn ghost sm" type="button" data-ag="noshow"' + k + ">" + t.a_noshow + "</button>";
    }
    if (a.st === "done" || a.st === "noshow") acts += '<button class="linkbtn" type="button" data-ag="undo"' + k + ">" + t.a_undo + "</button>";
    var sub = t.sv[a.k] + (a.mode === "on" ? " · " + t.mode_on : "") + (a.phone ? " · " + maskPhone(a.phone) : "") + (a.by ? " · " + t.v_assist_b : "") + (a.out != null ? " · " + t.on_out[a.out] : "");
    return '<div class="appt"><div class="tm">' + a.t + '</div><div class="who2"><b>' + esc(a.who) + " " + badgeSt(a.st) + "</b><span>" + sub + '</span></div><div class="acts">' + acts + "</div></div>";
  }
  function viewDashboard() {
    var t = L(), p = byId(DS.pid), map = stMap(), c = confOf(p);
    var next7 = 0, today = 0, ns = 0, pastN = 0;
    for (var i = -6; i <= 6; i++) agenda(p, dayAt(i), map).forEach(function (a) {
      if (i >= 0 && a.st !== "cancelled") { next7++; if (i === 0) today++; }
      if (i <= 0 && at(a.d, a.t) < Date.now() && (a.st === "done" || a.st === "noshow")) { pastN++; if (a.st === "noshow") ns++; }
    });
    var kpi = function (label, value, small) { return '<div class="kpi"><span>' + label + '</span><b>' + value + "</b>" + (small ? "<small>" + small + "</small>" : "") + "</div>"; };
    var tabs = ""; for (var j = 0; j < 7; j++) { var d = dayAt(j); tabs += '<button type="button" data-day="' + j + '" aria-pressed="' + (DS.day === j) + '"><span>' + (j === 0 ? t.today : fmt(d, { weekday: "short" })) + "</span><b>" + d.getDate() + "</b></button>"; }
    var list = agenda(p, dayAt(DS.day), map);
    var prices = p.svc.map(function (s) { return "<tr><td>" + t.sv[s.k] + (s.o ? ' <span class="badge plain">' + t.online_b + "</span>" : "") + '</td><td class="n">' + (s.c ? '<span class="badge">' + t.cov + "</span>" : '<input class="pinput" type="number" min="0" step="1000" inputmode="numeric" id="pr-' + s.k + '" value="' + priceOf(p, s) + '" aria-label="' + esc(t.sv[s.k]) + '">') + "</td></tr>"; }).join("");
    var reps = store.get(K.reports, []).filter(function (r) { return r.p === p.id && r.open; });
    return '<div class="wrap"><div class="dtop"><div><div class="eyebrow">' + t.nav_dash + "</div><h1>" + esc(pname(p)) + '</h1></div><div class="ctl"><label class="muted" for="dsel">' + t.d_as + '</label><select id="dsel">' + P.map(function (x) { return '<option value="' + x.id + '"' + (x.id === p.id ? " selected" : "") + ">" + esc(pname(x)) + "</option>"; }).join("") + '</select><button class="btn ghost sm" type="button" data-act="reset">' + t.d_reset + '</button></div></div><div class="demo" style="margin:0 0 16px">' + t.d_demo + "</div>" +
      '<div class="kpis">' + kpi(t.d_k[0], next7) + kpi(t.d_k[1], today) + kpi(t.d_k[2], ns, pastN ? Math.round(ns / pastN * 100) + "% · " + ns + "/" + pastN : "") + kpi(t.d_k[3], confDate(p), t.conf_ago(c)) + "</div>" +
      '<div class="fresh' + (c <= 7 ? " ok" : "") + '"><div><b>' + (c <= 7 ? t.d_fresh_ok : t.d_fresh_h) + "</b>" + (c <= 7 ? "" : '<div class="muted" style="font-size:.92rem">' + t.d_fresh_p(c) + "</div>") + "</div>" + (c > 7 ? '<button class="btn sm" type="button" data-act="confirmcal">' + t.d_confirm + "</button>" : "") + "</div>" +
      '<div class="dgrid"><div class="dcard"><h2>' + t.d_agenda + '</h2><div class="daytabs" role="group">' + tabs + "</div>" + (list.length ? list.map(apptRow).join("") : '<div class="empty">' + t.d_none + "</div>") + "</div>" +
      '<div><div class="dcard"><h2>' + t.d_prices + '</h2><p class="muted" style="font-size:.92rem;margin-bottom:14px">' + t.d_prices_p + '</p><form id="priceform" novalidate><div class="tablewrap"><table><tbody>' + prices + '</tbody></table></div><div class="err" id="pr-err"></div><button class="btn block" type="submit">' + t.d_save + "</button></form></div>" +
      '<div class="dcard"><h2>' + t.d_reports + "</h2>" + (reps.length ? reps.map(function (r) { return '<div class="report"><div><b>' + t.rp_opts[r.why] + '</b><div class="muted" style="font-size:.88rem">' + esc(r.note || "") + (r.note ? " · " : "") + fmt(new Date(r.at), { day: "numeric", month: "short" }) + '</div></div><button class="btn ghost sm" type="button" data-act="fix" data-rid="' + r.id + '">' + t.d_fix + "</button></div>"; }).join("") : '<p class="muted">' + t.d_no_reports + "</p>") + "</div></div></div></div>";
  }

  /* ---------------- village assist ---------------- */
  function viewAssist() {
    var t = L(), f = AS.f, sp = Object.keys(t.sp), body;
    var stepper = '<div class="astep">' + t.as_s.map(function (s, i) { var n = i + 1; return '<div class="' + (AS.step === n ? "on" : AS.step > n ? "done" : "") + '"><b>' + t.step(n, 3) + "</b>" + s + "</div>"; }).join("") + "</div>";
    if (AS.done) {
      var b = AS.done, p = byId(b.p);
      body = '<div class="box" style="max-width:620px"><div class="done-ico">' + ic("check") + "</div><h2>" + t.as_done + '</h2><div class="msg"><b>' + t.sms_who + "</b>" + esc(t.as_sms(t.sv[b.k], pname(p), whenTxt(fromIso(b.d), b.t))) + '</div><p style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="button" data-act="as-reset">' + t.as_another + '</button><a class="btn ghost" href="#/visits">' + t.nav_visits + "</a></p></div>";
    } else if (AS.step === 1) {
      var fl = function (id, label, type, val) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '"' + (type === "tel" ? ' inputmode="tel"' : "") + ' autocomplete="off" value="' + esc(val || "") + '"></div>'; };
      body = '<form class="form" id="asform1" novalidate style="max-width:720px"><div class="aform">' + fl("as-name", t.as_pname, "text", f.name) + fl("as-phone", t.as_pphone, "tel", f.phone) + fl("as-village", t.as_village, "text", f.village) +
        '<div class="fld"><label for="as-sp">' + t.as_need + '</label><select id="as-sp">' + sp.map(function (k) { return '<option value="' + k + '"' + (f.sp === k ? " selected" : "") + ">" + t.sp[k] + "</option>"; }).join("") + "</select></div>" + fl("as-helper", t.as_helper, "text", f.helper) +
        '</div><div class="err" id="as-err"></div><button class="btn" type="submit">' + t.as_next + " →</button></form>";
    } else if (AS.step === 2) {
      var list = P.filter(function (p) { return p.sp === f.sp && confOf(p) <= 14 && svcsFor(p, "in").length; });
      body = '<p class="muted" style="margin-bottom:12px">' + esc(f.name) + " · " + t.sp[f.sp] + '</p><div class="results" style="padding-bottom:0">' + (list.length ? list.map(function (p) { var nf = nextFree(p, "in"); return '<article class="rcard"><div class="info"><div class="who">' + avatar(p) + "<div><h3>" + esc(pname(p)) + '</h3><div class="spec">' + t.sp[p.sp] + " · " + t.ar[p.area] + "</div></div></div>" + confLine(p) + '<div class="nextfree">' + (nf ? t.next_free + ": <b>" + whenTxt(nf.d, nf.t) + "</b>" : t.none_free) + '</div></div><div class="cal"><div class="calmeta"><span>' + t.as_pick + "</span></div>" + calHTML(p, "in", "assist") + "</div></article>"; }).join("") : '<div class="empty">' + t.none_free + "</div>") +
        '</div><p style="margin-top:18px"><button class="btn ghost" type="button" data-act="as-back">← ' + t.as_back + "</button></p>";
    } else {
      var pk = AS.pick, pp = byId(pk.p), svs = svcsFor(pp, "in");
      body = '<form class="form" id="asform3" novalidate style="max-width:620px"><div class="sum" style="margin-top:0"><span class="muted">' + t.as_s[0] + "</span><b>" + esc(f.name) + " · " + esc(f.phone) + (f.village ? " · " + esc(f.village) : "") + '</b><span class="muted" style="margin-top:6px">' + t.bk_where + "</span><b>" + esc(pname(pp)) + ", " + t.ar[pp.area] + '</b><span class="muted" style="margin-top:6px">' + t.bk_when + "</span><b>" + whenTxt(fromIso(pk.d), pk.t) + "</b></div>" +
        '<div class="fld"><label for="as-svc">' + t.bk_service + '</label><select id="as-svc">' + svs.map(function (s) { return '<option value="' + s.k + '">' + t.sv[s.k] + " · " + priceTxt(pp, s) + "</option>"; }).join("") + '</select></div><div class="err" id="as-err3"></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="submit">' + t.as_book + '</button><button class="btn ghost" type="button" data-act="as-back">← ' + t.as_back + "</button></div></form>";
    }
    return '<div class="band deep"><div class="wrap bhead"><span class="soon" style="background:rgba(255,255,255,.14);color:var(--deep-ink)">' + t.vil_tag + "</span><h1>" + t.as_h + '</h1><p class="sub">' + t.as_p + '</p></div></div><div class="wrap pad" style="padding-top:28px"><div class="demo" style="margin:0 0 20px;max-width:720px">' + t.as_preview + "</div>" + (AS.done ? "" : stepper) + body + "</div>";
  }

  /* ---------------- map ---------------- */
  var CENTER = [40.3842, 71.7843];
  function destroyMap() { if (mapInst) { mapInst.remove(); mapInst = null; } markers = {}; }
  function popupHTML(r) {
    var t = L(), p = r.p, h = "<b>" + esc(pname(p)) + "</b><br>" + t.sp[p.sp] + " · " + t.ar[p.area];
    if (r.lead) h += "<br>" + t.sv[r.lead.k] + ": " + priceTxt(p, r.lead);
    if (r.nf) h += "<br>" + t.next_free + ": " + whenTxt(r.nf.d, r.nf.t);
    if (!r.solo) h += '<br><a href="#/p/' + p.id + (r.mode === "on" ? "?m=on" : "") + '">' + t.view + "</a>";
    return h;
  }
  function pinOn(id, on) { var m = markers[id], el = m && m.getElement(); if (el) { var pin = el.querySelector(".pin"); if (pin) pin.classList.toggle("on", on); } if (m) m.setZIndexOffset(on ? 1000 : 0); }
  /* a map with its zoom buttons in the site's language (Leaflet's own are English) */
  function newMap(LF, el) {
    var t = L(), m = LF.map(el, { scrollWheelZoom: false, dragging: !LF.Browser.mobile, tap: false, zoomControl: false });
    LF.control.zoom({ zoomInTitle: t.map_zin, zoomOutTitle: t.map_zout }).addTo(m);
    m.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    LF.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(m);
    return m;
  }
  function initMap(items) {
    var el = $("map"); if (!el) return;
    var LF = window.L; if (!LF || !LF.map) { el.innerHTML = '<div class="empty" style="margin:12px">' + L().map_off + "</div>"; return; }
    mapInst = newMap(LF, el).setView(CENTER, 13);
    var pts = [];
    items.forEach(function (r) {
      var p = r.p, icon = LF.divIcon({ className: "pin-wrap", html: '<div class="pin"><span>' + p.ch + "</span></div>", iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -30] });
      var m = LF.marker([p.lat, p.lng], { icon: icon, title: pname(p), keyboard: true }).addTo(mapInst).bindPopup(popupHTML(r));
      m.on("click", function () { var c = document.querySelector('.rcard[data-id="' + p.id + '"]'); if (c) { c.scrollIntoView({ block: "nearest", behavior: "smooth" }); c.classList.add("hl"); setTimeout(function () { c.classList.remove("hl"); }, 1600); } });
      markers[p.id] = m; pts.push([p.lat, p.lng]);
    });
    if (pts.length > 1) mapInst.fitBounds(pts, { padding: [40, 40], maxZoom: 15 }); else if (pts.length === 1) mapInst.setView(pts[0], 15);
  }


  /* ---------------- state clinic directory (OpenStreetMap data) ---------------- */
  var DATA = window.SHIFOKOR_DATA || { r: [], d: [], c: [] };
  var REG = DATA.r.map(function (r, i) { return { i: i, code: r[0], en: r[1], uz: r[2], ru: r[3] }; });
  var DIS = DATA.d.map(function (d, i) { return { i: i, code: d[0], r: d[1], en: d[2], uz: d[3], ru: d[4], city: !!d[5], lat: d[6], lng: d[7] }; });
  var FAC = DATA.c.map(function (c) { return { key: c[0], name: c[1], cat: c[2], own: c[3], lat: c[4], lng: c[5], d: c[6], hours: c[7], street: c[8], town: c[9] }; });
  var facByKey = {}, regByCode = {}, disByCode = {};
  FAC.forEach(function (f) { facByKey[f.key] = f; });
  REG.forEach(function (r) { regByCode[r.code] = r; });
  DIS.forEach(function (d) { disByCode[d.code] = d; });
  var STATE_N = FAC.filter(function (f) { return f.own === "s"; }).length;
  var CAT_ORDER = ["fdp", "fpc", "polyclinic", "district", "hospital", "children", "maternity", "emergency", "special", "clinic"];
  var CAT_IC = { fdp: "home", fpc: "heart", polyclinic: "hosp", district: "hosp", hospital: "hosp", children: "heart", maternity: "heart", emergency: "siren", special: "flask", clinic: "shield" };
  var nmL = function (o) { return o ? (o[lang] || o.en) : ""; };
  var POS = null; try { POS = JSON.parse(sessionStorage.getItem("shifokor-pos")); } catch (e) {}
  var DIRN = { q: "", n: 40 };
  function distKm(a, b, c, d) { var R = 6371, r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r, h = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(a * r) * Math.cos(c * r) * Math.sin(y / 2) * Math.sin(y / 2); return 2 * R * Math.asin(Math.sqrt(h)); }
  function facName(f) { return f.name || L().cat[f.cat] + " · " + nmL(DIS[f.d]); }
  function placeOf(f) { var d = DIS[f.d]; return nmL(d) + ", " + nmL(REG[d.r]); }
  function dirLinks(f) { return { y: "https://yandex.uz/maps/?rtext=~" + f.lat + "," + f.lng + "&rtt=auto", g: "https://www.google.com/maps/dir/?api=1&destination=" + f.lat + "," + f.lng }; }
  function regionTiles() {
    var t = L();
    return REG.map(function (r) {
      var ds = DIS.filter(function (d) { return d.r === r.i; }).length, sc = FAC.filter(function (f) { return f.own === "s" && DIS[f.d].r === r.i; }).length;
      return '<a class="tile" href="#/find?' + qs({ r: r.code }) + '"><b>' + esc(nmL(r)) + "</b><span>" + t.reg_line(sc, ds) + "</span></a>";
    }).join("");
  }
  function districtOptions(rcode, dcode) {
    var t = L(), r = regByCode[rcode];
    return '<option value="">' + t.all_districts + "</option>" + (r ? DIS.filter(function (d) { return d.r === r.i; }).sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (d) { return '<option value="' + d.code + '"' + (d.code === dcode ? " selected" : "") + ">" + esc(nmL(d)) + (d.city ? "" : " · " + t.village.toLowerCase()) + "</option>"; }).join("") : "");
  }
  function dirForm(q) {
    var t = L(), simple = !!q.simple;
    return '<form class="sform dform" id="dform" role="search"><div class="seg" id="downs" role="group" aria-label="' + esc(t.f_own) + '">' + ["s", "p", "all"].map(function (o) { return '<button type="button" data-ownsel="' + o + '" aria-pressed="' + ((q.o || "s") === o) + '">' + ic(o === "s" ? "shield" : o === "p" ? "tag" : "check") + t.own_f[o] + "</button>"; }).join("") + '</div><div class="' + (simple ? "srow3" : "srow4") + '">' +
      '<div class="sf"><label for="dr">' + t.f_region + '</label><select id="dr"><option value="">' + t.all_regions + "</option>" + REG.slice().sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (r) { return '<option value="' + r.code + '"' + (q.r === r.code ? " selected" : "") + ">" + esc(nmL(r)) + "</option>"; }).join("") + "</select></div>" +
      '<div class="sf"><label for="dd">' + t.f_district + '</label><select id="dd">' + districtOptions(q.r, q.d) + "</select></div>" +
      (simple ? "" : '<div class="sf"><label for="dt">' + t.f_type + '</label><select id="dt"><option value="">' + t.all_types + "</option>" + CAT_ORDER.map(function (c) { return '<option value="' + c + '"' + (q.t === c ? " selected" : "") + ">" + t.cat[c] + "</option>"; }).join("") + "</select></div>") +
      '<button class="btn big" type="submit">' + ic("search") + t.s_go + "</button></div>" +
      (simple ? '<button type="button" class="btn ghost near nearbig" data-act="near">' + ic("nav") + t.near_btn + "</button>"
        : '<div class="srow-b"><div class="sf grow"><label for="dq">' + t.f_name + '</label><input id="dq" autocomplete="off" placeholder="' + esc(t.f_name_ph) + '" value="' + esc(q.q || "") + '"></div><button type="button" class="btn ghost near" data-act="near">' + ic("nav") + t.near_btn + "</button></div>") +
      '<p class="near-msg" id="nearmsg" aria-live="polite"></p></form>';
  }
  function dirSearch(q) {
    var own = q.o || "s", r = regByCode[q.r], d = disByCode[q.d], text = (q.q || "").trim().toLowerCase(), near = q.near && POS;
    var list = FAC.filter(function (f) {
      if (own !== "all" && f.own !== own) return false;
      if (r && DIS[f.d].r !== r.i) return false;
      if (d && f.d !== d.i) return false;
      if (q.t && f.cat !== q.t) return false;
      if (text && (facName(f) + " " + placeOf(f) + " " + f.town + " " + f.street).toLowerCase().indexOf(text) < 0) return false;
      return true;
    });
    list.forEach(function (f) { f.km = POS ? distKm(POS.lat, POS.lng, f.lat, f.lng) : null; });
    if (near) list.sort(function (a, b) { return a.km - b.km; });
    else list.sort(function (a, b) { return (DIS[a.d].city - DIS[b.d].city) || (CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat)) || nmL(DIS[a.d]).localeCompare(nmL(DIS[b.d])) || facName(a).localeCompare(facName(b)); });
    var fallback = null;
    if (!list.length && d) {
      fallback = FAC.filter(function (f) { return f.own === "s"; }).map(function (f) { f.km = distKm(d.lat, d.lng, f.lat, f.lng); return f; }).sort(function (a, b) { return a.km - b.km; }).slice(0, 8);
    }
    return { list: list, fallback: fallback };
  }
  function ownBadge(f) { var t = L(); return '<span class="badge ' + (f.own === "s" ? "ok" : f.own === "p" ? "plain" : "warn") + '">' + t.own[f.own] + "</span>"; }
  function facCard(f) {
    var t = L(), dl = dirLinks(f), dd = DIS[f.d];
    return '<article class="fcard" data-key="' + f.key + '"><div class="ficon c-' + f.cat + '">' + ic(CAT_IC[f.cat]) + '</div><div class="fmain"><h3><a href="#/f/' + f.key + '">' + esc(facName(f)) + '</a></h3><div class="spec">' + t.cat[f.cat] + '</div><div class="badges">' + ownBadge(f) + '<span class="badge plain">' + (dd.city ? t.city : t.village) + "</span>" + (clinicForFac(f.key) ? '<span class="badge ok">' + ic("cal") + t.ap_h + "</span>" : "") + (f.km != null && f.km < 500 ? '<span class="badge">' + t.km(f.km < 10 ? f.km.toFixed(1) : Math.round(f.km)) + "</span>" : "") + '</div><div class="meta">' + ic("pin") + esc(placeOf(f)) + '</div></div><div class="facts"><a class="btn sm" href="' + dl.y + '" target="_blank" rel="noopener">' + ic("nav") + t.fac_dir + '</a><a class="btn ghost sm" href="#/f/' + f.key + '">' + t.view + "</a></div></article>";
  }
  function viewFind(q) {
    var t = L(), key = JSON.stringify(q), out = dirSearch(q), list = out.list, own = q.o || "s";
    if (q.near && !POS) setTimeout(askLocation, 0);
    if (DIRN.q !== key) { DIRN.q = key; DIRN.n = 40; }
    var shown = (out.fallback || list).slice(0, DIRN.n);
    pendingMap = { fac: out.fallback || list };
    var title = q.d && disByCode[q.d] ? nmL(disByCode[q.d]) : q.r && regByCode[q.r] ? nmL(regByCode[q.r]) : q.near ? t.nav_near : "";
    return       '<div class="band deep searchbar"><div class="wrap">' + dirForm(q) + "</div></div>" +
      '<div class="wrap"><div class="filters"><button class="btn ghost sm" type="button" data-act="missing">' + ic("plus") + t.add_missing + "</button></div>" +
      '<div class="rhead"><h1>' + (title ? esc(title) + " · " : "") + t.d_count(list.length) + "</h1></div><p class=\"rnote\">" + (q.near && POS ? t.near_on + " · " : "") + t.src_note + "</p>" +
      (out.fallback ? '<div class="note-box">' + t.empty_dist + "</div>" : "") +
      '<div class="rlayout"><div class="results">' + (shown.length ? shown.map(facCard).join("") : '<div class="empty">' + t.r_none + "</div>") +
      ((out.fallback || list).length > shown.length ? '<button class="btn ghost block" type="button" data-act="dirmore">' + t.more_btn + " (" + ((out.fallback || list).length - shown.length) + ")</button>" : "") + "</div>" +
      '<aside class="mapcol"><button class="btn ghost sm mapbtn" type="button" data-act="togglemap" aria-expanded="' + mapOn + '">' + (mapOn ? t.map_hide : t.map_show) + '</button><div id="map" class="map' + (mapOn ? "" : " off") + '" role="region" aria-label="' + t.p_loc + '"></div><p class="fine">' + t.fac_src + "</p></aside></div></div>";
  }
  function viewFacility(key) {
    var t = L(), f = facByKey[key]; if (!f) return viewFind({});
    var dl = dirLinks(f), dd = DIS[f.d], coords = f.lat.toFixed(5) + ", " + f.lng.toFixed(5);
    pendingMap = { fac: [f], single: true };
    var row = function (k, v) { return "<dt>" + k + "</dt><dd>" + v + "</dd>"; }, none = '<span class="muted">' + t.fac_none + "</span>";
    var fc = clinicForFac(f.key);
    return       '<div class="wrap"><a class="back" href="#/find?' + qs({ r: REG[dd.r].code, d: dd.code }) + '">‹ ' + esc(nmL(dd)) + '</a><div class="pf"><div><div class="who"><div class="ficon big c-' + f.cat + '">' + ic(CAT_IC[f.cat]) + "</div><div><h1>" + esc(facName(f)) + '</h1><div class="spec">' + t.cat[f.cat] + '</div><div class="badges">' + ownBadge(f) + '<span class="badge plain">' + (dd.city ? t.city : t.village) + "</span></div></div></div>" +
      '<div class="sect"><dl class="kv">' + row(t.fac_where, esc(placeOf(f))) + row(t.fac_addr, f.street || f.town ? esc([f.street, f.town].filter(Boolean).join(", ")) : none) + row(t.fac_hours, f.hours ? esc(f.hours) : none) + row(t.fac_phone, none) + row(t.fac_own, t.own[f.own] + ' <span class="muted">· ' + t.fac_own_note + "</span>") +
      row(t.fac_coords, '<span class="nums">' + coords + '</span> <button class="linkbtn" type="button" data-act="copycoords" data-c="' + coords + '">' + t.copy + "</button>") + '</dl><p style="margin-top:12px"><button class="linkbtn" type="button" data-act="wrong" data-key="' + f.key + '">' + t.fac_wrong + "</button></p></div>" +
      (fc ? apForm(fc, f.key) : apClosed()) +
      (function () { var c = clinicForFac(f.key), ds = c ? doctorsAt(c) : users().filter(function (u) { return u.role === "doctor" && (u.profile.work || []).some(function (w) { return w.t === "f" && w.key === f.key; }); });
        if (!c) return ds.length ? '<div class="sect"><h2 style="font-size:1.2rem;margin:0 0 10px">' + t.c_docs_h + '</h2><div class="results" style="padding:0">' + ds.map(function (d) { return docCard(d, c); }).join("") + "</div></div>" : ""; return '<div class="sect"><div class="note-box ok-box"><b>' + t.reg_note + '</b><div style="margin-top:10px"><a class="btn sm" href="#/c/' + c.id + '">' + t.see_profile + "</a></div></div>" + (ds.length ? '<h2 style="font-size:1.2rem;margin:18px 0 10px">' + t.c_docs_h + '</h2><div class="results" style="padding:0">' + ds.map(function (d) { return docCard(d, c); }).join("") + "</div>" : "") + "</div>"; })() +
      '<div class="sect box"><h3>' + t.rural_h + "</h3><p>" + t.rural_p + "</p></div>" +
      '<p class="fine" style="margin-top:22px">' + t.fac_src + "</p></div>" +
      '<aside class="stick"><h2>' + t.fac_map + '</h2><div id="map" class="map small" role="region" aria-label="' + t.p_loc + '"></div><div class="stack" style="margin-top:12px">' + (fc ? '<a class="btn block" href="#book" data-scroll="book">' + ic("cal") + t.ap_h + "</a>" : "") + '<a class="btn ' + (fc ? "ghost " : "") + 'block" href="' + dl.y + '" target="_blank" rel="noopener">' + ic("nav") + t.fac_dir_y + '</a><a class="btn ghost block" href="' + dl.g + '" target="_blank" rel="noopener">' + t.fac_dir_g + "</a></div></aside></div></div>";
  }
  function initFacMap(list, single) {
    var el = $("map"); if (!el) return;
    var LF = window.L; if (!LF || !LF.map) { el.innerHTML = '<div class="empty" style="margin:12px">' + L().map_off + "</div>"; return; }
    mapInst = newMap(LF, el).setView([41.3, 64.6], 6);
    var pts = [], t = L();
    list.forEach(function (f) {
      var col = f.own === "s" ? "#0A7F83" : f.own === "p" ? "#7C8B8E" : "#C98A2B";
      var m = LF.circleMarker([f.lat, f.lng], { radius: single ? 10 : 7, color: "#FFFFFF", weight: 2, fillColor: col, fillOpacity: 0.95 }).addTo(mapInst);
      if (!single) m.bindPopup("<b>" + esc(facName(f)) + "</b><br>" + t.cat[f.cat] + "<br>" + esc(placeOf(f)) + '<br><a href="#/f/' + f.key + '">' + t.view + "</a>");
      pts.push([f.lat, f.lng]);
    });
    if (POS && !single) { LF.circleMarker([POS.lat, POS.lng], { radius: 8, color: "#FFFFFF", weight: 3, fillColor: "#E07A5F", fillOpacity: 1 }).addTo(mapInst); }
    if (pts.length > 1) mapInst.fitBounds(pts, { padding: [30, 30], maxZoom: 13 }); else if (pts.length === 1) mapInst.setView(pts[0], 15);
  }
  function askLocation() {
    var msg = $("nearmsg"), t = L(), say = function (x) { if (msg) msg.textContent = x; else toast(x); };
    if (!navigator.geolocation) { say(t.near_err); return; }
    say(t.near_wait);
    navigator.geolocation.getCurrentPosition(function (p) {
      POS = { lat: p.coords.latitude, lng: p.coords.longitude }; try { sessionStorage.setItem("shifokor-pos", JSON.stringify(POS)); } catch (e) {}
      var q = current.path === "/find" ? Object.assign({}, current.q) : {}; q.near = "1"; delete q.r; delete q.d; go("#/find?" + qs(q));
    }, function () {
      if (POS) { var q = current.path === "/find" ? Object.assign({}, current.q) : {}; q.near = "1"; delete q.r; delete q.d; go("#/find?" + qs(q)); } else say(t.near_err);
    }, { timeout: 12000, maximumAge: 600000 });
  }


  /* ---------------- accounts: patients, doctors, clinics (demo, saved in this browser) ---------------- */
  var KU = "shifokor-users", KS = "shifokor-session";
  var users = function () { return store.get(KU, []); };
  var saveUsers = function (l) { store.set(KU, l); };
  /* sample doctors and reviews (samples.js): marked "Namuna", never stored, never bookable */
  var SMP = window.SHIFOKOR_SAMPLES || { d: [], r: [] };
  var withSamples = function () { return users().concat(SMP.d); };
  var userById = function (id) { return withSamples().filter(function (u) { return u.id === id; })[0] || null; };
  /* real doctors first, then samples, each group in the chosen order */
  var realFirst = function (list, how) { return sortDocs(list.filter(function (u) { return !u.sample; }), how).concat(sortDocs(list.filter(function (u) { return u.sample; }), how)); };
  /* up to three services with prices under a doctor's name in lists */
  function svcChips(u) {
    var l = ((u.profile || {}).svc || []).filter(function (x) { return x.name; }), t = L(); if (!l.length) return "";
    return '<ul class="svcchips" aria-label="' + esc(t.svc_h) + '">' + l.slice(0, 3).map(function (x) { return '<li class="svcchip"><span>' + esc(x.name) + "</span>" + (x.price === "" || x.price == null ? "" : '<b class="nums">' + esc(money(+x.price)) + "</b>") + "</li>"; }).join("") + (l.length > 3 ? '<li class="svcmore">+' + (l.length - 3) + "</li>" : "") + "</ul>";
  }
  var smpBadge = function () { return '<span class="sample">' + L().smp_badge + "</span>"; };
  var me = function () { var id = store.get(KS, null); return id ? userById(id) : null; };
  var REGROLE = "patient", ACC = null, ACC_DEL = false;
  var DOC_SP = ["gp", "therapist", "pediatrics", "gyn", "cardio", "neuro", "surgery", "dental", "ent", "eye", "derm", "uro", "endo", "psych", "other"];
  var digits = function (p) { var d = String(p || "").replace(/\D/g, ""); if (d.length === 9) d = "998" + d; return d; };
  var okEmail = function (e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); };
  var okPhone = function (p) { return /^998\d{9}$/.test(digits(p)); };
  var okTg = function (u) { return /^@?[A-Za-z0-9_]{5,32}$/.test(u); };
  var tgName = function (u) { return String(u || "").replace(/^@/, ""); };
  var fmtPhone = function (d) { d = digits(d); return d.length === 12 ? "+" + d.slice(0, 3) + " " + d.slice(3, 5) + " " + d.slice(5, 8) + " " + d.slice(8, 10) + " " + d.slice(10) : d; };
  var initials = function (n) { return String(n || "?").trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join(""); };
  function hashPw(pw, salt) {
    var txt = salt + ":" + pw;
    if (window.crypto && crypto.subtle && window.TextEncoder) return crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return (x < 16 ? "0" : "") + x.toString(16); }).join(""); });
    return Promise.resolve("h" + hash(txt) + "-" + hash(txt.split("").reverse().join("")));
  }
  function findByContact(email, phone, exceptId) {
    var e = (email || "").toLowerCase(), ph = phone ? digits(phone) : "";
    return users().filter(function (u) { return u.id !== exceptId && ((e && u.email === e) || (ph && u.phone === ph)); })[0] || null;
  }
  function checkContact(t, name, email, phone, tg) {
    if (!name) return t.e_name;
    if (!email && !phone) return t.e_contact;
    if (email && !okEmail(email)) return t.e_email;
    if (phone && !okPhone(phone)) return t.e_phone;
    if (tg && !okTg(tg)) return t.e_tg;
    return "";
  }
  function specName(pr) { var t = L(); return pr.spec === "other" ? (pr.spec_other || t.docsp.other) : t.docsp[pr.spec] || ""; }
  function wpLabel(w) { if (w.t === "c") { var c = userById(w.id); return c ? c.name : w.label; } if (w.t === "f") { var f = facByKey[w.key]; return f ? facName(f) : w.label; } return w.label; }
  function wpLink(w) { var label = esc(wpLabel(w)); if (w.t === "c" && userById(w.id)) return '<a href="#/c/' + w.id + '">' + label + "</a>"; if (w.t === "f" && facByKey[w.key]) return '<a href="#/f/' + w.key + '">' + label + "</a>"; return label; }
  function facLabel(f) { return facName(f) + " — " + placeOf(f); }
  function placeOptions(regionCode) {
    var r = regByCode[regionCode], out = users().filter(function (u) { return u.role === "clinic"; }).map(function (u) { return '<option value="' + esc(u.name + " — Shifokor") + '">'; });
    FAC.forEach(function (f) { if (!r || DIS[f.d].r === r.i) out.push('<option value="' + esc(facLabel(f)) + '">'); });
    return out.join("");
  }
  function matchPlace(label) {
    label = String(label || "").trim(); if (!label) return null;
    var c = users().filter(function (u) { return u.role === "clinic" && u.name + " — Shifokor" === label; })[0]; if (c) return { t: "c", id: c.id, label: c.name };
    var f = FAC.filter(function (x) { return facLabel(x) === label; })[0]; if (f) return { t: "f", key: f.key, label: facName(f) };
    return { t: "x", label: label };
  }
  function doctorsAt(clinic) {
    var fac = clinic.profile && clinic.profile.fac, staff = staffOfClinic(clinic.id).map(function (x) { return x.doctorId; });
    return users().filter(function (u) { return u.role === "doctor" && (staff.indexOf(u.id) > -1 || (u.profile.work || []).some(function (w) { return (w.t === "c" && w.id === clinic.id) || (fac && w.t === "f" && w.key === fac); })); });
  }
  function clinicForFac(key) { var l = users().filter(function (u) { return u.role === "clinic" && u.profile && u.profile.fac === key; }); return (BE ? l.filter(function (u) { return u.verified; })[0] : l[0]) || null; }
  var canBook = function (clinic) { return !BE || !!clinic.verified; };
  /* clinics on Shifokor where a patient can book a visit with this doctor: the places on the doctor's profile and the clinics they joined as staff */
  function bookPlaces(u) {
    if (!u || u.sample) return [];
    var out = [], add = function (c) { if (c && c.role === "clinic" && canBook(c) && out.indexOf(c) < 0) out.push(c); };
    ((u.profile || {}).work || []).forEach(function (w) { if (w.t === "c") add(userById(w.id)); else if (w.t === "f") add(clinicForFac(w.key)); });
    clinicsOfDoctor(u.id).forEach(function (x) { add(userById(x.clinicId)); });
    return out;
  }
  var bookHref = function (c, u) { return "#/c/" + c.id + "?" + qs({ doc: u.id }); };
  function vBadge(u) { var t = L(); return u.verified ? '<span class="badge ok">' + ic("shield") + t.vf_yes + "</span>" : '<span class="badge warn">' + t.verified_no + "</span>"; }
  /* a doctor's photo when they added one, otherwise their initials */
  function avatarOf(u, cls) { var c = "pav" + (cls ? " " + cls : ""); return u.photoUrl ? '<img class="' + c + ' pimg" src="' + esc(u.photoUrl) + '" alt="" loading="lazy">' : '<div class="' + c + '" aria-hidden="true">' + esc(initials(u.name)) + "</div>"; }
  function personAv(u) { return avatarOf(u, ""); }

  /* the doctor's and the clinic's details at sign-up: what patients and the checking team need first.
     Everything here can be changed later in the profile; * marks what is needed now. */
  var regSec = function (icon, title, sub, body) { return '<section class="regsec"><div class="regsech"><span class="icobox">' + ic(icon) + "</span><div><h2>" + title + "</h2>" + (sub ? "<p>" + sub + "</p>" : "") + "</div></div>" + body + "</section>"; };
  var regReq = function (s) { return s + ' <span class="req" aria-hidden="true">*</span>'; };
  function regRegion(t, req) {
    return '<div class="two"><div class="fld"><label for="r-region">' + (req ? regReq(t.f_region) : t.f_region) + '</label><select id="r-region"><option value="">—</option>' + REG.slice().sort(function (x, y) { return nmL(x).localeCompare(nmL(y)); }).map(function (r) { return '<option value="' + r.code + '">' + esc(nmL(r)) + "</option>"; }).join("") +
      '</select></div><div class="fld"><label for="r-district">' + t.f_district + '</label><select id="r-district">' + districtOptions("", "") + "</select></div></div>";
  }
  function regExtra(t) {
    var fi = function (id, label, type, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + (type || "text") + '"' + (extra || "") + "></div>"; };
    var ta = function (id, label, ph) { return '<div class="fld"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" maxlength="1500" rows="3" placeholder="' + esc(ph || "") + '"></textarea></div>'; };
    if (REGROLE === "doctor") return regSec("shield", t.rg_d_spec_h, t.rg_d_spec_p,
        '<div class="two"><div class="fld"><label for="r-spec">' + regReq(t.d_spec) + '</label><select id="r-spec"><option value="">—</option>' + DOC_SP.map(function (k) { return '<option value="' + k + '">' + t.docsp[k] + "</option>"; }).join("") + "</select></div>" +
        fi("r-years", regReq(t.d_years), "number", ' min="0" max="70" inputmode="numeric"') + '</div><div class="fld" id="r-spec-o" hidden><label for="r-spec-other">' + t.d_spec_other + '</label><input id="r-spec-other" maxlength="80"></div>' +
        '<div class="two">' + fi("r-lic", t.d_lic, "text", ' maxlength="60" autocomplete="off"') + '<div class="fld"><label for="r-sex">' + t.d_sex + '</label><select id="r-sex">' + [["", "—"], ["f", t.cs_sexes.f], ["m", t.cs_sexes.m]].map(function (o) { return '<option value="' + o[0] + '">' + o[1] + "</option>"; }).join("") + "</select></div></div>") +
      regSec("book", t.sec_bg, t.rg_d_bg_p, ta("r-edu", t.d_edu, t.d_edu_ph).replace('<label for="r-edu">', '<label class="vh" for="r-edu">') +
        '<div class="fld"><span class="flabel">' + t.d_langs + '</span><div class="checks" id="r-langs">' + ["uz", "ru", "en", "kaa", "tg"].map(function (l) { var n = { kaa: "Qaraqalpaq", tg: "Tojik" }[l] || t.lg[l]; return '<label class="mini"><input type="checkbox" value="' + l + '"' + (l === "uz" ? " checked" : "") + ">" + n + "</label>"; }).join("") + "</div></div>") +
      regSec("pin", t.sec_work, t.rg_d_work_p, regRegion(t, true) + '<datalist id="r-placelist">' + placeOptions("") + "</datalist>" + fi("r-work", t.works_at, "text", ' list="r-placelist" maxlength="200" placeholder="' + esc(t.d_work_ph) + '"')) +
      regSec("heart", t.d_bio, t.rg_d_bio_p, ta("r-bio", t.d_bio, t.d_bio_ph));
    if (REGROLE === "clinic") return regSec("hosp", t.sec_clinic, t.rg_c_p,
        '<div class="two"><div class="fld"><label for="r-ctype">' + regReq(t.c_type) + '</label><select id="r-ctype">' + CAT_ORDER.map(function (c) { return '<option value="' + c + '"' + (c === "clinic" ? " selected" : "") + ">" + t.cat[c] + "</option>"; }).join("") + '</select></div><div class="fld"><label for="r-own">' + t.c_own + '</label><select id="r-own">' + ["p", "s"].map(function (o) { return '<option value="' + o + '">' + t.own[o] + "</option>"; }).join("") + "</select></div></div>" +
        fi("r-clic", t.c_lic, "text", ' maxlength="60" autocomplete="off"') + ta("r-about", t.c_about, t.rg_c_about_ph)) +
      regSec("pin", t.sec_loc, t.rg_c_loc_p, regRegion(t, true) + fi("r-addr", regReq(t.c_addr), "text", ' maxlength="300" autocomplete="street-address"') + fi("r-hours", t.c_hours, "text", ' maxlength="120" placeholder="' + esc(t.c_hours_ph) + '"')) +
      regSec("user", t.rg_c_who_h, t.rg_c_who_p, '<div class="two">' + fi("r-contact", t.rg_c_who, "text", ' maxlength="120" autocomplete="name"') + fi("r-crole", t.rg_c_role, "text", ' maxlength="80" placeholder="' + esc(t.rg_c_role_ph) + '"') + "</div>");
    return "";
  }
  /* what was typed in the sign-up form, so switching the role doesn't lose it */
  function regKeep() { var o = {}; all("#regform input, #regform select, #regform textarea").forEach(function (el) { if (!el.id && el.closest("#r-langs")) o["lang:" + el.value] = el.checked; else if (el.id) o[el.id] = el.type === "checkbox" ? el.checked : el.value; }); return o; }
  function regPut(o) {
    if (o["r-region"] && $("r-region")) { $("r-region").value = o["r-region"]; regRegionChanged(); }
    Object.keys(o).forEach(function (k) { if (k.indexOf("lang:") === 0) { var cb = document.querySelector('#r-langs input[value="' + k.slice(5) + '"]'); if (cb) cb.checked = o[k]; return; } var el = $(k); if (el && k !== "r-region") { if (el.type === "checkbox") el.checked = o[k]; else el.value = o[k]; } });
    if ($("r-spec-o")) $("r-spec-o").hidden = $("r-spec").value !== "other";
  }
  function regRegionChanged() { var r = $("r-region").value; if ($("r-district")) $("r-district").innerHTML = districtOptions(r, ""); if ($("r-placelist")) $("r-placelist").innerHTML = placeOptions(r); }
  /* ---------------- "Sign in with Google" (Google Identity Services) ----------------
     Google draws its own button in each #gbtn; pressing it opens Google's window and hands back a signed token, which
     the server checks. data-g on #gbtn says what the token is for: "login", "register" or "link" (account page). */
  var GOOGLE = BE ? String((window.SHIFOKOR_CONFIG || {}).google || "") : "", GSI = null, GMODE = "";
  /* Google's sign-in doesn't open inside Telegram's or Instagram's own browser */
  var inApp = /Telegram|Instagram|FBAN|FBAV|; wv\)/i.test(navigator.userAgent || "");
  function gsiLoad() {
    if (!GSI) GSI = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client?hl=" + (lang === "uz" ? "uz" : lang); s.async = true;   /* without hl the first button follows the browser's language */
      s.onload = function () { try { google.accounts.id.initialize({ client_id: GOOGLE, callback: onGoogle, ux_mode: "popup", auto_select: false, cancel_on_tap_outside: true }); res(); } catch (e) { rej(e); } };
      s.onerror = function () { GSI = null; rej(new Error("gsi")); };
      document.head.appendChild(s);
    });
    return GSI;
  }
  function gsiMount() {
    var box = GOOGLE && $("gbtn"); if (!box) return;
    GMODE = box.dataset.g;
    gsiLoad().then(function () {
      var b = $("gbtn"); if (!b || b.firstChild) return;
      google.accounts.id.renderButton(b, { type: "standard", theme: "outline", size: "large", shape: "pill", text: GMODE === "register" ? "signup_with" : "continue_with", width: Math.min(400, Math.max(220, b.clientWidth || 320)), locale: lang === "uz" ? "uz" : lang });
    }, function () { var b = $("gbtn"); if (b) b.innerHTML = '<p class="fine">' + L().g_unavailable + "</p>"; });
  }
  function gErr(msg, html) { var el = $(GMODE === "register" ? "r-err" : GMODE === "link" ? "g-err" : "l-err"); if (el) { if (html) el.innerHTML = msg; else el.textContent = msg; } else toast(msg); }
  function gMsg(t, x) { return { google_new: t.g_new, google_exists: t.g_exists, google_taken: t.g_taken, google_only: t.g_only, google: t.g_bad, no_google: t.g_unavailable }[x && x.code] || beMsg(t, x); }
  function onGoogle(resp) {
    var t = L(), cred = resp && resp.credential; if (!cred || !BE) return;
    if (GMODE === "link") { BE.googleLink(cred).then(function () { toast(t.g_linked); render(true); }, function (x) { gErr(gMsg(t, x)); }); return; }
    var o = { credential: cred };
    if (GMODE === "register") {
      var rprof = regProfile(), rbad = regCheck(t, rprof);
      if (rbad) { gErr(rbad[0]); $(rbad[1]).focus(); return; }
      var rv = function (x) { return $(x) ? $(x).value.trim() : ""; }, ph = rv("r-phone"), tg = rv("r-tg");
      if (REGROLE === "clinic" && !rv("r-name")) { gErr(t.g_need_clinic); $("r-name").focus(); return; }
      if (ph && !/^998\d{9}$/.test(digits(ph))) { gErr(t.e_phone); $("r-phone").focus(); return; }
      o.role = REGROLE; o.profile = rprof; o.name = rv("r-name"); o.phone = ph ? digits(ph) : ""; o.tg = tg ? "@" + tgName(tg) : "";
    }
    gErr("");
    BE.google(o).then(function () { ACC = null; var mu = me(); toast(t.welcome(mu ? mu.name : "")); go(afterAuth()); },
      function (x) { gErr(x && x.code === "google_new" ? esc(t.g_new) + ' <a href="#/register">' + t.go_reg + "</a>" : esc(gMsg(t, x)), true); });
  }
  /* the button with an "or" line; nothing at all until GOOGLE_CLIENT_ID is set on the server */
  function googleBlock(mode) {
    var t = L(); if (!GOOGLE) return "";
    var btn = '<div class="gsign"><div id="gbtn" data-g="' + mode + '"></div>' + (inApp ? '<p class="fine">' + t.g_inapp + "</p>" : "") + "</div>";
    return mode === "register" ? '<div class="ordiv"><span>' + t.g_or + "</span></div>" + btn + '<p class="fine" style="text-align:center">' + t.g_reg_note + "</p>" : btn + '<div class="ordiv"><span>' + t.g_or + "</span></div>";
  }
  /* account page: add or remove "Sign in with Google" */
  function googleCard(u) {
    var t = L(); if (!GOOGLE || !u.remote) return "";
    var body = u.google ? '<p style="margin:6px 0 10px"><span class="badge ok">' + ic("check") + t.g_on + "</span></p>" + (u.hasPw ? '<button class="btn ghost sm" type="button" data-act="gunlink">' + t.g_unlink + "</button>" : '<p class="fine">' + t.g_only + "</p>")
      : '<p class="muted" style="margin:6px 0 10px">' + t.g_link_p + '</p><div class="gsign"><div id="gbtn" data-g="link"></div></div><div class="err" id="g-err" aria-live="polite"></div>';
    return '<div class="dcard" style="margin-bottom:22px"><h2>' + t.g_h + "</h2>" + body + "</div>";
  }
  function regProfile() {
    var v = function (id) { var el = $(id); return el ? el.value.trim() : ""; };
    if (REGROLE === "doctor") { var w = matchPlace(v("r-work")); return { spec: v("r-spec"), spec_other: v("r-spec") === "other" ? v("r-spec-other") : "", years: v("r-years"), lic: v("r-lic"), sex: v("r-sex"), edu: v("r-edu"), bio: v("r-bio"), region: v("r-region"), district: v("r-district"), langs: all("#r-langs input:checked").map(function (i) { return i.value; }), work: w ? [w] : [] }; }
    if (REGROLE === "clinic") return { ctype: v("r-ctype") || "clinic", own: v("r-own") || "p", lic: v("r-clic"), about: v("r-about"), region: v("r-region"), district: v("r-district"), addr: v("r-addr"), hours: v("r-hours"), contact: v("r-contact"), contact_role: v("r-crole") };
    return {};
  }
  function regCheck(t, p) {
    if (REGROLE === "doctor") { if (!p.spec) return [t.rg_e_spec, "r-spec"]; if (p.years === "" || !(+p.years >= 0 && +p.years <= 70)) return [t.rg_e_years, "r-years"]; if (!p.region) return [t.rg_e_region, "r-region"]; }
    if (REGROLE === "clinic") { if (!p.region) return [t.rg_e_region, "r-region"]; if (!p.addr) return [t.rg_e_addr, "r-addr"]; }
    return null;
  }

  /* ---------------- confirming the email with a 6-digit code ---------------- */
  var VER = { uid: "", at: 0, code: "", off: false, msg: "", busy: false }, VER_T = null;
  /* off until Resend has verified shifokor.com: no reminder, no code page after sign-up (the server side is ready) */
  var EMAIL_CHECK = true;
  var needsEmail = function (u) { return EMAIL_CHECK && !!(u && u.email && !u.emailVerified); };
  function verSend(force) {
    var u = me(), t = L(); if (!needsEmail(u) || VER.busy) return;
    if (!force && VER.uid === u.id) return;
    VER.uid = u.id; VER.msg = "";
    if (!BE) { VER.code = String(Math.floor(Math.random() * 1e6)).padStart(6, "0"); VER.at = Date.now(); return; }
    if (!BE.notify().mail) { VER.off = true; return; }
    VER.busy = true;
    BE.emailCode().then(function () { VER.at = Date.now(); VER.off = false; }, function (x) { var c = x && x.code; if (c === "no_mail") VER.off = true; else if (c === "wait") VER.at = VER.at || Date.now(); else VER.msg = c === "mail" ? t.ev_e_mail : beMsg(t, x); })
      .then(function () { VER.busy = false; if (current.path.indexOf("/account/verify") === 0) render(true); });
  }
  function verTick() {
    clearInterval(VER_T); VER_T = setInterval(function () {
      var b = $("ev-resend"); if (!b) { clearInterval(VER_T); return; }
      var left = Math.ceil((VER.at + 60e3 - Date.now()) / 1000); b.disabled = left > 0; b.textContent = left > 0 ? L().ev_resend_in(left) : L().ev_resend;
    }, 1000);
  }
  function pVerify(u) {
    var t = L();
    if (!u.email) return pHead(t.ev_h, "") + pCard("", pEmpty("mail", t.ev_noemail, t.ev_noemail_p, '<a class="btn" href="' + acc("/settings") + '">' + t.pro_t.profile + "</a>"));
    if (u.emailVerified) return pHead(t.ev_h, "") + pCard("", pEmpty("check", t.ev_done, t.ev_done_p(esc(u.email)), '<a class="btn" href="' + acc("/") + '">' + t.ev_go + "</a>"));
    verSend(false); setTimeout(verTick, 0);
    var left = Math.ceil((VER.at + 60e3 - Date.now()) / 1000);
    var body = VER.off ? '<div class="note-box">' + t.ev_off + "</div>" :
      '<p class="lead" style="margin:0 0 16px">' + t.ev_sent(esc(u.email)) + "</p>" + (!BE && VER.code ? '<div class="demo" style="margin:0 0 16px">' + t.ev_demo(VER.code) + "</div>" : "") +
      '<form id="evform" class="evform" novalidate><div class="fld"><label for="ev-code">' + t.ev_code + '</label><input id="ev-code" class="evcode nums" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" placeholder="••••••"></div>' +
      '<div class="err" id="ev-err" aria-live="polite">' + esc(VER.msg) + '</div><div class="btns"><button class="btn" type="submit">' + t.ev_btn + '</button><button class="btn ghost" type="button" id="ev-resend" data-act="evresend"' + (left > 0 ? " disabled" : "") + ">" + (left > 0 ? t.ev_resend_in(left) : t.ev_resend) + "</button></div></form>" +
      '<p class="fine" style="margin-top:14px">' + t.ev_spam + ' <a href="' + acc("/settings") + '">' + t.ev_change + "</a></p>";
    return pHead(t.ev_h, t.ev_p) + '<section class="pcard evcard"><div class="evicon">' + ic("mail") + "</div>" + body + '<p style="margin:18px 0 0"><a class="linkbtn" href="' + acc("/") + '">' + t.ev_later + "</a></p></section>";
  }
  function verBanner(u) { var t = L(); return '<section class="pcard evbanner"><span class="icobox">' + ic("mail") + "</span><div><b>" + t.ev_ban_h + '</b><p class="muted">' + t.ev_ban_p(esc(u.email)) + '</p></div><a class="btn sm" href="' + acc("/verify") + '">' + t.ev_ban_btn + "</a></section>"; }

  function viewRegister() {
    var t = L(), clinic = REGROLE === "clinic";
    var roles = ["patient", "doctor", "clinic"].map(function (r) { return '<button type="button" class="rolecard" data-regrole="' + r + '" aria-pressed="' + (REGROLE === r) + '"><span class="icobox">' + ic(r === "patient" ? "heart" : r === "doctor" ? "shield" : "hosp") + "</span><b>" + t.role[r] + "</b><span>" + t.role_d[r] + "</span></button>"; }).join("");
    var f = function (id, label, type, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '"' + (extra || "") + "></div>"; };
    return '<div class="wrap pad acc"><p class="authtop">' + t.have_acc + ' <a href="#/login">' + t.go_login + '</a></p><h1>' + t.reg_h + '</h1><p class="lead">' + t.reg_p + '</p><div class="demo" style="margin:16px 0 22px">' + t.acc_demo + '</div><div class="roles" role="group">' + roles + "</div>" +
      '<form class="form" id="regform" novalidate>' + f("r-name", clinic ? t.f_clinicname : t.f_fullname, "text", ' autocomplete="' + (clinic ? "organization" : "name") + '"') +
      '<div class="two">' + f("r-email", t.f_email, "email", ' autocomplete="email" inputmode="email"') + f("r-phone", t.f_phone2, "tel", ' autocomplete="tel" inputmode="tel" placeholder="+998"') + '</div><p class="fine" style="margin:-4px 0 14px">' + t.or_note + "</p>" +
      f("r-tg", t.f_tg, "text", ' autocomplete="off" placeholder="' + t.f_tg_ph + '"') + regExtra(t) +
      '<div class="two">' + f("r-pw", t.f_pw, "password", ' autocomplete="new-password"') + f("r-pw2", t.f_pw2, "password", ' autocomplete="new-password"') + "</div>" +
      (REGROLE !== "patient" ? '<p class="fine regnote">' + ic("shield") + t.rg_note + "</p>" : "") +
      '<div class="err" id="r-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.reg_btn + "</button>" + googleBlock("register") + '<p class="muted" style="margin-top:14px;text-align:center">' + t.have_acc + ' <a href="#/login">' + t.go_login + "</a></p></form></div>";
  }
  /* ---------------- a forgotten password ----------------
     Step 1: phone or email; a 6-digit code goes out by Telegram, email or SMS (whichever the account has).
     Step 2: the code and a new password. Without any channel, the person asks us and an admin makes a one-time link. */
  var FG = { step: 1, id: "", sent: [], code: "", at: 0 }, RL = { token: "", name: "", err: "", loading: false };
  function viewForgot() {
    var t = L(), via = FG.sent.map(function (c) { return t.fg_via[c]; }).join(", ");
    var head = '<div class="wrap pad acc" style="max-width:520px"><h1>' + t.fg_h + "</h1>";
    if (FG.step === 1) return head + '<p class="lead">' + t.fg_p + '</p><form class="form" id="fgform" novalidate><div class="fld"><label for="fg-id">' + t.login_id + '</label><input id="fg-id" autocomplete="username" value="' + esc(FG.id) + '"></div>' +
      '<div class="err" id="fg-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.fg_send + '</button><p class="muted" style="margin-top:14px;text-align:center"><a href="#/login">' + t.fg_back + "</a></p></form></div>";
    if (!FG.sent.length) return head + '<div class="note-box">' + t.fg_none + '</div><p style="margin-top:16px"><button class="linkbtn" type="button" data-act="fgagain">' + t.fg_other + '</button> · <a href="#/login">' + t.fg_back + "</a></p></div>";
    return head + '<p class="lead">' + t.fg_sent(esc(via)) + "</p>" + (!BE && FG.code ? '<div class="demo" style="margin:0 0 16px">' + t.ev_demo(FG.code) + "</div>" : "") +
      '<form class="form" id="fg2form" novalidate><div class="fld"><label for="fg-code">' + t.ev_code + '</label><input id="fg-code" class="evcode nums" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••"></div>' +
      '<div class="two"><div class="fld"><label for="fg-pw">' + t.fg_new + '</label><input id="fg-pw" type="password" autocomplete="new-password"></div><div class="fld"><label for="fg-pw2">' + t.f_pw2 + '</label><input id="fg-pw2" type="password" autocomplete="new-password"></div></div>' +
      '<div class="err" id="fg2-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.fg_save + '</button><p class="muted" style="margin-top:14px;text-align:center"><button class="linkbtn" type="button" data-act="fgagain">' + t.fg_other + "</button></p></form></div>";
  }
  function viewResetLink(token) {
    var t = L();
    if (!BE) return '<div class="wrap pad" style="max-width:560px"><div class="empty">' + t.im_claim_demo + "</div></div>";
    if (RL.token !== token) {
      RL = { token: token, name: "", err: "", loading: true };
      BE.pwLinkInfo(token).then(function (j) { RL.name = j.name; }, function (x) { RL.err = x.code === "reset" ? t.fg_bad_link : beMsg(t, x); }).then(function () { RL.loading = false; if (current.path === "/reset/" + token) render(true); });
    }
    if (RL.loading) return '<div class="wrap pad"><p class="muted">…</p></div>';
    if (!RL.name) return '<div class="wrap pad" style="max-width:560px"><div class="empty">' + esc(RL.err) + '<p style="margin-top:12px"><a href="#/forgot">' + t.fg_link + "</a></p></div></div>";
    return '<div class="wrap pad acc" style="max-width:520px"><h1>' + t.fg_h + '</h1><p class="lead">' + t.fg_link_p(esc(RL.name)) + '</p><form class="form" id="rlform" novalidate>' +
      '<div class="two"><div class="fld"><label for="rl-pw">' + t.fg_new + '</label><input id="rl-pw" type="password" autocomplete="new-password"></div><div class="fld"><label for="rl-pw2">' + t.f_pw2 + '</label><input id="rl-pw2" type="password" autocomplete="new-password"></div></div>' +
      '<div class="err" id="rl-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.fg_save + "</button></form></div>";
  }
  function viewLogin() {
    var t = L();
    return '<div class="wrap pad acc" style="max-width:520px"><h1>' + t.login_h + '</h1><div class="demo" style="margin:16px 0 22px">' + t.acc_demo + "</div>" + googleBlock("login") + '<form class="form" id="loginform" novalidate>' +
      '<div class="fld"><label for="l-id">' + t.login_id + '</label><input id="l-id" autocomplete="username"></div><div class="fld"><label for="l-pw">' + t.f_pw + '</label><input id="l-pw" type="password" autocomplete="current-password"></div>' +
      '<p class="fgline"><a href="#/forgot">' + t.fg_link + '</a></p><div class="err" id="l-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.login_btn + '</button><div class="authalt"><span>' + t.no_acc + '</span><a class="btn ghost block" href="#/register">' + t.go_reg + "</a></div></form></div>";
  }

  /* account editor keeps unsaved edits in ACC so adding a row does not lose what was typed */
  function accStart(u) { ACC = { id: u.id, name: u.name, email: u.email || "", phone: u.phone ? fmtPhone(u.phone) : "", tg: u.tg || "", pr: JSON.parse(JSON.stringify(u.profile || {})) }; ACC.pr.work = ACC.pr.work || []; ACC.pr.svc = ACC.pr.svc || []; ACC.pr.langs = ACC.pr.langs || []; ACC.pr.modes = ACC.pr.modes || ["in"]; }
  function accCollect() {
    if (!ACC) return; var v = function (id) { var el = $(id); return el ? el.value.trim() : undefined; }, pr = ACC.pr;
    ["name", "email", "phone", "tg"].forEach(function (k) { var x = v("a-" + k); if (x !== undefined) ACC[k] = x; });
    var map = { "a-region": "region", "a-district": "district", "p-village": "village", "d-spec": "spec", "d-spec-other": "spec_other", "d-years": "years", "d-lic": "lic", "d-edu": "edu", "d-bio": "bio", "c-type": "ctype", "c-own": "own", "c-addr": "addr", "c-hours": "hours", "c-lic": "lic", "c-about": "about", "d-reply": "reply", "d-ohours": "ohours", "d-sex": "sex" };
    Object.keys(map).forEach(function (id) { var x = v(id); if (x !== undefined) pr[map[id]] = x; });
    if ($("c-claim")) { var m = matchPlace(v("c-claim")); pr.fac = m && m.t === "f" ? m.key : ""; pr.claim = v("c-claim"); }
    if ($("d-cp-text")) { pr.cp = {}; ["text", "audio", "video"].forEach(function (k) { var x = v("d-cp-" + k); pr.cp[k] = x === "" ? "" : Math.max(0, Math.round(+x) || 0); }); }
    if ($("d-langs")) pr.langs = all("#d-langs input:checked").map(function (i) { return i.value; });
    if ($("d-hdays")) pr.hours = { days: all("#d-hdays input:checked").map(function (i) { return +i.value; }), from: v("d-hfrom"), to: v("d-hto"), len: +v("d-hlen") };
    if ($("d-modes")) pr.modes = all("#d-modes input:checked").map(function (i) { return i.value; });
    if ($("wp-list")) pr.work = all("#wp-list input").map(function (i) { return matchPlace(i.value); }).filter(Boolean);
    if ($("svc-list")) pr.svc = all("#svc-list .svcrow").map(function (row) { var n = row.querySelector(".s-n").value.trim(), pz = row.querySelector(".s-p").value.trim(), on = row.querySelector(".s-o"); return { name: n, price: pz === "" ? "" : Math.max(0, Math.round(+pz) || 0), online: on ? on.checked : false }; });
  }
  function viewAccount() {
    var t = L(), u = me(); if (!u) return viewLogin();
    if (u.role === "doctor" && !PRO_FORM) return viewPro(current.q || {});
    if (!ACC || ACC.id !== u.id) accStart(u);
    var a = ACC, pr = a.pr, role = u.role;
    var fi = function (id, label, val, type, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + (type || "text") + '" value="' + esc(val || "") + '"' + (extra || "") + "></div>"; };
    var ta = function (id, label, val, ph) { return '<div class="fld"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" maxlength="1500" placeholder="' + esc(ph || "") + '">' + esc(val || "") + "</textarea></div>"; };
    var regionSel = '<div class="two"><div class="fld"><label for="a-region">' + t.f_region + '</label><select id="a-region"><option value="">—</option>' + REG.slice().sort(function (x, y) { return nmL(x).localeCompare(nmL(y)); }).map(function (r) { return '<option value="' + r.code + '"' + (pr.region === r.code ? " selected" : "") + ">" + esc(nmL(r)) + "</option>"; }).join("") + '</select></div><div class="fld"><label for="a-district">' + t.f_district + '</label><select id="a-district">' + districtOptions(pr.region, pr.district) + "</select></div></div>";
    var contact = '<fieldset class="accsec"><legend>' + t.sec_contact + "</legend>" + fi("a-name", role === "clinic" ? t.f_clinicname : t.f_fullname, a.name) + '<div class="two">' + fi("a-email", t.f_email, a.email, "email") + fi("a-phone", t.f_phone2, a.phone, "tel", ' inputmode="tel" placeholder="+998"') + "</div>" + fi("a-tg", t.f_tg, a.tg, "text", ' placeholder="' + t.f_tg_ph + '"') + "</fieldset>";
    var svcRows = function (withOnline) {
      return '<div id="svc-list">' + pr.svc.map(function (sv, i) { return '<div class="svcrow"><input class="s-n" aria-label="' + t.svc_name + '" placeholder="' + esc(t.svc_name_ph) + '" value="' + esc(sv.name) + '"><input class="s-p" type="number" min="0" step="1000" inputmode="numeric" aria-label="' + t.svc_price + '" placeholder="' + t.svc_price + '" value="' + esc(sv.price) + '">' + (withOnline ? '<label class="mini"><input class="s-o" type="checkbox"' + (sv.online ? " checked" : "") + ">" + t.svc_online + "</label>" : "") + '<button class="linkbtn" type="button" data-svcdel="' + i + '">' + t.svc_remove + "</button></div>"; }).join("") + '</div><button class="btn ghost sm" type="button" data-act="svcadd">' + ic("plus") + t.svc_add + "</button>";
    };
    var body = "";
    if (role === "patient") body = '<fieldset class="accsec"><legend>' + t.sec_loc + "</legend>" + regionSel + fi("p-village", t.p_village, pr.village) + '<p class="fine">' + t.p_hint + "</p></fieldset>";
    if (role === "doctor") {
      body = '<fieldset class="accsec"><legend>' + t.sec_basic + '</legend><div class="two"><div class="fld"><label for="d-spec">' + t.d_spec + '</label><select id="d-spec">' + DOC_SP.map(function (k) { return '<option value="' + k + '"' + (pr.spec === k ? " selected" : "") + ">" + t.docsp[k] + "</option>"; }).join("") + "</select></div>" + fi("d-spec-other", t.d_spec_other, pr.spec_other) + "</div>" +
        '<div class="two">' + fi("d-years", t.d_years, pr.years, "number", ' min="0" max="70"') + fi("d-lic", t.d_lic, pr.lic) + "</div>" +
        '<div class="two"><div class="fld"><label for="d-sex">' + t.d_sex + '</label><select id="d-sex">' + [["", "—"], ["f", t.cs_sexes.f], ["m", t.cs_sexes.m]].map(function (o) { return '<option value="' + o[0] + '"' + ((pr.sex || "") === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select><p class="fine" style="margin-top:4px">' + t.d_sex_hint + "</p></div></div>" +
        '<div class="fld"><span class="flabel">' + t.d_langs + '</span><div class="checks" id="d-langs">' + ["uz", "ru", "en", "kaa", "tg"].map(function (l) { var n = { kaa: "Qaraqalpaq", tg: "Tojik" }[l] || t.lg[l]; return '<label class="mini"><input type="checkbox" value="' + l + '"' + (pr.langs.indexOf(l) > -1 ? " checked" : "") + ">" + n + "</label>"; }).join("") + "</div></div>" +
        '<div class="fld"><span class="flabel">' + t.d_modes + '</span><div class="checks" id="d-modes">' + [["in", t.tab_in], ["on", t.tab_on]].map(function (m) { return '<label class="mini"><input type="checkbox" value="' + m[0] + '"' + (pr.modes.indexOf(m[0]) > -1 ? " checked" : "") + ">" + m[1] + "</label>"; }).join("") + "</div></div>" +
        ta("d-bio", t.d_bio, pr.bio, t.d_bio_ph) + "</fieldset>" +
        '<fieldset class="accsec"><legend>' + t.sec_cprice + '</legend><p class="fine" style="margin:0 0 10px">' + t.cp_hint + '</p><div class="three">' + ["text", "audio", "video"].map(function (k) { var c = pr.cp || {}; return fi("d-cp-" + k, t.cp_types[k], c[k] === 0 ? "0" : c[k], "number", ' min="0" step="1000" inputmode="numeric" placeholder="' + unit() + '"'); }).join("") + "</div>" +
        '<div class="two"><div class="fld"><label for="d-reply">' + t.reply_l + '</label><select id="d-reply">' + ["", "1", "3", "24", "48"].map(function (h) { return '<option value="' + h + '"' + (String(pr.reply || "") === h ? " selected" : "") + ">" + t.replies[h] + "</option>"; }).join("") + "</select></div>" + fi("d-ohours", t.ohours_l, pr.ohours, "text", ' maxlength="80" placeholder="' + esc(t.ohours_ph) + '"') + "</div></fieldset>" +
        (function () { var h = pr.hours || {}, on = h.days || []; return '<fieldset class="accsec"><legend>' + t.sl_hours_h + '</legend><p class="fine" style="margin:0 0 10px">' + t.sl_hours_p + '</p><div class="checks wdays" id="d-hdays">' + WD7.map(function (d) { return '<label class="mini"><input type="checkbox" value="' + d + '"' + (on.indexOf(d) > -1 ? " checked" : "") + "><span>" + t.sl_wd[d - 1] + "</span></label>"; }).join("") + "</div>" +
          '<div class="three">' + fi("d-hfrom", t.sl_from, h.from || "09:00", "time", ' step="900"') + fi("d-hto", t.sl_to, h.to || "18:00", "time", ' step="900"') + '<div class="fld"><label for="d-hlen">' + t.sl_len + '</label><select id="d-hlen">' + [15, 20, 30, 60].map(function (m) { return '<option value="' + m + '"' + (+(h.len || 30) === m ? " selected" : "") + ">" + t.sl_min(m) + "</option>"; }).join("") + "</select></div></div></fieldset>"; })() +
        '<fieldset class="accsec"><legend>' + t.sec_bg + "</legend>" + ta("d-edu", t.d_edu, pr.edu, t.d_edu_ph) + "</fieldset>" +
        '<fieldset class="accsec"><legend>' + t.sec_work + "</legend>" + regionSel + '<datalist id="placelist">' + placeOptions(pr.region) + '</datalist><div id="wp-list">' + pr.work.map(function (w, i) { return '<div class="svcrow"><input list="placelist" aria-label="' + t.works_at + '" placeholder="' + esc(t.d_work_ph) + '" value="' + esc(w.t === "f" && facByKey[w.key] ? facLabel(facByKey[w.key]) : w.t === "c" ? wpLabel(w) + " — Shifokor" : w.label) + '"><button class="linkbtn" type="button" data-wpdel="' + i + '">' + t.svc_remove + "</button></div>"; }).join("") + '</div><p class="fine" style="margin:4px 0 10px">' + t.d_work_hint + '</p><button class="btn ghost sm" type="button" data-act="wpadd">' + ic("plus") + t.add_work + "</button></fieldset>" +
        '<fieldset class="accsec"><legend>' + t.sec_services + "</legend>" + svcRows(true) + "</fieldset>";
    }
    if (role === "clinic") {
      body = '<fieldset class="accsec"><legend>' + t.sec_clinic + '</legend><div class="two"><div class="fld"><label for="c-type">' + t.c_type + '</label><select id="c-type">' + CAT_ORDER.map(function (c) { return '<option value="' + c + '"' + (pr.ctype === c ? " selected" : "") + ">" + t.cat[c] + "</option>"; }).join("") + '</select></div><div class="fld"><label for="c-own">' + t.c_own + '</label><select id="c-own">' + ["s", "p"].map(function (o) { return '<option value="' + o + '"' + (pr.own === o ? " selected" : "") + ">" + t.own[o] + "</option>"; }).join("") + "</select></div></div>" +
        '<div class="two">' + fi("c-hours", t.c_hours, pr.hours, "text", ' placeholder="' + esc(t.c_hours_ph) + '"') + fi("c-lic", t.c_lic, pr.lic) + "</div>" + ta("c-about", t.c_about, pr.about, "") + "</fieldset>" +
        '<fieldset class="accsec"><legend>' + t.sec_loc + "</legend>" + regionSel + fi("c-addr", t.c_addr, pr.addr) + '<datalist id="claimlist">' + FAC.filter(function (f) { var r = regByCode[pr.region]; return !r || DIS[f.d].r === r.i; }).map(function (f) { return '<option value="' + esc(facLabel(f)) + '">'; }).join("") + "</datalist>" + fi("c-claim", t.c_claim, pr.claim || (pr.fac && facByKey[pr.fac] ? facLabel(facByKey[pr.fac]) : ""), "text", ' list="claimlist" placeholder="' + esc(t.c_claim_ph) + '"') + '<p class="fine">' + t.c_claim_hint + "</p></fieldset>" +
        '<fieldset class="accsec"><legend>' + t.sec_csvc + "</legend>" + svcRows(false) + "</fieldset>";
    }
    var del = ACC_DEL ? '<div class="confirm-row"><b>' + t.acc_del_q + '</b><button class="btn danger sm" type="button" data-act="accdel-yes">' + t.acc_del_yes + '</button><button class="btn ghost sm" type="button" data-act="accdel-no">' + t.v_keep + "</button></div>" : "";
    var pub = role === "doctor" ? "#/doc/" + u.id : role === "clinic" ? "#/c/" + u.id : "";
    if (PRO_FORM) return '<div class="acc proform">' + trustCard(u) + notifyCard(u) + googleCard(u) + '<form class="form accform" id="accform" novalidate>' + contact + body + '<div class="err" id="a-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.acc_save + "</button></form>" +
      '<p style="margin-top:20px"><button class="linkbtn" type="button" data-act="accdel">' + t.acc_del + "</button></p>" + del + "</div>";
    return '<div class="wrap pad acc"><div class="sechead"><div><div class="eyebrow">' + t.role[role] + "</div><h1>" + esc(u.name) + '</h1></div><div class="btns">' + (pub ? '<a class="btn ghost sm" href="' + pub + '">' + t.acc_view + "</a>" : "") + '<button class="btn ghost sm" type="button" data-act="logout">' + t.logout + '</button></div></div><div class="demo" style="margin:14px 0 20px">' + t.acc_demo + "</div>" +
      trustCard(u) + notifyCard(u) + googleCard(u) + (role === "doctor" ? liveCard(u) + mothersCard() + earnCard() + docInbox(u) : role === "clinic" ? clinicInbox(u) : "") + (role !== "patient" ? rvMine(u) : "") + '<form class="form accform" id="accform" novalidate>' + contact + body + '<div class="err" id="a-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.acc_save + "</button></form>" +
      '<p style="margin-top:20px"><button class="linkbtn" type="button" data-act="accdel">' + t.acc_del + "</button></p>" + del + "</div>";
  }

  /* public pages */
  function svcTable(list, withOnline) {
    var t = L(); list = (list || []).filter(function (x) { return x.name; });
    if (!list.length) return "";
    return '<div class="tablewrap"><table><thead><tr><th>' + t.svc_name + '</th><th class="n">' + t.p_price + "</th></tr></thead><tbody>" + list.map(function (x) { return "<tr><td>" + esc(x.name) + (withOnline && x.online ? ' <span class="badge plain">' + t.online_b + "</span>" : "") + '</td><td class="n">' + (x.price === "" || x.price == null ? '<span class="muted">' + t.price_ask + "</span>" : num(x.price) + " " + unit()) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  }
  function tgBtn(u) { return u.tg ? '<a class="btn" href="https://t.me/' + encodeURIComponent(tgName(u.tg)) + '" target="_blank" rel="noopener">' + ic("chat") + t2("contact_tg") + "</a>" : ""; }
  var t2 = function (k) { return L()[k]; };
  function viewDoc(id) {
    var t = L(), u = userById(id); if (!u || u.role !== "doctor") return '<div class="wrap pad"><div class="empty">' + t.not_found + "</div></div>";
    var pr = u.profile || {}, langs = (pr.langs || []).map(function (l) { return { kaa: "Qaraqalpaq", tg: "Tojik" }[l] || t.lg[l]; }).join(", ");
    var region = pr.district && disByCode[pr.district] ? nmL(disByCode[pr.district]) + ", " + nmL(REG[disByCode[pr.district].r]) : pr.region && regByCode[pr.region] ? nmL(regByCode[pr.region]) : "";
    return '<div class="wrap"><a class="back" href="#/doctors">‹ ' + t.nav_doctors + '</a><div class="pf"><div><div class="who">' + personAv(u) + "<div><h1>" + esc(u.name) + '</h1><div class="spec">' + esc(specName(pr)) + (pr.years ? " · " + t.exp(pr.years) : "") + '</div><div class="badges">' + (u.sample ? smpBadge() : '<span class="badge">' + t.on_sh + "</span>" + vBadge(u)) + (ratingOf(u.id).n ? '<a href="#reviews" data-scroll="reviews" class="badge plain rbadge">' + ratingLine(u.id) + "</a>" : "") + (isOnline(u) ? '<span class="badge plain">' + ic("video") + t.online_b + "</span>" : "") + "</div>" + (u.sample ? "" : shareBtn("/shifokor/" + u.id, u.name)) + "</div></div>" +
      (u.pending ? '<p class="note-box">' + t.im_pending_note + "</p>" : "") + (u.sample ? '<p class="note-box">' + t.smp_note + ' <a href="#/doctors?' + qs({ s: pr.spec }) + '">' + t.smp_real + "</a></p>" : "") +
      (pr.bio ? '<div class="sect"><p class="lead" style="margin:0">' + esc(pr.bio) + "</p></div>" : "") +
      (function () { var wl = (pr.work || []).slice(); clinicsOfDoctor(u.id).forEach(function (x) { if (!wl.some(function (w) { return w.t === "c" && w.id === x.clinicId; }) && userById(x.clinicId)) wl.push({ t: "c", id: x.clinicId }); });
        return wl.length ? '<div class="sect"><h2>' + t.works_at + '</h2><ul class="list">' + wl.map(function (w) { return "<li>" + wpLink(w) + "</li>"; }).join("") + "</ul></div>" : ""; })() +
      (function () { var bp = bookPlaces(u); return bp.length ? '<div class="sect" id="clinicbook"><h2>' + t.ap_doc_h + '</h2><p class="muted" style="margin:0 0 12px">' + t.ap_doc_p + '</p><div class="bkplaces">' + bp.map(function (c) { var cp = c.profile || {}; return '<div class="bkplace"><div><b>' + ic("hosp") + esc(c.name) + "</b>" + (cp.addr || cp.hours ? '<span class="muted">' + esc([cp.addr, cp.hours].filter(Boolean).join(" · ")) + "</span>" : "") + '</div><a class="btn sm" href="' + bookHref(c, u) + '">' + ic("cal") + t.ap_doc_btn + "</a></div>"; }).join("") + "</div></div>" : ""; })() +
      cpBlock(u) +
      ((pr.svc || []).some(function (x) { return x.name; }) ? '<div class="sect"><h2>' + t.svc_h + "</h2>" + svcTable(pr.svc, true) + "</div>" : "") + rvList(u) +
      (pr.edu ? '<div class="sect"><h2>' + t.sec_bg + '</h2><p class="pre">' + esc(pr.edu) + "</p></div>" : "") +
      '<div class="sect"><dl class="kv">' + (langs ? "<dt>" + t.p_langs + "</dt><dd>" + esc(langs) + "</dd>" : "") + (region ? "<dt>" + t.p_area + "</dt><dd>" + esc(region) + "</dd>" : "") + (pr.lic ? "<dt>" + t.d_lic + "</dt><dd>" + esc(pr.lic) + (u.verified ? "" : ' <span class="muted">· ' + t.verified_no + "</span>") + "</dd>" : "") + "</dl></div>" +
      '<p class="fine" style="margin-top:20px">' + t.acc_demo + (u.updated ? " · " + t.updated(fmt(fromIso(u.updated), { day: "numeric", month: "short" })) : "") + "</p></div>" +
      '<aside class="stick"><h2>' + esc(u.name) + "</h2>" + (function () { var f = !u.sample && isOnline(u) ? freeDays(u) : null, nx = f && f.days.length ? f.days[0].slots.filter(function (x) { return !x.busy; })[0] : null; return nx ? '<p class="cpaside"><small>' + t.sl_next + "</small><b>" + esc(slotTxt(nx.ms)) + "</b></p>" : ""; })() + (cpMin(u) != null ? '<p class="cpaside"><small>' + t.cp_h + "</small><b>" + (cpMin(u) === 0 ? t.free_c : esc(t.cp_from(num(cpMin(u)) + " " + unit()))) + "</b>" + (pr.reply ? '<span class="muted">' + t.reply_txt(pr.reply) + "</span>" : "") + "</p>" : "") + '<div class="stack">' + (isOnline(u) ? '<a class="btn" href="#/consult?' + qs({ doc: u.id }) + '">' + ic("chat") + t.cs_req_doc + "</a>" : "") + (function () { var bp = bookPlaces(u); return bp.length === 1 ? '<a class="btn ' + (isOnline(u) ? "ghost" : "") + '" href="' + bookHref(bp[0], u) + '">' + ic("cal") + t.ap_doc_btn + "</a>" : bp.length ? '<a class="btn ' + (isOnline(u) ? "ghost" : "") + '" href="#clinicbook" data-scroll="clinicbook">' + ic("cal") + t.ap_doc_btn + "</a>" : ""; })() + tgBtn(u) + "</div></aside></div></div>";
  }
  function cpBlock(u) {
    var t = L(), pr = u.profile || {}, c = cpOf(pr); if (!offersCp(u)) return "";
    var rows = ["text", "audio", "video"].filter(function (k) { return c[k] != null; }).map(function (k) { return "<tr><td>" + ic(k === "text" ? "chat" : k === "audio" ? "mic" : "video") + " " + t.cp_types[k] + '</td><td class="n nums">' + esc(money(c[k])) + "</td></tr>"; }).join("");
    var info = [pr.reply ? t.reply_txt(pr.reply) : "", pr.ohours ? t.ohours_l + ": " + esc(pr.ohours) : "", t.cp_pay].filter(Boolean).join(" · ");
    return '<div class="sect"><h2>' + t.cp_h + "</h2>" + (rows ? '<div class="tablewrap"><table><tbody>' + rows + "</tbody></table></div>" : '<p class="muted">' + t.cp_none + "</p>") + '<p class="muted" style="margin-top:10px;font-size:.92rem">' + info + "</p></div>";
  }
  function viewClinicAcc(id) {
    var t = L(), u = userById(id); if (!u || u.role !== "clinic") return '<div class="wrap pad"><div class="empty">' + t.not_found + "</div></div>";
    var pr = u.profile || {}, f = pr.fac ? facByKey[pr.fac] : null, d = pr.district && disByCode[pr.district], docs = doctorsAt(u);
    if (f) pendingMap = { fac: [f], single: true };
    var place = d ? nmL(d) + ", " + nmL(REG[d.r]) : f ? placeOf(f) : "";
    var dl = f ? dirLinks(f) : null;
    return '<div class="wrap"><a class="back" href="#/doctors">‹ ' + t.clinics_reg_h + '</a><div class="pf"><div><div class="who"><div class="ficon big c-' + (pr.ctype || "clinic") + '">' + ic(CAT_IC[pr.ctype || "clinic"]) + "</div><div><h1>" + esc(u.name) + '</h1><div class="spec">' + t.cat[pr.ctype || "clinic"] + '</div><div class="badges"><span class="badge">' + t.on_sh + "</span>" + (pr.own ? '<span class="badge ' + (pr.own === "s" ? "ok" : "plain") + '">' + t.own[pr.own] + "</span>" : "") + vBadge(u) + (ratingOf(u.id).n ? '<span class="badge plain rbadge">' + ratingLine(u.id) + "</span>" : "") + "</div>" + shareBtn("/klinika/" + u.id, u.name) + "</div></div>" +
      (pr.about ? '<div class="sect"><p class="lead" style="margin:0">' + esc(pr.about) + "</p></div>" : "") +
      '<div class="sect"><dl class="kv">' + (place ? "<dt>" + t.fac_where + "</dt><dd>" + esc(place) + "</dd>" : "") + (pr.addr ? "<dt>" + t.fac_addr + "</dt><dd>" + esc(pr.addr) + "</dd>" : "") + (pr.hours ? "<dt>" + t.fac_hours + "</dt><dd>" + esc(pr.hours) + "</dd>" : "") + (u.phone ? "<dt>" + t.fac_phone + '</dt><dd class="nums">' + esc(fmtPhone(u.phone)) + "</dd>" : "") + (pr.lic ? "<dt>" + t.c_lic + "</dt><dd>" + esc(pr.lic) + "</dd>" : "") + "</dl></div>" +
      ((pr.svc || []).some(function (x) { return x.name; }) ? '<div class="sect"><h2>' + t.svc_h + "</h2>" + svcTable(pr.svc, false) + (u.updated ? '<p style="margin-top:10px"><span class="confline">' + t.updated(fmt(fromIso(u.updated), { day: "numeric", month: "short" })) + "</span></p>" : "") + "</div>" : "") +
      (canBook(u) ? apForm(u, pr.fac) : '<div class="sect"><div class="note-box">' + t.ap_unv + "</div></div>") +
      rvList(u) +
      (branchesOf(u.id).length ? '<div class="sect"><h2>' + t.cl_br_pub + '</h2><div class="brpub">' + branchesOf(u.id).map(function (b) { return '<div class="brp"><b>' + ic("pin") + esc(b.name) + "</b>" + (b.address || (b.region && regByCode[b.region]) ? '<span class="muted">' + esc([b.region && regByCode[b.region] ? nmL(regByCode[b.region]) : "", b.address].filter(Boolean).join(", ")) + "</span>" : "") + (b.hours ? "<span>" + esc(b.hours) + "</span>" : "") + (b.phone ? '<a class="nums" href="tel:+' + digits(b.phone) + '">' + esc(fmtPhone(b.phone)) + "</a>" : "") + "</div>"; }).join("") + "</div></div>" : "") +
      '<div class="sect"><h2>' + t.c_docs_h + "</h2>" + (docs.length ? '<div class="results" style="padding:0">' + docs.map(function (d) { return docCard(d, u); }).join("") + "</div>" : '<p class="muted">' + t.c_no_docs + "</p>") + "</div>" +
      '<p class="fine" style="margin-top:20px">' + t.acc_demo + "</p></div>" +
      '<aside class="stick"><h2>' + t.fac_map + "</h2>" + (f ? '<div id="map" class="map small" role="region" aria-label="' + t.p_loc + '"></div>' : "") + '<div class="stack" style="margin-top:12px">' + (canBook(u) ? '<a class="btn block" href="#book" data-scroll="book">' + ic("cal") + t.ap_h + "</a>" : "") + tgBtn(u) + (dl ? '<a class="btn ghost block" href="' + dl.y + '" target="_blank" rel="noopener">' + ic("nav") + t.fac_dir_y + "</a>" : "") + "</div></aside></div></div>";
  }
  /* sharing a profile: the phone's share sheet, or the address copied */
  var pageUrl = function (path) { return location.origin + path; };
  function shareBtn(path, name) { return '<button class="btn ghost sm sharebtn" type="button" data-act="share" data-url="' + esc(pageUrl(path)) + '" data-name="' + esc(name) + '">' + ic("share") + L().sh_share + "</button>"; }
  /* consultation prices on a doctor's profile: { text, audio, video }, null when not offered, 0 when free */
  function cpOf(pr) { var c = (pr && pr.cp) || {}, o = {}; ["text", "audio", "video"].forEach(function (k) { o[k] = c[k] === "" || c[k] == null ? null : Math.max(0, +c[k] || 0); }); return o; }
  /* an imported doctor who hasn't claimed their profile can't answer, so they take no online consultations yet */
  var offersCp = function (u) { return !u.pending && ((u.profile || {}).modes || []).indexOf("on") > -1; };
  var isOnline = function (u) { return !u.sample && offersCp(u); };
  /* a doctor who switched on "I'm online now" */
  var onlineNow = function (u) { return isOnline(u) && !!u.onlineUntil && u.onlineUntil > Date.now(); };
  var liveBadge = function () { return '<span class="badge live"><i class="dot"></i>' + L().on_now + "</span>"; };
  function cpMin(u) { if (!offersCp(u)) return null; var c = cpOf(u.profile), v = ["text", "audio", "video"].map(function (k) { return c[k]; }).filter(function (x) { return x != null; }); return v.length ? Math.min.apply(null, v) : null; }
  var money = function (v) { return v === 0 ? L().free_c : num(v) + " " + unit(); };
  var langName = function (l) { return { kaa: "Qaraqalpaq", tg: "Tojik" }[l] || L().lg[l] || l; };
  function wantedNote(d, type) { var t = L(), p = cpOf(d.profile)[type]; return t.cs_wanted + ": " + d.name + (p != null ? " · " + t.cs_types[type][0] + " " + money(p) : ""); }
  /* checked doctors first; then those who give their prices; then experience */
  function sortDocs(list, how) {
    var yrs = function (u) { return +((u.profile || {}).years) || 0; }, cm = function (u) { var m = cpMin(u); return m == null ? Infinity : m; };
    return list.slice().sort(function (a, b) {
      if (how === "cheap") return cm(a) - cm(b) || (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      if (how === "exp") return yrs(b) - yrs(a);
      if (how === "rating") return rankScore(b.id) - rankScore(a.id) || ratingOf(b.id).n - ratingOf(a.id).n;
      return (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || rankScore(b.id) - rankScore(a.id) || (cm(a) === Infinity ? 1 : 0) - (cm(b) === Infinity ? 1 : 0) || yrs(b) - yrs(a);
    });
  }
  /* "Bugun 15:30", "Ertaga 09:00", or "Chor 4-noy 10:00" */
  function slotShort(ms) { var t = L(), k = tkDayKey(ms), now = Date.now(); return (k === tkDayKey(now) ? t.nx_today : k === tkDayKey(now + 864e5) ? t.nx_tomorrow : fmt(tkDate(ms), { weekday: "short", day: "numeric", month: "short" })) + " " + hhmm(ms); }
  function nextChips(u) {
    if (u.sample || !isOnline(u) || !hoursOf(u.profile)) return "";
    var t = L(), f = freeDays(u); if (!f || f.loading) return "";
    var free = []; f.days.forEach(function (d) { d.slots.forEach(function (x) { if (!x.busy && free.length < 4) free.push(x.ms); }); });
    if (!free.length) return "";
    return '<div class="nxchips"><small>' + t.nx_h + "</small>" + free.map(function (ms) { return '<a class="nxchip nums" href="#/consult?' + qs(Object.assign({}, dfKeep(), { doc: u.id, slot: String(ms) })) + '">' + esc(slotShort(ms)) + "</a>"; }).join("") + "</div>";
  }
  /* a compact doctor tile for grids (home page): face, name, specialty, rating, next time, price, one button */
  function docTile(u) {
    var t = L(), pr = u.profile || {}, m = cpMin(u), r = ratingOf(u.id), region = pr.region && regByCode[pr.region] ? nmL(regByCode[pr.region]) : "";
    var f = !u.sample && isOnline(u) && hoursOf(pr) ? freeDays(u) : null, nx = f && f.days.length ? f.days[0].slots.filter(function (x) { return !x.busy; })[0] : null;
    var ask = isOnline(u) ? "#/consult?" + qs({ doc: u.id }) : u.sample && offersCp(u) ? "#/consult?" + qs({ s: pr.spec, smp: "1" }) : "#/doc/" + u.id;
    return '<article class="dtile">' + avatarOf(u, "lg") + '<div class="dtbody"><h3><a href="#/doc/' + u.id + '">' + esc(u.name) + '</a></h3><p class="spec">' + esc(specName(pr)) + (pr.years ? " · " + t.exp(pr.years) : "") + "</p>" +
      '<div class="dtmeta">' + (r.n ? ratingLine(u.id) : "") + (u.sample ? smpBadge() : u.verified ? vBadge(u) : "") + "</div>" + (region ? '<p class="muted dtreg">' + ic("pin") + esc(region) + "</p>" : "") +
      (nx ? '<p class="dtnext">' + ic("cal") + esc(slotShort(nx.ms)) + "</p>" : "") + '</div><div class="dtfoot">' + (m != null ? '<b class="nums">' + (m === 0 ? t.free_c : esc(t.cp_from(num(m) + " " + unit()))) + "</b>" : "<span></span>") + '<a class="btn sm" href="' + ask + '">' + t.pr_consult + "</a></div></article>";
  }
  function docCard(u, at) {
    var t = L(), pr = u.profile || {}, w = (pr.work || [])[0], m = cpMin(u), on = isOnline(u);
    /* a visit at the clinic: the clinic whose page this is, or the doctor's first clinic on Shifokor */
    var bp = at && at.role === "clinic" ? (canBook(at) && !u.sample ? [at] : []) : bookPlaces(u), bk = bp.length ? '<a class="btn ' + (on ? "ghost " : "") + 'sm" href="' + bookHref(bp[0], u) + '">' + ic("cal") + t.ap_doc_short + "</a>" : "";
    var region = pr.district && disByCode[pr.district] ? nmL(disByCode[pr.district]) : pr.region && regByCode[pr.region] ? nmL(regByCode[pr.region]) : "";
    var meta2 = [region, (pr.langs || []).map(langName).join(", ")].filter(Boolean).join(" · ");
    return '<article class="fcard doccard">' + avatarOf(u, "sm") + '<div class="fmain"><h3><a href="#/doc/' + u.id + '">' + esc(u.name) + '</a></h3><div class="spec">' + esc(specName(pr)) + (pr.years ? " · " + t.exp(pr.years) : "") + "</div>" +
      '<div class="badges">' + (onlineNow(u) ? liveBadge() : "") + (ratingOf(u.id).n ? ratingLine(u.id) : "") + (u.verified ? vBadge(u) : "") + (u.sample ? smpBadge() : "") + (on ? '<span class="badge plain">' + ic("video") + t.online_b + "</span>" : "") + "</div>" +
      (w ? '<div class="meta">' + ic("hosp") + esc(wpLabel(w)) + "</div>" : "") + (meta2 ? '<div class="meta">' + ic("pin") + esc(meta2) + "</div>" : "") + svcChips(u) + nextChips(u) + "</div>" +
      '<div class="facts">' + (m != null ? '<div class="cpfrom"><small>' + t.cp_h + '</small><b class="nums">' + (m === 0 ? t.free_c : esc(t.cp_from(num(m) + " " + unit()))) + "</b></div>" : "") +
      (on ? '<a class="btn sm" href="#/consult?' + qs(Object.assign({}, dfKeep(), { doc: u.id })) + '">' + ic("chat") + t.pr_consult + "</a>" : u.sample && offersCp(u) ? '<a class="btn sm" href="#/consult?' + qs(Object.assign({}, dfKeep(), { s: (u.profile || {}).spec, smp: "1" })) + '">' + ic("chat") + t.pr_consult + "</a>" : "") + bk + '<a class="btn ghost sm" href="#/doc/' + u.id + '">' + t.view + "</a></div></article>";
  }
  /* ---------------- pages from the menus (after Doctor Anywhere): about, specialists, family health, wellness ---------------- */
  function pageHead(eyebrow, h, p) { return '<div class="band deep"><div class="wrap bhead"><div class="eyebrow">' + eyebrow + "</div><h1>" + h + '</h1><p class="sub">' + p + "</p></div></div>"; }
  var docsIn = function (k) { return withSamples().filter(function (u) { return u.role === "doctor" && (u.profile || {}).spec === k; }).length; };
  function viewAbout() {
    var t = L(), stats = [[num(FAC.length), t.ab_st[0]], [REG.length, t.ab_st[1]], [DIS.length, t.ab_st[2]], [DOC_SP.length - 1, t.ab_st[3]]];
    return pageHead(t.nv_about, t.ab_h, t.ab_p) +
      '<div class="wrap pad" id="ab-mission"><div class="misgrid"><div><h2>' + t.mis_h + '</h2><p class="lead">' + t.mis_p + '</p></div><figure class="shot">' + photo("nukus-phone", t.img_nukus, "(max-width: 760px) 90vw, 440px") + "<figcaption>" + t.img_nukus_cap + "</figcaption></figure></div></div>" +
      '<div class="band soft" id="ab-check"><div class="wrap pad"><h2>' + t.ab_check_h + '</h2></div><div class="wrap tcards">' + t.tc.map(function (x, i) { return '<div class="tcard"><div class="tcimg t' + i + '">' + ic(["shield", "free", "check"][i]) + "</div><div><b>" + x[0] + "</b><p>" + x[1] + "</p></div></div>"; }).join("") + "</div></div>" +
      '<div class="wrap pad" id="ab-network"><h2>' + t.nv_network + '</h2><p class="lead">' + t.ab_net_p + '</p><div class="stats">' + stats.map(function (x) { return '<div class="stat1"><b class="nums">' + x[0] + "</b><span>" + x[1] + "</span></div>"; }).join("") + "</div>" +
      '<div class="btns" style="margin-top:20px"><a class="btn" href="#/find">' + ic("hosp") + t.nav_hosp + '</a><a class="btn ghost" href="#/browse/areas">' + ic("pin") + t.br_regions + '</a><a class="btn ghost" href="#/register" data-regrole-link="clinic">' + t.ab_clinic_join + "</a></div></div>" +
      '<div class="band alt" id="ab-faq"><div class="wrap pad"><h2>' + t.nv_faq + '</h2><div class="faq">' + t.faq_f.map(function (q) { return "<details><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>"; }).join("") + "</div>" +
      '<p class="joinline">' + t.join_line + ' <a href="#/register" data-regrole-link="doctor">' + t.join_go + "</a></p></div></div>";
  }
  /* "Siz uchun tibbiy yordam" (Doctor Anywhere's "Healthcare for you"): four ways in, with the lowest price among real doctors only */
  var HC_SVG = {
    gp: '<circle cx="24" cy="15" r="7"/><path d="M17 12q7-6 14 0"/><path d="M11 42v-6q0-9 13-9t13 9v6"/><path d="M18 28v6a3 3 0 0 0 6 0M30 28v8"/><circle cx="30" cy="38" r="2"/>',
    spec: '<circle cx="24" cy="15" r="7"/><path d="M16 17q-1-11 8-11t8 11"/><path d="M12 38v-3q0-8 12-8t12 8v3"/><path d="M19 28v5a3 3 0 0 0 5 0M29 28v6"/><rect x="10" y="38" width="28" height="6" rx="1.5" fill="currentColor"/>',
    psych: '<path d="M30 42v-6q8-2 8-9h-3q2-4-1-6 1-14-13-14-12 0-12 13 0 7 5 11v11"/><circle cx="21" cy="19" r="6" class="fill"/><path d="M21 22l-3-3a2 2 0 0 1 3-3 2 2 0 0 1 3 3z"/>',
    pediatrics: '<rect x="13" y="6" width="22" height="38" rx="11"/><circle cx="24" cy="17" r="6"/><path d="M13 27l22 9" /><path d="M13 30l22 8v-3a11 11 0 0 1-11 9 11 11 0 0 1-11-9z" class="fill"/>'
  };
  function hcCards() {
    var t = L(), real = users().filter(function (u) { return u.role === "doctor" && isOnline(u); });
    var minOf = function (keep) { var v = real.filter(keep).map(cpMin).filter(function (x) { return x != null; }); return v.length ? Math.min.apply(null, v) : null; };
    var spOf = function (u) { return (u.profile || {}).spec; };
    var rows = [["gp", "#/consult?" + qs({ s: "gp" }), minOf(function (u) { return spOf(u) === "gp" || spOf(u) === "therapist"; })], ["spec", "#/specialists", minOf(function (u) { return ["gp", "therapist", "psych", "pediatrics"].indexOf(spOf(u)) < 0; })],
      ["psych", "#/consult?" + qs({ s: "psych" }), minOf(function (u) { return spOf(u) === "psych"; })], ["pediatrics", "#/consult?" + qs({ s: "pediatrics" }), minOf(function (u) { return spOf(u) === "pediatrics"; })]];
    return '<div class="wrap pad hcwrap"><h2>' + t.hc_h + '</h2><div class="hcgrid">' + rows.map(function (x) {
      return '<a class="hccard" href="' + x[1] + '"><svg class="hcic" viewBox="0 0 48 48" aria-hidden="true">' + HC_SVG[x[0]] + "</svg><span><b>" + t.hc_names[x[0]] + "</b><small>" + (x[2] == null ? t.hc_price_none : x[2] === 0 ? t.free_c : t.hc_from(num(x[2]) + " " + unit())) + "</small></span></a>";
    }).join("") + "</div></div>";
  }
  function viewSpecialists() {
    var t = L();
    return pageHead(t.nv_see, t.sp_h, t.sp_p) + '<div class="wrap pad"><div class="spcards">' + DOC_SP.filter(function (k) { return k !== "other"; }).map(function (k, i) {
      return '<div class="spcard"><span class="sptile" style="background:' + AVC[i % 4] + '">' + esc(t.docsp[k].charAt(0)) + "</span><div><h3>" + t.docsp[k] + '</h3><p class="muted">' + t.sp_desc[k] + '</p><div class="btns"><a class="btn sm" href="#/consult?' + qs({ s: k }) + '">' + ic("chat") + t.pr_consult + '</a><a class="btn ghost sm" href="#/doctors?' + qs({ s: k }) + '">' + t.cat_n(docsIn(k)) + "</a></div></div></div>";
    }).join("") + "</div></div>";
  }
  function viewFamily() {
    var t = L(), links = ["#/consult?" + qs({ s: "pediatrics" }), "#/consult?" + qs({ s: "therapist" }), "#/ona", "#/consult?" + qs({ s: "psych" })], all2 = ["#/doctors?" + qs({ s: "pediatrics" }), "#/doctors?" + qs({ s: "therapist" }), "#/doctors?" + qs({ s: "gyn", fem: "1" }), "#/doctors?" + qs({ s: "psych" })];
    var imgs = ["ped-baby", "elderly-visit", "pregnancy", "psychologist"];
    return pageHead(t.nv_see, t.fam_h, t.fam_p) + '<div class="wrap pad famlist">' + t.sl.map(function (x, i) {
      return '<section class="famrow slide s' + i + '"><div class="sltext"><span class="eyebrow">' + x[0] + "</span><h2>" + x[1] + "</h2><p>" + x[2] + '</p><ul class="slex">' + x[3].map(function (e) { return "<li>" + ic("check") + "<span>" + e + "</span></li>"; }).join("") + '</ul><div class="btns"><a class="btn" href="' + links[i] + '">' + (i === 2 ? x[4] : t.pr_consult) + '</a><a class="btn ghost" href="' + all2[i] + '">' + t.fam_all + "</a></div></div>" + photo(imgs[i], x[5], "(max-width: 760px) 90vw, 520px", "slimg") + "</section>";
    }).join("") + '<p class="fine">' + t.sl_em + "</p></div>";
  }
  function viewWellness() {
    var t = L(), icons = ["heart", "flask", "siren", "home", "chat", "check"];
    return pageHead(t.nv_well, t.wl_h, t.wl_p) + '<div class="wrap pad"><div class="wlcards">' + t.wl.map(function (x, i) {
      return '<article class="wlcard"><span class="act-ic">' + ic(icons[i]) + "</span><h2>" + x[0] + '</h2><ul class="slex one">' + x[1].map(function (e) { return "<li>" + ic("check") + "<span>" + e + "</span></li>"; }).join("") + '</ul><p class="wlwhen"><b>' + t.wl_when + "</b> " + x[2] + '</p><a class="btn ghost sm" href="' + x[3] + '">' + x[4] + " →</a></article>";
    }).join("") + '</div><p class="note-box" style="margin-top:24px">' + t.wl_note + "</p></div>";
  }
  /* the doctors-list filters to keep when the application panel opens over it */
  var dfKeep = function () { var q = current && (current.path === "/doctors" || current.path === "/consult") ? Object.assign({}, current.q) : {}; delete q.doc; delete q.now; delete q.smp; delete q.slot; if (current && current.path === "/consult") delete q.s; return q; };
  function dfQuery() { var v = function (id) { var el = $(id); return el ? el.value.trim() : ""; }; var r = v("df-r"), d = v("df-d"); if (d && !(disByCode[d] && regByCode[r] && disByCode[d].r === regByCode[r].i)) d = "";   /* a district from the region chosen before goes */
    return { s: v("df-s"), r: r, d: d, q: v("df-q"), lg: v("df-lg"), on: $("df-on") && $("df-on").checked ? "1" : "", fem: $("df-fem") && $("df-fem").checked ? "1" : "", sort: v("df-sort") }; }
  /* everyday complaints in Uzbek, Russian and English, and who sees them */
  var SYMS = [
    [["isitma", "harorat", "shamolla", "yo'tal", "tumov", "gripp", "temperatur", "кашел", "простуд", "насморк", "грипп", "температур", "fever", "cough", "cold", "flu"], ["gp", "therapist", "pediatrics"]],
    [["bola", "chaqaloq", "go'dak", "ребен", "ребён", "малыш", "child", "baby", "kid"], ["pediatrics"]],
    [["homilador", "hayz", "tug'ruq", "беремен", "месячн", "роды", "pregnan", "period"], ["gyn"]],
    [["bosim", "yurak", "давлен", "сердц", "blood pressure", "heart", "hypertens"], ["cardio", "therapist"]],
    [["bosh og'ri", "bosh aylan", "bel og'ri", "uvish", "головн", "мигрен", "спин", "головокруж", "headache", "migraine", "back pain", "dizz"], ["neuro"]],
    [["tish", "milk", "зуб", "десн", "tooth", "teeth", "gum"], ["dental"]],
    [["quloq", "tomoq", "burun", "angina", "sinusit", "ухо", "горл", "нос ", "ангин", "ear", "throat", "sinus", "tonsil"], ["ent"]],
    [["ko'z", "ko'rish", "глаз", "зрени", "eye", "vision"], ["eye"]],
    [["toshma", "teri", "husnbuzar", "qichi", "soch", "сып", "кож", "акне", "зуд", "rash", "skin", "acne", "itch", "hair"], ["derm"]],
    [["qand", "diabet", "qalqonsimon", "сахар", "диабет", "щитовид", "diabetes", "sugar", "thyroid"], ["endo"]],
    [["buyrak", "siydik", "почк", "моч", "kidney", "urine", "bladder"], ["uro"]],
    [["stress", "xavotir", "uyqu", "tushkun", "qo'rquv", "тревог", "стресс", "бессон", "депресс", "anxiety", "sleep", "depress", "panic"], ["psych"]],
    [["oshqozon", "ichak", "jigar", "ich ketish", "qayt", "желуд", "кишеч", "печен", "понос", "рвот", "stomach", "diarr", "vomit", "liver"], ["therapist", "gp"]],
    [["churra", "jarohat", "operatsiya", "грыж", "рана", "операц", "hernia", "wound", "surgery"], ["surgery"]]
  ];
  function symSpecs(qq) { var out = []; if (!qq || qq.length < 3) return out; SYMS.forEach(function (x) { if (x[0].some(function (w) { return qq.indexOf(norm(w)) > -1; })) x[1].forEach(function (k) { if (out.indexOf(k) < 0) out.push(k); }); }); return out; }
  function viewDoctors(q) {
    var t = L(), qq = norm(q.q);
    var ss = symSpecs(qq);   /* a complaint ("isitma", "tish og'rig'i") finds the right specialists, not only a name */
    var match = function (q) { return withSamples().filter(function (u) {
      var pr = u.profile || {}; if (u.role !== "doctor") return false;
      if ((q.s && pr.spec !== q.s) || (q.r && pr.region !== q.r) || (q.d && pr.district !== q.d) || (q.on && !isOnline(u)) || (q.fem && pr.sex !== "f") || (q.lg && (pr.langs || []).indexOf(q.lg) < 0)) return false;
      return !qq || ss.indexOf(pr.spec) > -1 || norm([u.name, specName(pr)].concat((pr.work || []).map(wpLabel), (pr.svc || []).map(function (x) { return x.name; })).join(" ")).indexOf(qq) > -1;
    }); };
    var list = realFirst(match(q), q.sort || "best");
    /* nothing matched: drop the language, then the region, and show the closest doctors */
    var near = [], any = q.s || q.r || q.q || q.lg || q.on || q.fem;
    if (!list.length && any) [{ lg: "" }, { lg: "", r: "" }, { lg: "", r: "", on: "", fem: "" }].some(function (o) { var q2 = Object.assign({}, q, o); near = realFirst(match(q2), q.sort || "best").slice(0, 8); return near.length; });
    var clinics = users().filter(function (u) { return u.role === "clinic" && (!q.r || (u.profile || {}).region === q.r); });
    var sel = function (id, label, opts, cur) { return '<label class="sel">' + label + ' <select id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (cur === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select></label>"; };
    var filters = '<form class="filters" id="docfilter">' +
      sel("df-s", t.d_spec, [["", t.all_specs]].concat(DOC_SP.map(function (k) { return [k, t.docsp[k]]; })), q.s || "") +
      sel("df-r", t.f_region, [["", t.all_regions]].concat(REG.map(function (r) { return [r.code, nmL(r)]; })), q.r || "") +
      (regByCode[q.r] ? sel("df-d", t.f_district, [["", t.all_districts]].concat(DIS.filter(function (d) { return d.r === regByCode[q.r].i; }).sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (d) { return [d.code, nmL(d)]; })), q.d || "") : "") +
      sel("df-lg", t.df_lang, [["", t.df_any_lang]].concat(["uz", "ru", "en", "kaa", "tg"].map(function (l) { return [l, langName(l)]; })), q.lg || "") +
      sel("df-sort", t.df_sort, ["best", "rating", "cheap", "exp"].map(function (k) { return [k, t.df_sorts[k]]; }), q.sort || "best") +
      '<label class="sel">' + t.ds_name + ' <input id="df-q" class="pinput" style="width:180px;text-align:left" value="' + esc(q.q || "") + '" placeholder="' + esc(t.ds_name_ph) + '"></label>' +
      '<label class="sel chkf"><input type="checkbox" id="df-on"' + (q.on ? " checked" : "") + "> " + t.df_online + "</label>" +
      '<label class="sel chkf"><input type="checkbox" id="df-fem"' + (q.fem ? " checked" : "") + "> " + t.df_fem + '</label><div class="dfgo"><button class="btn" type="submit">' + ic("search") + t.df_go + "</button>" + (any ? '<a class="btn ghost" href="#/doctors">' + t.df_clear + "</a>" : "") + "</div></form>";
    /* one page for choosing a doctor and applying: the first free doctor, or any card's button, opens the application over this list */
    return '<div class="band deep ochero' + (any ? " searching" : "") + '"><div class="wrap bhead"><div class="eyebrow">' + t.nv_clinic + "</div><h1>" + t.oc_page_h + '</h1><p class="sub">' + t.oc_page_p + '</p><ol class="ocsteps">' + t.oc_page_steps.map(function (x, i) { return "<li><b>" + (i + 1) + "</b><span>" + x + "</span></li>"; }).join("") + '</ol><p style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn light big" href="#/consult?' + qs(Object.assign({}, dfKeep(), { now: "1" })) + '">' + ic("video") + t.asap_now[0] + '</a><a class="btn ghost" style="color:var(--deep-ink);border-color:var(--deep-line)" href="#/register" data-regrole-link="doctor">' + t.reg_doc_cta + "</a></p></div></div>" +
      (any ? "" : hcCards()) + '<div class="wrap pad" style="padding-top:8px"><h2 class="subh">' + t.nv_panel + "</h2>" + filters + (ss.length ? '<p class="symhint">' + ic("search") + " " + t.sym_hint(esc(q.q), ss.map(function (k) { return t.docsp[k]; }).join(", ")) + "</p>" : "") + (list.some(function (u) { return u.sample; }) ? '<p class="fine smpline">' + t.smp_dir + "</p>" : "") + '<div class="results" style="padding:14px 0 0">' + (list.length ? '<p class="dfcount">' + t.df_found(list.length) + "</p>" + list.map(docCard).join("") : any ? '<div class="empty">' + t.df_none + ' <a href="#/doctors">' + t.df_clear + "</a></div>" + (near.length ? '<h2 class="subh" style="margin:22px 0 4px">' + t.df_near + "</h2>" + near.map(docCard).join("") : "") : '<div class="empty">' + t.no_doctors + "</div>") + "</div>" +
      '<h2 style="margin:40px 0 14px;font-size:1.4rem">' + t.clinics_reg_h + '</h2><div class="results" style="padding:0">' + (clinics.length ? clinics.map(function (c) { var pr = c.profile || {}; return '<article class="fcard"><div class="ficon c-' + (pr.ctype || "clinic") + '">' + ic(CAT_IC[pr.ctype || "clinic"]) + '</div><div class="fmain"><h3><a href="#/c/' + c.id + '">' + esc(c.name) + '</a></h3><div class="spec">' + t.cat[pr.ctype || "clinic"] + '</div><div class="badges">' + (c.verified ? vBadge(c) : "") + "</div>" + (pr.district && disByCode[pr.district] ? '<div class="meta">' + ic("pin") + esc(nmL(disByCode[pr.district]) + ", " + nmL(REG[disByCode[pr.district].r])) + "</div>" : "") + '</div><div class="facts"><a class="btn ghost sm" href="#/c/' + c.id + '">' + t.view + "</a></div></article>"; }).join("") : '<div class="empty">' + t.no_clinics_reg + "</div>") + "</div></div>";
  }

  /* ---------------- services and prices across doctors and clinics ---------------- */
  var norm = function (x) { return String(x || "").toLowerCase().replace(/[‘’ʻʼ'`]/g, "").replace(/\s+/g, " ").trim(); };
  var PQ_SYN = [["uzi", "узи", "узд", "ultratovush", "ultrasound"], ["qon", "кров", "blood"], ["ekg", "экг", "ecg"], ["pediatr", "педиатр", "paediatr", "bolalar"], ["ginekolog", "гинеколог", "gynaec", "gynec"], ["stomatolog", "стоматолог", "dentist", "tish"]];
  function pMatch(text, q) {
    if (!q) return true; var x = norm(text); if (x.indexOf(q) > -1) return true;
    return q.length >= 3 && PQ_SYN.some(function (g) { return g.some(function (w) { return q.indexOf(w) > -1 || w.indexOf(q) === 0; }) && g.some(function (w) { return x.indexOf(w) > -1; }); });
  }
  function priceRows() {
    var t = L(), out = [];
    withSamples().forEach(function (u) {
      if (u.role !== "doctor" && u.role !== "clinic") return;
      var pr = u.profile || {}, who = u.role === "doctor" ? specName(pr) : t.cat[pr.ctype || "clinic"];
      (pr.svc || []).forEach(function (x) { if (x.name) out.push({ u: u, name: x.name, price: x.price === "" || x.price == null ? null : +x.price, online: !!x.online, who: who }); });
      if (u.role === "doctor" && isOnline(u)) { var c = cpOf(pr); ["text", "audio", "video"].forEach(function (k) { if (c[k] != null) out.push({ u: u, name: t.pr_cs(t.cp_types[k]), price: c[k], online: true, cp: true, who: who }); }); }
    });
    return out;
  }
  /* the main button of a price row: book the service (an online one by consultation, an in-person one at the clinic), then the profile */
  function prAct(x, u, link) {
    var t = L(), sp = (u.profile || {}).spec, bp = u.role === "doctor" ? bookPlaces(u) : [];
    var act = x.cp ? '<a class="btn sm" href="#/consult?' + qs({ doc: u.id }) + '">' + ic("chat") + t.pr_consult + "</a>"
      : u.role === "clinic" ? (canBook(u) ? '<a class="btn sm" href="#/c/' + u.id + "?" + qs({ book: "1" }) + '">' + ic("cal") + t.ap_doc_short + "</a>" : "")
      : u.sample ? (sp ? '<a class="btn sm" href="#/consult?' + qs({ s: sp, smp: "1" }) + '">' + ic("chat") + t.pr_consult + "</a>" : "")   /* sample profiles can't be booked: ask a real doctor of the same field */
      : x.online && isOnline(u) ? '<a class="btn sm" href="#/consult?' + qs({ doc: u.id }) + '">' + ic("chat") + t.pr_consult + "</a>"
      : bp.length ? '<a class="btn sm" href="' + bookHref(bp[0], u) + '">' + ic("cal") + t.ap_doc_short + "</a>"
      : isOnline(u) ? '<a class="btn sm" href="#/consult?' + qs({ doc: u.id }) + '">' + ic("chat") + t.pr_consult + "</a>" : "";
    return '<span class="practs">' + act + '<a class="btn ghost sm" href="' + link + '">' + t.view + "</a></span>";
  }
  function viewPrices(q) {
    var t = L(), qq = norm(q.q), max = +q.max || 0, all0 = priceRows();
    var list = all0.filter(function (x) { var pr = x.u.profile || {}; return pMatch(x.name + " " + x.who, qq) && (!q.r || pr.region === q.r) && (!q.on || x.online) && (!max || (x.price != null && x.price <= max)); });
    list.sort(function (a, b) {
      if (!!a.u.sample !== !!b.u.sample) return a.u.sample ? 1 : -1;
      if (q.sort === "fresh") return (b.u.updated || "") < (a.u.updated || "") ? -1 : (b.u.updated || "") > (a.u.updated || "") ? 1 : 0;
      return (a.price == null ? Infinity : a.price) - (b.price == null ? Infinity : b.price) || (b.u.verified ? 1 : 0) - (a.u.verified ? 1 : 0);
    });
    var opt = function (v, label, cur) { return '<option value="' + v + '"' + (String(cur || "") === String(v) ? " selected" : "") + ">" + esc(label) + "</option>"; };
    var form = '<form class="form prform" id="prform" role="search"><div class="prgrid"><div class="fld"><label for="pr-q">' + t.pr_q + '</label><input id="pr-q" value="' + esc(q.q || "") + '" placeholder="' + esc(t.pr_q_ph) + '" autocomplete="off"></div>' +
      '<div class="fld"><label for="pr-r">' + t.f_region + '</label><select id="pr-r">' + opt("", t.all_regions, q.r) + REG.slice().sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (r) { return opt(r.code, nmL(r), q.r); }).join("") + "</select></div>" +
      '<div class="fld"><label for="pr-max">' + t.pr_max + '</label><select id="pr-max">' + opt("", t.pr_any, q.max) + [50000, 100000, 200000, 500000].map(function (v) { return opt(v, num(v) + " " + unit(), q.max); }).join("") + "</select></div>" +
      '<div class="fld"><label for="pr-sort">' + t.pr_sort + '</label><select id="pr-sort">' + ["cheap", "fresh"].map(function (k) { return opt(k, t.pr_sorts[k], q.sort || "cheap"); }).join("") + "</select></div></div>" +
      '<div class="prbar"><label class="chk" style="margin:0"><input type="checkbox" id="pr-on"' + (q.on ? " checked" : "") + "><span>" + t.pr_on + '</span></label><button class="btn" type="submit">' + ic("search") + t.pr_go + "</button></div>" +
      '<div class="chips" style="margin-top:12px">' + t.pr_quick.map(function (w) { return '<button type="button" class="chip" data-pq="' + esc(w) + '" aria-pressed="' + (norm(w) === qq) + '">' + esc(w) + "</button>"; }).join("") + "</div></form>";
    var row = function (x) {
      var u = x.u, pr = u.profile || {}, reg = pr.region && regByCode[pr.region] ? nmL(regByCode[pr.region]) : "", link = (u.role === "doctor" ? "#/doc/" : "#/c/") + u.id;
      return '<article class="prow"><div class="prmain"><h3>' + esc(x.name) + (x.online && !x.cp ? ' <span class="badge plain">' + t.online_b + "</span>" : "") + '</h3><div class="meta"><a href="' + link + '">' + esc(u.name) + "</a> · " + esc(x.who) + (reg ? " · " + esc(reg) : "") + " " + (u.sample ? smpBadge() : u.verified ? vBadge(u) : "") + "</div>" +
        (u.updated ? '<div class="fine">' + t.pr_upd(fmt(fromIso(u.updated), { day: "numeric", month: "short" })) + "</div>" : "") + "</div>" +
        '<div class="prside"><b class="nums">' + (x.price == null ? '<span class="muted">' + t.pr_ask + "</span>" : esc(money(x.price))) + "</b>" + prAct(x, u, link) + "</div></article>";
    };
    var smpNote = list.some(function (x) { return x.u.sample; }) ? '<p class="fine prnote">' + t.smp_dir + "</p>" : "";
    var body = !all0.length ? '<div class="empty">' + t.pr_empty + '<p style="margin-top:14px"><a class="btn" href="#/register" data-regrole-link="doctor">' + t.pr_add + "</a></p></div>"
      : list.length ? '<p class="muted" style="margin:0 0 10px">' + t.pr_n(list.length) + '</p><div class="prlist">' + list.map(row).join("") + "</div>" : '<div class="empty">' + t.pr_none + "</div>";
    return '<div class="band deep"><div class="wrap bhead"><div class="eyebrow">' + t.nav_prices + "</div><h1>" + t.pr_h + '</h1><p class="sub">' + t.pr_p + "</p></div></div>" +
      '<div class="wrap pad" style="padding-top:20px;max-width:980px">' + form + '<div style="margin-top:22px">' + smpNote + body + "</div></div>";
  }
  function prQuery(over) { var v = function (id) { var el = $(id); return el ? el.value.trim() : ""; }; return Object.assign({ q: v("pr-q"), r: v("pr-r"), max: v("pr-max"), sort: v("pr-sort") === "cheap" ? "" : v("pr-sort"), on: $("pr-on") && $("pr-on").checked ? "1" : "" }, over || {}); }


  /* ---------------- consultation applications and online / text consultation (demo) ---------------- */
  var KC = "shifokor-consults";
  var consults = function () { return store.get(KC, []); };
  var saveConsults = function (l) { store.set(KC, l); };
  var consultById = function (id) { return consults().filter(function (c) { return c.id === id; })[0] || null; };
  var CS = null;

  /* photos in a consultation (a rash, a lab result). The browser shrinks each one to JPEG, which also drops the
     phone's location data. Server mode keeps them on the server for this consultation's patient and doctor only;
     demo mode keeps smaller copies in this browser. */
  var KF = "shifokor-files", PH = null, CSPH = [], phUrls = {}, PH_FORM_MAX = 3;
  function shrinkPhoto(file, max) {
    var side = max || (BE ? 1600 : 1000), qual = max ? 0.8 : BE ? 0.82 : 0.7;
    return new Promise(function (ok, no) {
      if (!file) { no(new Error("photo")); return; }
      var src = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var k = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight)), cv = document.createElement("canvas"), cx = cv.getContext("2d");
        cv.width = Math.max(1, Math.round(img.naturalWidth * k)); cv.height = Math.max(1, Math.round(img.naturalHeight * k));
        cx.fillStyle = "#fff"; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(src);
        var url = cv.toDataURL("image/jpeg", qual);
        if (url.length > 2000000) url = cv.toDataURL("image/jpeg", 0.6);
        if (url.indexOf("data:image/jpeg") !== 0 || url.length > 2100000) { no(new Error("photo")); return; }
        ok({ url: url, data: url.slice(url.indexOf(",") + 1) });
      };
      img.onerror = function () { URL.revokeObjectURL(src); no(new Error("photo")); };
      img.src = src;
    });
  }
  /* demo mode: returns the new photo's id, or "" when this browser has no room left */
  function demoPhoto(ph) {
    var id = "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), m = store.get(KF, {});
    m[id] = ph.url;
    try { localStorage.setItem(KF, JSON.stringify(m)); } catch (e) { return ""; }
    phUrls[id] = ph.url; return id;
  }
  function photoSrc(id) { if (!phUrls[id] && !BE) phUrls[id] = store.get(KF, {})[id] || ""; return phUrls[id] || ""; }
  function phImg(id) { var t = L(); return '<button type="button" class="msgph" data-ph="' + esc(id) + '" aria-label="' + esc(t.ph_open) + '"><img data-phid="' + esc(id) + '" alt="' + esc(t.ph_alt) + '"></button>'; }
  /* fills in photo <img>s after a render; server photos load once and then come from memory */
  function hydratePhotos() {
    /* voice messages load the same way as photos */
    all("audio[data-auid]").forEach(function (au) {
      var id = au.dataset.auid, u = photoSrc(id);
      if (u) { au.src = u; return; }
      if (!BE) { au.replaceWith(document.createTextNode("—")); return; }
      BE.photo(id).then(function (url) { phUrls[id] = url; all('audio[data-auid="' + id + '"]').forEach(function (x) { x.src = url; }); }, function () {});
    });
    all("img[data-phid]").forEach(function (im) {
      var id = im.dataset.phid, u = photoSrc(id);
      if (u) { im.src = u; return; }
      var gone = function () { all('img[data-phid="' + id + '"]').forEach(function (x) { x.parentNode.classList.add("gone"); }); };
      if (!BE) { gone(); return; }
      BE.photo(id).then(function (url) { phUrls[id] = url; all('img[data-phid="' + id + '"]').forEach(function (x) { x.src = url; }); if (modal && modal.type === "photo" && modal.id === id) refreshModal(); }, gone);
    });
  }
  function phPick(input, max, done) {
    var t = L(), files = Array.prototype.slice.call(input.files || [], 0, max); input.value = "";
    if (!files.length) return;
    files.reduce(function (p, f) { return p.then(function (got) { return shrinkPhoto(f).then(function (ph) { return got.concat([ph]); }, function () { toast(t.ph_bad); return got; }); }); }, Promise.resolve([])).then(function (got) { if (got.length) done(got); });
  }

  function csStart(q) {
    var u = me(), pr = (u && u.profile) || {};
    CSPH = [];
    CS = { docQ: csKey(q), asap: (q.now === "1" || !!q.s) && !q.doc, type: "text", who: "self", name: u && u.role === "patient" ? u.name : "", age: "", sex: "f", phone: u && u.phone ? fmtPhone(u.phone) : "", region: pr.region || "", district: pr.district || "", complaint: "", since: "1", chronic: "", meds: "", allergy: "", spec: "", doc: q.doc || "", consent: false };
    if (AI.complaint) { CS.complaint = AI.complaint; AI.complaint = ""; }
    var d = q.doc ? userById(q.doc) : null; if (d) CS.spec = (d.profile || {}).spec || ""; if (d && d.sample) CS.doc = ""; if (!d && q.s) CS.spec = q.s; if (d && q.slot && +q.slot > Date.now()) { CS.slot = +q.slot; CS.slotDay = Date.UTC(new Date(+q.slot + TK).getUTCFullYear(), new Date(+q.slot + TK).getUTCMonth(), new Date(+q.slot + TK).getUTCDate()) - TK; }
  }
  function csCollect() {
    if (!CS) return;
    var map = { "cs-name": "name", "cs-age": "age", "cs-sex": "sex", "cs-phone": "phone", "cs-region": "region", "cs-district": "district", "cs-complaint": "complaint", "cs-since": "since", "cs-chronic": "chronic", "cs-meds": "meds", "cs-allergy": "allergy", "cs-spec": "spec", "cs-doc": "doc" };
    Object.keys(map).forEach(function (id) { var el = $(id); if (el) CS[map[id]] = el.value.trim(); });
    var c = $("cs-consent"); if (c) CS.consent = c.checked;
  }
  var onlineDoctors = function (spec) { return users().filter(function (u) { var pr = u.profile || {}; return u.role === "doctor" && isOnline(u) && (!spec || pr.spec === spec); }); };
  var csKey = function (q) { return (q.doc || "") + (q.s ? "|" + q.s : "") + (q.slot ? "@" + q.slot : ""); };
  /* where the apply panel's close button goes: the same doctors list, without the application */
  var apClose = function () { var q = Object.assign({}, current.q); delete q.doc; delete q.now; delete q.smp; delete q.slot; return "#/doctors" + (qs(q) ? "?" + qs(q) : ""); };
  /* the application form; embed = a panel over the doctors list (#/consult), so choosing a doctor and applying is one page */
  function viewConsult(q, embed) {
    var t = L(); if (!CS || CS.docQ !== csKey(q) || (q.now === "1" && !CS.asap && !CS.complaint)) csStart(q);
    var c = CS, fi = function (id, label, val, type, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + (type || "text") + '" value="' + esc(val || "") + '"' + (extra || "") + "></div>"; };
    var types = ["text", "audio", "video"].map(function (k) { return '<button type="button" class="rolecard" data-cstype="' + k + '" aria-pressed="' + (c.type === k) + '"><span class="icobox">' + ic(k === "text" ? "chat" : k === "audio" ? "mic" : "video") + "</span><b>" + t.cs_types[k][0] + "</b><span>" + t.cs_types[k][1] + "</span></button>"; }).join("");
    var dis = '<div class="two"><div class="fld"><label for="cs-region">' + t.f_region + '</label><select id="cs-region"><option value="">—</option>' + REG.slice().sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (r) { return '<option value="' + r.code + '"' + (c.region === r.code ? " selected" : "") + ">" + esc(nmL(r)) + "</option>"; }).join("") + '</select></div><div class="fld"><label for="cs-district">' + t.f_district + '</label><select id="cs-district">' + districtOptions(c.region, c.district) + "</select></div></div>";
    var docs = onlineDoctors(c.spec);
    var form =
      '<fieldset class="accsec"><legend>' + t.cs_prob_h + '</legend><div class="fld"><label for="cs-complaint">' + t.cs_complaint + '</label><textarea id="cs-complaint" maxlength="1500" placeholder="' + esc(t.cs_complaint_ph) + '">' + esc(c.complaint) + "</textarea></div>" +
      '<div class="phfld"><b>' + t.ph_form + '</b><div class="phrow">' + CSPH.map(function (p, i) { return '<span class="phthumb"><img src="' + p.url + '" alt="' + esc(t.ph_alt) + '"><button type="button" data-phrm="' + i + '" aria-label="' + esc(t.ph_remove) + '">×</button></span>'; }).join("") +
        (CSPH.length < PH_FORM_MAX ? '<label class="phadd"><input type="file" accept="image/*" id="cs-ph" class="vh" multiple>' + ic("camera") + "<span>" + t.ph_add + "</span></label>" : "") + '</div><p class="fine">' + t.ph_form_p(PH_FORM_MAX) + " " + t.ph_privacy + "</p></div>" +
      '</fieldset>' +
      '<fieldset class="accsec"><legend>' + t.cs_pat_h + '</legend><div class="seg" role="group" style="margin-bottom:14px">' + ["self", "child", "other"].map(function (k) { return '<button type="button" data-csfor="' + k + '" aria-pressed="' + (c.who === k) + '">' + t.cs_for[k] + "</button>"; }).join("") + "</div>" +
      '<div class="two">' + fi("cs-name", t.cs_pname, c.name, "text", ' autocomplete="name"') + fi("cs-age", t.cs_age, c.age, "number", ' min="0" max="120" inputmode="numeric"') + "</div>" +
      '<details class="csmore" id="cs-more"' + (c.who !== "self" || !okPhone(c.phone) || ($("cs-more") && $("cs-more").open) ? " open" : "") + '><summary>' + t.cs_more_h + '</summary><div class="two"><div class="fld"><label for="cs-sex">' + t.cs_sex + '</label><select id="cs-sex">' + ["f", "m"].map(function (k) { return '<option value="' + k + '"' + (c.sex === k ? " selected" : "") + ">" + t.cs_sexes[k] + "</option>"; }).join("") + "</select></div>" + fi("cs-phone", t.cs_phone, c.phone, "tel", ' inputmode="tel" placeholder="+998" autocomplete="tel"') + "</div>" + dis +
      '<div class="fld"><label for="cs-since">' + t.cs_since + '</label><select id="cs-since">' + t.cs_sinces.map(function (x, i) { return '<option value="' + i + '"' + (String(c.since) === String(i) ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></div>" +
      fi("cs-chronic", t.cs_chronic, c.chronic) + '<div class="two">' + fi("cs-meds", t.cs_meds, c.meds) + fi("cs-allergy", t.cs_allergy, c.allergy) + "</div></details></fieldset>" +
      '<fieldset class="accsec"><legend>' + t.cs_doc_h + '</legend><div class="roles two-roles" role="group" style="margin-bottom:14px">' + [["1", t.asap_now, "chat"], ["0", t.asap_pick, "search"]].map(function (x) { return '<button type="button" class="rolecard" data-csasap="' + x[0] + '" aria-pressed="' + (!!c.asap === (x[0] === "1")) + '"><span class="icobox">' + ic(x[2]) + "</span><b>" + x[1][0] + "</b><span>" + x[1][1] + "</span></button>"; }).join("") + "</div>" +
      (c.asap ? (function () { var n = onlineDoctors(c.spec).filter(onlineNow).length; return '<p class="cpnote">' + (n ? liveBadge() + " " + t.asap_note_on(n) : t.asap_note_off) + "</p>"; })() : "") +
      '<div class="two"><div class="fld"><label for="cs-spec">' + t.d_spec + '</label><select id="cs-spec"><option value="">' + t.cs_spec_any + "</option>" + DOC_SP.filter(function (k) { return k !== "other"; }).map(function (k) { return '<option value="' + k + '"' + (c.spec === k ? " selected" : "") + ">" + t.docsp[k] + "</option>"; }).join("") + '</select></div>' + (c.asap ? "</div>" : "") + '<div class="fld"' + (c.asap ? " hidden" : "") + '><label for="cs-doc">' + t.cs_doc_pick + '</label><select id="cs-doc"><option value="">' + t.cs_doc_any + "</option>" + docs.map(function (d) { var p = cpOf(d.profile)[c.type]; return '<option value="' + d.id + '"' + (c.doc === d.id ? " selected" : "") + ">" + esc(d.name) + " · " + esc(specName(d.profile || {})) + (p != null ? " · " + esc(money(p)) : "") + "</option>"; }).join("") + "</select></div>" + (c.asap ? "" : "</div>") + (function () {
        var d = !c.asap && c.doc ? userById(c.doc) : null; if (!d) return "";
        var cp = cpOf(d.profile), p = cp[c.type], anyP = ["text", "audio", "video"].some(function (k) { return cp[k] != null; });
        return '<p class="cpnote">' + (p != null ? ic("tag") + " <b>" + esc(t.cp_price_note(t.cs_types[c.type][0], money(p))) + ".</b> " + (p > 0 && payOn() ? t.cp_pay_online : t.cp_pay) : anyP ? t.cp_not_offered : t.cp_none) + "</p>";
      })() + slotPicker(c) + "</fieldset>" +
      '<label class="chk"><input type="checkbox" id="cs-consent"' + (c.consent ? " checked" : "") + "><span>" + t.cs_consent + '</span></label><div class="err" id="cs-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.cs_send + "</button>";
    if (embed) {
      var dd0 = q.doc ? userById(q.doc) : null, smp0 = dd0 && dd0.sample;
      var ttl = dd0 && !smp0 ? t.ap_to(dd0.name) : c.asap ? (c.spec ? t.ap_spec(t.docsp[c.spec] || "") : t.asap_now[0]) : t.cs_h_short;
      return '<a class="apov" href="' + apClose() + '" aria-label="' + esc(t.ap_x) + '" tabindex="-1"></a><aside class="applypanel" role="dialog" aria-modal="true" aria-labelledby="ap-h"><div class="aphead"><div><small>' + t.nv_clinic + '</small><h2 id="ap-h">' + esc(ttl) + '</h2></div><a class="apx" href="' + apClose() + '" aria-label="' + esc(t.ap_x) + '">×</a></div><div class="apbody">' +
        (BE && !BE.userId() ? '<div class="authgate"><b>' + t.ag_h + "</b><p>" + t.ag_p + '</p><div class="btns"><a class="btn" href="#/register">' + t.go_reg + '</a><a class="btn ghost" href="#/login">' + t.go_login + "</a></div></div>" : "") + (q.s && !q.doc ? '<p class="note-box">' + (q.smp ? t.ap_smp : t.ap_spec_note) + "</p>" : "") + '<p class="demo">' + t.cs_demo + "</p>" +
        '<form class="form accform" id="csform" novalidate><fieldset class="accsec"><legend>' + t.cs_type + '</legend><div class="roles">' + types + "</div>" +
        "</fieldset>" +
        '<p class="emline">' + ic("phone") + "<span>" + t.em_line + ' <a href="tel:103">103</a></span></p>' + form + "</form></div></aside>";
    }
    return '<div class="band deep"><div class="wrap bhead"><div class="eyebrow">' + t.nav_consult + "</div><h1>" + t.cs_h + '</h1><p class="sub">' + t.cs_p + "</p></div></div>" +
      '<div class="wrap pad acc" style="padding-top:28px">' + steps([t.cs_steps_h, t.cs_steps_p]) + '<div class="demo" style="margin:28px 0 20px">' + t.cs_demo + "</div>" +
      '<form class="form accform" id="csform" novalidate><fieldset class="accsec"><legend>' + t.cs_type + '</legend><div class="roles">' + types + "</div>" +
        '<details class="ocmini"><summary>' + t.oc_q + "</summary>" + ocLists(true) + "</details></fieldset>" +
      '<p class="emline">' + ic("phone") + "<span>" + t.em_line + ' <a href="tel:103">103</a></span></p>' + form + "</form></div>";
  }
  /* after accepting: straight to that consultation's chat, cursor in the reply box */
  function csOpen(id) { CS_FOCUS = Date.now(); if (current.path !== "/consult/" + id) go("#/consult/" + id); else render(true); }
  function csBadge(st) { var t = L(); return '<span class="badge ' + (st === "done" ? "ok" : st === "accepted" ? "" : st === "referred" || st === "cancelled" ? "plain" : "warn") + '">' + t.cs_st[st] + "</span>"; }
  function csRow(c) { var t = L(), mu = me(), rate = c.status === "done" && c.doctorId && !(mu && mu.role === "doctor") && !myReview("c", c.id); return '<a class="visit cs-row" href="#/consult/' + c.id + '"><div class="date"><span>' + fmt(c.slotAt ? tkDate(c.slotAt) : new Date(c.at), { month: "short" }) + "</span><b>" + (c.slotAt ? tkDate(c.slotAt) : new Date(c.at)).getDate() + '</b></div><div><h3>' + t.cs_no(c.n) + " " + csBadge(c.status) + (c.slotAt ? ' <span class="badge plain nums">' + ic("cal") + hhmm(c.slotAt) + "</span>" : "") + (c.status === "accepted" && c.payStatus === "due" ? " " + payBadge(c) : "") + (c.asap && c.status === "new" ? ' <span class="badge warn">' + t.asap_badge + "</span>" : "") + (rate ? ' <span class="badge warn">★ ' + t.rv_rate_badge + "</span>" : "") + '</h3><div class="muted" style="font-size:.92rem">' + t.cs_types[c.type][0] + " · " + esc(c.name) + " · " + esc(c.complaint.slice(0, 80)) + (c.complaint.length > 80 ? "…" : "") + '</div></div><div class="acts">' + ic(c.type === "text" ? "chat" : c.type === "audio" ? "mic" : "video") + "</div></a>"; }
  /* visits patients booked at a clinic with this doctor: the clinic confirms the hour, the doctor sees them here */
  function docVisits(u, always) {
    var t = L(), list = apSort(appts().filter(function (a) { return a.doctorId === u.id; })), open = list.filter(apOpen);
    if (!always && !open.length) return "";
    return '<div class="dcard" style="margin-top:22px"><h2>' + t.ap_docv_h + '</h2><p class="muted" style="margin:4px 0 12px">' + t.ap_docv_p + "</p>" + (list.length ? '<div class="visits">' + (always ? list : open).map(function (a) { return apRow(a, "doc"); }).join("") + "</div>" : '<p class="muted">' + t.ap_docv_none + "</p>") + "</div>";
  }
  function docInbox(u) {
    var t = L(), sp = (u.profile || {}).spec;
    var list = consults().filter(function (c) { return c.doctorId === u.id || (c.status === "new" && (c.doc ? c.doc === u.id : !c.spec || c.spec === sp || (sp === "gp" && !c.spec))); }).sort(function (a, b) { return b.at - a.at; });
    return '<div class="dcard" style="margin-bottom:22px"><h2>' + t.cs_doc_list_h + "</h2>" + (list.length ? '<div class="visits">' + list.map(csRow).join("") + "</div>" : '<p class="muted" style="margin-top:8px">' + t.cs_none + "</p>") + "</div>";
  }
  /* ---------------- paying for a consultation: Payme or Click, after the doctor accepts ---------------- */
  var payOn = function () { var p = BE ? BE.pay() : null; return !BE || !!(p.payme || p.click); };   /* demo mode shows the flow with a test button */
  function payBadge(c) {
    var t = L();
    if (c.payStatus === "paid") return '<span class="badge ok">' + t.pay_paid + "</span>";
    if (c.payStatus === "refunded") return '<span class="badge plain">' + t.pay_refunded + "</span>";
    return c.payStatus === "due" && c.status === "accepted" ? '<span class="badge warn">' + t.pay_due + "</span>" : "";
  }
  /* the consultation this browser just left to pay for, so the page can say the payment is being checked */
  function paying() { try { var x = JSON.parse(sessionStorage.getItem("shifokor-paying") || "null"); return x && Date.now() - x.at < 1800e3 ? x.id : ""; } catch (e) { return ""; } }
  function payCard(c) {
    var t = L(), pv = BE ? BE.pay() : {};
    var btn = function (k, label) { return '<button class="btn big" type="button" data-pay="' + k + '" data-id="' + c.id + '">' + label + "</button>"; };
    var btns = BE ? (pv.payme ? btn("payme", t.pay_payme) : "") + (pv.click ? btn("click", t.pay_click) : "") : btn("demo", t.pay_demo);
    return '<div class="dcard paycard" id="pay"><h2>' + t.pay_h + '</h2><p class="payamt nums">' + esc(money(c.price)) + '</p><p class="muted">' + t.pay_p(esc(c.doctorName)) + "</p>" +
      (paying() === c.id ? '<p class="note-box" role="status">' + t.pay_checking + "</p>" : "") +
      (btns ? '<div class="paybtns">' + btns + "</div>" : '<p class="note-box">' + t.pay_off + "</p>") + '<p class="fine">' + (BE ? t.pay_safe : t.pay_demo_note) + "</p></div>";
  }
  /* ---------------- "Onalar uchun": pregnancy and the first six weeks after birth ---------------- */
  var KO = "shifokor-ona", ONA_WEEKS = [12, 20, 26, 30, 34, 36, 38, 40];   /* WHO: at least 8 antenatal contacts */
  var ONA_PREG = ["bleed", "head", "swell", "fever", "move", "belly", "water", "fit", "breath"], ONA_BORN = ["bleed", "fever", "head", "breath", "bfever", "bfeed", "byellow", "bbreath", "bfit"];
  var ON = { mode: "due", urgent: false, ok: false, famUrl: "", del: false };
  function myPreg() { var u = me(); if (!u) return null; if (BE) return BE.ona().preg; return store.get(KO, {})[u.id] || null; }
  function savePregDemo(p) { var u = me(), all = store.get(KO, {}); if (p) all[u.id] = p; else delete all[u.id]; store.set(KO, all); }
  var dayN = function (s) { return Math.round((fromIso(String(s).slice(0, 10)) - today0()) / 864e5); };   /* days from today */
  var pregWeek = function (due) { return Math.floor((280 - dayN(due)) / 7); };
  var weekDate = function (due, w) { var d = fromIso(due); d.setDate(d.getDate() - (280 - 7 * w)); return iso(d); };
  var gynDocs = function () { return users().filter(function (u) { return u.role === "doctor" && (u.profile || {}).spec === "gyn"; }).sort(function (a, b) { return ((b.profile || {}).sex === "f") - ((a.profile || {}).sex === "f"); }); };
  function onaSetup(p) {
    var t = L(), docs = gynDocs(), cur = p ? p.doctor : "";
    return '<form class="form accform" id="onaform" novalidate><fieldset class="accsec"><legend>' + t.ona_setup_h + '</legend><div class="seg" role="group" style="margin-bottom:12px">' + [["due", t.ona_mode_due], ["lmp", t.ona_mode_lmp]].map(function (x) { return '<button type="button" data-onamode="' + x[0] + '" aria-pressed="' + (ON.mode === x[0]) + '">' + x[1] + "</button>"; }).join("") + "</div>" +
      '<div class="two"><div class="fld"><label for="ona-date">' + (ON.mode === "lmp" ? t.ona_lmp_l : t.ona_due_l) + '</label><input id="ona-date" type="date" value="' + (p && ON.mode === "due" ? p.due : "") + '"></div>' +
      '<div class="fld"><label for="ona-doc">' + t.ona_doc_l + '</label><select id="ona-doc"><option value="">' + t.ona_doc_later + "</option>" + docs.map(function (d) { return '<option value="' + d.id + '"' + (cur === d.id ? " selected" : "") + ">" + esc(d.name) + ((d.profile || {}).sex === "f" ? " · " + t.ona_fem : "") + "</option>"; }).join("") + "</select></div></div>" +
      '<div class="err" id="ona-err" aria-live="polite"></div><button class="btn" type="submit">' + t.ona_save + '</button><p class="fine" style="margin-top:10px">' + t.ona_privacy + "</p></fieldset></form>";
  }
  function onaIntro() { var t = L(); return '<div class="why">' + t.ona_why.map(function (x, i) { return '<div class="whyi"><span class="act-ic">' + ic(["heart", "bell", "shield"][i]) + "</span><b>" + x[0] + "</b><p>" + x[1] + "</p></div>"; }).join("") + "</div>"; }
  /* a doctor's pregnant patients who chose them, with their last check-in */
  function mothersCard() {
    var t = L(), u = me(), all = store.get(KO, {});
    var l = BE ? BE.ona().mothers : Object.keys(all).filter(function (k) { return all[k].doctor === u.id; }).map(function (k) { var p = all[k], c = (p.checks || [])[0]; return { name: (userById(k) || {}).name || "—", phone: (userById(k) || {}).phone || "", due: p.due, born: p.born, lastSigns: c ? c.signs : [], lastAt: c ? c.at : 0 }; });
    if (!l.length) return "";
    return '<div class="dcard" style="margin-bottom:22px"><h2>' + t.ona_mothers_h + "</h2>" + l.map(function (m) {
      var bad = m.lastSigns && m.lastSigns.length;
      return '<div class="porow"><b>' + esc(m.name) + '</b><span class="muted">' + (m.born ? t.ona_after : t.ona_week(pregWeek(m.due))) + (m.phone ? " · " + esc(fmtPhone(m.phone)) : "") + "</span>" + (m.lastAt ? '<span class="badge ' + (bad ? "risk" : "ok") + '">' + (bad ? m.lastSigns.map(function (k) { return t.ona_signs[k]; }).join(", ") : t.ona_fine) + "</span>" : "<span>—</span>") + "</div>";
    }).join("") + "</div>";
  }
  function viewOna() {
    var t = L(), u = me(), p = myPreg();
    var head = '<div class="band deep"><div class="wrap bhead"><div class="eyebrow">' + t.nav_ona + "</div><h1>" + t.ona_h + '</h1><p class="sub">' + t.ona_p + "</p></div></div>";
    if (!u) return head + '<div class="wrap pad">' + onaIntro() + '<div class="btns" style="margin-top:22px"><a class="btn big" href="#/register">' + t.ona_join + '</a><a class="btn ghost big" href="#/login">' + t.go_login + "</a></div></div>";
    if (u.role === "doctor") return head + '<div class="wrap pad">' + (mothersCard() || '<p class="muted">' + t.ona_mothers_none + "</p>") + "</div>";
    if (!p) return head + '<div class="wrap pad acc">' + onaIntro() + '<div style="margin-top:24px">' + onaSetup(null) + "</div></div>";
    var born = !!p.born, w = pregWeek(p.due), left = dayN(p.due), list = born ? ONA_BORN : ONA_PREG, doc = p.doctor ? userById(p.doctor) : null;
    var top = born ? '<div class="dcard onaweek"><span>' + t.ona_after + "</span><b>" + t.ona_days_after(Math.max(0, -dayN(p.born))) + "</b><small>" + t.ona_born_on(poDay(p.born)) + "</small></div>"
      : '<div class="dcard onaweek"><span>' + t.ona_week_l + " · " + t.ona_tri[w < 14 ? 0 : w < 28 ? 1 : 2] + "</span><b>" + t.ona_week(Math.max(1, Math.min(42, w))) + '</b><div class="onabar" role="img" aria-label="' + esc(t.ona_week(w)) + '"><i style="width:' + Math.max(3, Math.min(100, w / 40 * 100)) + '%"></i></div><small>' + t.ona_due(poDay(p.due), left) + "</small></div>";
    var check = '<div class="dcard onacheck" id="onacheck"><h2>' + (born ? t.ona_q_born : t.ona_q) + "</h2>" +
      (ON.urgent ? '<div class="emerg" role="alert" style="margin:10px 0 14px"><b>' + t.ona_urgent_h + "</b> " + t.ona_urgent_p + ' <span class="btns" style="margin-top:10px"><a class="btn danger sm" href="tel:103">' + ic("phone") + '103</a><a class="btn ghost sm" href="#/find?near=1">' + ic("hosp") + t.ona_hosp + "</a></span></div>" : "") +
      (ON.ok ? '<p class="note-box ok-box">' + t.ona_ok_done + "</p>" : "") +
      '<button class="btn" type="button" data-ona="ok">' + ic("check") + t.ona_ok + '</button><p class="muted" style="margin:16px 0 8px">' + t.ona_signs_h + '</p><div class="signs">' +
      list.map(function (c) { return '<label class="chk"><input type="checkbox" value="' + c + '" name="onasign"><span>' + t.ona_signs[c] + "</span></label>"; }).join("") +
      '</div><button class="btn danger" type="button" data-ona="send">' + t.ona_send + "</button></div>";
    var hist = (p.checks || []).length ? '<div class="dcard"><h2>' + t.ona_hist_h + "</h2>" + p.checks.slice(0, 8).map(function (c) { return '<div class="porow"><span class="nums">' + esc(fmt(new Date(c.at), { day: "numeric", month: "short" })) + "</span>" + (c.signs.length ? '<span class="badge risk">' + c.signs.map(function (k) { return t.ona_signs[k]; }).join(", ") + "</span>" : '<span class="badge ok">' + t.ona_fine + "</span>") + '<span class="muted">' + (c.week ? t.ona_week(c.week) : "") + "</span></div>"; }).join("") + "</div>" : "";
    var nextW = ONA_WEEKS.filter(function (x) { return x >= w; })[0];
    var sched = born ? "" : '<div class="dcard"><h2>' + t.ona_sched_h + '</h2><ol class="sched">' + ONA_WEEKS.map(function (x) { var st = x < w ? "past" : x === nextW ? "next" : ""; return '<li class="' + st + '"><b>' + t.ona_week(x) + '</b><span class="nums">' + esc(poDay(weekDate(p.due, x))) + "</span>" + (st === "next" ? '<span class="badge warn">' + t.ona_next + "</span>" : st === "past" ? '<span class="muted">✓</span>' : "") + "</li>"; }).join("") + '</ol><p class="fine">' + t.ona_sched_note + "</p></div>";
    var docBox = '<div class="dcard"><h2>' + t.ona_doc_h + "</h2>" + (doc || p.doctorName ? "<p><b>" + esc(doc ? doc.name : p.doctorName) + "</b>" + (doc ? " · " + esc(specName(doc.profile || {})) : "") + '</p><div class="btns"><a class="btn sm" href="#/consult?' + qs({ doc: p.doctor }) + '">' + ic("chat") + t.ona_doc_write + "</a></div>" : '<p class="muted">' + t.ona_doc_none + '</p><a class="btn sm" href="#/doctors?' + qs({ s: "gyn", fem: "1" }) + '">' + ic("search") + t.ona_doc_find + "</a>") + "</div>";
    var tgOn = BE && BE.notify().tg;
    var fam = '<div class="dcard"><h2>' + t.ona_fam_h + '</h2><p class="muted">' + t.ona_fam_p + "</p>" +
      (p.familyLinked ? "<p><b>" + esc(p.family) + "</b> · " + t.ona_fam_on + '</p><button class="btn ghost sm" type="button" data-ona="famoff">' + t.ona_fam_off + "</button>"
        : ON.famUrl ? "<p>" + t.ona_fam_send(esc(p.family)) + '</p><div class="msgbox">' + esc(ON.famUrl) + '</div><div class="btns" style="margin-top:8px"><button class="btn sm" type="button" data-ona="famcopy">' + ic("copy") + t.ona_fam_copy + "</button></div>"
        : tgOn ? (p.familyWaiting ? '<p class="fine">' + t.ona_fam_wait(esc(p.family)) + "</p>" : "") + '<div class="fld"><label for="ona-fam">' + t.ona_fam_name + '</label><input id="ona-fam" maxlength="80" placeholder="' + esc(t.ona_fam_ph) + '"></div><button class="btn sm" type="button" data-ona="fam">' + t.ona_fam_btn + "</button>"
        : '<p class="fine">' + t.ona_fam_notg + "</p>") + "</div>";
    var sets = '<details class="finish"><summary>' + t.ona_set_h + "</summary>" + (born ? "<p>" + t.ona_born_on(poDay(p.born)) + ' <button class="linkbtn" type="button" data-ona="unborn">' + t.ona_unborn + "</button></p>"
        : '<div class="fld"><label for="ona-born">' + t.ona_born_l + '</label><input id="ona-born" type="date" max="' + iso(today0()) + '"></div><button class="btn sm" type="button" data-ona="born">' + t.ona_born_btn + "</button>") +
      '<div style="margin-top:14px">' + onaSetup(p) + "</div><p>" + (ON.del ? '<button class="btn danger sm" type="button" data-ona="delok">' + t.ona_del_yes + '</button> <button class="btn ghost sm" type="button" data-ona="delno">' + t.po_cancel + "</button>" : '<button class="linkbtn" type="button" data-ona="del">' + t.ona_del + "</button>") + "</p></details>";
    return head + '<div class="wrap"><div class="pf"><div>' + top + check + hist + '</div><aside class="onaside">' + sched + docBox + fam + sets + '<p class="fine">' + t.ona_privacy + "</p></aside></div></div>";
  }
  /* the patient's side after a consultation: "come in person" advice, or "how are you feeling?" two days later */
  function careCard(c) {
    var t = L();
    if (c.status === "referred") return '<div class="dcard carecard"><h2>' + t.rf2_h + "</h2><p>" + t.rf2_p(esc(c.doctorName)) + '</p><div class="btns"><a class="btn" href="#/find?near=1">' + ic("hosp") + t.rf2_near + '</a><a class="btn ghost" href="tel:103">' + ic("phone") + "103</a></div></div>";
    if (c.status !== "done" || !c.followupAt) return "";
    if (!c.followup) return '<div class="dcard carecard"><h2>' + t.fu_h + '</h2><p class="muted">' + t.fu_p(esc(c.doctorName)) + '</p><div class="btns">' + ["better", "same", "worse"].map(function (k) { return '<button class="btn' + (k === "better" ? "" : " ghost") + '" type="button" data-fu="' + k + '" data-id="' + c.id + '">' + t.fu_opts[k] + "</button>"; }).join("") + "</div></div>";
    if (c.followup !== "worse") return '<p class="note-box ok-box">' + t.fu_thanks + "</p>";
    return '<div class="dcard carecard warn"><h2>' + t.fu_worse_h + "</h2><p>" + t.fu_worse_p + '</p><div class="btns">' + (c.doctorId ? '<a class="btn" href="#/consult?' + qs({ doc: c.doctorId }) + '">' + ic("chat") + t.fu_again + "</a>" : "") + '<a class="btn ghost" href="#/find?near=1">' + ic("hosp") + t.rf2_near + '</a><a class="btn danger" href="tel:103">' + ic("phone") + "103</a></div></div>";
  }
  /* which problems suit an online consultation, and which need 103 */
  function ocLists(mini) {
    var t = L(), li = function (l) { return "<ul>" + l.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; };
    return '<div class="oc' + (mini ? " mini" : "") + '"><div class="occol"><h3>' + ic("check") + t.oc_common_h + "</h3>" + li(t.oc_common) + '</div><div class="occol"><h3>' + ic("heart") + t.oc_chronic_h + "</h3>" + li(t.oc_chronic) + '</div><div class="occol not"><h3>' + ic("siren") + t.oc_not_h + "</h3>" + li(t.oc_not) + '</div></div><p class="ocpromise">' + ic("shield") + " " + t.oc_promise + "</p>";
  }
  /* the doctor pressed "call" in the last 3 minutes */
  var ringNow = function (c) { return !!c.callAt && Date.now() - c.callAt < 180e3; };
  function openCall(c, role) {
    var t = L();
    if (!window.ShifokorCall) return;
    var onChat = BE ? function (text) { var mu = me(); BE.addMessage(c.id, role, mu ? mu.name : "", text).catch(function () {}); } : null;   /* messages written during the call stay in the consultation's chat */
    ShifokorCall.open({ cid: c.id, role: role, media: c.type === "video" ? "video" : "audio", title: t.cs_no(c.n), peer: role === "d" ? c.name : c.doctorName, t: t, demo: !BE, onChat: onChat,
      done: function (sec) { if (sec) toast(t.cl_ended(Math.floor(sec / 60) + ":" + pad(sec % 60))); render(true); } });
    render(true);
  }
  function viewConsultThread(id) {
    var t = L(), c = consultById(id); if (!c) return '<div class="wrap pad"><div class="empty">' + t.not_found + "</div></div>";
    markSeen([["c" + c.id, (c.msgs || []).length]]);
    var u = me(), isDoc = !!(u && u.role === "doctor"), mineDoc = isDoc && c.doctorId === u.id;
    var dd = c.district && disByCode[c.district], area = dd ? nmL(dd) + ", " + nmL(REG[dd.r]) : c.region && regByCode[c.region] ? nmL(regByCode[c.region]) : "—";
    var row = function (k, v) { return v ? "<dt>" + k + "</dt><dd>" + v + "</dd>" : ""; };
    var due = c.status === "accepted" && c.payStatus === "due";
    var details = '<dl class="kv">' + row(t.cs_type_lbl, t.cs_types[c.type][0]) + row(t.pay_price, c.price != null && c.status !== "new" ? '<span class="nums">' + esc(money(c.price)) + "</span>" : "") + row(t.cs_for_lbl, t.cs_for[c.who]) + row(t.cs_pname, esc(c.name)) + row(t.cs_age, esc(c.age)) + row(t.cs_sex, t.cs_sexes[c.sex]) + row(t.cs_phone, '<span class="nums">' + esc(isDoc || !c.userId || (u && u.id === c.userId) ? c.phone : maskPhone(c.phone)) + "</span>") + row(t.cs_area, esc(area)) + row(t.cs_since, t.cs_sinces[+c.since]) + "</dl>" +
      '<h3 style="margin:16px 0 6px">' + t.cs_complaint + '</h3><p class="pre">' + esc(c.complaint) + "</p>" +
      '<dl class="kv" style="margin-top:14px">' + row(t.cs_chronic, esc(c.chronic)) + row(t.cs_meds, esc(c.meds)) + row(t.cs_allergy, esc(c.allergy)) + row(t.cs_wanted, c.spec ? t.docsp[c.spec] : t.cs_spec_any) + row(t.cs_doctor, c.doctorId ? '<a href="#/doc/' + c.doctorId + '">' + esc(c.doctorName) + "</a>" : "") + "</dl>";
    var msgs = c.msgs.map(function (m) { if (m.from === "s") return '<div class="sys">' + esc(m.text) + "</div>"; var mine = (isDoc && m.from === "d") || (!isDoc && m.from === "p"); return '<div class="' + (mine ? "me" : "them") + (m.file ? " hasph" : "") + '">' + (m.from === "d" && !mine ? "<b>" + esc(m.name) + "</b>" : "") + (m.file ? (m.fk === "a" ? '<audio class="voice" controls preload="none" data-auid="' + esc(m.file) + '"></audio>' : phImg(m.file)) : "") + esc(m.text || "") + '<small>' + fmt(new Date(m.at), { day: "numeric", month: "short" }) + " " + pad(new Date(m.at).getHours()) + ":" + pad(new Date(m.at).getMinutes()) + "</small></div>"; }).join("");
    var canWrite = c.status !== "done" && c.status !== "referred" && c.status !== "cancelled" && (!isDoc || (mineDoc && !due));
    var actions = "";
    if (isDoc && c.status === "new") actions = '<button class="btn" type="button" data-cs="accept" data-id="' + c.id + '">' + ic("check") + t.cs_accept + "</button>" +
      /* instead of accepting: an in-person visit is needed, the application closes and nothing is charged */
      '<details class="finish"><summary>' + t.rf2_btn + '</summary><form id="csrefer" data-id="' + c.id + '" novalidate><div class="fld"><label for="cs-adv">' + t.rf2_label + '</label><textarea id="cs-adv" maxlength="1000" placeholder="' + esc(t.rf2_ph) + '"></textarea></div><div class="err" id="csr-err" aria-live="polite"></div><button class="btn" type="submit">' + t.rf2_send + '</button><p class="fine" style="margin-top:8px">' + t.rf2_note + "</p></form></details>";
    if (mineDoc && c.status === "accepted") actions = (due ? '<div class="note-box">' + ic("tag") + " " + t.pay_wait_doc(esc(money(c.price))) + "</div>" : "") + (!due ? (c.callBy === "p" && ringNow(c) ? '<div class="ring" role="status"><span class="ring-ic">' + ic(c.type === "video" ? "video" : "mic") + "</span><div><b>" + t.cl_pat_ringing + "</b><span>" + esc(c.name) + "</span></div></div>" : "") + '<button class="btn" type="button" data-cs="call" data-id="' + c.id + '">' + ic(c.type === "video" ? "video" : "mic") + (c.callBy === "p" && ringNow(c) ? t.cl_answer : c.type === "text" ? t.cl_call_audio : t.cs_call) + "</button>" : "") +
      '<details class="finish"><summary>' + t.cs_finish + '</summary><form id="csfinish" data-id="' + c.id + '" novalidate><div class="radio">' + t.on_out.map(function (o, i) { return '<label><input type="radio" name="csout" value="' + i + '">' + o + "</label>"; }).join("") + '</div><div class="fld"><label for="cs-sum">' + t.vs_note + '</label><textarea id="cs-sum" maxlength="600"></textarea></div><div class="err" id="csf-err"></div><button class="btn" type="submit">' + t.vs_save + "</button></form></details>";
    if (!isDoc && c.status === "accepted" && !due && (u ? c.userId === u.id : !c.userId)) actions = (c.call && ringNow(c) && c.callBy !== "p" ? '<button class="btn" type="button" data-cs="join" data-id="' + c.id + '">' + ic(c.type === "video" ? "video" : "mic") + t.cs_join + "</button>" : "") +
      '<button class="btn' + (c.call && ringNow(c) && c.callBy !== "p" ? " ghost" : "") + '" type="button" data-cs="pcall" data-id="' + c.id + '">' + ic(c.type === "video" ? "video" : "phone") + t.cl_call_doc(c.type === "video") + "</button>";
    var slotBox = c.slotAt && (c.status === "new" || c.status === "accepted") ? '<div class="slotbox' + (c.slotAt - Date.now() < 3600e3 && c.slotAt > Date.now() - 3600e3 ? " soon" : "") + '">' + ic("cal") + "<div><small>" + t.sl_when + "</small><b>" + esc(slotTxt(c.slotAt)) + "</b><span>" + (c.slotAt > Date.now() ? t.sl_in(Math.round((c.slotAt - Date.now()) / 60e3)) : t.sl_now) + " · " + t.sl_tz + "</span></div></div>" : "";
    var own = !isDoc && (u ? c.userId === u.id : !c.userId), dWho = c.doc ? userById(c.doc) : c.doctorId ? userById(c.doctorId) : null;
    var canMove = own && c.slotAt && (c.status === "new" || c.status === "accepted") && dWho && hoursOf(dWho.profile);
    var manage = own && (c.status === "new" || canMove) ? (RS && RS.cid === c.id ? '<div class="dcard rsbox"><h2>' + t.rs_h + "</h2>" + slotPicker(RS) + '<div class="err" id="rs-err" aria-live="polite"></div><div class="btns"><button class="btn" type="button" data-rs="save"' + (RS.slot ? "" : " disabled") + ">" + t.rs_save + '</button><button class="btn ghost" type="button" data-rs="close">' + t.po_cancel + "</button></div></div>"
      : CX === c.id ? '<div class="confirm-row"><b>' + t.cx_q + '</b><button class="btn danger sm" type="button" data-cx="yes" data-id="' + c.id + '">' + t.cx_yes + '</button><button class="btn ghost sm" type="button" data-cx="no">' + t.v_keep + "</button></div>"
      : '<div class="btns manage">' + (canMove ? '<button class="btn ghost sm" type="button" data-rs="open" data-id="' + c.id + '">' + ic("cal") + t.rs_btn + "</button>" : "") + (c.status === "new" ? '<button class="linkbtn" type="button" data-cx="ask" data-id="' + c.id + '">' + t.cx_btn + "</button>" : "") + "</div>") : "";
    var talk = c.status === "accepted" && !due && (mineDoc || (!isDoc && (u ? c.userId === u.id : !c.userId))) ? '<div class="talkbar"><span>' + t.tk_h + '</span><a class="btn" href="#csmsg" data-scroll="csmsg">' + ic("chat") + t.tk_write + '</a><button class="btn ghost" type="button" data-cs="' + (mineDoc ? "call" : "pcall") + '" data-id="' + c.id + '">' + ic(c.type === "video" ? "video" : "phone") + (c.type === "video" ? t.tk_video : t.tk_call) + "</button></div>" : "";
    var ringing = !isDoc && c.status === "accepted" && c.callBy !== "p" && ringNow(c) && !due && !(window.ShifokorCall && ShifokorCall.active());
    return '<div class="wrap"><a class="back" href="' + (isDoc ? "#/pro?tab=requests" : "#/visits") + '">‹ ' + (isDoc ? t.pro_t.requests : t.nav_visits) + '</a><div class="sechead" style="padding-top:12px"><div><h1 style="font-size:clamp(1.6rem,1.3rem + 1.4vw,2.3rem)">' + t.cs_no(c.n) + "</h1><div class=\"badges\">" + csBadge(c.status) + payBadge(c) + (c.asap && c.status === "new" ? '<span class="badge warn">' + t.asap_badge + "</span>" : "") + (isDoc && c.followup ? '<span class="badge ' + (c.followup === "worse" ? "warn" : "ok") + '">' + t.fu_doc(t.fu_opts[c.followup]) + "</span>" : "") + '<span class="badge plain">' + t.cs_types[c.type][0] + "</span></div></div>" + (isDoc ? '<span class="sample">' + t.cs_doc_view + "</span>" : "") + "</div>" +
      slotBox + manage + talk + (ringing ? '<div class="ring" role="status"><span class="ring-ic">' + ic(c.type === "video" ? "video" : "mic") + "</span><div><b>" + t.cl_ringing + "</b><span>" + esc(c.doctorName) + '</span></div><button class="btn" type="button" data-cs="join" data-id="' + c.id + '">' + t.cs_join + "</button></div>" : "") +
      '<div class="pf" style="padding-top:18px"><div>' + (!isDoc && due && (u ? c.userId === u.id : !c.userId) ? payCard(c) : "") + (!isDoc && (u ? c.userId === u.id : !c.userId) ? careCard(c) : "") + rxCard(c, mineDoc, !isDoc && (u ? c.userId === u.id : !c.userId)) + (!isDoc && c.status === "done" && c.doctorId && (u ? c.userId === u.id : !c.userId) ? rvCard("c", c.id, c.doctorName, false) : "") + '<div class="dcard"><h2>' + t.cs_details + "</h2>" + details + "</div>" + (isDoc && !mineDoc && c.status !== "new" ? "" : "") + '<p class="fine" style="margin-top:14px">' + t.cs_demo + "</p></div>" +
      '<aside class="dcard chatcard"><h2>' + t.cs_thread + '</h2><div class="room-log" id="cslog">' + (msgs || '<div class="sys">' + t.cs_sent + "</div>") + "</div>" +
      (canWrite ? voBar(c.id) + '<form class="room-send withph" id="csmsg" data-id="' + c.id + '" style="margin-top:10px">' + (PH && PH.cid === c.id ? '<div class="phpend"><img src="' + PH.url + '" alt="' + esc(t.ph_alt) + '"><span>' + t.ph_ready + '</span><button class="btn ghost sm" type="button" data-act="phdrop">' + t.ph_remove + "</button></div>" : "") +
        '<label class="btn ghost phbtn" title="' + esc(t.ph_add) + '"><input type="file" accept="image/*" id="csmsg-ph" class="vh" aria-label="' + esc(t.ph_add) + '">' + ic("camera") + '</label><button class="btn ghost phbtn" type="button" data-vo="rec" data-id="' + c.id + '" title="' + esc(t.vo_btn) + '" aria-label="' + esc(t.vo_btn) + '">' + ic("mic") + '</button><input id="csmsg-in" class="pinput" style="width:100%;text-align:left" placeholder="' + esc(t.cs_write) + '" aria-label="' + esc(t.cs_write) + '" autocomplete="off"><button class="btn" type="submit">' + t.cs_send_msg + '</button></form><p class="fine" style="margin-top:6px">' + t.ph_privacy + "</p>" : "") +
      (actions ? '<div class="stack" style="margin-top:12px">' + actions + "</div>" : "") + (!isDoc && c.status === "new" ? "" : "") + '<p class="fine" style="margin-top:10px">' + t.cs_sms_note + "</p></aside></div></div>";
  }
  /* ---------------- booked times: the patient picks one of the doctor's free slots (Tashkent time, UTC+5) ---------------- */
  var TK = 5 * 3600e3, WD7 = [1, 2, 3, 4, 5, 6, 7];
  /* the doctor's weekly hours: { days: [1..7, Monday = 1], from, to, len } in minutes, or null */
  function hoursOf(pr) {
    var h = pr && pr.hours; if (!h || !h.days || !h.days.length) return null;
    var min = function (x) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(x || "")) ? +x.slice(0, 2) * 60 + +x.slice(3) : null; };
    var from = min(h.from), to = min(h.to), len = [15, 20, 30, 60].indexOf(+h.len) > -1 ? +h.len : null;
    return from != null && to != null && len && to - from >= len ? { days: h.days.map(Number), from: from, to: to, len: len } : null;
  }
  /* a Date whose local fields read as Tashkent time, for fmt() */
  var tkDate = function (ms) { var d = new Date(ms + TK); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()); };
  var hhmm = function (ms) { var d = new Date(ms + TK); return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()); };
  function slotTxt(ms) { return fmt(tkDate(ms), { weekday: "long", day: "numeric", month: "long" }) + ", " + hhmm(ms); }
  /* times others booked: from the server (no patient details), or from this browser in demo mode */
  var TAKEN = {};
  function takenFor(doc) {
    if (!BE) return consults().filter(function (c) { return c.doc === doc && c.slotAt && (c.status === "new" || c.status === "accepted"); }).map(function (c) { return c.slotAt; });
    var e = TAKEN[doc];
    if (!e || Date.now() - e.at > 60e3) { TAKEN[doc] = { at: Date.now(), list: e ? e.list : null }; BE.slots(doc).then(function (j) { TAKEN[doc] = { at: Date.now(), list: j.taken || [] }; render(true); }, function () { TAKEN[doc].list = TAKEN[doc].list || []; }); }
    return TAKEN[doc].list;
  }
  /* the next working days (up to 7, within 14 days) with their free start times, at least 30 minutes ahead */
  function freeDays(u) {
    var h = hoursOf(u.profile), taken = takenFor(u.id); if (!h) return null;
    var out = [], now = Date.now(), t0 = new Date(now + TK), day0 = Date.UTC(t0.getUTCFullYear(), t0.getUTCMonth(), t0.getUTCDate()) - TK;
    for (var i = 0; i < 14 && out.length < 7; i++) {
      var start = day0 + i * 864e5, wd = new Date(start + TK).getUTCDay() || 7; if (h.days.indexOf(wd) < 0) continue;
      var list = []; for (var m = h.from; m + h.len <= h.to; m += h.len) { var ms = start + m * 60e3; if (ms >= now + 30 * 60e3) list.push({ ms: ms, busy: !!taken && taken.indexOf(ms) > -1 }); }
      if (list.some(function (x) { return !x.busy; })) out.push({ day: start, slots: list });
    }
    return { days: out, loading: taken === null };
  }
  function slotPicker(c) {
    var t = L(), d = !c.asap && c.doc ? userById(c.doc) : null; if (!d || d.sample) return "";
    var f = freeDays(d); if (!f) return '<p class="fine">' + t.sl_none_set + "</p>";
    if (f.loading) return '<p class="muted">…</p>';
    if (!f.days.length) return '<p class="note-box">' + t.sl_full + "</p>";
    if (!c.slotDay || !f.days.some(function (x) { return x.day === c.slotDay; })) c.slotDay = f.days[0].day;
    var cur = f.days.filter(function (x) { return x.day === c.slotDay; })[0];
    if (c.slot && !cur.slots.some(function (x) { return x.ms === c.slot && !x.busy; }) && !f.days.some(function (x) { return x.slots.some(function (y) { return y.ms === c.slot && !y.busy; }); })) c.slot = 0;
    return '<div class="slotpick"><b class="flabel">' + t.sl_pick + '</b><div class="sldays" role="group" aria-label="' + esc(t.sl_pick) + '">' + f.days.map(function (x) { var dd = tkDate(x.day + 6 * 3600e3); return '<button type="button" data-slday="' + x.day + '" aria-pressed="' + (x.day === c.slotDay) + '"><small>' + esc(fmt(dd, { weekday: "short" })) + "</small><b>" + dd.getDate() + "</b><small>" + esc(fmt(dd, { month: "short" })) + "</small></button>"; }).join("") + "</div>" +
      '<div class="sltimes" role="group">' + cur.slots.map(function (x) { return '<button type="button" class="nums" data-slot="' + x.ms + '" aria-pressed="' + (c.slot === x.ms) + '"' + (x.busy ? " disabled" : "") + ">" + hhmm(x.ms) + "</button>"; }).join("") + "</div>" +
      '<p class="fine">' + (c.slot ? ic("cal") + " <b>" + esc(slotTxt(c.slot)) + "</b> · " : "") + t.sl_tz + "</p></div>";
  }
  /* ---------------- voice messages in the consultation chat ---------------- */
  /* { cid, state: "rec" | "ready", rec, stream, chunks, t0, timer, blob, url, sec } */
  var VO = null, VO_MAX = 120;
  var RS = null, CX = null;   /* the patient moving a booked time { cid, doc, slot, slotDay }; the application they are about to cancel */
  var mmss = function (s) { return Math.floor(s / 60) + ":" + pad(s % 60); };
  function voDrop() { if (!VO) return; clearInterval(VO.timer); if (VO.state === "rec") { VO.cancel = true; try { VO.rec.stop(); } catch (x) {} } if (VO.stream) VO.stream.getTracks().forEach(function (tr) { tr.stop(); }); if (VO.url) URL.revokeObjectURL(VO.url); VO = null; }
  function voStart(cid) {
    var t = L();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { toast(t.vo_unsup); return; }
    voDrop();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var type = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/webm"].filter(function (x) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x); })[0] || "";
      var rec; try { rec = new MediaRecorder(stream, type ? { mimeType: type, audioBitsPerSecond: 32000 } : undefined); } catch (x) { stream.getTracks().forEach(function (tr) { tr.stop(); }); toast(t.vo_unsup); return; }
      var v = VO = { cid: cid, state: "rec", rec: rec, stream: stream, chunks: [], t0: Date.now() };
      rec.ondataavailable = function (e) { if (e.data && e.data.size) v.chunks.push(e.data); };
      rec.onstop = function () {
        stream.getTracks().forEach(function (tr) { tr.stop(); });
        if (v.cancel || VO !== v) return;
        v.blob = new Blob(v.chunks, { type: (rec.mimeType || type || "audio/webm").split(";")[0] }); v.url = URL.createObjectURL(v.blob); v.sec = Math.max(1, Math.round((Date.now() - v.t0) / 1000)); v.state = "ready"; render(true);
      };
      rec.start(1000);
      v.timer = setInterval(function () { var sec = Math.floor((Date.now() - v.t0) / 1000), el = $("vo-t"); if (el) el.textContent = mmss(sec); if (sec >= VO_MAX) voStop(); }, 250);
      render(true);
    }, function () { toast(t.vo_denied); });
  }
  function voStop() { if (VO && VO.state === "rec") { clearInterval(VO.timer); VO.rec.stop(); } }
  function voBar(cid) {
    var t = L(); if (!VO || VO.cid !== cid) return "";
    if (VO.state === "rec") return '<div class="vobar rec" role="status"><span class="recdot" aria-hidden="true"></span><b id="vo-t" class="nums">' + mmss(Math.floor((Date.now() - VO.t0) / 1000)) + "</b><span>" + t.vo_rec + '</span><button class="btn sm" type="button" data-vo="stop">' + t.vo_stop + '</button><button class="linkbtn" type="button" data-vo="drop">' + t.po_cancel + "</button></div>";
    return '<div class="vobar"><audio controls src="' + VO.url + '"></audio><button class="btn sm" type="button" data-vo="send" data-id="' + cid + '">' + t.vo_send + '</button><button class="linkbtn" type="button" data-vo="drop">' + t.vo_del + "</button></div>";
  }
  function voSend(el) {
    var t = L(), v = VO, cid = v.cid, u = me(), asDoc = !!(u && u.role === "doctor"), c = consultById(cid);
    var fr = new FileReader();
    fr.onload = function () {
      var data = String(fr.result);
      if (data.length > 2150000) { toast(t.vo_long); return; }
      if (BE) {
        el.disabled = true; el.textContent = t.ph_sending;
        BE.addMessage(cid, asDoc ? "d" : "p", asDoc ? u.name : (c || {}).name, "", null, { data: data }).then(function () { voDrop(); render(true); var lg = $("cslog"); if (lg) lg.scrollTop = lg.scrollHeight; }, function (x) { el.disabled = false; el.textContent = t.vo_send; toast(beMsg(t, x)); });
        return;
      }
      var fid = demoPhoto({ url: data }); if (!fid) { toast(t.ph_full); return; }
      var cl = consults(), cc = cl.filter(function (x) { return x.id === cid; })[0];
      cc.msgs.push({ from: asDoc ? "d" : "p", name: asDoc ? u.name : cc.name, text: "", file: fid, fk: "a", at: Date.now() }); saveConsults(cl); voDrop(); render(true);
      var lg2 = $("cslog"); if (lg2) lg2.scrollTop = lg2.scrollHeight;
    };
    fr.readAsDataURL(v.blob);
  }
  /* ---------------- medicines after a consultation, and home delivery ---------------- */
  /* the doctor writes what to take; the patient can ask a partner pharmacy to deliver it (price by phone, paid on delivery) */
  var KMO = "shifokor-medorders", RX = null, RXO = null;   /* doctor's open list editor { cid, rows }; patient's open order form */
  var medOrders = function () { return store.get(KMO, []); };
  var RX_ST = ["new", "confirmed", "on_way", "delivered"];
  function rxList(rx) { var t = L(); return '<ol class="rxlist">' + rx.map(function (m) { return "<li><b>" + esc(m.name) + "</b>" + (m.how || m.days ? "<span>" + esc([m.how, m.days ? t.rx_days(m.days) : ""].filter(Boolean).join(" · ")) + "</span>" : "") + "</li>"; }).join("") + "</ol>"; }
  function rxCollect() { if (!RX) return; RX.rows = RX.rows.map(function (r, i) { var v = function (k) { var el = $("rx-" + k + "-" + i); return el ? el.value : ""; }; return { name: v("n"), how: v("h"), days: v("d") }; }); }
  function rxoCollect() { if (!RXO) return; ["region", "addr", "phone", "note"].forEach(function (k) { var el = $("rxo-" + k); if (el) RXO[k] = el.value; }); var c = $("rxo-ok"); if (c) RXO.ok = c.checked; }
  function rxCard(c, mineDoc, isPat) {
    var t = L(), rx = c.rx || [];
    if (mineDoc && (c.status === "accepted" || c.status === "done")) {
      if (RX && RX.cid === c.id) {
        var fl = function (id, label, v, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" value="' + esc(v == null ? "" : v) + '"' + (extra || "") + "></div>"; };
        return '<form class="dcard rxcard" id="rxform" data-id="' + c.id + '" novalidate><h2>' + t.rx_h + '</h2><p class="muted">' + t.rx_doc_p + "</p>" + RX.rows.map(function (r, i) {
          return '<div class="rxrow">' + fl("rx-n-" + i, t.rx_name, r.name, ' maxlength="120"') + fl("rx-h-" + i, t.rx_how, r.how, ' maxlength="200" placeholder="' + esc(t.rx_how_ph) + '"') + fl("rx-d-" + i, t.rx_days_l, r.days, ' type="number" min="1" max="365" inputmode="numeric"') + '<button class="linkbtn" type="button" data-rx="rm" data-i="' + i + '">' + t.rx_rm + "</button></div>";
        }).join("") + (RX.rows.length < 15 ? '<p><button class="btn ghost sm" type="button" data-rx="add">' + ic("plus") + t.rx_add + "</button></p>" : "") + '<div class="err" id="rx-err" aria-live="polite"></div><div class="btns"><button class="btn" type="submit">' + t.rx_save + '</button><button class="btn ghost" type="button" data-rx="close">' + t.po_cancel + "</button></div></form>";
      }
      return '<div class="dcard rxcard"><h2>' + t.rx_h + "</h2>" + (rx.length ? rxList(rx) : '<p class="muted">' + t.rx_none_doc + "</p>") + '<button class="btn ghost sm" type="button" data-rx="edit" data-id="' + c.id + '">' + (rx.length ? t.rx_edit : ic("plus") + t.rx_write) + "</button></div>";
    }
    if (!isPat || !rx.length) return "";
    var mine = medOrders().filter(function (o) { return o.consultId === c.id; }), o = mine.filter(function (x) { return x.status !== "cancelled"; })[0];
    var body;
    if (o) {
      var k = RX_ST.indexOf(o.status);
      body = '<ol class="rxsteps">' + RX_ST.map(function (st, i) { return '<li class="' + (i < k ? "done" : i === k ? "now" : "") + '">' + t.rx_st[st] + "</li>"; }).join("") + '</ol><p class="muted" style="margin:10px 0 0">' + esc(o.address) + " · " + esc(fmtPhone(o.phone)) + "</p>" +
        (o.status === "new" ? '<p class="fine">' + t.rx_wait + '</p><button class="linkbtn" type="button" data-rx="odel" data-id="' + o.id + '">' + t.rx_cancel + "</button>" : "");
    } else if (RXO && RXO.cid === c.id) {
      body = '<form id="rxoform" data-id="' + c.id + '" novalidate><div class="fld"><label for="rxo-region">' + t.f_region + '</label><select id="rxo-region"><option value="">—</option>' + REG.slice().sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (r) { return '<option value="' + r.code + '"' + (RXO.region === r.code ? " selected" : "") + ">" + esc(nmL(r)) + "</option>"; }).join("") + "</select></div>" +
        '<div class="fld"><label for="rxo-addr">' + t.rx_addr + '</label><textarea id="rxo-addr" maxlength="300" rows="2" placeholder="' + esc(t.rx_addr_ph) + '">' + esc(RXO.addr) + "</textarea></div>" +
        '<div class="fld"><label for="rxo-phone">' + t.cs_phone + '</label><input id="rxo-phone" type="tel" inputmode="tel" value="' + esc(RXO.phone) + '"></div>' +
        '<div class="fld"><label for="rxo-note">' + t.rx_note + '</label><input id="rxo-note" maxlength="300" value="' + esc(RXO.note) + '"></div>' +
        '<label class="chk"><input type="checkbox" id="rxo-ok"' + (RXO.ok ? " checked" : "") + "><span>" + t.rx_ok + '</span></label><div class="err" id="rxo-err" aria-live="polite"></div><div class="btns"><button class="btn" type="submit">' + t.rx_send + '</button><button class="btn ghost" type="button" data-rx="oclose">' + t.po_cancel + "</button></div></form>";
    } else body = '<p class="muted" style="margin:6px 0 12px">' + t.rx_offer + '</p><button class="btn" type="button" data-rx="order" data-id="' + c.id + '">' + ic("home") + t.rx_order + "</button>";
    return '<div class="dcard rxcard"><h2>' + t.rx_h_pat(esc(c.doctorName)) + "</h2>" + rxList(rx) + '<h3 class="rxdel">' + ic("home") + t.rx_del_h + ' <span class="badge plain">' + t.rx_pilot + "</span></h3>" + body + "</div>";
  }
  /* admins: every delivery request, moved along as the pharmacy reports back */
  var MO = { list: null, busy: false, err: "" };
  function moLoad() { if (!BE || MO.busy) return; MO.busy = true; BE.adminMedOrders().then(function (j) { MO.list = j.orders || []; MO.err = ""; }, function (x) { MO.err = beMsg(L(), x); MO.list = MO.list || []; }).then(function () { MO.busy = false; if (current.path === "/admin") render(true); }); }
  function viewMedOrders() {
    var t = L(); if (BE && !MO.list) { moLoad(); return '<p class="muted">…</p>'; }
    var l = BE ? MO.list.map(function (o) { return { id: o.id, n: o.n, doctor: o.doctor_name, name: o.patient_name, rx: o.rx || [], region: o.region, address: o.address, phone: o.phone, note: o.note, status: o.status, at: Date.parse(o.created_at), cid: o.consult_id }; })
      : medOrders().map(function (o) { var c = consultById(o.consultId) || {}; return { id: o.id, n: c.n, doctor: c.doctorName, name: c.name, rx: c.rx || [], region: o.region, address: o.address, phone: o.phone, note: o.note, status: o.status, at: o.at, cid: o.consultId }; });
    return '<p class="muted">' + t.mo_p + "</p>" + (MO.err ? '<p class="err">' + esc(MO.err) + "</p>" : "") + (l.length ? l.map(function (o) {
      var open = o.status !== "delivered" && o.status !== "cancelled";
      return '<div class="dcard admrow' + (open ? "" : " past") + '"><div class="rvtop"><b>' + esc(o.name || "") + '</b><span class="muted nums"> · ' + esc(fmtPhone(o.phone)) + " · №" + esc(String(o.n || "")) + " · " + fmt(new Date(o.at), { day: "numeric", month: "short" }) + '</span> <span class="badge ' + (o.status === "delivered" ? "ok" : o.status === "cancelled" ? "plain" : "warn") + '">' + (o.status === "cancelled" ? t.rx_cancelled : t.rx_st[o.status]) + "</span></div>" +
        rxList(o.rx) + '<p style="margin:6px 0">' + ic("pin") + " " + esc([o.region && regByCode[o.region] ? nmL(regByCode[o.region]) : "", o.address].filter(Boolean).join(", ")) + "</p>" + (o.note ? '<p class="muted">' + esc(o.note) + "</p>" : "") +
        (open ? '<div class="btns">' + ["confirmed", "on_way", "delivered"].filter(function (st) { return RX_ST.indexOf(st) > RX_ST.indexOf(o.status); }).map(function (st) { return '<button class="btn sm" type="button" data-mos="' + st + '" data-id="' + o.id + '">' + t.rx_st[st] + "</button>"; }).join("") + '<button class="btn ghost sm" type="button" data-mos="cancelled" data-id="' + o.id + '">' + t.rx_cancel + "</button></div>" : "") + "</div>";
    }).join("") : '<p class="muted">' + t.adm_none + "</p>");
  }
  function homeDoctorSearch() {
    var t = L(), list = users().filter(function (u) { return u.role === "doctor"; }).slice(-3).reverse();
    return '<div class="wrap" style="padding-top:20px"><div class="panel docsearch"><div><h3>' + t.ds_h + '</h3><p class="muted" style="font-size:.95rem">' + t.ds_p + '</p></div><form id="docsearch" class="dsrow" role="search"><div class="sf"><label for="hs-s">' + t.d_spec + '</label><select id="hs-s"><option value="">' + t.all_specs + "</option>" + DOC_SP.map(function (k) { return '<option value="' + k + '">' + t.docsp[k] + "</option>"; }).join("") + '</select></div><div class="sf"><label for="hs-r">' + t.f_region + '</label><select id="hs-r"><option value="">' + t.all_regions + "</option>" + REG.slice().sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (r) { return '<option value="' + r.code + '">' + esc(nmL(r)) + "</option>"; }).join("") + '</select></div><div class="sf"><label for="hs-q">' + t.ds_name + '</label><input id="hs-q" autocomplete="off" placeholder="' + esc(t.ds_name_ph) + '"></div><button class="btn" type="submit">' + ic("search") + t.ds_go + "</button></form>" +
      (list.length ? '<div class="results" style="padding:6px 0 0;grid-column:1/-1">' + list.map(docCard).join("") + "</div>" : "") + "</div></div>";
  }


  /* ---------------- settings ---------------- */
  var SET_ASK = false;
  /* ---------------- visit requests to clinics: the patient picks a day, the clinic confirms the hour ---------------- */
  var KA = "shifokor-appts";
  var appts = function () { return store.get(KA, []); };
  var saveAppts = function (l) { store.set(KA, l); };
  var AP = null, APX = null, apAsk = null;   /* booking form, the clinic's open reply, visit awaiting cancel */
  var dayTxt = function (s) { return fmt(fromIso(s), { weekday: "short", day: "numeric", month: "short" }); };
  /* the next 10 days from tomorrow, without Sundays (state polyclinics work Monday to Saturday) */
  function apDays(n, from) { var out = []; for (var i = from == null ? 1 : from; out.length < n && i <= 30; i++) { var d = dayAt(i); if (d.getDay() !== 0) out.push(iso(d)); } return out; }
  function apStart(cid) { var u = me(); AP = { cid: cid, day: "", part: "", who: "self", name: u && u.role === "patient" ? u.name : "", phone: u && u.phone ? fmtPhone(u.phone) : "", spec: "", reason: "", doc: "", docQ: "" }; }
  function apCollect() {
    if (!AP) return;
    var map = { "ap-name": "name", "ap-phone": "phone", "ap-spec": "spec", "ap-reason": "reason", "ap-doc": "doc" };
    Object.keys(map).forEach(function (id) { var el = $(id); if (el) AP[map[id]] = el.value.trim(); });
  }
  function apxCollect() {
    if (!APX) return;
    var map = { "apx-day": "day", "apx-time": "time", "apx-note": "note" };
    Object.keys(map).forEach(function (id) { var el = $(id); if (el) APX[map[id]] = el.value.trim(); });
  }
  function apForm(clinic, fac) {
    var t = L(), u = me(); if (!AP || AP.cid !== clinic.id) apStart(clinic.id);
    if (u && u.id === clinic.id) return '<div class="sect" id="book"><div class="note-box ok-box"><b>' + t.ap_inbox_h + '</b><div style="margin-top:10px"><a class="btn sm" href="#/account">' + t.nav_account + "</a></div></div></div>";
    /* the clinic's own doctors on Shifokor (not the sample profiles): the patient may pick one, or come from a doctor's page with ?doc= */
    var docs = doctorsAt(clinic).filter(function (d) { return !d.sample; }), qd = current && current.q && current.q.doc;
    if (qd && qd !== AP.docQ) { AP.docQ = qd; if (docs.some(function (d) { return d.id === qd; })) AP.doc = qd; }
    if (AP.doc && !docs.some(function (d) { return d.id === AP.doc; })) AP.doc = "";
    var a = AP, fi = function (id, label, val, type, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + (type || "text") + '" value="' + esc(val || "") + '"' + (extra || "") + "></div>"; };
    var chips = function (attr, list, cur, label) { return '<div class="chips apchips">' + list.map(function (v) { return '<button type="button" class="chip" data-' + attr + '="' + v + '" aria-pressed="' + (cur === v) + '">' + label(v) + "</button>"; }).join("") + "</div>"; };
    return '<div class="sect" id="book"><h2 style="font-size:1.3rem;margin:0 0 4px">' + t.ap_h + '</h2><p class="muted" style="margin:0 0 14px">' + t.ap_p + "</p>" +
      '<form class="form accform apform" id="apform" data-fac="' + esc(fac || "") + '" novalidate>' +
      '<div class="fld"><span class="flabel">' + t.ap_day + "</span>" + chips("apday", apDays(10), a.day, dayTxt) + "</div>" +
      '<div class="fld"><span class="flabel">' + t.ap_part + "</span>" + chips("appart", ["am", "pm"], a.part, function (k) { return t.ap_parts[k]; }) + "</div>" +
      '<div class="fld"><span class="flabel">' + t.ap_who + '</span><div class="seg" role="group">' + ["self", "other"].map(function (k) { return '<button type="button" data-apwho="' + k + '" aria-pressed="' + (a.who === k) + '">' + t.ap_whos[k] + "</button>"; }).join("") + "</div></div>" +
      '<div class="two">' + fi("ap-name", t.ap_name, a.name, "text", ' autocomplete="name"') + fi("ap-phone", t.ap_phone, a.phone, "tel", ' inputmode="tel" placeholder="+998" autocomplete="tel"') + "</div>" +
      (docs.length ? '<div class="fld"><label for="ap-doc">' + t.ap_doc + '</label><select id="ap-doc"><option value="">' + t.ap_doc_any + "</option>" + docs.map(function (d) { var s = specName(d.profile || {}); return '<option value="' + d.id + '"' + (a.doc === d.id ? " selected" : "") + ">" + esc(d.name + (s ? " — " + s : "")) + "</option>"; }).join("") + "</select></div>" : "") +
      (a.doc ? "" : '<div class="fld"><label for="ap-spec">' + t.ap_spec + '</label><select id="ap-spec"><option value="">' + t.ap_spec_any + "</option>" + DOC_SP.filter(function (k) { return k !== "other" && k !== "gp"; }).map(function (k) { return '<option value="' + k + '"' + (a.spec === k ? " selected" : "") + ">" + t.docsp[k] + "</option>"; }).join("") + "</select></div>") +
      fi("ap-reason", t.ap_reason, a.reason, "text", ' maxlength="500" placeholder="' + esc(t.ap_reason_ph) + '"') +
      '<p class="fine" style="margin:0 0 12px">' + t.ap_note + '</p><div class="err" id="ap-err" aria-live="polite"></div><button class="btn big block" type="submit">' + ic("cal") + t.ap_send + "</button></form></div>";
  }
  function apClosed() {
    var t = L();
    return '<div class="sect"><div class="note-box"><b>' + t.ap_closed_h + '</b><p style="margin:6px 0 0">' + t.ap_closed_p + '</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><a class="btn ghost sm" href="#/consult">' + ic("chat") + t.nav_consult + '</a></div><p style="margin:12px 0 0;font-size:.92rem"><a href="#/register" data-regrole-link="clinic">' + t.ap_join + "</a></p></div></div>";
  }
  function apBadge(st) { return '<span class="badge ' + (st === "confirmed" ? "ok" : st === "new" ? "warn" : "plain") + '">' + L().ap_st[st] + "</span>"; }
  var apOpen = function (a) { return (a.status === "new" || a.status === "confirmed") && a.day >= iso(today0()); };
  /* open requests first, soonest day first; closed ones after, newest first */
  function apSort(list) { return list.slice().sort(function (x, y) { var ox = apOpen(x), oy = apOpen(y); if (ox !== oy) return ox ? -1 : 1; if (ox && x.status !== y.status) return x.status === "new" ? -1 : 1; return ox ? (x.day < y.day ? -1 : x.day > y.day ? 1 : 0) : (x.day < y.day ? 1 : x.day > y.day ? -1 : 0); }); }
  function apRow(a, forClinic) {
    var t = L(), d = fromIso(a.day), c = userById(a.clinicId), open = apOpen(a);
    var when = dayTxt(a.day) + ", " + (a.time ? t.ap_at(a.time) : t.ap_parts_s[a.part]);
    var place = a.fac && facByKey[a.fac] ? '<a href="#/f/' + a.fac + '">' + esc(a.clinicName) + "</a>" : c ? '<a href="#/c/' + c.id + '">' + esc(a.clinicName) + "</a>" : esc(a.clinicName);
    var tel = function (ph) { return '<a class="btn ghost sm" href="tel:+' + esc(digits(ph)) + '">' + ic("phone") + t.ap_call + "</a>"; };
    /* forClinic: true for the clinic's inbox, "doc" for the doctor the patient picked (read only: the clinic sets the hour) */
    var dname = a.doctorId ? (userById(a.doctorId) || {}).name || a.doctorName : "";
    var sub = (forClinic ? "<b>" + esc(a.name) + '</b> · <span class="nums">' + esc(fmtPhone(a.phone)) + "</span>" + (forClinic === "doc" ? "<br>" + place : "") : place + (a.who === "other" ? " · " + esc(t.ap_for(a.name)) : "")) + "<br>" + when + (dname && forClinic !== "doc" ? " · " + (a.doctorId && userById(a.doctorId) ? '<a href="#/doc/' + a.doctorId + '">' + esc(t.ap_with(dname)) + "</a>" : esc(t.ap_with(dname))) : a.spec ? " · " + esc(t.docsp[a.spec] || "") : "") + (a.reason ? "<br>" + esc(a.reason) : "");
    if (forClinic === "doc") return '<div class="visit' + (open ? "" : " past") + '"><div class="date"><span>' + fmt(d, { weekday: "short" }) + "</span><b>" + d.getDate() + "</b><span>" + fmt(d, { month: "short" }) + "</span></div><div><h3>" + t.ap_no(a.n) + " " + apBadge(a.status) + '</h3><div class="muted" style="font-size:.92rem">' + sub + "</div>" + (a.note ? '<div class="apnote"><b>' + t.ap_clinic_note + ":</b> " + esc(a.note) + "</div>" : "") + '</div><div class="acts"><a class="btn ghost sm" href="tel:+' + esc(digits(a.phone)) + '">' + ic("phone") + t.ap_call + "</a></div></div>";
    var note = a.note ? '<div class="apnote"><b>' + t.ap_clinic_note + ":</b> " + esc(a.note) + "</div>" : !forClinic && a.status === "new" && open ? '<div class="apnote muted">' + t.ap_wait + "</div>" : "";
    var acts = forClinic ? (open ? '<button class="btn sm" type="button" data-apx="ok" data-id="' + a.id + '">' + ic("check") + t.ap_ok + '</button><button class="btn ghost sm" type="button" data-apx="no" data-id="' + a.id + '">' + t.ap_decline + "</button>" : "") + tel(a.phone)
      : (c && c.phone ? tel(c.phone) : "") + (open ? '<button class="btn ghost sm" type="button" data-act="apcancel" data-id="' + a.id + '">' + t.ap_cancel + "</button>" : "");
    var extra = "";
    var rateable = !forClinic && a.status === "confirmed" && a.day <= iso(today0()) && !myReview("v", a.id);
    if (rateable && !(RV && RV.key === "v" + a.id)) acts += '<button class="btn sm" type="button" data-act="rvopen" data-id="' + a.id + '">★ ' + t.rv_rate_btn + "</button>";
    if (!forClinic && RV && RV.key === "v" + a.id && rateable) extra = '<div class="rvinline">' + rvCard("v", a.id, a.clinicName, true) + "</div>";
    else if (!forClinic && myReview("v", a.id)) note += '<div class="apnote">' + t.rv_yours + ": " + starsTxt(myReview("v", a.id).stars) + "</div>";
    if (!forClinic && apAsk === a.id) extra = '<div class="confirm-row"><b>' + t.ap_cancel_q + '</b><button class="btn danger sm" type="button" data-act="apcancel-yes" data-id="' + a.id + '">' + t.ap_cancel_yes + '</button><button class="btn ghost sm" type="button" data-act="apcancel-no">' + t.v_keep + "</button></div>";
    if (forClinic && APX && APX.id === a.id) {
      var ok = APX.mode === "ok", days = apDays(30, 0); if (days.indexOf(a.day) < 0 && a.day >= iso(today0())) days.unshift(a.day);
      extra = '<form class="apreply" id="apreply" data-id="' + a.id + '" novalidate>' + (ok ? '<div class="two"><div class="fld"><label for="apx-day">' + t.ap_date2 + '</label><select id="apx-day">' + days.map(function (x) { return '<option value="' + x + '"' + (APX.day === x ? " selected" : "") + ">" + esc(dayTxt(x)) + "</option>"; }).join("") + '</select></div><div class="fld"><label for="apx-time">' + t.ap_time + '</label><input id="apx-time" type="time" min="07:00" max="20:00" step="300" value="' + esc(APX.time) + '"></div></div>' : "") +
        '<div class="fld"><label for="apx-note">' + t.ap_cnote + '</label><input id="apx-note" maxlength="300" value="' + esc(APX.note) + '" placeholder="' + esc(ok ? t.ap_cnote_ph : t.ap_dnote_ph) + '"></div><div class="err" id="apx-err" aria-live="polite"></div>' +
        '<div class="btns"><button class="btn ' + (ok ? "" : "danger ") + 'sm" type="submit">' + (ok ? t.ap_ok : t.ap_decline) + '</button><button class="btn ghost sm" type="button" data-apx="back">' + t.ap_back + "</button></div></form>";
    }
    return '<div class="visit' + (open ? "" : " past") + '"><div class="date"><span>' + fmt(d, { weekday: "short" }) + "</span><b>" + d.getDate() + "</b><span>" + fmt(d, { month: "short" }) + "</span></div><div><h3>" + t.ap_no(a.n) + " " + apBadge(a.status) + '</h3><div class="muted" style="font-size:.92rem">' + sub + "</div>" + note + '</div><div class="acts">' + acts + "</div>" + extra + "</div>";
  }
  /* ---------------- reviews: only after a finished consultation or a visit ---------------- */
  var KR = "shifokor-reviews";
  var SMP_RV = null;
  var reviews = function () {
    if (!SMP_RV) SMP_RV = SMP.r.map(function (r) { if (r.att) return r; var h = hash(r.id + "sub"); var lo = r.stars < 5 ? 1 : 0; return Object.assign({}, r, { att: r.stars, exp: Math.max(1, r.stars - (lo && Math.abs(h) % 3 === 0 ? 1 : 0)), wait: Math.max(1, r.stars - (lo && Math.abs(h >> 3) % 2 === 0 ? 1 : 0)) }); });
    return store.get(KR, []).concat(SMP_RV);
  };
  var RV = null, RR = null;   /* open review form { key, stars, body, anon }; open reply { id, text } */
  function ratingOf(id) { var l = reviews().filter(function (r) { return r.target === id && !r.hidden; }), n = l.length; return { n: n, avg: n ? l.reduce(function (a, r) { return a + r.stars; }, 0) / n : 0 }; }
  /* a few reviews say less than many: pull small counts towards 4 stars before ranking */
  var rankScore = function (id) { var r = ratingOf(id); return (r.avg * r.n + 4 * 3) / (r.n + 3); };
  var avgTxt = function (a) { return a.toFixed(1).replace(".", lang === "en" ? "." : ","); };
  function starsTxt(n) { var full = Math.round(n); return '<span class="stars" aria-label="' + esc(L().rv_star_l(full)) + '">' + "★★★★★".slice(0, full) + '<span class="off">' + "★★★★★".slice(full) + "</span></span>"; }
  function ratingLine(id) { var r = ratingOf(id); return r.n ? '<span class="rating">' + starsTxt(r.avg) + " <b>" + avgTxt(r.avg) + "</b> · " + L().rv_n(r.n) + "</span>" : ""; }
  var myReview = function (kind, id) { return reviews().filter(function (r) { return r.mine && (kind === "c" ? r.consult === id : r.appt === id); })[0] || null; };
  function rvCollect() { if (!RV) return; var b = $("rv-body"), a = $("rv-anon"); if (b) RV.body = b.value; if (a) RV.anon = a.checked; }
  /* the form, or the review already sent; kind "c" (consultation, rates the doctor) or "v" (visit, rates the clinic) */
  function rvCard(kind, id, targetName, forClinic) {
    var t = L(), mine = myReview(kind, id), key = kind + id;
    if (mine) return '<div class="dcard rvcard"><h2>' + t.rv_yours + "</h2><p>" + starsTxt(mine.stars) + "</p>" + (mine.body ? '<p class="pre" style="margin:6px 0 0">' + esc(mine.body) + "</p>" : "") + (mine.reply ? '<div class="rvreply"><b>' + t.rv_reply_h + ":</b> " + esc(mine.reply) + "</div>" : "") + "</div>";
    if (!RV || RV.key !== key) RV = { key: key, stars: 0, body: "", anon: false, sub: { att: 0, exp: 0, wait: 0 } };
    return '<form class="dcard rvcard" id="rvform" data-kind="' + kind + '" data-id="' + id + '" novalidate><h2>' + (forClinic ? t.rv_ask_h_c : t.rv_ask_h) + '</h2><p class="muted" style="margin:4px 0 12px">' + esc(targetName) + " · " + t.rv_ask_p + "</p>" +
      '<div class="rvstars" role="group" aria-label="' + t.rv_stars + '">' + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-rvstar="' + n + '" aria-pressed="' + (RV.stars >= n) + '" aria-label="' + esc(t.rv_star_l(n)) + '">★</button>'; }).join("") + "</div>" +
      '<div class="rvsubs"><p class="muted" style="margin:12px 0 6px">' + t.rv_sub_h + "</p>" + RV_SUB.map(function (k) { return '<div class="rvsubrow"><span>' + (forClinic ? t.rv_sub_c[k] : t.rv_sub[k]) + '</span><div class="rvstars sm" role="group" aria-label="' + esc(forClinic ? t.rv_sub_c[k] : t.rv_sub[k]) + '">' + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-rvsub="' + k + '" data-n="' + n + '" aria-pressed="' + (RV.sub[k] >= n) + '" aria-label="' + esc(t.rv_star_l(n)) + '">★</button>'; }).join("") + "</div></div>"; }).join("") + "</div>" +
      '<div class="fld" style="margin-top:12px"><label for="rv-body">' + t.rv_body + '</label><textarea id="rv-body" maxlength="600" placeholder="' + esc(t.rv_body_ph) + '">' + esc(RV.body) + "</textarea></div>" +
      '<label class="chk"><input type="checkbox" id="rv-anon"' + (RV.anon ? " checked" : "") + "><span>" + t.rv_anon + '</span></label><div class="err" id="rv-err" aria-live="polite"></div><button class="btn block" type="submit">' + t.rv_send + "</button></form>";
  }
  /* detail stars: attention, explanation, on time; shown as bars once at least one review has them */
  var RV_SUB = ["att", "exp", "wait"];
  function rvSubSummary(l, forClinic) {
    var t = L(), rows = RV_SUB.map(function (k) { var v = l.filter(function (r) { return r[k] > 0; }); return { k: k, n: v.length, avg: v.length ? v.reduce(function (a, r) { return a + r[k]; }, 0) / v.length : 0 }; }).filter(function (x) { return x.n; });
    return rows.length ? '<div class="rvsum">' + rows.map(function (x) { return '<div class="rvsumrow"><span>' + (forClinic ? t.rv_sub_c[x.k] : t.rv_sub[x.k]) + '</span><span class="rvbar" aria-hidden="true"><i style="width:' + Math.round(x.avg / 5 * 100) + '%"></i></span><b class="nums">' + avgTxt(x.avg) + "</b></div>"; }).join("") + "</div>" : "";
  }
  function rvList(u) {
    var t = L(), l = reviews().filter(function (r) { return r.target === u.id && !r.hidden; }).sort(function (a, b) { return b.at - a.at; });
    var item = function (r) { return '<div class="rvitem"><div class="rvtop">' + starsTxt(r.stars) + " <b>" + esc(r.author || t.rv_anon_name) + '</b><span class="muted"> · ' + t.rv_kind[r.kind] + " · " + fmt(new Date(r.at), { day: "numeric", month: "short" }) + "</span></div>" + (r.body ? '<p class="pre">' + esc(r.body) + "</p>" : "") + (r.reply ? '<div class="rvreply"><b>' + t.rv_reply_h + ":</b> " + esc(r.reply) + "</div>" : "") + "</div>"; };
    return '<div class="sect" id="reviews"><h2>' + t.rv_h + " " + ratingLine(u.id) + "</h2>" + rvSubSummary(l, u.role === "clinic") + (l.length ? l.map(item).join("") : '<p class="muted">' + t.rv_none + "</p>") + '<p class="fine" style="margin-top:10px">' + (u.sample ? t.smp_rv : t.rv_only) + "</p></div>";
  }
  /* ================= the panel app (/panel/): one workspace per role, after SuperFlow's CRM panel =================
     The public site (/) shows doctors and takes applications; everything behind a sign-in lives here, with its own
     sidebar, top bar and pages: patients, doctors, clinics, and admins on top of their role. Same API, same session. */
  var PANEL = false;   /* set on each render: true on account pages */
  var isPanelPath = function (p) { return p === "/account" || p.indexOf("/account/") === 0 || ["/pro", "/visits", "/admin", "/login", "/register", "/forgot"].indexOf(p) > -1 || p.indexOf("/consult/") === 0 || p.indexOf("/claim/") === 0 || p.indexOf("/reset/") === 0; };
  var acc = function (p) { return "#/account" + (p && p !== "/" ? p : ""); };
  var PRO_FORM = false;   /* viewAccount() returns just the profile form, for the panel's settings page */
  var PNAV = {
    patient: [["/", "home", "home"], ["/consults", "chat", "consults"], ["/record", "file", "record"], ["/visits", "cal", "visits"], ["/meds", "flask", "meds"], ["/ona", "heart", "ona"], ["/settings", "user", "settings"], ["/prefs", "gear", "prefs"]],
    doctor: [["/", "home", "home"], ["/requests", "chat", "requests"], ["/schedule", "cal", "schedule"], ["/patients", "heart", "patients"], ["/earnings", "card", "earnings"], ["/reviews", "star", "reviews"], ["/settings", "user", "settings"], ["/prefs", "gear", "prefs"]],
    clinic: [["/", "home", "home"], ["/requests", "bell", "crequests"], ["/calendar", "cal", "ccalendar"], ["/team", "heart", "cdoctors"], ["/branches", "pin", "cbranches"], ["/reviews", "star", "reviews"], ["/settings", "user", "settings"], ["/prefs", "gear", "prefs"]],
    admin: [["/admin", "shield", "a_chk"], ["/admin?tab=pay", "card", "a_pay"], ["/admin?tab=import", "plus", "a_import"], ["/admin?tab=meds", "flask", "a_meds"]]
  };
  var siteUrl = function (hash) { return hash || "#/"; };
  function pHead(title, desc, actions) { return '<div class="phead"><div><h1>' + title + "</h1>" + (desc ? "<p>" + desc + "</p>" : "") + "</div>" + (actions ? '<div class="btns">' + actions + "</div>" : "") + "</div>"; }
  function pStat(icon, label, value, hint, href) { return '<' + (href ? 'a href="' + href + '"' : "div") + ' class="pstat"><span class="psi">' + ic(icon) + '</span><div><small>' + label + '</small><b class="nums">' + value + "</b>" + (hint ? '<span class="muted">' + hint + "</span>" : "") + "</div></" + (href ? "a" : "div") + ">"; }
  function pEmpty(icon, title, text, act) { return '<div class="pempty"><span>' + ic(icon) + "</span><h3>" + title + "</h3>" + (text ? "<p>" + text + "</p>" : "") + (act || "") + "</div>"; }
  function pCard(title, body, extra) { return '<section class="pcard">' + (title ? '<div class="pcardh"><h2>' + title + "</h2>" + (extra || "") + "</div>" : "") + body + "</section>"; }
  /* patient pages */
  function pPatientHome(u) {
    var t = L(), mine = consults().filter(function (c) { return c.userId === u.id; }), now = Date.now();
    var open = mine.filter(function (c) { return c.status === "new" || c.status === "accepted"; }), next = open.filter(function (c) { return c.slotAt && c.slotAt > now - 3600e3; }).sort(function (a, b) { return a.slotAt - b.slotAt; })[0];
    var orders = medOrders().filter(function (o) { return o.status !== "delivered" && o.status !== "cancelled" && mine.some(function (c) { return c.id === o.consultId; }); });
    var aps = appts().filter(function (a) { return a.userId === u.id && a.status !== "cancelled" && a.status !== "declined"; });
    return pHead(t.pro_hello(esc(u.name.split(" ")[0])), t.pn_pat_p, '<a class="btn" href="' + siteUrl("#/consult?now=1") + '">' + ic("video") + t.asap_now[0] + '</a><a class="btn ghost" href="' + siteUrl("#/doctors") + '">' + ic("search") + t.hf_go + "</a>") +
      '<div class="pstats">' + pStat("chat", t.pn_st_open, open.length, "", acc("/consults")) + pStat("cal", t.pn_st_next, next ? esc(slotShort(next.slotAt)) : "—", next ? esc(next.doctorName || "") : "", next ? "#/consult/" + next.id : "") + pStat("flask", t.pn_st_meds, orders.length, "", acc("/meds")) + pStat("hosp", t.pn_st_visits, aps.length, "", acc("/visits")) + "</div>" +
      pCard(t.pn_open_h, open.length ? '<div class="visits">' + open.sort(function (a, b) { return (a.slotAt || a.at) - (b.slotAt || b.at); }).map(csRow).join("") + "</div>" : pEmpty("chat", t.pn_open_none, t.pn_open_none_p, '<a class="btn" href="' + siteUrl("#/doctors") + '">' + t.hf_go + "</a>"), '<a class="linkbtn" href=acc("/consults")>' + t.pro_all + "</a>");
  }
  function pPatientConsults(u) {
    var t = L(), mine = consults().filter(function (c) { return c.userId === u.id; }).sort(function (a, b) { return b.at - a.at; });
    var open = mine.filter(function (c) { return c.status === "new" || c.status === "accepted"; }), closed = mine.filter(function (c) { return open.indexOf(c) < 0; });
    return pHead(t.pn_t.consults, t.pn_consults_p, '<a class="btn" href="' + siteUrl("#/doctors") + '">' + ic("plus") + t.cs_new_btn + "</a>") +
      (mine.length ? pCard(t.pro_f.active + " · " + open.length, open.length ? '<div class="visits">' + open.map(csRow).join("") + "</div>" : '<p class="muted">' + t.pro_none.active + "</p>") + (closed.length ? pCard(t.pro_f.done + " · " + closed.length, '<div class="visits">' + closed.map(csRow).join("") + "</div>") : "")
        : pCard("", pEmpty("chat", t.pn_open_none, t.pn_open_none_p, '<a class="btn" href="' + siteUrl("#/doctors") + '">' + t.hf_go + "</a>")));
  }
  function pPatientVisits(u) {
    var t = L(), aps = apSort(appts().filter(function (a) { return a.userId === u.id; }));
    markSeen(aps.map(function (a) { return [a.id, apKey(a)]; }));
    return pHead(t.pn_t.visits, t.ap_visits_p, '<a class="btn ghost" href="' + siteUrl("#/find") + '">' + ic("hosp") + t.ap_find + "</a>") +
      pCard("", aps.length ? '<div class="visits">' + aps.map(function (a) { return apRow(a, false); }).join("") + "</div>" : pEmpty("cal", t.ap_none, "", '<a class="btn" href="' + siteUrl("#/find") + '">' + t.ap_find + "</a>"));
  }
  function pPatientMeds(u) {
    var t = L(), mine = consults().filter(function (c) { return c.userId === u.id && c.rx && c.rx.length; }).sort(function (a, b) { return b.at - a.at; });
    return pHead(t.pn_t.meds, t.pn_meds_p) + (mine.length ? mine.map(function (c) { var o = medOrders().filter(function (x) { return x.consultId === c.id && x.status !== "cancelled"; })[0];
      return pCard(esc(c.doctorName || "") + ' <small class="muted">' + t.cs_no(c.n) + "</small>", rxList(c.rx) + '<p class="muted">' + (o ? ic("home") + " " + t.rx_st[o.status] : t.rx_offer) + '</p><a class="btn ghost sm" href="#/consult/' + c.id + '">' + (o ? t.pro_open : t.rx_order) + "</a>"); }).join("") : pCard("", pEmpty("flask", t.pn_meds_none, t.pn_meds_none_p)));
  }
  /* clinic pages */
  function pClinicHome(u) {
    var t = L(), list = appts().filter(function (a) { return a.clinicId === u.id; }), fresh = list.filter(function (a) { return a.status === "new" && apOpen(a); }), today = iso(today0());
    var todays = list.filter(function (a) { return a.day === today && a.status === "confirmed"; }), docs = doctorsAt(u), r = ratingOf(u.id);
    return pHead(esc(u.name), t.pn_cli_p, '<a class="btn ghost" href="' + siteUrl("#/c/" + u.id) + '">' + ic("search") + t.acc_view + "</a>") + trustCard(u) +
      '<div class="pstats">' + pStat("cal", t.pn_st_cnew, fresh.length, "", acc("/requests")) + pStat("check", t.pn_st_ctoday, todays.length, "", acc("/requests")) + pStat("heart", t.pn_st_cdocs, docs.length, myStaff(u).filter(function (x) { return x.status !== "active"; }).length ? t.cl_inv_wait_n(myStaff(u).filter(function (x) { return x.status !== "active"; }).length) : "", acc("/team")) + pStat("pin", t.cl_st_branches, branchesOf(u.id).length, "", acc("/branches")) + pStat("star", t.pro_st_rating(r.n), r.n ? avgTxt(r.avg) + " ★" : "—", "", acc("/reviews")) + "</div>" + clinicInbox(u);
  }
  /* ---------------- the patient's health record: what they told doctors, every finished consultation with the
     doctor's last words and medicines, and clinic visits; each consultation has a printable summary (save as PDF) ---------------- */
  var lastDocMsg = function (c) { var m = (c.msgs || []).filter(function (x) { return x.from === "d" && x.text; }); return m.length ? m[m.length - 1].text : ""; };
  function pPatientRecord(u) {
    var t = L(), mine = consults().filter(function (c) { return c.userId === u.id; }).sort(function (a, b) { return b.at - a.at; });
    var latest = function (k) { var c = mine.filter(function (x) { return x.who === "self" && String(x[k] || "").trim(); })[0]; return c ? esc(c[k]) : ""; };
    var info = [[t.cs_allergy, latest("allergy")], [t.cs_chronic, latest("chronic")], [t.cs_meds, latest("meds")]];
    var done = mine.filter(function (c) { return c.status === "done" || c.status === "referred"; });
    var item = function (c) {
      var d = c.doctorId ? userById(c.doctorId) : null, adv = lastDocMsg(c);
      return '<div class="recitem"><div class="recdate"><b class="nums">' + esc(fmt(new Date(c.closedAt || c.at), { day: "numeric", month: "short" })) + "</b><small>" + new Date(c.closedAt || c.at).getFullYear() + '</small></div><div class="recbody"><h3>' + esc(c.doctorName || (d && d.name) || "") + (d ? ' <small class="muted">' + esc(specName(d.profile || {})) + "</small>" : "") + "</h3>" +
        '<p class="muted">' + (c.who !== "self" ? esc(c.name) + " · " : "") + esc(String(c.complaint || "").slice(0, 160)) + "</p>" +
        (c.outcome != null && c.status === "done" ? '<span class="badge plain">' + t.on_out[c.outcome] + "</span> " : c.status === "referred" ? '<span class="badge warn">' + t.on_out[2] + "</span> " : "") +
        (adv ? '<div class="recadv"><b>' + t.rec_advice + ":</b> " + esc(adv) + "</div>" : "") +
        (c.rx && c.rx.length ? '<div class="recrx"><b>' + t.rx_h + ":</b> " + c.rx.map(function (m) { return esc(m.name) + (m.how ? " — " + esc(m.how) : "") + (m.days ? " (" + t.rx_days(m.days) + ")" : ""); }).join("; ") + "</div>" : "") +
        '<div class="btns"><a class="btn ghost sm" href="' + acc("/summary/" + c.id) + '">' + ic("file") + t.rec_pdf + '</a><a class="linkbtn" href="' + acc("/consult/" + c.id) + '">' + t.rec_chat + "</a></div></div></div>";
    };
    var visits = appts().filter(function (a) { return a.userId === u.id && a.status === "confirmed"; }).sort(function (a, b) { return a.day < b.day ? 1 : -1; });
    return pHead(t.pn_t.record, t.rec_p) +
      pCard(t.rec_info_h, info.some(function (x) { return x[1]; }) ? '<dl class="kv">' + info.map(function (x) { return "<dt>" + x[0] + "</dt><dd>" + (x[1] || '<span class="muted">—</span>') + "</dd>"; }).join("") + '</dl><p class="fine" style="margin-top:8px">' + t.rec_info_p + "</p>" : '<p class="muted">' + t.rec_none_info + "</p>") +
      pCard(t.rec_tl_h + " · " + done.length, done.length ? '<div class="reclist">' + done.map(item).join("") + "</div>" : pEmpty("file", t.rec_none, t.rec_none_p, '<a class="btn" href="' + siteUrl("#/doctors") + '">' + t.hf_go + "</a>")) +
      (visits.length ? pCard(t.pn_t.visits, '<ul class="list">' + visits.map(function (a) { var c = userById(a.clinicId); return "<li><b>" + esc(a.day) + (a.time ? " " + esc(a.time) : "") + "</b> · " + esc(c ? c.name : "") + (a.note ? ' <span class="muted">— ' + esc(a.note) + "</span>" : "") + "</li>"; }).join("") + "</ul>") : "");
  }
  /* one consultation as a page to print or save as PDF (the browser's own "Save as PDF") */
  function pSummary(u, cid) {
    var t = L(), c = consultById(cid);
    if (!c || (c.userId !== u.id && c.doctorId !== u.id)) return pCard("", pEmpty("file", t.not_found, ""));
    var d = c.doctorId ? userById(c.doctorId) : null, row = function (k, v) { return v ? "<tr><th>" + k + "</th><td>" + v + "</td></tr>" : ""; };
    var docMsgs = (c.msgs || []).filter(function (m) { return m.from === "d" && m.text; });
    return '<div class="noprint sumtools"><a class="btn ghost sm" href="' + acc(u.role === "patient" ? "/record" : "/patients") + '">‹ ' + t.sum_back + '</a><button class="btn sm" type="button" data-act="print">' + ic("file") + t.sum_print + "</button></div>" +
      '<article class="sumdoc"><header class="sumhead"><img src="icon.svg?v=3" alt="" width="40" height="40"><div><b>Shifokor</b><small>shifokor.com</small></div><div class="sumno"><small>' + t.sum_h + '</small><b class="nums">№ ' + esc(String(c.n || "")) + "</b></div></header>" +
      "<h1>" + t.sum_h + "</h1>" +
      '<table class="sumtab">' + row(t.sum_patient, esc(c.name) + (c.age !== "" ? ", " + t.pro_age(c.age) : "") + (c.sex ? ", " + t.cs_sexes[c.sex] : "")) + row(t.sum_date, esc(fmt(new Date(c.closedAt || c.at), { day: "numeric", month: "long" })) + " " + new Date(c.closedAt || c.at).getFullYear()) +
        row(t.sum_doctor, esc(c.doctorName || (d && d.name) || "") + (d ? " — " + esc(specName(d.profile || {})) : "")) + row(t.sum_type, t.cs_types[c.type] ? t.cs_types[c.type][0] : "") + "</table>" +
      "<h2>" + t.sum_complaint + '</h2><p class="pre">' + esc(c.complaint || "") + "</p>" +
      (c.chronic || c.allergy || c.meds ? '<table class="sumtab">' + row(t.cs_chronic, esc(c.chronic)) + row(t.cs_allergy, esc(c.allergy)) + row(t.cs_meds, esc(c.meds)) + "</table>" : "") +
      "<h2>" + t.rec_advice + "</h2>" + (docMsgs.length ? docMsgs.map(function (m) { return '<p class="pre">' + esc(m.text) + "</p>"; }).join("") : '<p class="muted">—</p>') +
      (c.outcome != null && c.status === "done" ? "<p><b>" + t.sum_outcome + ":</b> " + t.on_out[c.outcome] + "</p>" : c.status === "referred" ? "<p><b>" + t.sum_outcome + ":</b> " + t.on_out[2] + "</p>" : "") +
      (c.rx && c.rx.length ? "<h2>" + t.rx_h + '</h2><table class="sumtab rx"><thead><tr><th>' + t.rx_name + "</th><th>" + t.rx_how + "</th><th>" + t.rx_days_l + "</th></tr></thead><tbody>" + c.rx.map(function (m) { return "<tr><td>" + esc(m.name) + "</td><td>" + esc(m.how || "") + '</td><td class="nums">' + esc(String(m.days || "")) + "</td></tr>"; }).join("") + "</tbody></table>" : "") +
      '<p class="fine sumnote">' + t.sum_note + "</p></article>";
  }
  /* ---------------- licence and diploma documents, for the checking team only ---------------- */
  var KDOC = "shifokor-docs", DOCS = { uid: "", list: null, busy: false, kind: "", err: "" }, DOC_KINDS = ["licence", "diploma", "certificate", "clinic_licence", "other"];
  function docsMine(u) {
    if (!BE) return store.get(KDOC, []).filter(function (d) { return d.user_id === u.id; });
    if (DOCS.uid !== u.id || (!DOCS.list && !DOCS.busy)) { DOCS = { uid: u.id, list: null, busy: true, kind: DOCS.kind, err: "" }; BE.docs().then(function (j) { DOCS.list = j.docs || []; }, function () { DOCS.list = []; }).then(function () { DOCS.busy = false; if (current.path.indexOf("/account/settings") === 0) render(true); }); }
    return DOCS.list || [];
  }
  var docSize = function (n) { return n > 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1e3)) + " KB"; };
  function docsCard(u) {
    var t = L(), list = docsMine(u), kinds = DOC_KINDS.filter(function (k) { return u.role === "clinic" ? k !== "diploma" : k !== "clinic_licence"; });
    var rows = list.map(function (d) { return '<div class="docrow">' + ic(d.mime === "application/pdf" ? "file" : "camera") + '<div class="stmain"><b>' + esc(d.name || t.doc_kinds[d.kind]) + '</b><small class="muted">' + t.doc_kinds[d.kind] + " · " + docSize(+d.size || 0) + " · " + esc(fmt(new Date(d.created_at), { day: "numeric", month: "short" })) + '</small></div><button class="linkbtn" type="button" data-docopen="' + d.id + '">' + t.doc_open + '</button><button class="linkbtn" type="button" data-docdel="' + d.id + '">' + t.svc_remove + "</button></div>"; }).join("");
    return pCard(t.doc_h, '<p class="muted" style="margin:0 0 12px">' + (u.role === "clinic" ? t.doc_p_cli : t.doc_p_doc) + "</p>" + (BE && !DOCS.list ? '<p class="muted">…</p>' : rows ? '<div class="stlist">' + rows + "</div>" : '<p class="muted">' + t.doc_none + "</p>") +
      (list.length < 8 ? '<div class="docadd"><label class="vh" for="doc-kind">' + t.doc_kind + '</label><select id="doc-kind">' + kinds.map(function (k) { return '<option value="' + k + '"' + (DOCS.kind === k ? " selected" : "") + ">" + t.doc_kinds[k] + "</option>"; }).join("") + '</select><label class="btn sm docpick">' + ic("plus") + t.doc_add + '<input type="file" id="doc-file" accept="image/*,application/pdf" hidden></label></div>' : "") +
      '<p class="err" aria-live="polite">' + esc(DOCS.err) + '</p><p class="fine">' + t.doc_private + "</p>");
  }
  /* a file from the browser as base64: photos made smaller as JPEG, PDFs as they are (up to 1.6 MB) */
  function docRead(file) {
    if (/^image\//.test(file.type)) return shrinkPhoto(file, 2000).then(function (ph) { return { data: ph.data, mime: "image/jpeg", url: ph.url, size: Math.round(ph.data.length * 0.75) }; });
    return new Promise(function (ok, no) {
      if (file.type !== "application/pdf" || file.size > 1600000) { no(new Error("file")); return; }
      var r = new FileReader(); r.onload = function () { var u = String(r.result); ok({ data: u.slice(u.indexOf(",") + 1), mime: "application/pdf", url: u, size: file.size }); }; r.onerror = function () { no(new Error("file")); }; r.readAsDataURL(file);
    });
  }
  function docOpen(id) {
    var w = window.open("", "_blank");
    var show = function (mime, b64) { var bin = atob(b64), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); var url = URL.createObjectURL(new Blob([a], { type: mime })); if (w) w.location = url; else location.href = url; };
    if (!BE) { var d = store.get(KDOC, []).filter(function (x) { return x.id === id; })[0]; if (d) show(d.mime, d.url.slice(d.url.indexOf(",") + 1)); return; }
    BE.docFile(id).then(function (j) { show(j.mime, j.data); }, function (x) { if (w) w.close(); toast(beMsg(L(), x)); });
  }
  /* ---------------- clinics with branches and staff (after SuperFlow's branches and specialists) ----------------
     A clinic keeps branches and invites doctors by phone; the doctor accepts in their panel. The clinic's calendar shows
     its doctors' booked times, not the patients. Server mode reads what sync brought; demo mode keeps it all here. */
  var KBR = "shifokor-branches", KSTA = "shifokor-staff-all", BRF = null, STDEL = "", CAL = { at: 0, list: null, busy: false };
  var demoStaff = function () { return store.get(KSTA, []); };
  var branches = function () { return store.get(KBR, []); };
  var branchesOf = function (cid) { return branches().filter(function (b) { return b.clinicId === cid; }); };
  var branchById = function (id) { return branches().filter(function (b) { return b.id === id; })[0] || null; };
  /* working doctors (accepted) of a clinic, or a doctor's clinics */
  function staffActive() { return BE ? store.get("shifokor-staff", []) : demoStaff().filter(function (x) { return x.status === "active"; }); }
  function staffOfClinic(cid) { return staffActive().filter(function (x) { return x.clinicId === cid; }); }
  function clinicsOfDoctor(did) { return staffActive().filter(function (x) { return x.doctorId === did; }); }
  /* the clinic's own list, with invitations not yet answered */
  function myStaff(u) { if (BE) return store.get("shifokor-mystaff", []); return demoStaff().filter(function (x) { return x.clinicId === u.id; }).map(function (x) { var d = x.doctorId ? userById(x.doctorId) : null; return Object.assign({}, x, { doctorName: d ? d.name : "" }); }); }
  /* invitations waiting for this doctor */
  function myInvites(u) {
    if (BE) return store.get("shifokor-invites", []);
    return demoStaff().filter(function (x) { return x.status === "invited" && (x.doctorId === u.id || (!x.doctorId && u.phone && x.phone === digits(u.phone))); }).map(function (x) { var c = userById(x.clinicId), b = branchById(x.branchId); return { id: x.id, clinicId: x.clinicId, branchId: x.branchId, clinicName: c ? c.name : "", branchName: b ? b.name : "" }; });
  }
  var branchSel = function (id, cid, cur, empty) { var t = L(); return '<select id="' + id + '"><option value="">' + (empty || t.cl_no_branch) + "</option>" + branchesOf(cid).map(function (b) { return '<option value="' + b.id + '"' + (cur === b.id ? " selected" : "") + ">" + esc(b.name) + "</option>"; }).join("") + "</select>"; };
  function pClinicBranches(u) {
    var t = L(), list = branchesOf(u.id), staff = staffOfClinic(u.id);
    var form = function (b) {
      b = b || {};
      return '<form class="pcard brform" id="brform" data-id="' + esc(b.id || "") + '" novalidate><div class="pcardh"><h2>' + (b.id ? t.cl_br_edit : t.cl_br_new) + '</h2></div><div class="two"><div class="fld"><label for="br-name">' + t.cl_br_name + '</label><input id="br-name" maxlength="120" value="' + esc(b.name || "") + '" placeholder="' + esc(t.cl_br_name_ph) + '"></div>' +
        '<div class="fld"><label for="br-region">' + t.f_region + '</label><select id="br-region"><option value="">—</option>' + REG.slice().sort(function (x, y) { return nmL(x).localeCompare(nmL(y)); }).map(function (r) { return '<option value="' + r.code + '"' + (b.region === r.code ? " selected" : "") + ">" + esc(nmL(r)) + "</option>"; }).join("") + "</select></div></div>" +
        '<div class="fld"><label for="br-addr">' + t.fac_addr + '</label><input id="br-addr" maxlength="300" value="' + esc(b.address || "") + '"></div><div class="two"><div class="fld"><label for="br-phone">' + t.fac_phone + '</label><input id="br-phone" type="tel" inputmode="tel" value="' + esc(b.phone ? fmtPhone(b.phone) : "") + '" placeholder="+998"></div>' +
        '<div class="fld"><label for="br-hours">' + t.fac_hours + '</label><input id="br-hours" maxlength="120" value="' + esc(b.hours || "") + '" placeholder="' + esc(t.ohours_ph) + '"></div></div><div class="err" id="br-err" aria-live="polite"></div><div class="btns"><button class="btn" type="submit">' + t.acc_save + '</button><button class="btn ghost" type="button" data-br="close">' + t.po_cancel + "</button></div></form>";
    };
    var card = function (b) {
      if (BRF && BRF.id === b.id) return form(b);
      var n = staff.filter(function (x) { return x.branchId === b.id; }).length;
      return '<section class="pcard brcard"><div class="pcardh"><h2>' + ic("pin") + " " + esc(b.name) + '</h2><span class="badge plain">' + t.cl_docs_n(n) + "</span></div>" +
        '<dl class="kv">' + (b.region && regByCode[b.region] ? "<dt>" + t.f_region + "</dt><dd>" + esc(nmL(regByCode[b.region])) + "</dd>" : "") + (b.address ? "<dt>" + t.fac_addr + "</dt><dd>" + esc(b.address) + "</dd>" : "") + (b.phone ? "<dt>" + t.fac_phone + '</dt><dd class="nums">' + esc(fmtPhone(b.phone)) + "</dd>" : "") + (b.hours ? "<dt>" + t.fac_hours + "</dt><dd>" + esc(b.hours) + "</dd>" : "") + "</dl>" +
        '<div class="btns">' + (STDEL === "br" + b.id ? '<b class="muted">' + t.cl_br_del_q + '</b><button class="btn danger sm" type="button" data-br="delok" data-id="' + b.id + '">' + t.cl_del_yes + '</button><button class="btn ghost sm" type="button" data-br="nodel">' + t.v_keep + "</button>" : '<button class="btn ghost sm" type="button" data-br="edit" data-id="' + b.id + '">' + t.cl_edit + '</button><button class="linkbtn" type="button" data-br="del" data-id="' + b.id + '">' + t.cl_delete + "</button>") + "</div></section>";
    };
    return pHead(t.pn_t.cbranches, t.cl_br_p, BRF && !BRF.id ? "" : '<button class="btn" type="button" data-br="new">' + ic("plus") + t.cl_br_add + "</button>") + (BRF && !BRF.id ? form(null) : "") +
      (list.length ? '<div class="brgrid">' + list.map(card).join("") + "</div>" : BRF ? "" : pCard("", pEmpty("pin", t.cl_br_none, t.cl_br_none_p, '<button class="btn" type="button" data-br="new">' + ic("plus") + t.cl_br_add + "</button>")));
  }
  function pClinicTeam(u) {
    var t = L(), rows = myStaff(u), docs = doctorsAt(u);
    var row = function (x) {
      var d = x.doctorId ? userById(x.doctorId) : null;
      return '<div class="strow">' + (d ? avatarOf(d, "sm") : '<span class="pav sm" aria-hidden="true">' + ic("phone") + "</span>") + '<div class="stmain"><b>' + esc(x.doctorName || (d && d.name) || fmtPhone(x.phone)) + '</b><small class="muted">' + (d ? esc(specName(d.profile || {})) + " · " + esc(fmtPhone(x.phone)) : x.doctorName ? esc(fmtPhone(x.phone)) : "") + "</small></div>" +
        '<span class="badge ' + (x.status === "active" ? "ok" : "warn") + '">' + (x.status === "active" ? t.cl_st_active : x.doctorId ? t.cl_st_invited : t.cl_st_wait) + "</span>" +
        '<label class="vh" for="st-br-' + x.id + '">' + t.cl_branch + "</label>" + branchSel("st-br-" + x.id, u.id, x.branchId) +
        (STDEL === "st" + x.id ? '<button class="btn danger sm" type="button" data-st="rmok" data-id="' + x.id + '">' + t.cl_del_yes + '</button><button class="btn ghost sm" type="button" data-st="no">' + t.v_keep + "</button>" : '<button class="linkbtn" type="button" data-st="rm" data-id="' + x.id + '">' + t.cl_remove + "</button>") + "</div>";
    };
    return pHead(t.pn_t.cdoctors, t.cl_team_p) +
      '<form class="pcard stform" id="stform" novalidate><div class="pcardh"><h2>' + t.cl_inv_h + '</h2></div><p class="muted" style="margin:0 0 12px">' + t.cl_inv_p + '</p><div class="stinv"><div class="fld"><label for="st-phone">' + t.cl_inv_phone + '</label><input id="st-phone" type="tel" inputmode="tel" placeholder="+998"></div><div class="fld"><label for="st-branch">' + t.cl_branch + "</label>" + branchSel("st-branch", u.id, "") + '</div><button class="btn" type="submit">' + ic("plus") + t.cl_inv_send + '</button></div><div class="err" id="st-err" aria-live="polite"></div></form>' +
      pCard(t.cl_staff_h + " · " + rows.length, rows.length ? '<div class="stlist">' + rows.map(row).join("") + "</div>" : '<p class="muted">' + t.cl_staff_none + "</p>") +
      (docs.length ? pCard(t.pn_cdocs_h, '<div class="dtgrid">' + docs.map(docTile).join("") + "</div>") : "");
  }
  function calLoad() { if (!BE || CAL.busy) return; CAL.busy = true; BE.clinicCalendar().then(function (j) { CAL.list = j.slots || []; CAL.at = Date.now(); }, function () { CAL.list = CAL.list || []; }).then(function () { CAL.busy = false; if (current.path.indexOf("/account/calendar") === 0) render(true); }); }
  function pClinicCalendar(u, q) {
    var t = L(), list;
    if (BE) { if (!CAL.list || Date.now() - CAL.at > 60e3) calLoad(); list = CAL.list || []; }
    else { var docIds = staffOfClinic(u.id); list = consults().filter(function (c) { return c.slotAt && (c.status === "new" || c.status === "accepted"); }).map(function (c) { var s = docIds.filter(function (x) { return x.doctorId === (c.doctorId || c.doc); })[0]; var d = s && userById(s.doctorId); return s ? { id: c.id, at: c.slotAt, status: c.status, type: c.type, doctor_id: s.doctorId, doctor_name: d ? d.name : "", branch_id: s.branchId } : null; }).filter(Boolean); }
    if (q.b) list = list.filter(function (x) { return (x.branch_id || "") === q.b; });
    var t0 = new Date(Date.now() + TK), day0 = Date.UTC(t0.getUTCFullYear(), t0.getUTCMonth(), t0.getUTCDate()) - TK, days = [];
    for (var i = 0; i < 7; i++) days.push(day0 + i * 864e5);
    var filter = branchesOf(u.id).length ? '<label class="sel">' + t.cl_branch + " " + branchSel("cal-b", u.id, q.b || "", t.cl_all_branches) + "</label>" : "";
    return pHead(t.pn_t.ccalendar, t.cl_cal_p, filter) + (BE && !CAL.list ? '<p class="muted">…</p>' :
      '<div class="week">' + days.map(function (d, i) {
        var dd = tkDate(d + 6 * 3600e3), items = list.filter(function (x) { return x.at >= d && x.at < d + 864e5; }).sort(function (a, b) { return a.at - b.at; });
        return '<div class="wday' + (i === 0 ? " today" : "") + '"><div class="wdh"><small>' + esc(fmt(dd, { weekday: "short" })) + "</small><b>" + dd.getDate() + "</b></div>" + (items.length ? items.map(function (x) { var b = branchById(x.branch_id); return '<div class="wslot busy"><b class="nums">' + hhmm(x.at) + "</b><span>" + esc(x.doctor_name) + "</span>" + (b ? "<small>" + esc(b.name) + "</small>" : "") + "</div>"; }).join("") : '<p class="muted wclosed">' + t.cl_cal_free + "</p>") + "</div>";
      }).join("") + "</div>") + '<p class="fine">' + t.cl_cal_note + "</p>";
  }
  /* the doctor's side: invitations to accept, and the clinics they work for */
  function inviteCards(u) {
    var t = L(), inv = myInvites(u); if (!inv.length) return "";
    return inv.map(function (x) { return '<section class="pcard invcard"><div><b>' + t.cl_inv_to(esc(x.clinicName)) + "</b>" + (x.branchName ? '<p class="muted">' + t.cl_branch + ": " + esc(x.branchName) + "</p>" : "") + '<p class="fine">' + t.cl_inv_note + '</p></div><div class="btns"><button class="btn" type="button" data-inv="yes" data-id="' + x.id + '">' + t.cl_inv_yes + '</button><button class="btn ghost" type="button" data-inv="no" data-id="' + x.id + '">' + t.cl_inv_no + "</button></div></section>"; }).join("");
  }
  function myClinicsCard(u) {
    var t = L(), list = clinicsOfDoctor(u.id); if (!list.length) return "";
    return pCard(t.cl_mine_h, '<div class="stlist">' + list.map(function (x) { var c = userById(x.clinicId), b = branchById(x.branchId); return '<div class="strow"><span class="pav sm" aria-hidden="true">' + ic("hosp") + '</span><div class="stmain"><b>' + esc(c ? c.name : "") + "</b>" + (b ? '<small class="muted">' + esc(b.name) + "</small>" : "") + "</div>" + (STDEL === "lv" + x.id ? '<button class="btn danger sm" type="button" data-st="leaveok" data-id="' + x.id + '">' + t.cl_leave + '</button><button class="btn ghost sm" type="button" data-st="no">' + t.v_keep + "</button>" : '<button class="linkbtn" type="button" data-st="leave" data-id="' + x.id + '">' + t.cl_leave + "</button>") + "</div>"; }).join("") + "</div>");
  }
  /* the shell: sidebar with the role's pages (and admin pages for admins), top bar with the page name, language and the way back to the site */
  function panelPage(path0, q) {
    var pg = panelPage0(path0, q), u = me();
    if (pg.body && !pg.bare && !pg.redirect && pg.key !== "verify" && needsEmail(u)) pg.body = verBanner(u) + pg.body;
    return pg;
  }
  function panelPage0(path0, q) {
    var path = path0 === "/account" ? "/" : path0.indexOf("/account/") === 0 ? path0.slice(8) : path0;
    var t = L(), u = me(), role = u ? u.role : "";
    if (u && (path === "/login" || path === "/register")) return { redirect: acc("/") };
    if (path === "/login") return { body: '<div class="pauth">' + viewLogin() + "</div>", bare: true };
    if (path === "/register") { if (q.role && ["patient", "doctor", "clinic"].indexOf(q.role) > -1) REGROLE = q.role; return { body: '<div class="pauth">' + viewRegister() + "</div>", bare: true }; }
    if (path.indexOf("/claim/") === 0) return { body: '<div class="pauth">' + viewClaim(path.slice(7)) + "</div>", bare: true };
    if (path === "/forgot") return { body: '<div class="pauth">' + viewForgot() + "</div>", bare: true };
    if (path.indexOf("/reset/") === 0) return { body: '<div class="pauth">' + viewResetLink(path.slice(7)) + "</div>", bare: true };
    if (!u) return { redirect: "#/login" };
    /* links written for the old one-page site, and public pages opened from the panel */
    if (path === "/pro") path = q.tab === "profile" ? "/settings" : "/" + (q.tab && q.tab !== "home" ? q.tab : "");
    if (path === "/visits" && role !== "patient") path = "/";
    if (path === "/verify") return { body: pVerify(u), key: "verify" };
    var mineR = role === "doctor" ? ["/", "/requests", "/schedule", "/patients", "/earnings", "/reviews"] : role === "clinic" ? ["/", "/requests", "/calendar", "/team", "/branches", "/reviews"] : ["/", "/consults", "/record", "/visits", "/meds", "/ona"];
    /* another role's page, or one that doesn't exist: this account's overview */
    if (mineR.indexOf(path) < 0 && path !== "/settings" && path !== "/prefs" && path !== "/admin" && path.indexOf("/consult/") !== 0 && path.indexOf("/summary/") !== 0) return { redirect: acc("/") };
    if (path.indexOf("/summary/") === 0) return { body: pSummary(u, path.slice(9)), key: role === "patient" ? "record" : "patients" };
    if (path === "/prefs") return { body: pHead(t.pn_t.prefs, t.set_p) + '<div class="acc">' + settingsCard(true) + "</div>", key: "prefs" };
    if (path.indexOf("/consult/") === 0) return { body: viewConsultThread(path.slice(9)), key: role === "doctor" ? "requests" : role === "clinic" ? "requests" : "consults" };
    if (path === "/admin") return { body: viewAdmin(q), key: "a_" + (q.tab === "pay" ? "pay" : q.tab === "import" ? "import" : q.tab === "meds" ? "meds" : "chk") };
    if (path === "/settings") { PRO_FORM = true; try { return { body: pHead(t.pro_t.profile, t.pn_set_p, role !== "patient" ? '<a class="btn ghost" href="' + siteUrl(role === "doctor" ? "#/doc/" + u.id : "#/c/" + u.id) + '">' + t.acc_view + "</a>" : "") + (role === "doctor" ? liveCard(u) + myClinicsCard(u) : "") + (role !== "patient" ? docsCard(u) : "") + viewAccount(), key: "settings" }; } finally { PRO_FORM = false; } }
    var page = path.slice(1) || "home";
    if (role === "doctor") {
      var mine = proMine(u);
      var b = page === "requests" ? proRequests(u, mine, q.f) : page === "schedule" ? proSchedule(u, mine) + docVisits(u, true) : page === "patients" ? proPatients(u, mine) : page === "earnings" ? proEarnings(u, mine) : page === "reviews" ? "<h1>" + t.pro_t.reviews + "</h1>" + rvMine(u) : proHome(u, mine) + docVisits(u, false);
      return { body: b, key: ["requests", "schedule", "patients", "earnings", "reviews"].indexOf(page) > -1 ? page : "home" };
    }
    if (role === "clinic") { var ck = { requests: "crequests", calendar: "ccalendar", team: "cdoctors", branches: "cbranches", reviews: "reviews" };
      return { body: page === "requests" ? pHead(t.pn_t.crequests, t.ap_inbox_p) + clinicInbox(u) : page === "calendar" ? pClinicCalendar(u, q) : page === "team" ? pClinicTeam(u) : page === "branches" ? pClinicBranches(u) : page === "reviews" ? pHead(t.pro_t.reviews, "") + rvMine(u) : pClinicHome(u), key: ck[page] || "home" }; }
    return { body: page === "record" ? pPatientRecord(u) : page === "consults" ? pPatientConsults(u) : page === "visits" ? pPatientVisits(u) : page === "meds" ? pPatientMeds(u) : page === "ona" ? viewOna() : pPatientHome(u), key: ["consults", "record", "visits", "meds", "ona"].indexOf(page) > -1 ? page : "home" };
  }
  function panelShell(pg) {
    var t = L(), u = me(), role = u.role, items = PNAV[role] || PNAV.patient, nNew = role === "doctor" ? proMine(u).filter(function (c) { return c.status === "new"; }).length : role === "clinic" ? appts().filter(function (a) { return a.clinicId === u.id && a.status === "new" && apOpen(a); }).length : 0;
    var link = function (x) { var on = x[2] === pg.key; return '<a href="' + (x[0].indexOf("/admin") === 0 ? "#" + x[0] : acc(x[0])) + '"' + (on ? ' aria-current="page"' : "") + ">" + ic(x[1]) + "<span>" + t.pn_t[x[2]] + "</span>" + ((x[2] === "requests" || x[2] === "crequests") && nNew ? '<b class="pronum">' + nNew + "</b>" : "") + "</a>"; };
    var title = (items.concat(PNAV.admin).filter(function (x) { return x[2] === pg.key; })[0] || [])[2];
    return '<div class="pshell"><aside class="pside" id="pside"><div class="pbrandrow"><a class="pbrand" href="' + acc("/") + '"><img src="icon.svg?v=3" alt="" width="36" height="36"><span><b>Shifokor</b><small>' + t.pn_role[role] + '</small></span></a><button class="pico pclose" type="button" data-act="pnav" aria-label="' + esc(t.ap_x) + '"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<nav aria-label="' + esc(t.pro_panel) + '">' + items.map(link).join("") + (u.admin ? '<p class="pgroup">' + t.pn_admin + "</p>" + PNAV.admin.map(link).join("") : "") +
      '<p class="pgroup"></p>' + (role === "patient" ? '<a href="#/">' + ic("search") + "<span>" + t.pn_site + "</span></a>" : "") + '<button class="pnavout" type="button" data-act="logout"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/></svg><span>' + t.logout + "</span></button></nav>" +
      '<div class="puser">' + avatarOf(u, "sm") + '<div><b>' + esc(u.name) + "</b><small>" + esc(role === "doctor" ? specName(u.profile || {}) : u.email || fmtPhone(u.phone || "")) + '</small></div><button class="pico" type="button" data-act="logout" title="' + esc(t.logout) + '" aria-label="' + esc(t.logout) + '"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/></svg></button></div></aside>' +
      '<div class="pmain"><header class="ptop"><button class="pico pmenu" type="button" data-act="pnav" aria-label="' + esc(t.nav_menu) + '" aria-controls="pside" aria-expanded="false"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><b class="ptitle">' + (title ? t.pn_t[title] : "") + '</b><span class="spacer"></span>' +
      '<div class="lang plang" role="group" aria-label="Language">' + ["uz", "ru", "en"].map(function (l) { return '<button type="button" data-l="' + l + '" aria-pressed="' + (lang === l) + '">' + l.toUpperCase() + "</button>"; }).join("") + "</div>" +
      '<div class="dd pacct"><button type="button" class="ddbtn pacctbtn" aria-haspopup="true" aria-expanded="false">' + avatarOf(u, "sm") + '<span class="pacctname">' + esc(shortName(u)) + '</span><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button><div class="menu menu-r" hidden>' + acctMenu(u, true) + "</div></div></header>" + '<div class="pcontent">' + pg.body + "</div></div></div>";
  }
  /* a short name for buttons: the first name, skipping "Dr" */
  var shortName = function (u) { var w = String(u.name || "").split(/\s+/).filter(function (x) { return x && !/^(dr|doc|д-р)\.?$/i.test(x); }); return w[0] || u.name || ""; };
  /* the account menu, in the site's header and in the panel's top bar */
  function acctMenu(u, inPanel) {
    var t = L(), role = u.role, items = ['<span class="mh">' + esc(u.name) + " · " + t.pn_role[role] + "</span>"];
    if (!inPanel) items.push('<a href="#/account">' + ic("home") + t.pn_role[role] + "</a>");
    if (role === "patient") items.push('<a href="' + acc("/consults") + '">' + ic("chat") + t.pn_t.consults + "</a>");
    if (role === "doctor") items.push('<a href="' + acc("/requests") + '">' + ic("chat") + t.pn_t.requests + "</a>");
    if (role === "clinic") items.push('<a href="' + acc("/requests") + '">' + ic("bell") + t.pn_t.crequests + "</a>");
    items.push('<a href="' + acc("/settings") + '">' + ic("user") + t.pn_t.settings + "</a>", '<a href="' + acc("/prefs") + '">' + ic("gear") + t.pn_t.prefs + "</a>");
    if (u.admin) items.push('<a href="#/admin">' + ic("shield") + t.pn_admin + "</a>");
    if (inPanel && role === "patient") items.push('<a class="sep" href="#/">' + ic("search") + t.pn_site + "</a>");
    items.push('<button class="sep acctout" type="button" data-act="logout">' + t.logout + "</button>");
    return items.join("");
  }
  /* ---------------- the doctor's panel: its own workspace, after Practo / Doctor Anywhere doctor apps ----------------
     overview, request queue, week schedule, patients, earnings, reviews, and profile with prices and hours */
  var PRO_TABS = [["home", "home"], ["requests", "chat"], ["schedule", "cal"], ["patients", "heart"], ["earnings", "card"], ["reviews", "star"], ["profile", "shield"]];
  function proMine(u) {   /* applications this doctor sees: theirs, and new ones they may accept */
    var sp = (u.profile || {}).spec;
    return consults().filter(function (c) { return c.doctorId === u.id || (c.status === "new" && (c.doc ? c.doc === u.id : !c.spec || c.spec === sp || (sp === "gp" && !c.spec))); });
  }
  var tkDayKey = function (ms) { return new Date(ms + TK).toISOString().slice(0, 10); };
  var waitTxt = function (ms) { var t = L(), m = Math.max(1, Math.round((Date.now() - ms) / 60e3)); return m < 60 ? t.pro_ago_m(m) : m < 1440 ? t.pro_ago_h(Math.round(m / 60)) : t.pro_ago_d(Math.round(m / 1440)); };
  function proCard(c, u) {   /* one application in the queue, with what a doctor needs to decide */
    var t = L(), age = c.age !== "" && c.age != null ? t.pro_age(c.age) : "";
    return '<article class="procard' + (c.status === "new" ? " isnew" : "") + '"><div class="pchead"><span class="pctype">' + ic(c.type === "text" ? "chat" : c.type === "audio" ? "mic" : "video") + '</span><div><b>' + esc(c.name) + '</b><small class="muted">' + [age, t.cs_sexes[c.sex] || "", t.cs_types[c.type][0]].filter(Boolean).join(" · ") + "</small></div>" + csBadge(c.status) + "</div>" +
      (c.slotAt ? '<p class="pcslot">' + ic("cal") + " <b>" + esc(slotTxt(c.slotAt)) + "</b></p>" : c.asap && c.status === "new" ? '<p class="pcslot warn">' + ic("siren") + " " + t.asap_badge + "</p>" : "") +
      '<p class="pccompl">' + esc(c.complaint.slice(0, 160)) + (c.complaint.length > 160 ? "…" : "") + "</p>" +
      '<div class="pcfoot"><small class="muted">' + t.cs_no(c.n) + " · " + waitTxt(c.at) + (c.msgs && c.msgs.some(function (m) { return m.file; }) ? " · " + ic("camera") : "") + '</small><div class="btns">' +
      (c.status === "new" ? '<button class="btn sm" type="button" data-cs="accept" data-id="' + c.id + '">' + ic("check") + t.cs_accept + "</button>" : "") + '<a class="btn ghost sm" href="#/consult/' + c.id + '">' + (c.status === "accepted" ? t.pro_open_chat : t.pro_open) + "</a></div></div></article>";
  }
  function proHome(u, mine) {
    var t = L(), today = tkDayKey(Date.now()), r = ratingOf(u.id);
    var fresh = mine.filter(function (c) { return c.status === "new"; }).sort(function (a, b) { return (a.slotAt || a.at) - (b.slotAt || b.at); });
    var active = mine.filter(function (c) { return c.status === "accepted"; });
    var todays = mine.filter(function (c) { return c.slotAt && tkDayKey(c.slotAt) === today && (c.status === "new" || c.status === "accepted"); }).sort(function (a, b) { return a.slotAt - b.slotAt; });
    var e = BE && BE.earnings();
    var stats = [[fresh.length, t.pro_st_new, "requests"], [todays.length, t.pro_st_today, "schedule"], [active.length, t.pro_st_active, "requests&f=active"], [r.n ? avgTxt(r.avg) + " ★" : "—", t.pro_st_rating(r.n), "reviews"]].concat(e ? [[num(e.balance), t.er_owed, "earnings"]] : []);
    /* a complete profile gets more requests: what is still missing, as on Practo's and Doctolib's onboarding lists */
    var pr = u.profile || {}, cp = cpOf(pr), todo = [[!!u.photoUrl, t.pro_do_photo], [!!pr.lic, t.pro_do_lic], [!!pr.bio, t.pro_do_bio], [["text", "audio", "video"].some(function (k) { return cp[k] != null; }), t.pro_do_price], [!!hoursOf(pr), t.pro_do_hours]].concat(BE && BE.notify().tg ? [[!!u.tgLinked, t.pro_do_tg]] : []);
    var done = todo.filter(function (x) { return x[0]; }).length;
    return inviteCards(u) + '<div class="prohello"><div><h1>' + t.pro_hello(esc(u.name.split(" ")[0] === "Dr" ? u.name : u.name.split(" ")[0])) + '</h1><p class="muted">' + esc(fmt(tkDate(Date.now()), { weekday: "long", day: "numeric", month: "long" })) + " · " + esc(specName(pr)) + "</p></div></div>" +
      liveCard(u) +
      '<div class="prostats">' + stats.map(function (x) { return '<a class="prostat" href="#/pro?tab=' + x[2] + '"><b class="nums">' + x[0] + "</b><span>" + x[1] + "</span></a>"; }).join("") + "</div>" +
      (done < todo.length ? '<div class="dcard protodo"><div class="sechead"><h2>' + t.pro_todo_h + '</h2><span class="muted nums">' + done + " / " + todo.length + '</span></div><div class="pbar2"><i style="width:' + Math.round(done / todo.length * 100) + '%"></i></div><ul>' + todo.map(function (x) { return '<li class="' + (x[0] ? "ok" : "") + '">' + ic(x[0] ? "check" : "plus") + "<span>" + x[1] + "</span></li>"; }).join("") + '</ul><a class="btn sm" href="#/pro?tab=profile">' + t.pro_todo_go + "</a></div>" : "") +
      '<div class="progrid"><section><div class="sechead"><h2>' + t.pro_today_h + '</h2><a class="linkbtn" href="#/pro?tab=schedule">' + t.pro_all + "</a></div>" + (todays.length ? '<div class="protimeline">' + todays.map(function (c) { return '<a class="tlrow" href="#/consult/' + c.id + '"><b class="nums">' + hhmm(c.slotAt) + "</b><span>" + esc(c.name) + '<small class="muted"> · ' + t.cs_types[c.type][0] + "</small></span>" + csBadge(c.status) + "</a>"; }).join("") + "</div>" : '<p class="muted">' + t.pro_today_none + "</p>") + "</section>" +
      '<section><div class="sechead"><h2>' + t.pro_new_h + '</h2><a class="linkbtn" href="#/pro?tab=requests">' + t.pro_all + "</a></div>" + (fresh.length ? fresh.slice(0, 4).map(function (c) { return proCard(c, u); }).join("") : '<p class="muted">' + t.pro_new_none + "</p>") + "</section></div>";
  }
  function proRequests(u, mine, f) {
    var t = L(), groups = { "new": mine.filter(function (c) { return c.status === "new"; }), active: mine.filter(function (c) { return c.status === "accepted"; }), done: mine.filter(function (c) { return c.status === "done" || c.status === "referred" || c.status === "cancelled"; }) };
    f = groups[f] ? f : "new";
    var list = groups[f].sort(function (a, b) { return f === "done" ? b.at - a.at : (a.slotAt || a.at) - (b.slotAt || b.at); });
    return '<h1>' + t.pro_t.requests + '</h1><div class="seg proseg" role="group">' + ["new", "active", "done"].map(function (k) { return '<a href="#/pro?tab=requests&f=' + k + '" aria-current="' + (k === f ? "page" : "false") + '">' + t.pro_f[k] + ' <span class="cnt">' + groups[k].length + "</span></a>"; }).join("") + "</div>" +
      (f === "new" ? '<p class="fine">' + t.pro_req_p + "</p>" : "") + (list.length ? '<div class="procards">' + list.map(function (c) { return proCard(c, u); }).join("") + "</div>" : '<div class="empty">' + t.pro_none[f] + "</div>");
  }
  function proSchedule(u, mine) {
    var t = L(), h = hoursOf(u.profile);
    if (!h) return "<h1>" + t.pro_t.schedule + '</h1><div class="empty">' + t.pro_sch_none + ' <p style="margin-top:12px"><a class="btn" href="#/pro?tab=profile">' + t.pro_sch_set + "</a></p></div>";
    var booked = {}; mine.forEach(function (c) { if (c.slotAt && (c.status === "new" || c.status === "accepted")) booked[c.slotAt] = c; });
    var t0 = new Date(Date.now() + TK), day0 = Date.UTC(t0.getUTCFullYear(), t0.getUTCMonth(), t0.getUTCDate()) - TK, days = [];
    for (var i = 0; i < 7; i++) days.push(day0 + i * 864e5);
    return "<h1>" + t.pro_t.schedule + '</h1><p class="muted">' + t.pro_sch_p(t.sl_min(h.len)) + ' <a href="#/pro?tab=profile">' + t.pro_sch_edit + "</a></p>" +
      '<div class="week">' + days.map(function (d) {
        var wd = new Date(d + TK).getUTCDay() || 7, open = h.days.indexOf(wd) > -1, dd = tkDate(d + 6 * 3600e3), cells = [];
        if (open) for (var m = h.from; m + h.len <= h.to; m += h.len) { var ms = d + m * 60e3, c = booked[ms]; cells.push(c ? '<a class="wslot busy" href="#/consult/' + c.id + '"><b class="nums">' + hhmm(ms) + "</b><span>" + esc(c.name) + "</span></a>" : '<span class="wslot' + (ms < Date.now() ? " past" : "") + '"><b class="nums">' + hhmm(ms) + "</b><span>" + t.pro_free + "</span></span>"); }
        return '<div class="wday' + (i === 0 ? " today" : "") + '"><div class="wdh"><small>' + esc(fmt(dd, { weekday: "short" })) + "</small><b>" + dd.getDate() + "</b></div>" + (open ? cells.join("") : '<p class="muted wclosed">' + t.pro_closed + "</p>") + "</div>";
      }).join("") + "</div>";
  }
  function proPatients(u, mine) {
    var t = L(), by = {};
    mine.filter(function (c) { return c.doctorId === u.id; }).forEach(function (c) { var k = c.userId || c.phone || c.name; var p = by[k] = by[k] || { name: c.name, age: c.age, sex: c.sex, list: [] }; p.list.push(c); });
    var ps = Object.keys(by).map(function (k) { var p = by[k]; p.list.sort(function (a, b) { return b.at - a.at; }); return p; }).sort(function (a, b) { return b.list[0].at - a.list[0].at; });
    return "<h1>" + t.pro_t.patients + '</h1><p class="muted">' + t.pro_pat_p + "</p>" + mothersCard() + (ps.length ? '<div class="procards">' + ps.map(function (p) { var last = p.list[0]; return '<a class="procard patrow" href="#/consult/' + last.id + '"><span class="pav2" style="background:' + AVC[(p.name.length) % 4] + '">' + esc(initials(p.name)) + "</span><div><b>" + esc(p.name) + '</b><small class="muted">' + [p.age !== "" && p.age != null ? t.pro_age(p.age) : "", t.cs_sexes[p.sex] || "", t.pro_visits(p.list.length)].filter(Boolean).join(" · ") + '</small><p class="pccompl">' + esc(last.complaint.slice(0, 120)) + "</p></div><small class=\"muted\">" + esc(fmt(new Date(last.at), { day: "numeric", month: "short" })) + "</small></a>"; }).join("") + "</div>" : '<div class="empty">' + t.pro_pat_none + "</div>");
  }
  function proEarnings(u, mine) {
    var t = L(), card = earnCard();
    if (card) return "<h1>" + t.pro_t.earnings + "</h1>" + card;
    var paid = mine.filter(function (c) { return c.doctorId === u.id && c.status === "done" && c.price > 0; }), sum = paid.reduce(function (a, c) { return a + c.price; }, 0);
    return "<h1>" + t.pro_t.earnings + '</h1><div class="dcard"><div class="pobal big"><span>' + t.pro_earn_demo + '</span><b class="nums">' + esc(som(sum)) + '</b></div><p class="fine" style="margin-top:10px">' + t.pro_earn_note + "</p></div>";
  }
  function viewPro(q) {
    var t = L(), u = me(); if (!u) return viewLogin(); if (u.role !== "doctor") return viewAccount();
    var tab = PRO_TABS.some(function (x) { return x[0] === q.tab; }) ? q.tab : "home", mine = proMine(u), nNew = mine.filter(function (c) { return c.status === "new"; }).length;
    var main = tab === "requests" ? proRequests(u, mine, q.f) : tab === "schedule" ? proSchedule(u, mine) : tab === "patients" ? proPatients(u, mine) : tab === "earnings" ? proEarnings(u, mine) : tab === "reviews" ? "<h1>" + t.pro_t.reviews + "</h1>" + rvMine(u) : tab === "profile" ? "<h1>" + t.pro_t.profile + "</h1>" + (function () { PRO_FORM = true; try { return viewAccount(); } finally { PRO_FORM = false; } })() : proHome(u, mine);
    var nav = PRO_TABS.map(function (x) { return '<a href="#/pro?tab=' + x[0] + '"' + (x[0] === tab ? ' aria-current="page"' : "") + ">" + ic(x[1]) + "<span>" + t.pro_t[x[0]] + "</span>" + (x[0] === "requests" && nNew ? '<b class="pronum">' + nNew + "</b>" : "") + "</a>"; }).join("");
    return '<div class="pro"><aside class="pronav"><div class="prome">' + avatarOf(u, "sm") + "<div><b>" + esc(u.name) + "</b><small>" + esc(specName(u.profile || {})) + (onlineNow(u) ? " · " + t.on_now : "") + '</small></div></div><nav aria-label="' + esc(t.pro_panel) + '">' + nav + '</nav><div class="profoot"><a href="#/doc/' + u.id + '">' + ic("search") + t.acc_view + '</a><button class="linkbtn" type="button" data-act="logout">' + t.logout + "</button></div></aside>" +
      '<div class="promain">' + main + "</div></div>";
  }
  /* account page: "I'm online now" and the profile photo patients see */
  function liveCard(u) {
    var t = L(), on = u.onlineUntil && u.onlineUntil > Date.now(), at = on ? new Date(u.onlineUntil) : null;
    /* online consultations switched off: patients can't apply, so say so first, with a one-click fix */
    if (!u.pending && ((u.profile || {}).modes || []).indexOf("on") < 0) return '<div class="dcard offcard" style="margin-bottom:22px"><h2>' + t.off_h + '</h2><p class="muted" style="margin:6px 0 12px">' + t.off_p + '</p><button class="btn" type="button" data-act="goonline">' + ic("video") + t.off_btn + "</button></div>";
    var waiting = consults().filter(function (c) { return c.status === "new" && c.asap; }).length;
    return '<div class="dcard livecard" style="margin-bottom:22px"><div class="livegrid"><div><h2>' + t.ol_h + " " + (on ? liveBadge() : "") + '</h2><p class="muted" style="margin:6px 0 12px">' + (on ? t.ol_on(pad(at.getHours()) + ":" + pad(at.getMinutes())) : t.ol_off) + "</p>" +
      '<div class="btns">' + [60, 120, 240].map(function (m) { return '<button class="btn sm' + (on ? " ghost" : "") + '" type="button" data-online="' + m + '">' + t.ol_opts[m] + "</button>"; }).join("") + (on ? '<button class="btn ghost sm" type="button" data-online="0">' + t.ol_stop + "</button>" : "") + "</div>" +
      (waiting ? '<p class="fine" style="margin-top:10px">' + t.ol_wait(waiting) + "</p>" : "") + (BE && !u.tgLinked ? '<p class="fine" style="margin-top:6px">' + t.ol_tg + "</p>" : "") + "</div>" +
      '<div class="photobox">' + avatarOf(u, "lg") + '<div><b>' + t.ph2_h + '</b><p class="fine" style="margin:4px 0 8px">' + t.ph2_p + '</p><label class="btn ghost sm"><input type="file" accept="image/*" id="doc-photo" class="vh">' + ic("camera") + (u.photoUrl ? t.ph2_change : t.ph2_add) + "</label>" + (u.photoUrl ? ' <button class="linkbtn" type="button" data-act="photorm">' + t.ph2_rm + "</button>" : "") + "</div></div></div></div>";
  }
  /* account page: what this doctor earned from paid consultations and what was transferred */
  function earnCard() {
    var t = L(), e = BE && BE.earnings(); if (!e) return "";
    var rows = [[t.po_done(e.done_n), som(e.gross)]].concat(e.fee_pct ? [[t.po_fee(e.fee_pct), som(e.fee)]] : []).concat([[t.er_net, som(e.net)], [t.er_out, som(e.paid_out)]]);
    return '<div class="dcard" style="margin-bottom:22px"><h2>' + t.er_h + '</h2><div class="pobal big"><span>' + t.er_owed + '</span><b class="nums' + (e.balance < 0 ? " neg" : "") + '">' + esc(som(e.balance)) + "</b></div>" +
      '<dl class="kv" style="margin-top:12px">' + rows.map(function (r) { return "<dt>" + r[0] + '</dt><dd class="nums">' + esc(r[1]) + "</dd>"; }).join("") + "</dl>" +
      (e.open_n ? '<p class="fine">' + t.er_open(e.open_n, som(e.open_net)) + "</p>" : "") +
      (e.payouts.length ? '<h3 style="margin:16px 0 6px">' + t.er_hist + "</h3>" + e.payouts.map(function (p) { return '<div class="porow"><span class="nums">' + esc(poDay(p.paid_on)) + '</span><b class="nums">' + esc(som(p.amount)) + '</b><span class="muted">' + esc(p.ref) + "</span></div>"; }).join("") : "") +
      '<p class="fine" style="margin-top:10px">' + t.er_note + "</p></div>";
  }
  /* account page: reviews about this doctor or clinic, each with a reply box */
  function rvMine(u) {
    var t = L(), l = reviews().filter(function (r) { return r.target === u.id; }).sort(function (a, b) { return b.at - a.at; });
    var item = function (r) {
      var open = RR && RR.id === r.id;
      return '<div class="rvitem"><div class="rvtop">' + starsTxt(r.stars) + " <b>" + esc(r.author || t.rv_anon_name) + '</b><span class="muted"> · ' + t.rv_kind[r.kind] + " · " + fmt(new Date(r.at), { day: "numeric", month: "short" }) + "</span></div>" + (r.body ? '<p class="pre">' + esc(r.body) + "</p>" : "") +
        (open ? '<form class="rvreplyform" id="rvreply" data-id="' + r.id + '"><input id="rvreply-in" maxlength="400" value="' + esc(RR.text) + '" placeholder="' + esc(t.rv_reply_ph) + '"><button class="btn sm" type="submit">' + t.rv_reply_send + '</button><button class="btn ghost sm" type="button" data-rr="close">' + t.ap_back + "</button></form>"
          : (r.reply ? '<div class="rvreply"><b>' + t.rv_reply_h + ":</b> " + esc(r.reply) + "</div>" : "") + '<button class="linkbtn" type="button" data-rr="' + r.id + '">' + t.rv_reply_btn + "</button>") + "</div>";
    };
    return '<div class="dcard" style="margin-bottom:22px"><h2>' + t.rv_mine_h + " " + ratingLine(u.id) + "</h2>" + (l.length ? l.map(item).join("") : '<p class="muted" style="margin-top:8px">' + t.rv_mine_none + "</p>") + "</div>";
  }

  /* ---------------- checking clinics and doctors, Telegram notices, unread counts ---------------- */
  function trustCard(u) {
    var t = L(), pr = u.profile || {}; if (!BE || (u.role !== "clinic" && u.role !== "doctor")) return "";
    if (u.verified) return '<div class="note-box ok-box">' + ic("shield") + " <b>" + t.vf_yes + ".</b> " + t.vf_ok_p + " " + t.vf_reset + "</div>";
    var missing = !pr.lic || (u.role === "clinic" && !pr.fac);
    return '<div class="note-box"><b>' + t.vf_h + ": " + t.vf_wait + ".</b> " + (u.role === "clinic" ? t.vf_wait_clinic : t.vf_wait_doc) + (missing ? '<p style="margin:8px 0 0"><b>' + (u.role === "clinic" ? t.vf_need_clinic : t.vf_need_doc) + "</b></p>" : "") + '<p style="margin:8px 0 0">' + t.doc_hint + "</p></div>";
  }
  var NT_WAIT = false;
  function notifyCard(u) {
    var t = L(); if (!BE || !BE.notify().tg) return "";
    var body = u.tgLinked ? '<p style="margin:6px 0 10px"><span class="badge ok">' + ic("check") + t.nt_on + "</span></p>" + '<button class="btn ghost sm" type="button" data-act="tgunlink">' + t.nt_unlink + "</button>"
      : '<p class="muted" style="margin:6px 0 10px">' + t.nt_p + (BE.notify().sms && u.role === "patient" ? " " + t.nt_sms : "") + "</p>" + '<button class="btn sm" type="button" data-act="tglink">' + ic("chat") + t.nt_link + "</button>" + (NT_WAIT ? '<p class="fine" style="margin-top:10px">' + t.nt_wait + "</p>" : "");
    return '<div class="dcard" style="margin-bottom:22px"><h2>' + t.nt_h + "</h2>" + body + "</div>";
  }
  var KSEEN = "shifokor-seen";
  var apKey = function (a) { return a.status + a.day + (a.time || ""); };
  function unseen() {
    var mu = me(), sn = store.get(KSEEN, {}); if (!mu) return { v: 0, c: 0 };
    var v = appts().filter(function (a) { return a.userId === mu.id && (a.status === "confirmed" || a.status === "declined") && sn[a.id] !== apKey(a); }).length +
      consults().filter(function (c) { var m = c.msgs || [], lm = m[m.length - 1]; return c.userId === mu.id && c.status !== "new" && lm && lm.from !== "p" && (sn["c" + c.id] || 0) < m.length; }).length;
    return { v: v, c: mu.role === "clinic" ? appts().filter(function (a) { return a.clinicId === mu.id && a.status === "new" && apOpen(a); }).length : 0 };
  }
  function markSeen(list) { var sn = store.get(KSEEN, {}), ch = false; list.forEach(function (x) { if (sn[x[0]] !== x[1]) { sn[x[0]] = x[1]; ch = true; } }); if (ch) store.set(KSEEN, sn); }
  /* header: account button, unread counts, admin link */
  function hdr() {
    var t = L(), ab = $("acctBtn"), mu = me(), n = unseen();
    var rb = $("regBtn"); if (rb) { rb.hidden = !!mu; rb.setAttribute("href", "#/register"); }
    var isD = !!(mu && mu.role === "doctor"), isPro = !!(mu && mu.role !== "patient"), nNew = isD ? proMine(mu).filter(function (c) { return c.status === "new"; }).length : 0;
    /* "Onlayn maslahat" is for patients and visitors; everyone signed in also gets a link to their own cabinet beside it */
    all(".navcta, .navcta-m").forEach(function (a) { a.textContent = t.nav_consult; a.setAttribute("href", "#/consult?now=1"); a.hidden = isPro; });
    all(".nav .desk:not(.navcab):not(.navcta), .nav .dd.mob .menu > *:not(.navcab-m):not(.navcta-m):not(.admlink)").forEach(function (el) { el.hidden = isPro; });
    var nCab = isD ? nNew : n.c || 0;
    all(".navcab, .navcab-m").forEach(function (a) { a.hidden = !mu; if (!mu) return; a.textContent = t.nav_cab; if (nCab) a.setAttribute("data-n", nCab); else a.removeAttribute("data-n"); });
    if (ab) { ab.textContent = t.nav_login; ab.hidden = !!mu; }
    /* signed in: the account button opens a menu (panel, profile, settings, sign out) */
    var ad = $("acctDd"), amb = $("acctMenuBtn");
    if (ad) { ad.hidden = !mu; if (mu) { amb.innerHTML = esc(shortName(mu)) + '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'; if (n.c) amb.setAttribute("data-n", n.c); else amb.removeAttribute("data-n"); if ($("acctMenu").hidden) $("acctMenu").innerHTML = acctMenu(mu, false); } }
    all('a[href="#/visits"]').forEach(function (a) { if (n.v) a.setAttribute("data-n", n.v); else a.removeAttribute("data-n"); });
    all(".admlink").forEach(function (al) { al.hidden = !(mu && mu.admin); });
  }
  var ADM = { list: null, busy: false, err: "" };
  function admLoad() {
    if (!BE || ADM.busy) return; ADM.busy = true;
    BE.adminList().then(function (j) { ADM.list = j.users || []; ADM.reviews = j.reviews || []; ADM.docs = j.docs || []; ADM.tg = j.webhook; ADM.err = ""; }, function (x) { ADM.err = beMsg(L(), x); ADM.list = ADM.list || []; }).then(function () { ADM.busy = false; if (current.path === "/admin") render(true); });
  }
  /* ---------------- paying doctors: what each is owed from paid, finished consultations, and the transfers made ---------------- */
  var PO = { data: null, busy: false, err: "", form: null, del: "" };
  var som = function (v) { return num(v) + " " + unit(); };   /* sums, where 0 means 0 rather than "free" */
  var poDay = function (s) { return fmt(fromIso(String(s).slice(0, 10)), { day: "numeric", month: "short", year: "numeric" }); };
  function poLoad() {
    if (!BE || PO.busy) return; PO.busy = true;
    BE.adminPayouts().then(function (j) { PO.data = j; PO.err = ""; }, function (x) { PO.err = beMsg(L(), x); PO.data = PO.data || { doctors: [], payouts: [], paid: [], fee_pct: 0 }; }).then(function () { PO.busy = false; if (current.path === "/admin") render(true); });
  }
  function poCollect() { if (!PO.form) return; [["po-amount", "amount"], ["po-day", "day"], ["po-ref", "ref"], ["po-note", "note"]].forEach(function (m) { var el = $(m[0]); if (el) PO.form[m[1]] = el.value.trim(); }); }
  function viewPayouts() {
    var t = L(), d = PO.data;
    if (!d) { poLoad(); return '<p class="muted">…</p>'; }
    var total = function (k) { return d.doctors.reduce(function (a, x) { return a + (x[k] || 0); }, 0); };
    var paidOnly = d.paid.filter(function (c) { return c.pay_status === "paid"; });
    var stat = function (label, v) { return '<div class="postat"><span>' + label + '</span><b class="nums">' + esc(som(v)) + "</b></div>"; };
    var fi = function (id, label, val, type, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + (type || "text") + '" value="' + esc(val || "") + '"' + (extra || "") + "></div>"; };
    var card = function (x) {
      var f = PO.form && PO.form.doctor === x.id ? PO.form : null;
      var facts = [[t.po_done(x.done_n), som(x.gross)], [t.po_fee(d.fee_pct), som(x.fee)], [t.po_net, som(x.net)], [t.po_out, som(x.paid_out)]];
      var form = f ? '<form class="form poform" id="poform" data-id="' + x.id + '" novalidate><div class="three">' + fi("po-amount", t.po_amount, f.amount, "number", ' min="1" step="1" inputmode="numeric"') + fi("po-day", t.po_day, f.day, "date", ' max="' + iso(today0()) + '"') + fi("po-ref", t.po_ref, f.ref, "text", ' maxlength="100" placeholder="' + esc(t.po_ref_ph) + '"') + "</div>" +
        fi("po-note", t.po_note, f.note, "text", ' maxlength="300"') + '<div class="err" id="po-err" aria-live="polite">' + esc(f.err || "") + '</div><div class="btns"><button class="btn" type="submit">' + t.po_save + '</button><button class="btn ghost" type="button" data-po="cancel">' + t.po_cancel + '</button></div><p class="fine">' + t.po_hint + "</p></form>" : "";
      return '<div class="dcard admrow"><div class="sechead" style="margin:0"><div><h3><a href="#/doc/' + x.id + '">' + esc(x.name) + '</a></h3><div class="muted">' + [x.phone ? fmtPhone(x.phone) : "", x.email].filter(Boolean).map(esc).join(" · ") + "</div></div>" +
        '<div class="pobal"><span>' + t.po_owed + '</span><b class="nums' + (x.balance < 0 ? " neg" : "") + '">' + esc(som(x.balance)) + "</b></div></div>" +
        '<dl class="kv" style="margin-top:10px">' + facts.map(function (r) { return "<dt>" + r[0] + '</dt><dd class="nums">' + esc(r[1]) + "</dd>"; }).join("") + "</dl>" +
        (x.open_n ? '<p class="fine">' + t.po_open(x.open_n, som(x.open_net)) + "</p>" : "") + (x.last_paid ? '<p class="fine">' + t.po_last(poDay(x.last_paid)) + "</p>" : "") +
        (form || (x.balance > 0 ? '<button class="btn sm" type="button" data-po="open" data-id="' + x.id + '" data-amount="' + x.balance + '">' + t.po_record + "</button>" : "")) + "</div>";
    };
    var hist = d.payouts.map(function (p) {
      return '<div class="porow wide"><span class="nums">' + esc(poDay(p.paid_on)) + "</span><b>" + esc(p.doctor_name) + '</b><b class="nums">' + esc(som(p.amount)) + '</b><span class="muted">' + esc([p.ref, p.note].filter(Boolean).join(" · ")) + "</span>" +
        (PO.del === p.id ? '<span class="btns"><button class="btn danger sm" type="button" data-po="delok" data-id="' + p.id + '">' + t.po_del_yes + '</button><button class="btn ghost sm" type="button" data-po="delno">' + t.po_cancel + "</button></span>" : '<button class="linkbtn" type="button" data-po="del" data-id="' + p.id + '">' + t.po_del + "</button>") + "</div>";
    }).join("");
    return '<p class="lead">' + t.po_p(d.fee_pct) + "</p>" + (PO.err ? '<p class="err">' + esc(PO.err) + "</p>" : "") +
      '<div class="postats">' + stat(t.po_collected, paidOnly.reduce(function (a, c) { return a + (c.price || 0); }, 0)) + stat(t.po_platform, paidOnly.reduce(function (a, c) { return a + Number(c.fee || 0); }, 0)) + stat(t.po_owed_all, d.doctors.reduce(function (a, x) { return a + Math.max(0, x.balance); }, 0)) + stat(t.po_paid_all, total("paid_out")) + "</div>" +
      (d.doctors.length ? d.doctors.map(card).join("") : '<p class="muted">' + t.po_none + "</p>") +
      '<div class="sechead" style="margin-top:28px"><h2 class="subh" style="margin:0">' + t.po_hist + '</h2><div class="btns"><button class="btn ghost sm" type="button" data-po="csv-paid">' + ic("copy") + t.po_csv_paid + '</button><button class="btn ghost sm" type="button" data-po="csv-out">' + ic("copy") + t.po_csv_out + "</button></div></div>" +
      (hist ? '<div class="dcard">' + hist + "</div>" : '<p class="muted">' + t.po_hist_none + "</p>");
  }
  /* a spreadsheet for the accountant: semicolons and a BOM so Excel opens it with Uzbek and Russian letters intact */
  function csvDownload(name, rows) {
    var cell = function (v) { v = v == null ? "" : String(v); if (/^[=+\-@]/.test(v) && isNaN(+v)) v = "'" + v; return /[";\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + rows.map(function (r) { return r.map(cell).join(";"); }).join("\r\n")], { type: "text/csv;charset=utf-8" }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  /* ---------------- importing doctors who agreed to be listed, from a spreadsheet ---------------- */
  var IM = { text: "", rows: null, agree: false, busy: false, err: "", results: null, sent: [], links: {}, del: "" };
  var IM_HEAD = ["ism", "telefon", "email", "mutaxassislik", "viloyat", "litsenziya", "tajriba", "tillar", "ish_joyi", "matn_narx", "audio_narx", "video_narx", "onlayn", "haqida"];
  var IM_COLS = { name: ["ism", "name", "fio", "ism_familiya", "full_name"], phone: ["telefon", "phone", "tel"], email: ["email", "e_mail", "pochta"], spec: ["mutaxassislik", "specialty", "speciality", "spec"],
    region: ["viloyat", "region"], lic: ["litsenziya", "licence", "license"], years: ["tajriba", "years", "experience"], langs: ["tillar", "languages", "langs"], work: ["ish_joyi", "workplace", "work"],
    text: ["matn_narx", "price_text"], audio: ["audio_narx", "price_audio"], video: ["video_narx", "price_video"], online: ["onlayn", "online"], bio: ["haqida", "bio", "about"] };
  var imNorm = function (s) { return String(s || "").toLowerCase().replace(/[‘’ʻʼ'`"]/g, "").trim().replace(/[\s-]+/g, "_"); };
  /* CSV with ; , or tab between cells (whichever the header row uses most) and "quoted" cells */
  function csvParse(text) {
    text = String(text || "").replace(/^\uFEFF/, "");
    var first = text.split(/\r?\n/)[0] || "", d = [";", "\t", ","].map(function (c) { return [c, first.split(c).length]; }).sort(function (a, b) { return b[1] - a[1]; })[0][0];
    var rows = [], row = [], cell = "", quoted = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (quoted) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; } else cell += ch; }
      else if (ch === '"' && cell === "") quoted = true;
      else if (ch === d) { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += ch;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c.trim(); }); });
  }
  /* a specialty written as its code or its name in any of the three languages; anything else is "other" with the text kept */
  function imSpec(v) {
    var x = imNorm(v); if (!x) return null;
    if (DOC_SP.indexOf(x) > -1) return { spec: x };
    var hit = x.length < 3 ? null : DOC_SP.filter(function (k) { return k !== "other" && ["uz", "ru", "en"].some(function (l) { var n = imNorm(T[l].docsp[k]); return !!n && (n === x || n.indexOf(x) === 0 || x.indexOf(n) === 0); }); })[0];
    return hit ? { spec: hit } : { spec: "other", spec_other: String(v).trim().slice(0, 80) };
  }
  /* a region as its code or name, the way people write it: "Qashqadaryo viloyati", "Кашкадарья", "Toshkent shahri" */
  function imRegion(v) {
    var x = imNorm(v).replace(/\./g, ""); if (!x) return null;
    var names = function (r) { return [r.code, r.uz, r.ru, r.en].map(function (n) { return imNorm(n).replace(/\./g, ""); }); };
    var exact = REG.filter(function (r) { return names(r).indexOf(x) > -1; })[0]; if (exact) return exact;
    if (/(toshkent|tashkent|ташкент)/.test(x) && /(shahri|shahar|_sh$|city|^г_|город|_ш$)/.test(x)) return regByCode.UZ26 || null;
    x = x.replace(/_(viloyati|viloyat|vil|region|oblast|область|обл|respublikasi|республика)$/, "");
    if (x.length < 4) return null;
    var hits = REG.filter(function (r) { return r.code !== "UZ26" && names(r).some(function (n) { return n === x || n.indexOf(x) === 0 || x.indexOf(n) === 0 || n.slice(0, 6) === x.slice(0, 6); }); });
    return hits.length === 1 ? hits[0] : null;   /* two possible regions: better to ask than to guess */
  }
  function imLangs(v) {
    var map = { uz: "uz", ozbek: "uz", ozbekcha: "uz", узбекский: "uz", ru: "ru", rus: "ru", ruscha: "ru", русский: "ru", en: "en", ingliz: "en", inglizcha: "en", english: "en", английский: "en", kaa: "kaa", qoraqalpoq: "kaa", tg: "tg", tojik: "tg", tojikcha: "tg" };
    var out = []; String(v || "").split(/[,;\/\s]+/).forEach(function (w) { var c = map[imNorm(w)]; if (c && out.indexOf(c) < 0) out.push(c); });
    return out.length ? out : ["uz"];
  }
  function imRows(text) {
    var grid = csvParse(text); if (grid.length < 2) return [];
    var head = grid[0].map(imNorm), idx = {}, seen = {};
    Object.keys(IM_COLS).forEach(function (k) { for (var j = 0; j < head.length; j++) if (IM_COLS[k].indexOf(head[j]) > -1) { idx[k] = j; break; } });
    return grid.slice(1).map(function (r, n) {
      var g = function (k) { return idx[k] == null ? "" : String(r[idx[k]] || "").trim(); };
      var price = function (k) { var d = g(k).replace(/[^\d]/g, ""); return d === "" ? "" : Math.min(100000000, +d); };
      var sp = imSpec(g("spec")), rg = imRegion(g("region")), yrs = parseInt(g("years"), 10);
      var o = { line: n + 2, name: g("name").slice(0, 200), phone: digits(g("phone")), email: g("email").toLowerCase(), errs: [] };
      o.profile = { spec: sp ? sp.spec : "", spec_other: sp && sp.spec_other || "", region: rg ? rg.code : "", lic: g("lic").slice(0, 60), years: yrs >= 0 && yrs <= 70 ? String(yrs) : "",
        langs: imLangs(g("langs")), modes: /^(ha|yes|да|1|true|bor|\+)$/i.test(g("online")) ? ["in", "on"] : ["in"], work: g("work") ? [matchPlace(g("work").slice(0, 200))] : [], svc: [],
        cp: { text: price("text"), audio: price("audio"), video: price("video") }, bio: g("bio").slice(0, 1500) };
      if (!o.name) o.errs.push("name");
      if (!/^998\d{9}$/.test(o.phone)) o.errs.push("phone");
      else if (seen[o.phone]) o.errs.push("dup");
      seen[o.phone] = 1;
      if (o.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(o.email)) o.errs.push("email");
      if (!sp) o.errs.push("spec");
      if (g("region") && !rg) o.errs.push("region");
      return o;
    });
  }
  function imRead(file) {
    /* Excel saves Russian CSVs in Windows-1251 more often than UTF-8: try UTF-8 first, then that */
    var read = function (enc) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result || "")); }; fr.onerror = rej; fr.readAsText(file, enc); }); };
    return read("utf-8").then(function (s) { return s.indexOf("\uFFFD") > -1 ? read("windows-1251") : s; });
  }
  function viewImport() {
    var t = L(); if (!ADM.list) admLoad();
    var rows = IM.rows, ok = rows ? rows.filter(function (r) { return !r.errs.length; }) : [];
    var link = function (url) { return '<span class="imlink"><input readonly value="' + esc(url) + '" aria-label="' + esc(t.im_link) + '"><button class="btn ghost sm" type="button" data-imcopy="' + esc(url) + '">' + ic("copy") + t.im_copy + "</button></span>"; };
    var regName = function (code) { var r = code && regByCode[code]; return r ? nmL(r) : "—"; };
    var preview = rows ? (rows.length ? '<h2 class="subh" style="margin-top:24px">' + t.im_preview + '</h2><p class="muted">' + t.im_summary(ok.length, rows.length) + '</p><div class="imtable-wrap"><table class="imtable"><thead><tr>' + t.im_th.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
        rows.map(function (r) { return "<tr" + (r.errs.length ? ' class="bad"' : "") + '><td class="nums">' + r.line + "</td><td>" + esc(r.name || "—") + '</td><td class="nums">' + esc(r.phone ? fmtPhone(r.phone) : "—") + "</td><td>" + esc(r.profile.spec ? specName(r.profile) : "—") + "</td><td>" + esc(regName(r.profile.region)) + "</td><td>" + (r.profile.modes.indexOf("on") > -1 ? t.im_yes : "—") + "</td><td>" + (r.errs.length ? r.errs.map(function (e) { return esc(t.im_err[e] || e); }).join("; ") : ic("check") + " " + t.im_ok) + "</td></tr>"; }).join("") + "</tbody></table></div>" +
        (ok.length ? '<label class="chk" style="margin-top:14px"><input type="checkbox" id="im-agree"' + (IM.agree ? " checked" : "") + "><span>" + t.im_agree + '</span></label><div class="err" aria-live="polite">' + esc(IM.err) + '</div><button class="btn big" type="button" data-im="go"' + (IM.busy ? " disabled" : "") + ">" + (IM.busy ? t.im_busy : t.im_go(ok.length)) + "</button>" : "")
      : '<p class="err" style="margin-top:14px">' + t.im_empty + "</p>") : "";
    var results = IM.results ? '<h2 class="subh" style="margin-top:24px">' + t.im_results + '</h2><p class="muted">' + t.im_results_p + '</p><div class="dcard">' + IM.results.map(function (r) { var o = IM.sent[r.i] || {}; return '<div class="imres"><div><b>' + esc(o.name) + '</b><span class="muted nums"> · ' + esc(o.phone ? fmtPhone(o.phone) : "") + "</span></div>" + (r.url ? link(r.url) : '<span class="err">' + esc(t.im_err[r.error] || r.error) + "</span>") + "</div>"; }).join("") + "</div>" +
      (IM.results.some(function (r) { return r.url; }) ? '<p><button class="btn ghost sm" type="button" data-im="links">' + ic("copy") + t.im_links_csv + "</button></p>" : "") : "";
    var pend = (ADM.list || []).filter(function (x) { return x.pending; });
    var pending = '<h2 class="subh" style="margin-top:28px">' + t.im_pending + " (" + pend.length + ')</h2><p class="muted">' + t.im_pending_p + "</p>" + (pend.length ? '<div class="dcard">' + pend.map(function (x) {
      return '<div class="imres"><div><a href="#/doc/' + x.id + '"><b>' + esc(x.name) + '</b></a><span class="muted nums"> · ' + esc(x.phone ? fmtPhone(x.phone) : "") + (x.invite_at ? " · " + t.im_sent(poDay(x.invite_at)) : "") + "</span></div>" +
        (IM.links[x.id] ? link(IM.links[x.id]) : "") +
        '<div class="btns">' + (IM.links[x.id] ? "" : '<button class="btn ghost sm" type="button" data-im="invite" data-id="' + x.id + '">' + t.im_new_link + "</button>") +
        (IM.del === x.id ? '<button class="btn danger sm" type="button" data-im="rmok" data-id="' + x.id + '">' + t.im_rm_yes + '</button><button class="btn ghost sm" type="button" data-im="rmno">' + t.po_cancel + "</button>" : '<button class="linkbtn" type="button" data-im="rm" data-id="' + x.id + '">' + t.im_rm + "</button>") + "</div></div>";
    }).join("") + "</div>" : '<p class="muted">' + t.adm_none + "</p>");
    return '<p class="lead">' + t.im_p + '</p><ol class="imsteps">' + t.im_steps.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>" +
      '<details class="imcols"><summary>' + t.im_cols_h + '</summary><dl class="kv">' + t.im_cols.map(function (c) { return "<dt><code>" + c[0] + "</code></dt><dd>" + c[1] + "</dd>"; }).join("") + "</dl></details>" +
      '<p><button class="btn ghost sm" type="button" data-im="template">' + ic("copy") + t.im_template + "</button></p>" +
      '<form class="form" id="imform" novalidate><div class="fld"><label for="im-file">' + t.im_file + '</label><input type="file" id="im-file" accept=".csv,.txt,text/csv,text/plain"></div><div class="fld"><label for="im-text">' + t.im_paste + '</label><textarea id="im-text" rows="6" spellcheck="false" placeholder="' + esc(IM_HEAD.join(";")) + '">' + esc(IM.text) + '</textarea></div><button class="btn" type="submit">' + t.im_check + "</button></form>" +
      preview + results + pending;
  }

  /* ---------------- an invited doctor claims their profile ---------------- */
  var CL = { token: "", info: null, err: "", loading: false };
  function viewClaim(token) {
    var t = L();
    if (!BE) return '<div class="wrap pad" style="max-width:560px"><div class="empty">' + t.im_claim_demo + "</div></div>";
    if (CL.token !== token) {
      CL = { token: token, info: null, err: "", loading: true };
      BE.claimInfo(token).then(function (j) { CL.info = j; }, function (x) { CL.err = x.code === "invite" ? t.im_bad_link : beMsg(t, x); }).then(function () { CL.loading = false; if (current.path === "/claim/" + token) render(true); });
    }
    if (CL.loading) return '<div class="wrap pad"><p class="muted">…</p></div>';
    if (!CL.info) return '<div class="wrap pad" style="max-width:560px"><div class="empty">' + esc(CL.err) + "</div></div>";
    var i = CL.info, row = function (k, v) { return v ? "<dt>" + k + "</dt><dd>" + v + "</dd>" : ""; };
    return '<div class="wrap pad acc" style="max-width:560px"><h1 style="font-size:clamp(1.8rem,1.4rem + 2vw,2.4rem)">' + t.im_claim_h + '</h1><p class="lead">' + t.im_claim_p(esc(i.name)) + "</p>" +
      '<dl class="kv">' + row(t.d_spec, esc(i.spec ? specName({ spec: i.spec }) : "")) + row(t.f_phone2, '<span class="nums">' + esc(i.phone) + "</span>") + row(t.f_email, esc(i.email)) + "</dl>" +
      '<form class="form" id="claimform" novalidate style="margin-top:18px"><div class="fld"><label for="cl-pw">' + t.im_pw + '</label><input id="cl-pw" type="password" autocomplete="new-password" minlength="6"></div><div class="fld"><label for="cl-pw2">' + t.im_pw2 + '</label><input id="cl-pw2" type="password" autocomplete="new-password" minlength="6"></div>' +
      '<label class="chk"><input type="checkbox" id="cl-ok"><span>' + t.im_claim_agree + '</span></label><div class="err" id="cl-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.im_claim_go + '</button></form><p class="fine" style="margin-top:12px">' + t.im_claim_fine + "</p></div>";
  }
  var admTabs = function (cur) { var t = L(); return '<div class="chips admtabs">' + [["chk", t.adm_tab_chk], ["pay", t.adm_tab_pay], ["import", t.adm_tab_import], ["meds", t.adm_tab_meds]].map(function (x) { return '<button class="chip" type="button" data-admtab="' + x[0] + '" aria-pressed="' + (cur === x[0]) + '">' + x[1] + "</button>"; }).join("") + "</div>"; };
  function viewAdmin(q) {
    var t = L(), u = me();
    if (!BE || !u || !u.admin) return '<div class="wrap pad"><div class="empty">' + t.adm_forbidden + "</div></div>";
    if (q && q.tab === "import") return '<div class="wrap pad" style="max-width:980px">' + admTabs("import") + '<h1 style="font-size:clamp(1.8rem,1.4rem + 2vw,2.4rem)">' + t.im_h + "</h1>" + viewImport() + "</div>";
    if (q && q.tab === "meds") return '<div class="wrap pad" style="max-width:900px">' + admTabs("meds") + '<h1 style="font-size:clamp(1.8rem,1.4rem + 2vw,2.4rem)">' + t.mo_h + "</h1>" + viewMedOrders() + "</div>";
    if (q && q.tab === "pay") return '<div class="wrap pad" style="max-width:900px">' + admTabs("pay") + '<h1 style="font-size:clamp(1.8rem,1.4rem + 2vw,2.4rem)">' + t.po_h + "</h1>" + viewPayouts() + "</div>";
    if (!ADM.list) { admLoad(); return '<div class="wrap pad"><p class="muted">…</p></div>'; }
    var row = function (x) {
      var pr = x.profile || {}, f = pr.fac && facByKey[pr.fac];
      var facts = [[t.adm_contact, [x.email, x.phone ? fmtPhone(x.phone) : "", x.tg].filter(Boolean).map(esc).join(" · ") || "—"], [t.adm_lic, pr.lic ? esc(pr.lic) : "—"]];
      var xd = (ADM.docs || []).filter(function (d) { return d.user_id === x.id; });
      facts.push([t.doc_h, xd.length ? xd.map(function (d) { return '<button class="linkbtn" type="button" data-docopen="' + d.id + '">' + esc(d.name || t.doc_kinds[d.kind]) + "</button> <small class=\"muted\">(" + t.doc_kinds[d.kind] + ")</small>"; }).join("<br>") : '<span class="muted">' + t.doc_none_adm + "</span>"]);
      if (EMAIL_CHECK && x.email) facts.push(["Email", x.email_verified ? '<span class="badge ok">' + t.adm_email_ok + "</span>" : '<span class="badge warn">' + t.adm_email_no + "</span>"]);
      if (x.role === "clinic" && pr.contact) facts.push([t.adm_cperson, esc(pr.contact) + (pr.contact_role ? " · " + esc(pr.contact_role) : "")]);
      if (x.role === "clinic") facts.push([t.adm_fac, f ? '<a href="#/f/' + f.key + '">' + esc(facLabel(f)) + "</a>" : pr.claim ? esc(pr.claim) : "—"]);
      if (x.role === "doctor") facts.push([t.d_spec, esc(specName(pr)) || "—"], [t.adm_exp, pr.years ? esc(t.exp(pr.years)) : "—"], [t.adm_edu, pr.edu ? esc(pr.edu) : "—"], [t.works_at, (pr.work || []).map(wpLabel).map(esc).join("; ") || "—"], [t.adm_bio, pr.bio ? esc(pr.bio) : "—"]);
      if (x.role === "clinic") facts.push([t.adm_addr, [pr.region && regByCode[pr.region] ? nmL(regByCode[pr.region]) : "", pr.addr].filter(Boolean).map(esc).join(", ") || "—"], [t.adm_hours, pr.hours ? esc(pr.hours) : "—"], [t.adm_about, pr.about ? esc(pr.about) : "—"]);
      if (x.role === "doctor" && pr.region && regByCode[pr.region]) facts.push([t.f_region, esc(nmL(regByCode[pr.region]))]);
      facts.push([t.adm_since, esc(fmt(new Date(x.created_at), { day: "numeric", month: "short" }))]);
      return '<div class="dcard admrow"><div class="sechead" style="margin:0"><div><div class="eyebrow">' + t.role[x.role] + "</div><h3>" + '<a href="#/' + (x.role === "clinic" ? "c/" : "doc/") + x.id + '">' + esc(x.name) + "</a> " + vBadge(x) + "</h3></div>" +
        '<div class="btns">' + (x.verified ? "" : '<button class="btn sm" type="button" data-adm="ok" data-id="' + x.id + '">' + ic("check") + t.adm_ok + "</button>") + '<button class="btn ghost sm" type="button" data-adm="no" data-id="' + x.id + '">' + (x.verified ? t.adm_revoke : t.adm_no) + "</button></div></div>" +
        '<dl class="kv" style="margin-top:10px">' + facts.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl></div>";
    };
    var pend = ADM.list.filter(function (x) { return !x.verified; }), done = ADM.list.filter(function (x) { return x.verified; });
    return '<div class="wrap pad" style="max-width:900px">' + admTabs("chk") + '<h1 style="font-size:clamp(1.8rem,1.4rem + 2vw,2.4rem)">' + t.adm_h + '</h1><p class="lead">' + t.adm_p + "</p>" + (ADM.err ? '<p class="err">' + esc(ADM.err) + "</p>" : "") +
      '<form class="dcard admrl" id="admrlform" novalidate><b>' + t.fg_adm_h + '</b><p class="muted" style="margin:4px 0 10px">' + t.fg_adm_p + '</p><div class="admrlrow"><input id="adm-rl" placeholder="+998 … / email" aria-label="' + esc(t.login_id) + '"><button class="btn sm" type="submit">' + t.fg_adm_btn + '</button></div><p class="fine" id="adm-rl-out" aria-live="polite"></p></form>' +
      '<h2 class="subh" style="margin-top:24px">' + t.adm_pending + " (" + pend.length + ")</h2>" + (pend.length ? pend.map(row).join("") : '<p class="muted">' + t.adm_none + "</p>") +
      '<h2 class="subh" style="margin-top:28px">' + t.adm_done + " (" + done.length + ")</h2>" + (done.length ? done.map(row).join("") : '<p class="muted">' + t.adm_none + "</p>") +
      '<h2 class="subh" style="margin-top:28px">' + t.adm_rv_h + " (" + (ADM.reviews || []).length + ')</h2><p class="muted">' + t.adm_rv_p + "</p>" + ((ADM.reviews || []).length ? (ADM.reviews || []).map(function (r) { return '<div class="dcard admrow' + (r.hidden ? " past" : "") + '"><div class="rvtop">' + starsTxt(r.stars) + " <b>" + esc(r.author || t.rv_anon_name) + '</b><span class="muted"> · ' + t.adm_rv_about + ": " + esc(r.target_name) + " · " + fmt(new Date(r.created_at), { day: "numeric", month: "short" }) + (r.hidden ? " · " + t.rv_hidden : "") + "</span></div>" + (r.body ? '<p class="pre">' + esc(r.body) + "</p>" : "") + '<button class="btn ghost sm" type="button" data-admrv="' + (r.hidden ? "show" : "hide") + '" data-id="' + r.id + '">' + (r.hidden ? t.adm_rv_show : t.adm_rv_hide) + "</button></div>"; }).join("") : '<p class="muted">' + t.adm_none + "</p>") +
      (ADM.tg ? '<p style="margin-top:28px"><button class="btn ghost sm" type="button" data-act="admtg">' + ic("chat") + t.adm_tg + "</button></p>" : "") + "</div>";
  }

  function clinicInbox(u) {
    var t = L(), list = apSort(appts().filter(function (a) { return a.clinicId === u.id; })), nn = list.filter(function (a) { return a.status === "new" && apOpen(a); }).length;
    return '<div class="dcard" id="inbox" style="margin-bottom:22px"><h2>' + t.ap_inbox_h + (nn ? ' <span class="badge warn">' + t.ap_new_n(nn) + "</span>" : "") + '</h2><p class="muted" style="margin:4px 0 0">' + t.ap_inbox_p + "</p>" + (!(u.profile || {}).fac ? '<p class="fine" style="margin-top:8px">' + t.ap_inbox_hint + "</p>" : "") +
      (list.length ? '<div class="visits">' + list.map(function (a) { return apRow(a, true); }).join("") + "</div>" : '<p class="muted" style="margin-top:12px">' + t.ap_inbox_none + "</p>") + "</div>";
  }

  function viewSettings() {
    var t = L(), u = me(), hasPos = false;
    try { hasPos = !!sessionStorage.getItem("shifokor-pos"); } catch (e) {}
    var seg = function (key, opts, cur, labels) { return '<div class="seg setseg" role="group">' + opts.map(function (o) { return '<button type="button" data-pref="' + key + '" data-val="' + o + '" aria-pressed="' + (cur === o) + '">' + labels[o] + "</button>"; }).join("") + "</div>"; };
    var row = function (title, body, note) { return '<div class="setrow"><div><h3>' + title + "</h3>" + (note ? '<p class="muted">' + note + "</p>" : "") + "</div><div>" + body + "</div></div>"; };
    var langs = '<div class="seg setseg" role="group">' + [["uz", "O‘zbekcha"], ["ru", "Русский"], ["en", "English"]].map(function (l) { return '<button type="button" data-setlang="' + l[0] + '" aria-pressed="' + (lang === l[0]) + '">' + l[1] + "</button>"; }).join("") + "</div>";
    var clear = SET_ASK ? '<div class="confirm-row"><b>' + t.set_data_q + '</b><button class="btn danger sm" type="button" data-act="cleardata-yes">' + t.set_data_yes + '</button><button class="btn ghost sm" type="button" data-act="cleardata-no">' + t.v_keep + "</button></div>" : '<button class="btn ghost sm" type="button" data-act="cleardata">' + t.set_data_btn + "</button>";
    return '<div class="wrap pad acc"><h1>' + t.set_h + '</h1><p class="lead">' + t.set_p + "</p>" + settingsCard(false) + "</div>";
  }
  /* installing the site on the phone like an app (a service worker makes it open offline too) */
  var INSTALL = null, standalone = function () { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; };
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); INSTALL = e; if (/\/(settings|prefs)/.test(current.path)) render(true); });
  window.addEventListener("appinstalled", function () { INSTALL = null; toast(L().ins_done); });
  function installRow() {
    var t = L(), ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var body = standalone() ? '<span class="badge ok">' + ic("check") + t.ins_have + "</span>" : INSTALL ? '<button class="btn sm" type="button" data-act="install">' + ic("plus") + t.ins_btn + "</button>" : "";
    var note = standalone() ? "" : INSTALL ? t.ins_p : ios ? t.ins_ios : t.ins_other;
    return '<div class="setrow"><div><h3>' + t.ins_h + "</h3>" + (note ? '<p class="muted">' + note + "</p>" : "") + "</div><div>" + body + "</div></div>";
  }
  /* the settings card: on the site's settings page and in every panel */
  function settingsCard(inPanel) {
    var t = L(), u = me(), hasPos = false;
    try { hasPos = !!sessionStorage.getItem("shifokor-pos"); } catch (e) {}
    var seg = function (key, opts, cur, labels) { return '<div class="seg setseg" role="group">' + opts.map(function (o) { return '<button type="button" data-pref="' + key + '" data-val="' + o + '" aria-pressed="' + (cur === o) + '">' + labels[o] + "</button>"; }).join("") + "</div>"; };
    var row = function (title, body, note) { return '<div class="setrow"><div><h3>' + title + "</h3>" + (note ? '<p class="muted">' + note + "</p>" : "") + "</div><div>" + body + "</div></div>"; };
    var langs = '<div class="seg setseg" role="group">' + [["uz", "O‘zbekcha"], ["ru", "Русский"], ["en", "English"]].map(function (l) { return '<button type="button" data-setlang="' + l[0] + '" aria-pressed="' + (lang === l[0]) + '">' + l[1] + "</button>"; }).join("") + "</div>";
    var clear = SET_ASK ? '<div class="confirm-row"><b>' + t.set_data_q + '</b><button class="btn danger sm" type="button" data-act="cleardata-yes">' + t.set_data_yes + '</button><button class="btn ghost sm" type="button" data-act="cleardata-no">' + t.v_keep + "</button></div>" : '<button class="btn ghost sm" type="button" data-act="cleardata">' + t.set_data_btn + "</button>";
    var accRow = u ? '<a class="btn ghost sm" href="' + (inPanel ? acc("/settings") : "#/account") + '">' + (inPanel ? t.pn_t.settings : t.nav_account) + '</a> <button class="btn ghost sm" type="button" data-act="logout">' + t.logout + "</button>" : '<a class="btn sm" href="#/login">' + t.nav_login + '</a> <a class="btn ghost sm" href="#/register">' + t.go_reg + "</a>";
    return '<div class="dcard setcard">' + installRow() +
      row(t.set_lang, langs) + row(t.set_size, seg("size", ["n", "l"], PREF.size, t.sizes)) + row(t.set_theme, seg("theme", ["auto", "light", "dark"], PREF.theme, t.themes)) +
      (inPanel ? "" : row(t.set_map, seg("map", ["on", "off"], mapOn ? "on" : "off", t.maps)) +
      row(t.set_loc, '<button class="btn ghost sm" type="button" data-act="forgetloc"' + (hasPos ? "" : " disabled") + ">" + t.set_loc_btn + "</button>", hasPos ? t.set_loc_p : t.set_loc_none)) +
      row(t.set_acc, accRow, u ? esc(u.name) : "") +
      row(t.ct_row, '<a class="btn ghost sm" href="#/calltest">' + ic("video") + t.ct_row_btn + "</a>", t.ct_row_p) +
      row(t.set_data, clear, t.set_data_p) + "</div>";
  }

  /* ---------------- browse ---------------- */
  var BR = [["areas", "br_regions", "br_d_rg"], ["types", "br_types", "br_d_ty"]];
  function browseList(type) {
    var t = L(), st = function (pred) { return FAC.filter(function (f) { return f.own === "s" && pred(f); }).length; };
    if (type === "types") return '<ul class="blist">' + CAT_ORDER.map(function (c) { return '<li><a href="#/find?' + qs({ t: c }) + '">' + t.cat[c] + '</a><span class="cnt">' + t.dist_line(st(function (f) { return f.cat === c; })) + "</span></li>"; }).join("") + "</ul>";
    return REG.slice().sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (r) {
      var ds = DIS.filter(function (d) { return d.r === r.i; }).sort(function (a, b) { return a.city - b.city || nmL(a).localeCompare(nmL(b)); });
      return '<div class="bgroup"><h2><a href="#/find?' + qs({ r: r.code }) + '" style="color:inherit">' + esc(nmL(r)) + '</a> <span class="badge">' + t.reg_line(st(function (f) { return DIS[f.d].r === r.i; }), ds.length) + '</span></h2><ul class="blist">' +
        ds.map(function (d) { return '<li><a href="#/find?' + qs({ r: r.code, d: d.code }) + '">' + esc(nmL(d)) + '</a><span class="cnt">' + (d.city ? t.city : t.village) + " · " + t.dist_line(st(function (f) { return f.d === d.i; })) + "</span></li>"; }).join("") + "</ul></div>";
    }).join("");
  }
  function viewBrowse(type) {
    var t = L(), known = BR.filter(function (b) { return b[0] === type; })[0];
    var tabs = '<div class="btabs"><a class="chip" href="#/browse"' + (known ? "" : ' aria-current="page"') + ">" + t.br_cats + "</a>" + BR.map(function (b) { return '<a class="chip" href="#/browse/' + b[0] + '"' + (b[0] === type ? ' aria-current="page"' : "") + ">" + t[b[1]] + "</a>"; }).join("") + '<a class="chip" href="#/search">' + t.nav_demo + "</a></div>";
    var body = known ? browseList(type) : '<div class="tiles" style="margin-top:0">' + BR.map(function (b) { return '<a class="tile" href="#/browse/' + b[0] + '"><b>' + t[b[1]] + "</b><span>" + t[b[2]] + "</span></a>"; }).join("") + '<a class="tile" href="#/search"><b>' + t.nav_demo + "</b><span>" + t.br_d_dm + "</span></a></div>";
    return '<div class="band deep"><div class="wrap bhead"><div class="eyebrow">' + t.nav_browse + "</div><h1>" + (known ? t[known[1]] : t.br_regions) + '</h1><p class="sub">' + (known ? t[known[2]] : t.reg_p) + "</p>" + dirForm({}) + '</div></div><div class="wrap pad">' + tabs + body + '<p class="fine" style="margin-top:28px">' + t.src_note + "</p></div>";
  }

  /* ---------------- join form ---------------- */
  var who = "patient";
  function joinIntro() { var t = L(); return '<div><div class="eyebrow">' + t.join_eye + "</div><h2>" + t.join_h + '</h2><p class="lead">' + t.join_p + "</p></div>"; }
  function fld(id, label, type, opts) {
    var ctl = opts ? '<select id="' + id + '">' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + "</option>"; }).join("") + "</select>" : '<input id="' + id + '" type="' + type + '" autocomplete="' + (type === "tel" ? "tel" : "off") + '"' + (type === "tel" ? ' inputmode="tel"' : "") + ">";
    return '<div class="fld"><label for="' + id + '">' + label + "</label>" + ctl + "</div>";
  }
  function joinFields() {
    var t = L();
    return who === "patient" ? fld("f-name", t.f_name, "text") + fld("f-phone", t.f_phone, "tel") + fld("f-district", t.f_district, "text") + fld("f-need", t.f_need, null, t.o_need)
      : fld("f-cname", t.f_cname, "text") + fld("f-cperson", t.f_cperson, "text") + fld("f-phone", t.f_phone, "tel") + fld("f-district", t.f_district, "text") + fld("f-ctype", t.f_ctype, null, t.o_ctype);
  }
  function joinForm(def) {
    who = def; var t = L();
    return '<form class="form" id="form" novalidate><div class="seg" id="who" role="group"><button type="button" data-w="patient" aria-pressed="' + (who === "patient") + '">' + t.w_patient + '</button><button type="button" data-w="clinic" aria-pressed="' + (who === "clinic") + '">' + t.w_clinic + '</button></div><div id="fields">' + joinFields() + '</div><p class="fine" style="margin:4px 0 16px">' + t.join_fine + '</p><button class="btn block" type="submit">' + (CONFIG.telegram ? t.go_tg : t.go_copy) + '</button><div class="status" id="status" aria-live="polite"></div><div class="msgbox" id="msgbox" hidden></div></form>';
  }
  function submitJoin() {
    var t = L(), g = function (id) { var el = $(id); return el ? el.value.trim() : ""; }, st = $("status"), box = $("msgbox");
    var nameVal = who === "patient" ? g("f-name") : g("f-cname"), phone = g("f-phone");
    if (!nameVal || !phone) { st.className = "status err"; st.textContent = t.err; box.hidden = true; return; }
    var lines = [who === "patient" ? t.msg_p : t.msg_c];
    if (who === "patient") lines.push(t.f_name + ": " + nameVal, t.f_phone + ": " + phone, t.f_district + ": " + g("f-district"), t.f_need + ": " + t.o_need[+$("f-need").value]);
    else lines.push(t.f_cname + ": " + nameVal, t.f_cperson + ": " + g("f-cperson"), t.f_phone + ": " + phone, t.f_district + ": " + g("f-district"), t.f_ctype + ": " + t.o_ctype[+$("f-ctype").value]);
    var msg = lines.join("\n"); st.className = "status";
    if (CONFIG.telegram) { st.textContent = t.opened; box.hidden = true; window.open("https://t.me/" + encodeURIComponent(CONFIG.telegram) + "?text=" + encodeURIComponent(msg), "_blank", "noopener"); return; }
    box.hidden = false; box.textContent = msg;
    try { navigator.clipboard.writeText(msg).then(function () { st.textContent = t.copied; }, function () { st.textContent = t.copy_fail; }); } catch (err) { st.textContent = t.copy_fail; }
  }

  /* ---------------- drawer: booking, move, online room, report, visit summary ---------------- */
  function head(stepn) { return '<div class="sheet-h"><span class="stepn">' + (stepn || "") + '</span><button class="x" type="button" data-act="close" aria-label="' + L().bk_close + '">×</button></div>'; }
  var progress = function (n) { return '<div class="progress"><i class="on"></i><i' + (n > 1 ? ' class="on"' : "") + "></i><i" + (n > 2 ? ' class="on"' : "") + "></i></div>"; };
  function drawerHTML() {
    var t = L(), m = modal;
    if (m.type === "book") {
      var p = byId(m.p), d = fromIso(m.d), where = esc(pname(p)) + ", " + t.ar[p.area], when = whenTxt(d, m.t) + (m.m === "on" ? " · " + t.mode_on : "");
      if (m.step === "rf") return '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dh">' + head(t.step(1, 3)) + progress(1) + '<h2 id="dh">' + t.rf_h + '</h2><p class="muted" style="margin-top:8px">' + t.rf_p + '</p><ul class="rflist">' + t.rf_list.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul><div class="stack"><button class="btn big block" type="button" data-act="rf-no">' + t.rf_no + '</button><button class="btn ghost big block" type="button" data-act="rf-yes" style="color:var(--risk);border-color:var(--risk)">' + t.rf_yes + '</button></div><p class="fine" style="margin-top:14px">' + t.rf_note + "</p></div>";
      if (m.step === "em") return '<div class="sheet" role="alertdialog" aria-modal="true" aria-labelledby="dh">' + head() + '<div class="em-ico">!</div><h2 id="dh">' + t.em_h + '</h2><p style="margin:10px 0 20px;font-size:1.1rem">' + t.em_p + '</p><div class="stack"><a class="btn danger big block" href="tel:103">' + ic("phone") + t.em_call + '</a><button class="btn ghost block" type="button" data-act="rf-back">← ' + t.em_back + "</button></div></div>";
      if (m.step === "done") return '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dh">' + head(t.step(3, 3)) + progress(3) + '<div class="done-ico">' + ic("check") + '</div><h2 id="dh">' + t.bk_done + '</h2><p class="muted" style="margin-top:8px">' + t.bk_done_p + '</p><div class="sum"><b>' + t.sv[m.k] + "</b><span>" + where + "</span><span>" + when + '</span></div><div class="msg"><b>' + t.tg_who + "</b>" + esc(t.tg_msg(t.sv[m.k], pname(p), whenTxt(d, m.t))) + '</div><p class="muted" style="margin-top:12px;font-size:.9rem">' + t.bk_remind + '</p><div class="grow"></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><a class="btn" href="#/visits" data-act="close">' + t.bk_visits + '</a><button class="btn ghost" type="button" data-act="close">' + t.bk_close + '</button></div><div class="demo">' + t.demo + "</div></div>";
      return '<form class="sheet" id="bkform" role="dialog" aria-modal="true" aria-labelledby="dh" novalidate>' + head(t.step(2, 3)) + progress(2) + '<h2 id="dh">' + t.bk_h + '</h2><div class="sum"><span class="muted">' + t.bk_where + "</span><b>" + where + '</b><span class="muted" style="margin-top:6px">' + t.bk_when + "</span><b>" + when + "</b></div>" +
        '<div class="fld"><label for="bk-svc">' + t.bk_service + '</label><select id="bk-svc">' + svcsFor(p, m.m).map(function (x) { return '<option value="' + x.k + '"' + (x.k === m.k ? " selected" : "") + ">" + t.sv[x.k] + " · " + priceTxt(p, x) + "</option>"; }).join("") + "</select></div>" +
        '<div class="fld"><label for="bk-name">' + t.bk_name + '</label><input id="bk-name" autocomplete="name" value="' + esc(m.name || "") + '"></div><div class="fld"><label for="bk-phone">' + t.bk_phone + '</label><input id="bk-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998" value="' + esc(m.phone || "") + '"></div>' +
        '<label class="chk"><input type="checkbox" id="bk-ok"><span>' + t.bk_consent + '</span></label><div class="err" id="bk-err" aria-live="polite">' + (m.err || "") + '</div><button class="btn big block" type="submit">' + t.bk_confirm + '</button><div class="demo">' + t.demo + "</div></form>";
    }
    if (m.type === "move") {
      var b = bookings().filter(function (x) { return x.id === m.bid; })[0], pm = byId(b.p);
      return '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dh">' + head() + '<h2 id="dh">' + t.v_move_h + '</h2><div class="sum"><b>' + t.sv[b.k] + "</b><span>" + esc(pname(pm)) + '</span><span class="muted">' + whenTxt(fromIso(b.d), b.t) + '</span></div><div class="err" id="mv-err" aria-live="polite">' + (m.err || "") + "</div>" + calHTML(pm, b.m, "drawer") + "</div>";
    }
    if (m.type === "room") {
      var rb = bookings().filter(function (x) { return x.id === m.bid; })[0], rp = byId(rb.p);
      var log = '<div class="sys">' + t.rm_wait(rb.t) + "</div>" + m.log.map(function (x) { return '<div class="me">' + esc(x) + "</div>"; }).join("") + (m.media !== "chat" ? '<div class="sys">' + t.rm_demo + "</div>" : "");
      var mb = function (k, icn, label) { return '<button class="chip" type="button" data-rmode="' + k + '" aria-pressed="' + (m.media === k) + '">' + ic(icn) + label + "</button>"; };
      return '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dh"><div class="room"><div>' + head() + '<h2 id="dh">' + t.mode_on + '</h2><p class="muted" style="margin-top:4px">' + t.sv[rb.k] + " · " + esc(pname(rp)) + " · " + whenTxt(fromIso(rb.d), rb.t) + "</p></div>" +
        '<div><div class="room-modes">' + mb("chat", "chat", t.rm_chat) + mb("audio", "mic", t.rm_audio) + mb("video", "video", t.rm_video) + '</div><p class="fine" style="margin-top:8px">' + t.rm_mode_note + '</p></div><div class="room-log" id="roomlog">' + log + '</div><div><form class="room-send" id="roomform"><input id="room-in" class="pinput" style="width:100%;text-align:left" placeholder="' + esc(t.rm_ph) + '" autocomplete="off" aria-label="' + esc(t.rm_ph) + '"><button class="btn" type="submit">' + t.rm_send + '</button></form><p style="margin-top:12px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><span class="fine">' + t.rm_demo + '</span><button class="btn ghost sm" type="button" data-act="close">' + t.rm_leave + "</button></p></div></div></div>";
    }
    if (m.type === "report") {
      var pr = byId(m.p);
      return '<form class="sheet" id="rpform" role="dialog" aria-modal="true" aria-labelledby="dh" novalidate>' + head() + '<h2 id="dh">' + t.p_report + '</h2><p class="muted" style="margin:6px 0 16px">' + esc(pname(pr)) + '</p><fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:600;margin-bottom:8px">' + t.rp_what + '</legend><div class="radio">' + t.rp_opts.map(function (o, i) { return '<label><input type="radio" name="rpwhy" value="' + i + '"' + (i === 0 ? " checked" : "") + ">" + o + "</label>"; }).join("") + '</div></fieldset><div class="fld"><label for="rp-note">' + t.rp_note + '</label><textarea id="rp-note" maxlength="300"></textarea></div><button class="btn big block" type="submit">' + t.rp_send + "</button></form>";
    }
    if (m.type === "photo") {
      var psrc = photoSrc(m.id);
      return '<div class="sheet phview" role="dialog" aria-modal="true" aria-labelledby="dh">' + head() + '<h2 id="dh">' + t.ph_alt + "</h2>" + (psrc ? '<img src="' + psrc + '" alt="' + esc(t.ph_alt) + '">' : '<p class="muted">' + t.ph_loading + "</p>") + '<p class="fine">' + t.ph_privacy + "</p></div>";
    }
    if (m.type === "msg") {
      var mf = m.key ? facByKey[m.key] : null, wrong = m.kind === "wrong";
      return '<form class="sheet" id="msform" role="dialog" aria-modal="true" aria-labelledby="dh" novalidate>' + head() + '<h2 id="dh">' + (wrong ? t.ms_h_wrong : t.ms_h_missing) + "</h2>" + (mf ? '<p class="muted" style="margin:6px 0 16px">' + esc(facName(mf)) + " · " + esc(placeOf(mf)) + "</p>" : '<p style="margin:6px 0 16px"></p>') +
        (wrong ? "" : '<div class="fld"><label for="ms-name">' + t.ms_name + '</label><input id="ms-name" autocomplete="off"></div><div class="fld"><label for="ms-where">' + t.ms_where + '</label><input id="ms-where" autocomplete="off" value="' + esc(m.where || "") + '"></div>') +
        '<div class="fld"><label for="ms-phone">' + t.ms_phone + '</label><input id="ms-phone" type="tel" inputmode="tel" autocomplete="off"></div>' + (wrong ? '<div class="fld"><label for="ms-note">' + t.ms_note + '</label><textarea id="ms-note" maxlength="400"></textarea></div>' : "") +
        '<div class="err" id="ms-err" aria-live="polite"></div><button class="btn big block" type="submit">' + (CONFIG.telegram ? t.ms_tg : t.ms_send) + '</button><div class="status" id="ms-status" aria-live="polite"></div><div class="msgbox" id="ms-box" hidden></div></form>';
    }
    if (m.type === "summary") {
      return '<form class="sheet" id="vsform" role="dialog" aria-modal="true" aria-labelledby="dh" novalidate>' + head() + '<h2 id="dh">' + t.vs_h + '</h2><p class="muted" style="margin:6px 0 16px">' + esc(m.who) + " · " + m.t + '</p><fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:600;margin-bottom:8px">' + t.vs_out + '</legend><div class="radio">' + t.on_out.map(function (o, i) { return '<label><input type="radio" name="vsout" value="' + i + '">' + o + "</label>"; }).join("") + '</div></fieldset><div class="fld"><label for="vs-note">' + t.vs_note + '</label><textarea id="vs-note" maxlength="500"></textarea></div><div class="err" id="vs-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.vs_save + "</button></form>";
    }
    return "";
  }
  function openModal(m) { modal = m; var dr = $("drawer"); dr.hidden = false; dr.innerHTML = drawerHTML(); document.body.style.overflow = "hidden"; var f = dr.querySelector("input:not([type=checkbox]):not([type=radio]), button.btn"); if (f) f.focus(); }
  function refreshModal() { if (!modal) return; var dr = $("drawer"), y = dr.firstElementChild ? dr.firstElementChild.scrollTop : 0; dr.innerHTML = drawerHTML(); if (dr.firstElementChild) dr.firstElementChild.scrollTop = y; }
  function closeModal() { modal = null; var dr = $("drawer"); dr.hidden = true; dr.innerHTML = ""; document.body.style.overflow = ""; }
  function toast(msg) { var el = $("toast"); el.textContent = msg; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { el.hidden = true; }, 3200); }

  /* ---------------- router ---------------- */
  var current = { path: "/", q: {} };
  var PRO_NO = ["/", "/ai", "/doctors", "/search", "/services", "/find", "/specialists", "/family", "/prices", "/ona", "/wellness", "/consult"], CS_FOCUS = 0;
  function render(keepScroll) {
    var t = L(), h = parseHash(), path = h.path, q = h.q, html, route = "home";
    current = h; document.documentElement.lang = lang === "uz" ? "uz-Latn" : lang;
    /* pages behind a sign-in (#/account/...) use the panel layout: each role's own sidebar, no site header or footer */
    PANEL = isPanelPath(path);
    /* doctors and clinics work in their own panel: the patient pages (finding a doctor, services, clinics...) send them there */
    var mu0 = me();
    if (path === "/ai" && !(mu0 && mu0.role !== "patient")) { AI.open = true; location.replace(location.pathname + location.search + "#/"); return; }   /* old links to the AI page open Shifo_AI */
    if (!PANEL && mu0 && mu0.role !== "patient" && (PRO_NO.indexOf(path) > -1 || path.indexOf("/browse") === 0)) { location.replace(location.pathname + location.search + "#/account"); return; }
    document.body.classList.toggle("panelapp", PANEL);
    if (PANEL) {
      var pg = panelPage(path, q);
      if (pg.redirect) { location.replace(location.pathname + location.search + pg.redirect); return; }
      html = pg.bare ? '<div class="pbare"><a class="pbrand" href="#/"><img src="icon.svg?v=3" alt="" width="36" height="36"><span><b>Shifokor</b></span></a>' + pg.body + "</div>" : panelShell(pg); route = "account";
    }
    else if (path === "/search") html = viewSearch(q);
    else if (path.indexOf("/p/") === 0) html = viewProfile(path.slice(3), q);
    else if (path === "/find") { html = viewFind(q); route = "find"; }
    else if (path === "/register") { html = viewRegister(); route = "account"; }
    else if (path === "/login") { html = me() ? viewAccount() : viewLogin(); route = "account"; }
    else if (path === "/account") { html = viewAccount(); route = "account"; }
    else if (path === "/pro") { html = viewPro(q); route = "account"; }
    else if (path === "/settings") { html = viewSettings(); route = "settings"; }
    else if (path === "/admin") { html = viewAdmin(q); route = "admin"; }
    else if (path === "/ona") { html = viewOna(); route = "ona"; }
    else if (path === "/consult") { html = viewDoctors(q) + viewConsult(q, true); route = "consult"; }
    else if (path === "/about") { html = viewAbout(); route = "about"; }
    else if (path === "/specialists") { html = viewSpecialists(); route = "specialists"; }
    else if (path === "/services") { html = viewServices(); route = "services"; }
    else if (path === "/calltest" || path.indexOf("/calltest/") === 0) { html = viewCallTest(path.slice(10)); route = "calltest"; }
    else if (path === "/family") { html = viewFamily(); route = "family"; }
    else if (path === "/wellness") { html = viewWellness(); route = "wellness"; }
    else if (path.indexOf("/consult/") === 0) { html = viewConsultThread(path.slice(9)); route = "consult"; }
    else if (path === "/doctors") { html = viewDoctors(q); route = "doctors"; }
    else if (path === "/prices") { html = viewPrices(q); route = "prices"; }
    else if (path.indexOf("/doc/") === 0) { html = viewDoc(path.slice(5)); route = "doctors"; }
    else if (path.indexOf("/claim/") === 0) { html = viewClaim(path.slice(7)); route = "account"; }
    else if (path.indexOf("/c/") === 0) { html = viewClinicAcc(path.slice(3)); route = "doctors"; }
    else if (path.indexOf("/f/") === 0) { html = viewFacility(path.slice(3)); route = "find"; }
    else if (path === "/browse" || path.indexOf("/browse/") === 0) { html = viewBrowse(path.slice(8)); route = "browse"; }
    else if (path === "/visits") { html = viewVisits(); route = "visits"; }
    else if (path === "/clinics") { html = viewClinics(); route = "clinics"; }
    else if (path === "/dashboard") { html = viewDashboard(); route = "dashboard"; }
    else if (path === "/assist") { html = viewAssist(); route = "assist"; }
    else html = viewHome();
    var y = window.scrollY, apb = document.querySelector(".apbody"), apy = apb ? apb.scrollTop : 0; destroyMap(); $("app").innerHTML = html; hydratePhotos(); gsiMount();
    document.documentElement.classList.toggle("aplock", !!$("ap-h")); if (keepScroll && $("ap-h")) document.querySelector(".applypanel").classList.add("still");   /* slide in once, not on every redraw */ if (keepScroll && apy && document.querySelector(".apbody")) document.querySelector(".apbody").scrollTop = apy;
    if (pendingMap) { var items = pendingMap; pendingMap = null; if (items.fac) initFacMap(items.fac, items.single); else initMap(items); }
    all("[data-t]").forEach(function (el) { var v = t[el.dataset.t]; if (typeof v === "string") el.innerHTML = v; });
    all("[data-r]").forEach(function (a) { if (a.dataset.r === route) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    all(".ddbtn[data-routes]").forEach(function (b) { if (b.dataset.routes && (" " + b.dataset.routes + " ").indexOf(" " + route + " ") > -1) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    all("#lang button, .plang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.l === lang)); });
    var tu = /^\/(doc|c)\/(.+)$/.exec(path), tw = tu && userById(tu[2]);
    document.title = tw && (tw.role === "doctor" || tw.role === "clinic") ? tw.name + (tw.role === "doctor" ? " — " + specName(tw.profile || {}) : "") + " | Shifokor" : "Shifokor: " + (lang === "ru" ? "найдите хорошего врача и проконсультируйтесь онлайн" : lang === "uz" ? "yaxshi shifokorni toping va onlayn maslahat oling" : "find a good doctor and consult online");
    hdr();
    aiSync();
    tbDraw();
    closeMenu();
    if (keepScroll) window.scrollTo(0, y); else { window.scrollTo(0, 0); $("app").focus({ preventScroll: true }); }
    if (Date.now() - CS_FOCUS < 1500) { var csTa = $("csmsg-in"); if (csTa) csTa.focus(); }   /* a page can draw twice after a move, so this holds briefly */
    if (!keepScroll && $("ap-h")) { $("ap-h").setAttribute("tabindex", "-1"); $("ap-h").focus({ preventScroll: true }); }
    if (!keepScroll && (q.doc || q.book) && (path.indexOf("/c/") === 0 || path.indexOf("/f/") === 0) && $("book")) { $("book").scrollIntoView(); setTimeout(function () { var el = $("book"); if (el) el.scrollIntoView(); }, 350); }   /* "book with this doctor" from a doctor's page lands on the form */
    if (!keepScroll && path === "/about" && q.s && $("ab-" + q.s)) { $("ab-" + q.s).scrollIntoView(); setTimeout(function () { var el = $("ab-" + q.s); if (el) el.scrollIntoView(); }, 350); }
  }
  /* after signing in or registering, go back to the page the visitor was on (an application they started, say) */
  var NEXT_K = "shifokor-next";
  function afterAuth() {
    var n = ""; try { n = sessionStorage.getItem(NEXT_K) || ""; sessionStorage.removeItem(NEXT_K); } catch (x) {}
    /* a page of the public site (an application the visitor started there): go back to it */
    /* back to an application the visitor had started; otherwise straight to their own panel */
    return /^#\/consult\?/.test(n) ? n : "#/account";
  }
  function go(hash) { if (location.hash === hash) render(true); else location.hash = hash; }
  function rerender() { render(true); refreshModal(); }

  /* ---------------- events ---------------- */
  function closeMenu() { all(".menu").forEach(function (m) { m.hidden = true; }); all(".ddbtn").forEach(function (b) { b.setAttribute("aria-expanded", "false"); }); }
  function openBooking(o) { var p = byId(o.p), u = me(); openModal({ type: "book", step: "rf", p: o.p, d: o.d, t: o.t, m: o.m, k: svcsFor(p, o.m)[0].k, name: u ? u.name : "", phone: u && u.phone ? fmtPhone(u.phone) : "" }); }

  /* the panel's menu on phones: open or closed */
  function pnavSet(open) { var sh = document.querySelector(".pshell"); if (!sh) return; sh.classList.toggle("navopen", open); all('.pmenu').forEach(function (b) { b.setAttribute("aria-expanded", String(open)); }); if (open) { var f = document.querySelector(".pside nav a"); if (f) f.focus({ preventScroll: true }); } }
  document.addEventListener("click", function (e) {
    if (document.querySelector(".pshell.navopen") && !e.target.closest(".pside") && !e.target.closest(".pmenu")) { pnavSet(false); return; }
    if (!e.target.closest(".dd")) closeMenu();
    var authA = e.target.closest('a[href="#/login"], a[href="#/register"]');
    if (authA && current && current.path !== "/login" && current.path !== "/register") { try { sessionStorage.setItem(NEXT_K, location.hash || "#/"); } catch (x) {} }
    var db = e.target.closest(".ddbtn"); if (db) { var mn = db.nextElementSibling, was = mn.hidden; closeMenu(); mn.hidden = !was; db.setAttribute("aria-expanded", String(was)); return; }
    if (e.target.closest(".menu a")) { var ma = e.target.closest(".menu a"); if (ma.dataset.regroleLink) REGROLE = ma.dataset.regroleLink; closeMenu(); if (!ma.dataset.act) return; }
    var el = e.target.closest("button, a"); if (!el) return;
    var ds = el.dataset, t = L();
    if (el.tagName === "A" && el.closest("#shifoai") && AI.open) { AI.open = false; setTimeout(aiDraw, 0); }

    if (el.classList.contains("sb")) {
      if (ds.ctx === "drawer" && modal && modal.type === "move") {
        var list = bookings(), b = list.filter(function (x) { return x.id === modal.bid; })[0];
        if (!isFree(byId(b.p), b.m, ds.d, ds.time)) { modal.err = t.bk_taken; refreshModal(); return; }
        b.d = ds.d; b.t = ds.time; saveBookings(list); closeModal(); toast(t.v_moved); render(true); return;
      }
      if (ds.ctx === "assist") { AS.pick = { p: ds.p, d: ds.d, t: ds.time }; AS.step = 3; render(false); return; }
      openBooking({ p: ds.p, d: ds.d, t: ds.time, m: ds.m }); return;
    }
    if (el.classList.contains("calnav")) { var st = cal[ds.p] || (cal[ds.p] = { off: 0, more: false }); st.off = Math.max(0, Math.min(HORIZON - 6, st.off + 3 * +ds.dir)); rerender(); return; }
    if (ds.act === "more") { cal[ds.p].more = !cal[ds.p].more; rerender(); return; }
    if (ds.act === "close") { closeModal(); return; }
    if (ds.act === "rf-no") { modal.step = "form"; refreshModal(); var nm = $("bk-name"); if (nm) nm.focus(); return; }
    if (ds.act === "rf-yes") { modal.step = "em"; refreshModal(); return; }
    if (ds.act === "rf-back") { modal.step = "rf"; refreshModal(); return; }
    if (ds.act === "report") { openModal({ type: "report", p: ds.p }); return; }
    if (ds.act === "move") { cancelAsk = null; openModal({ type: "move", bid: +ds.bid }); return; }
    if (ds.act === "room") { openModal({ type: "room", bid: +ds.bid, log: [], media: "chat" }); return; }
    if (ds.act === "askcancel") { cancelAsk = +ds.bid; render(true); return; }
    if (ds.act === "keep") { cancelAsk = null; render(true); return; }
    if (ds.act === "docancel") { var l2 = bookings(); l2.forEach(function (x) { if (x.id === +ds.bid) x.st = "cancelled"; }); saveBookings(l2); cancelAsk = null; toast(t.v_cancelled); render(true); return; }
    if (ds.rmode) { modal.media = ds.rmode; refreshModal(); return; }
    if (ds.act === "togglemap") { mapOn = !mapOn; $("map").classList.toggle("off", !mapOn); el.setAttribute("aria-expanded", String(mapOn)); el.textContent = mapOn ? t.map_hide : t.map_show; if (mapOn && mapInst) setTimeout(function () { mapInst.invalidateSize(); }, 50); return; }
    if (ds.scroll) { e.preventDefault(); var tg = $(ds.scroll); if (tg) tg.scrollIntoView({ behavior: "smooth" }); return; }
    if (ds.day != null && el.closest(".daytabs")) { DS.day = +ds.day; render(true); return; }
    if (ds.ag) {
      var key = ds.key;
      if (ds.ag === "start") { var a = agenda(byId(DS.pid), dayAt(DS.day)).filter(function (x) { return x.key === key; })[0]; openModal({ type: "summary", key: key, who: a.who, t: a.t }); return; }
      setStatus(key, { confirm: "confirmed", done: "done", noshow: "noshow", undo: "confirmed" }[ds.ag], ds.ag === "undo" ? { out: null, sum: null } : null); render(true); return;
    }
    if (ds.act === "confirmcal") { var cf = store.get(K.conf, {}); cf[DS.pid] = iso(today0()); store.set(K.conf, cf); toast(t.d_confirmed); render(true); return; }
    if (ds.act === "fix") { var rs = store.get(K.reports, []); rs.forEach(function (r) { if (String(r.id) === ds.rid) r.open = false; }); store.set(K.reports, rs); toast(t.d_fixed); render(true); return; }
    if (ds.act === "reset") { Object.keys(K).forEach(function (k) { try { localStorage.removeItem(K[k]); } catch (x) {} }); cal = {}; AS = { step: 1, f: { sp: "dental" }, pick: null, done: null }; toast(t.d_reset_done); render(true); return; }
    if (ds.act === "as-back") { AS.step = Math.max(1, AS.step - 1); render(false); return; }
    if (ds.act === "as-reset") { AS = { step: 1, f: { sp: AS.f.sp }, pick: null, done: null }; render(false); return; }
    if (ds.w) { who = ds.w; all("#who button").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.w === who)); }); $("fields").innerHTML = joinFields(); $("status").textContent = ""; $("msgbox").hidden = true; return; }
    if (ds.f) {
      var q = Object.assign({}, current.q);
      if (ds.f === "cov") F.cov = !F.cov; else if (ds.f === "clear") { F = { cov: false, max: 0, lang: "", sort: "soon" }; q = { m: q.m }; } else if (ds.f === "online") q.m = q.m === "on" ? "" : "on";
      go("#/search?" + qs(q)); return;
    }
    if (el.parentNode && el.parentNode.id === "smode" && ds.m) { S.mode = ds.m; all("#smode button").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.m === S.mode)); }); return; }
    if (el.parentNode && el.parentNode.id === "pmode" && ds.m) { current.q.m = ds.m; go("#/p/" + current.path.slice(3) + "?" + qs(current.q)); return; }
    if (ds.cstype) { csCollect(); CS.type = ds.cstype; render(true); return; }
    if (ds.phrm != null) { csCollect(); CSPH.splice(+ds.phrm, 1); render(true); return; }
    if (ds.ph) { openModal({ type: "photo", id: ds.ph }); return; }
    if (ds.act === "phdrop") { var tx0 = $("csmsg-in") ? $("csmsg-in").value : ""; PH = null; render(true); if ($("csmsg-in")) { $("csmsg-in").value = tx0; $("csmsg-in").focus(); } return; }
    if (ds.csfor) { csCollect(); CS.who = ds.csfor; render(true); return; }
    if (ds.onamode) { var dd = $("ona-doc") ? $("ona-doc").value : ""; ON.mode = ds.onamode; render(true); if ($("ona-doc")) $("ona-doc").value = dd; if ($("ona-date") && ON.mode === "lmp") $("ona-date").value = ""; return; }
    if (ds.ona) {
      var op = myPreg(), oa = ds.ona, done = function () { render(true); }, fail = function (x) { el.disabled = false; toast(beMsg(t, x)); };
      if (!op) return;
      if (oa === "ok" || oa === "send") {
        var signs = oa === "ok" ? [] : all('input[name="onasign"]:checked').map(function (i) { return i.value; });
        if (oa === "send" && !signs.length) { toast(t.ona_pick); return; }
        var after = function (urgent) { ON.urgent = !!urgent; ON.ok = !urgent; render(true); var oc = $("onacheck"); if (oc) oc.scrollIntoView({ block: "start" }); };
        if (BE) { el.disabled = true; BE.pregCheck(signs).then(after, fail); return; }
        op.checks = [{ week: op.born ? null : pregWeek(op.due), signs: signs, at: Date.now() }].concat(op.checks || []); savePregDemo(op); after(signs.length > 0); return;
      }
      if (oa === "fam") { var fn = (($("ona-fam") || {}).value || "").trim(); if (!fn) { toast(t.ona_fam_name); return; } el.disabled = true; BE.pregFamily(fn).then(function (url) { ON.famUrl = url; render(true); }, fail); return; }
      if (oa === "famcopy") { try { navigator.clipboard.writeText(ON.famUrl).then(function () { toast(t.copied); }, function () { toast(t.copy_fail); }); } catch (x) { toast(t.copy_fail); } return; }
      if (oa === "famoff") { ON.famUrl = ""; BE.pregFamilyOff().then(done, fail); return; }
      if (oa === "born" || oa === "unborn") {
        var bd = oa === "born" ? ($("ona-born") || {}).value : "";
        if (oa === "born" && !bd) { toast(t.ona_born_l); return; }
        ON.urgent = ON.ok = false;
        if (BE) { BE.pregBorn(bd).then(done, fail); return; }
        op.born = bd; savePregDemo(op); render(true); return;
      }
      if (oa === "del" || oa === "delno") { ON.del = oa === "del"; render(true); return; }
      if (oa === "delok") { ON = { mode: "due", urgent: false, ok: false, famUrl: "", del: false }; if (BE) { BE.pregDelete().then(done, fail); return; } savePregDemo(null); render(true); return; }
    }
    if (ds.csasap) { csCollect(); CS.asap = ds.csasap === "1"; if (CS.asap) CS.doc = ""; render(true); return; }
    if (ds.slday) { if (RS && el.closest(".rsbox")) { RS.slotDay = +ds.slday; RS.slot = 0; render(true); return; } csCollect(); CS.slotDay = +ds.slday; CS.slot = 0; render(true); return; }
    if (ds.slot) { if (RS && el.closest(".rsbox")) { RS.slot = +ds.slot; render(true); return; } csCollect(); CS.slot = +ds.slot; render(true); return; }
    if (ds.rs) {
      if (ds.rs === "open") { var rc0 = consultById(ds.id); RS = { cid: rc0.id, doc: rc0.doc || rc0.doctorId, asap: false, slot: 0, slotDay: 0 }; CX = null; render(true); return; }
      if (ds.rs === "close") { RS = null; render(true); return; }
      if (ds.rs === "save" && RS && RS.slot) {
        var rsc = RS, note = t.rs_note(slotTxt(rsc.slot));
        if (BE) { el.disabled = true; BE.reschedule(rsc.cid, new Date(rsc.slot).toISOString(), note).then(function () { RS = null; toast(t.rs_done); render(true); }, function (x) { el.disabled = false; if (x && x.code === "slot_taken") delete TAKEN[rsc.doc]; $("rs-err").textContent = beMsg(t, x); render(true); }); return; }
        var rcl = consults(); rcl.forEach(function (c) { if (c.id === rsc.cid) { c.slotAt = rsc.slot; c.msgs.push({ from: "s", text: note, at: Date.now() }); } }); saveConsults(rcl); RS = null; toast(t.rs_done); render(true); return;
      }
      return;
    }
    if (ds.cx) {
      if (ds.cx === "ask") { CX = ds.id; RS = null; render(true); return; }
      if (ds.cx === "no") { CX = null; render(true); return; }
      if (ds.cx === "yes") {
        var xid = ds.id;
        if (BE) { el.disabled = true; BE.cancelConsult(xid, t.cx_note).then(function () { CX = null; toast(t.cx_done); render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
        var xcl = consults(); xcl.forEach(function (c) { if (c.id === xid && c.status === "new") { c.status = "cancelled"; c.closedAt = Date.now(); c.msgs.push({ from: "s", text: t.cx_note, at: Date.now() }); } }); saveConsults(xcl); CX = null; toast(t.cx_done); render(true); return;
      }
    }
    if (ds.vo) {
      if (ds.vo === "rec") { voStart(ds.id); return; }
      if (ds.vo === "stop") { voStop(); return; }
      if (ds.vo === "drop") { voDrop(); render(true); return; }
      if (ds.vo === "send" && VO && VO.blob) { voSend(el); return; }
      return;
    }
    if (ds.rx) {
      var rxc = consultById(ds.id || (RX && RX.cid) || (RXO && RXO.cid) || "");
      if (ds.rx === "edit" && rxc) { RX = { cid: rxc.id, rows: (rxc.rx && rxc.rx.length ? rxc.rx : [{ name: "", how: "", days: "" }]).map(function (m) { return { name: m.name, how: m.how || "", days: m.days || "" }; }) }; render(true); if ($("rx-n-0")) $("rx-n-0").focus(); return; }
      if (ds.rx === "add") { rxCollect(); RX.rows.push({ name: "", how: "", days: "" }); render(true); if ($("rx-n-" + (RX.rows.length - 1))) $("rx-n-" + (RX.rows.length - 1)).focus(); return; }
      if (ds.rx === "rm") { rxCollect(); RX.rows.splice(+ds.i, 1); if (!RX.rows.length) RX.rows.push({ name: "", how: "", days: "" }); render(true); return; }
      if (ds.rx === "close") { RX = null; render(true); return; }
      if (ds.rx === "order" && rxc) { RXO = { cid: rxc.id, region: rxc.region || "", addr: "", phone: rxc.phone ? fmtPhone(rxc.phone) : "", note: "", ok: false }; render(true); if ($("rxo-addr")) $("rxo-addr").focus(); return; }
      if (ds.rx === "oclose") { RXO = null; render(true); return; }
      if (ds.rx === "odel") {
        if (BE) { el.disabled = true; BE.medOrderCancel(ds.id).then(function () { render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
        var mol = medOrders(); mol.forEach(function (o) { if (o.id === ds.id && o.status === "new") o.status = "cancelled"; }); store.set(KMO, mol); render(true); return;
      }
    }
    /* clinic branches and staff */
    if (ds.br) {
      var bu = me();
      if (ds.br === "new") { BRF = { id: "" }; STDEL = ""; render(true); if ($("br-name")) $("br-name").focus(); return; }
      if (ds.br === "edit") { BRF = { id: ds.id }; STDEL = ""; render(true); if ($("br-name")) $("br-name").focus(); return; }
      if (ds.br === "close") { BRF = null; render(true); return; }
      if (ds.br === "del") { STDEL = "br" + ds.id; render(true); return; }
      if (ds.br === "nodel") { STDEL = ""; render(true); return; }
      if (ds.br === "delok") {
        STDEL = "";
        if (BE) { el.disabled = true; BE.branchDelete(ds.id).then(function () { toast(t.cl_br_deleted); render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
        store.set(KBR, branches().filter(function (b) { return b.id !== ds.id; })); store.set(KSTA, demoStaff().map(function (x) { return x.branchId === ds.id ? Object.assign({}, x, { branchId: "" }) : x; }));
        toast(t.cl_br_deleted); render(true); return;
      }
    }
    if (ds.st) {
      if (ds.st === "rm" || ds.st === "leave") { STDEL = (ds.st === "rm" ? "st" : "lv") + ds.id; render(true); return; }
      if (ds.st === "no") { STDEL = ""; render(true); return; }
      if (ds.st === "rmok" || ds.st === "leaveok") {
        STDEL = ""; var msg = ds.st === "rmok" ? t.cl_removed : t.cl_left;
        if (BE) { el.disabled = true; BE.staffRemove(ds.id).then(function () { toast(msg); render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
        store.set(KSTA, demoStaff().filter(function (x) { return x.id !== ds.id; })); toast(msg); render(true); return;
      }
    }
    if (ds.inv) {
      var yes = ds.inv === "yes", iu = me();
      if (BE) { el.disabled = true; BE.staffAnswer(ds.id, yes).then(function () { toast(yes ? t.cl_inv_joined : t.cl_inv_declined); render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
      var sl = demoStaff(), sx = sl.filter(function (x) { return x.id === ds.id; })[0];
      if (sx && iu) { if (yes) { sx.status = "active"; sx.doctorId = iu.id; } else sl = sl.filter(function (x) { return x !== sx; }); store.set(KSTA, sl); }
      toast(yes ? t.cl_inv_joined : t.cl_inv_declined); render(true); return;
    }
    if (ds.mos) {
      if (BE) { el.disabled = true; BE.adminMedStatus(ds.id, ds.mos).then(function () { MO.list = null; render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
      var mol2 = medOrders(); mol2.forEach(function (o) { if (o.id === ds.id) o.status = ds.mos; }); store.set(KMO, mol2); render(true); return;
    }
    if (ds.fu) {
      var fcl = consults(), fc = fcl.filter(function (x) { return x.id === ds.id; })[0]; if (!fc) return;
      var fnote = t.fu_note(t.fu_opts[ds.fu]);
      if (BE) { el.disabled = true; BE.followup(fc.id, ds.fu, fnote).then(function () { render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
      fc.followup = ds.fu; fc.msgs.push({ from: "s", text: fnote, at: Date.now() }); saveConsults(fcl); render(true); return;
    }
    if (ds.online != null) {
      var mins = +ds.online, ou = me(); if (!ou) return;
      if (BE) { el.disabled = true; BE.setOnline(mins).then(function () { render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
      var ul = users(), uu = ul.filter(function (x) { return x.id === ou.id; })[0]; uu.onlineUntil = mins ? Date.now() + mins * 60000 : 0; store.set("shifokor-users", ul); render(true); return;
    }
    if (ds.act === "photorm") {
      if (BE) { BE.setPhoto(null).then(function () { render(true); }, function (x) { toast(beMsg(t, x)); }); return; }
      var ul2 = users(), u2 = ul2.filter(function (x) { return x.id === (me() || {}).id; })[0]; if (u2) { u2.photoUrl = ""; store.set("shifokor-users", ul2); } render(true); return;
    }
    if (ds.pay) {
      var pcl = consults(), pc = pcl.filter(function (x) { return x.id === ds.id; })[0]; if (!pc) return;
      if (ds.pay === "demo") { pc.payStatus = "paid"; pc.paidAt = Date.now(); pc.payProvider = "demo"; pc.msgs.push({ from: "s", text: t.pay_done, at: Date.now() }); saveConsults(pcl); toast(t.pay_done); render(true); return; }
      el.disabled = true;
      BE.payLink(pc.id, ds.pay, lang).then(function (url) { try { sessionStorage.setItem("shifokor-paying", JSON.stringify({ id: pc.id, at: Date.now() })); } catch (x) {} location.href = url; }, function (x) { el.disabled = false; toast(beMsg(t, x)); render(true); });
      return;
    }
    if (ds.cs) {
      var cl = consults(), cc = cl.filter(function (x) { return x.id === ds.id; })[0], du = me(); if (!cc) return;
      if (BE && ds.cs === "accept") { if (!du || du.role !== "doctor") { toast(t.cs_only_doc); return; } BE.updateConsult(cc.id, { status: "accepted", doctor_id: du.id, doctor_name: du.name }, t.cs_accepted(du.name)).then(function () { csOpen(cc.id); }, function () { toast(t.be_err); }); return; }
      if (BE && ds.cs === "call") { BE.updateConsult(cc.id, { call: true }, t.cs_call_msg(cc.type)).then(function () { render(true); }, function (x) { toast(beMsg(t, x)); }); openCall(cc, "d"); return; }
      if (ds.cs === "accept") { if (!du || du.role !== "doctor") { toast(t.cs_only_doc); return; } cc.status = "accepted"; cc.doctorId = du.id; cc.doctorName = du.name; cc.price = cpOf(du.profile)[cc.type]; cc.payStatus = cc.price > 0 ? "due" : "none"; cc.msgs.push({ from: "s", text: t.cs_accepted(du.name), at: Date.now() }); saveConsults(cl); csOpen(cc.id); return; }
      if (ds.cs === "call") { if (!ringNow(cc)) cc.msgs.push({ from: "s", text: t.cs_call_msg(cc.type), at: Date.now() }); cc.callBy = ringNow(cc) && cc.callBy === "p" ? "p" : "d"; cc.call = true; cc.callAt = Date.now(); saveConsults(cl); render(true); openCall(cc, "d"); return; }
      if (ds.cs === "join") { openCall(cc, "p"); return; }
      if (ds.cs === "pcall") {
        if (BE) { BE.updateConsult(cc.id, { call: true }, t.cl_pat_msg).then(function () { render(true); }, function (x) { toast(beMsg(t, x)); }); openCall(cc, "p"); return; }
        if (!ringNow(cc)) cc.msgs.push({ from: "s", text: t.cl_pat_msg, at: Date.now() }); cc.call = true; cc.callAt = Date.now(); cc.callBy = "p"; saveConsults(cl); render(true); openCall(cc, "p"); return;
      }
    }
    if (ds.aitry) { aiSend(ds.aitry); return; }
    if (ds.act === "ctnew") { el.disabled = true; BE.callTest("").then(function (j) { go("#/calltest/" + j.code); }, function (x) { el.disabled = false; toast(x && x.code === "limit" ? t.ct_limit : x && x.code === "no_livekit" ? t.ct_off : beMsg(t, x)); }); return; }
    if (ds.act === "ctcopy") { var cl = $("ct-link"); if (cl) { cl.select(); (navigator.clipboard ? navigator.clipboard.writeText(cl.value) : Promise.reject()).then(function () { toast(t.ct_copied); }, function () { try { document.execCommand("copy"); toast(t.ct_copied); } catch (x) {} }); } return; }
    if (ds.ctjoin) {
      var ctc = current.path.slice(10).toUpperCase();
      if (!window.ShifokorCall || !BE) return;
      ShifokorCall.open({ cid: "test-" + ctc, role: "p", media: ds.ctjoin, title: t.ct_room(ctc), peer: t.ct_peer, t: t, demo: false, lkOnly: true, wait: t.ct_wait, roomInfo: function () { return BE.callTest(ctc); }, done: function (sec) { if (sec) toast(t.cl_ended(Math.floor(sec / 60) + ":" + pad(sec % 60))); render(true); } });
      return;
    }
    if (ds.aiask) { AI.complaint = AI.msgs.filter(function (m) { return m.role === "user"; }).map(function (m) { return m.content; }).join(". ").slice(0, 1500); CS = null; AI.open = false; aiDraw(); go("#/consult?" + qs({ s: ds.aiask })); return; }
    if (ds.act === "aireset") { AI.msgs = []; AI.busy = false; aiDraw(""); return; }
    if (ds.act === "aiopen" || ds.act === "aiclose") { AI.open = ds.act === "aiopen" ? !AI.open : false; aiDraw(AI.open ? "" : null); if (!AI.open) { var fb = document.querySelector(".aifab"); if (fb) fb.focus(); } return; }
    if (ds.pq) { go("#/prices?" + qs(prQuery({ q: ds.pq }))); return; }
    if (ds.apday || ds.appart || ds.apwho) { apCollect(); if (ds.apday) AP.day = ds.apday; if (ds.appart) AP.part = ds.appart; if (ds.apwho) { AP.who = ds.apwho; var mu7 = me(); AP.name = ds.apwho === "self" && mu7 && mu7.role === "patient" ? mu7.name : ""; } render(true); return; }
    if (ds.apx) {
      if ((current.path === "/account" || current.path === "/pro")) accCollect();
      var ax = appts().filter(function (x) { return x.id === ds.id; })[0];
      APX = ds.apx === "back" || !ax ? null : { id: ax.id, mode: ds.apx, day: ax.day, time: ax.time || (ax.part === "am" ? "09:00" : "14:00"), note: ax.note || "" };
      render(true); if ($("apx-time")) $("apx-time").focus(); else if ($("apx-note")) $("apx-note").focus(); return;
    }
    if (ds.rvstar) { rvCollect(); RV.stars = +ds.rvstar; render(true); return; }
    if (ds.rvsub) { rvCollect(); RV.sub[ds.rvsub] = +ds.n; render(true); return; }
    if (ds.act === "rvopen") { RV = { key: "v" + ds.id, stars: 0, body: "", anon: false }; render(true); return; }
    if (ds.sl) { var cur = slideAt(); slideTo(ds.sl === "prev" ? cur - 1 : ds.sl === "next" ? cur + 1 : +ds.sl); return; }
    if (ds.rr) { if ((current.path === "/account" || current.path === "/pro")) accCollect(); var rr0 = reviews().filter(function (x) { return x.id === ds.rr; })[0]; RR = ds.rr === "close" || !rr0 ? null : { id: rr0.id, text: rr0.reply || "" }; render(true); if ($("rvreply-in")) $("rvreply-in").focus(); return; }
    if (ds.admtab) { go("#/admin" + (ds.admtab !== "chk" ? "?tab=" + ds.admtab : "")); return; }
    if (ds.imcopy) { var inp = el.parentNode.querySelector("input"); try { navigator.clipboard.writeText(ds.imcopy).then(function () { toast(t.im_copied); }, function () { if (inp) inp.select(); }); } catch (x) { if (inp) inp.select(); } return; }
    if (ds.im && BE) {
      if (ds.im === "template") { csvDownload("shifokor-shifokorlar-shablon.csv", [IM_HEAD]); return; }
      if (ds.im === "links") { csvDownload("shifokor-takliflar-" + iso(today0()) + ".csv", [t.im_cols_links].concat((IM.results || []).filter(function (r) { return r.url; }).map(function (r) { var o = IM.sent[r.i]; return [o.name, "+" + o.phone, r.url]; }))); return; }
      if (ds.im === "go") {
        var okRows = (IM.rows || []).filter(function (r) { return !r.errs.length; });
        if (!okRows.length) return;
        if (!IM.agree) { IM.err = t.im_err_agree; render(true); return; }
        IM.err = ""; IM.busy = true; render(true);
        /* at most 200 per request; results keep their place in the full list */
        var chunks = []; for (var ci = 0; ci < okRows.length; ci += 200) chunks.push(ci);
        chunks.reduce(function (pr, start) {
          return pr.then(function (acc) { return BE.adminImport(okRows.slice(start, start + 200).map(function (r) { return { name: r.name, phone: r.phone, email: r.email, profile: r.profile }; })).then(function (j) { return acc.concat(j.results.map(function (x) { return Object.assign({}, x, { i: x.i + start }); })); }); });
        }, Promise.resolve([])).then(function (res) { IM.results = res; IM.sent = okRows; IM.rows = null; IM.text = ""; IM.agree = false; ADM.list = null; BE.refresh().catch(function () {}); toast(t.im_done(res.filter(function (x) { return x.url; }).length)); },
          function (x) { IM.err = beMsg(t, x); }).then(function () { IM.busy = false; render(true); });
        return;
      }
      if (ds.im === "invite") { el.disabled = true; BE.adminInvite(ds.id).then(function (j) { IM.links[ds.id] = j.url; render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
      if (ds.im === "rm" || ds.im === "rmno") { IM.del = ds.im === "rm" ? ds.id : ""; render(true); return; }
      if (ds.im === "rmok") { el.disabled = true; BE.adminRemovePending(ds.id).then(function () { IM.del = ""; ADM.list = null; BE.refresh().catch(function () {}); toast(t.im_removed); render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
    }
    if (ds.po && BE) {
      var pd = PO.data || { doctors: [], payouts: [], paid: [] };
      if (ds.po === "open") { PO.form = { doctor: ds.id, amount: ds.amount, day: iso(today0()), ref: "", note: "", err: "" }; PO.del = ""; render(true); if ($("po-ref")) $("po-ref").focus(); return; }
      if (ds.po === "cancel") { PO.form = null; render(true); return; }
      if (ds.po === "del" || ds.po === "delno") { PO.del = ds.po === "del" ? ds.id : ""; render(true); return; }
      if (ds.po === "delok") { el.disabled = true; BE.adminPayoutDelete(ds.id).then(function () { PO.del = ""; PO.data = null; toast(t.po_deleted); render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
      if (ds.po === "csv-paid") {
        csvDownload("shifokor-maslahatlar-" + iso(today0()) + ".csv", [t.po_cols_paid].concat(pd.paid.map(function (c) {
          var fee = Number(c.fee || 0);
          return [c.n, c.paid_at ? String(c.paid_at).slice(0, 16).replace("T", " ") : "", c.doctor_name, c.price, fee, c.price - fee, c.pay_provider, c.pay_status === "refunded" ? t.pay_refunded : t.cs_st[c.status]];
        })));
        return;
      }
      if (ds.po === "csv-out") { csvDownload("shifokor-otkazmalar-" + iso(today0()) + ".csv", [t.po_cols_out].concat(pd.payouts.map(function (p) { return [String(p.paid_on).slice(0, 10), p.doctor_name, p.amount, p.ref, p.note]; }))); return; }
    }
    if (ds.admrv && BE) { el.disabled = true; BE.adminReview(ds.id, ds.admrv === "hide").then(function () { ADM.list = null; BE.refresh().catch(function () {}); render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
    if (ds.act === "apcancel") { apAsk = ds.id; render(true); return; }
    if (ds.act === "tglink" && BE) {
      var tw = null; try { tw = window.open("", "_blank"); } catch (x) {}   /* opened now, inside the click, so it isn't blocked as a pop-up */
      BE.tgLink().then(function (url) { if (tw) tw.location.href = url; else location.href = url; NT_WAIT = true; render(true); }, function (x) { if (tw) tw.close(); toast(beMsg(t, x)); });
      return;
    }
    if (ds.act === "goonline") {
      var gu = me(); if (!gu) return; var gp = JSON.parse(JSON.stringify(gu.profile || {})); gp.modes = (gp.modes || ["in"]).filter(function (m) { return m !== "on"; }).concat(["on"]);
      if (BE) { el.disabled = true; BE.saveProfile({ role: gu.role, name: gu.name, email: gu.email || "", phone: gu.phone || "", tg: gu.tg || "", profile: gp }).then(function () { ACC = null; toast(t.off_done); render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
      var gl = users(); gl.forEach(function (x) { if (x.id === gu.id) x.profile = gp; }); saveUsers(gl); ACC = null; toast(t.off_done); render(true); return;
    }
    if (ds.act === "gunlink" && BE) { if (current.path === "/account" || current.path === "/pro") accCollect(); el.disabled = true; BE.googleUnlink().then(function () { toast(t.g_unlinked); render(true); }, function (x) { el.disabled = false; toast(gMsg(t, x)); }); return; }
    if (ds.act === "tgunlink" && BE) { if ((current.path === "/account" || current.path === "/pro")) accCollect(); BE.tgUnlink().then(function () { NT_WAIT = false; render(true); }, function (x) { toast(beMsg(t, x)); }); return; }
    if (ds.adm && BE) { el.disabled = true; BE.adminVerify(ds.id, ds.adm === "ok").then(function () { toast(ds.adm === "ok" ? t.adm_ok_done : t.adm_no_done); ADM.list = null; BE.refresh().catch(function () {}); render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
    if (ds.act === "admtg" && BE) { BE.adminTgSetup().then(function (j) { toast(t.adm_tg_ok(j.bot)); }, function (x) { toast(beMsg(t, x)); }); return; }
    if (ds.act === "apcancel-no") { apAsk = null; render(true); return; }
    if (ds.act === "apcancel-yes") {
      var aid = ds.id; apAsk = null;
      if (BE) { BE.apptAction(aid, "cancel").then(function () { toast(t.ap_cancelled); render(true); }, function (x) { toast(beMsg(t, x)); render(true); }); return; }
      var al = appts(); al.forEach(function (x) { if (x.id === aid && apOpen(x)) x.status = "cancelled"; }); saveAppts(al); toast(t.ap_cancelled); render(true); return;
    }
    if (ds.regrole) { REGROLE = ds.regrole; var keep = regKeep(); if (current.q.role) { try { history.replaceState(null, "", location.pathname + location.search + "#/register"); } catch (x) {} } render(true); regPut(keep); return; }
    if (ds.act === "print") { window.print(); return; }
    if (ds.docopen) { docOpen(ds.docopen); return; }
    if (ds.docdel) {
      if (BE) { el.disabled = true; BE.docDelete(ds.docdel).then(function () { DOCS.list = null; render(true); }, function (x) { el.disabled = false; toast(beMsg(t, x)); }); return; }
      store.set(KDOC, store.get(KDOC, []).filter(function (d) { return d.id !== ds.docdel; })); render(true); return;
    }
    if (ds.act === "install") { if (INSTALL) { INSTALL.prompt(); INSTALL.userChoice.then(function () { INSTALL = null; render(true); }); } return; }
    if (ds.act === "share") {
      var shu = ds.url, shn = ds.name;
      if (navigator.share) { navigator.share({ title: shn + " | Shifokor", url: shu }).catch(function () {}); return; }
      (navigator.clipboard ? navigator.clipboard.writeText(shu) : Promise.reject()).then(function () { toast(t.sh_copied); }, function () { window.prompt(t.sh_copy, shu); });
      return;
    }
    if (ds.act === "fgagain") { FG = { step: 1, id: FG.id, sent: [], code: "", at: 0 }; render(true); return; }
    if (ds.act === "evresend") { el.disabled = true; verSend(true); render(true); return; }
    if (ds.regroleLink) { REGROLE = ds.regroleLink; return; }
    if (ds.act === "svcadd") { accCollect(); ACC.pr.svc.push({ name: "", price: "", online: false }); render(true); var rows = all("#svc-list .s-n"); if (rows.length) rows[rows.length - 1].focus(); return; }
    if (ds.svcdel != null) { accCollect(); ACC.pr.svc.splice(+ds.svcdel, 1); render(true); return; }
    if (ds.act === "wpadd") { accCollect(); ACC.pr.work.push({ t: "x", label: "" }); render(true); var ws = all("#wp-list input"); if (ws.length) ws[ws.length - 1].focus(); return; }
    if (ds.wpdel != null) { accCollect(); ACC.pr.work.splice(+ds.wpdel, 1); render(true); return; }
    if (ds.act === "pnav") { pnavSet(!document.querySelector(".pshell.navopen")); return; }
    if (ds.act === "logout" && BE) { BE.signOut().then(function () { ACC = null; toast(t.logged_out); go("#/"); }); return; }
    if (ds.act === "accdel-yes" && BE) { BE.deleteAccount().then(function () { ACC = null; ACC_DEL = false; toast(t.acc_deleted); go("#/"); }, function () { toast(t.be_err); }); return; }
    if (ds.act === "logout") { store.set(KS, null); ACC = null; toast(t.logged_out); go("#/"); return; }
    if (ds.act === "accdel") { ACC_DEL = true; render(true); return; }
    if (ds.act === "accdel-no") { ACC_DEL = false; render(true); return; }
    if (ds.act === "accdel-yes") { var cu = me(); saveUsers(users().filter(function (x) { return x.id !== cu.id; })); store.set(KS, null); ACC = null; ACC_DEL = false; toast(t.acc_deleted); go("#/"); return; }
    if (ds.pref) {
      PREF[ds.pref] = ds.val;
      if (ds.pref === "map") mapOn = ds.val === "on";
      savePrefs(); render(true); toast(t.set_saved); return;
    }
    if (ds.setlang) { lang = ds.setlang; try { localStorage.setItem("shifokor-lang", lang); } catch (x) {} render(true); return; }
    if (ds.act === "forgetloc") { POS = null; try { sessionStorage.removeItem("shifokor-pos"); } catch (x) {} toast(t.set_loc_done); render(true); return; }
    if (ds.act === "cleardata") { SET_ASK = true; render(true); return; }
    if (ds.act === "cleardata-no") { SET_ASK = false; render(true); return; }
    if (ds.act === "cleardata-yes") {
      phUrls = {}; PH = null;
      ["bookings", "status", "prices", "conf", "reports", "consults", "appts", "reviews", "files"].concat(BE ? [] : ["users", "session"]).forEach(function (k) { try { localStorage.removeItem("shifokor-" + k); } catch (x) {} });
      SET_ASK = false; cal = {}; toast(t.set_data_done); if (BE) BE.refresh().catch(function () {}); render(true); return;
    }
    if (ds.act === "near") { e.preventDefault(); closeMenu(); askLocation(); return; }
    if (ds.act === "dirmore") { DIRN.n += 40; render(true); return; }
    if (ds.ownsel) {
      all("#downs button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === el)); });
      if (current.path === "/find") { var qs2 = Object.assign({}, current.q); qs2.o = ds.ownsel === "s" ? "" : ds.ownsel; go("#/find?" + qs(qs2)); }
      return;
    }
    if (ds.own) { var qo = Object.assign({}, current.q); qo.o = ds.own === "s" ? "" : ds.own; go("#/find?" + qs(qo)); return; }
    if (ds.act === "missing") { var dsel = disByCode[current.q.d]; openModal({ type: "msg", kind: "missing", where: dsel ? nmL(dsel) + ", " + nmL(REG[dsel.r]) : "" }); return; }
    if (ds.act === "wrong") { openModal({ type: "msg", kind: "wrong", key: ds.key }); return; }
    if (ds.act === "copycoords") { var cc = ds.c; try { navigator.clipboard.writeText(cc).then(function () { toast(t.copied2 + ": " + cc); }, function () { toast(cc); }); } catch (x) { toast(cc); } return; }
    if (el.matches("#lang button, .plang button")) { lang = ds.l; try { localStorage.setItem("shifokor-lang", lang); } catch (x) {} render(true); refreshModal(); return; }
  });

  document.addEventListener("submit", function (e) {
    var id = e.target.id, t = L(); e.preventDefault();
    if (id === "sform") {
      var mode = $("smode").querySelector('[aria-pressed="true"]').dataset.m, raw = $("sq").value.trim(), o = { q: raw, a: $("sa").value, m: mode === "on" ? "on" : "" };
      S.mode = mode; Object.keys(t.sp).forEach(function (k) { if (t.sp[k].toLowerCase() === raw.toLowerCase()) { o.s = k; o.q = ""; } });
      Object.keys(t.sv).forEach(function (k) { if (t.sv[k].toLowerCase() === raw.toLowerCase()) { o.v = k; o.q = ""; } });
      F.max = 0; F.lang = ""; go("#/search?" + qs(o)); return;
    }
    if (id === "brform") {
      var berr = $("br-err"), bo = { id: e.target.dataset.id || undefined, name: $("br-name").value.trim(), region: $("br-region").value, address: $("br-addr").value.trim(), phone: digits($("br-phone").value), hours: $("br-hours").value.trim() };
      if (!bo.name) { berr.textContent = t.cl_br_err_name; $("br-name").focus(); return; }
      if (bo.phone && !okPhone(bo.phone)) { berr.textContent = t.e_phone; $("br-phone").focus(); return; }
      if (BE) { var bbtn = e.target.querySelector("[type=submit]"); bbtn.disabled = true; BE.branchSave(bo).then(function () { BRF = null; toast(t.cl_br_saved); render(true); }, function (x) { bbtn.disabled = false; berr.textContent = beMsg(t, x); }); return; }
      var bl = branches(), bme = me();
      if (bo.id) bl.forEach(function (b) { if (b.id === bo.id) Object.assign(b, bo); });
      else { if (branchesOf(bme.id).length >= 50) { berr.textContent = t.e_ap_limit; return; } bl.push(Object.assign({}, bo, { id: "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), clinicId: bme.id })); }
      store.set(KBR, bl); BRF = null; toast(t.cl_br_saved); render(true); return;
    }
    if (id === "stform") {
      var serr = $("st-err"), sph = digits($("st-phone").value), sbr = $("st-branch").value;
      if (!okPhone(sph)) { serr.textContent = t.e_phone; $("st-phone").focus(); return; }
      if (BE) { var sbtn = e.target.querySelector("[type=submit]"); sbtn.disabled = true; BE.staffInvite({ phone: sph, branch: sbr || null }).then(function (j) { toast(j && j.found ? t.cl_inv_sent : t.cl_inv_sent_wait); render(true); }, function (x) { sbtn.disabled = false; serr.textContent = x && x.code === "not_doctor" ? t.cl_err_not_doc : x && x.code === "exists" ? t.cl_err_exists : beMsg(t, x); }); return; }
      var cme = me(), all = demoStaff(), who = users().filter(function (x) { return x.phone && digits(x.phone) === sph; })[0];
      if (who && who.role !== "doctor") { serr.textContent = t.cl_err_not_doc; return; }
      if (all.some(function (x) { return x.clinicId === cme.id && x.phone === sph; })) { serr.textContent = t.cl_err_exists; return; }
      all.push({ id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), clinicId: cme.id, doctorId: who ? who.id : "", phone: sph, branchId: sbr, status: "invited" });
      store.set(KSTA, all); toast(who ? t.cl_inv_sent : t.cl_inv_sent_wait); render(true); return;
    }
    if (id === "form") { submitJoin(); return; }
    if (id === "csform") {
      csCollect(); var C = CS, err = $("cs-err");
      if (!C.name || !(+C.age >= 0 && C.age !== "") || !okPhone(C.phone) || C.complaint.length < 10) { err.textContent = t.cs_err_fill; var dm = $("cs-more"); if (dm && !okPhone(C.phone)) dm.open = true; return; }
      if (!C.consent) { err.textContent = t.cs_err_consent; return; }
      var sd = !C.asap && C.doc ? userById(C.doc) : null, sf = sd && !sd.sample ? freeDays(sd) : null;
      if (sf && sf.days && sf.days.length && !C.slot) { err.textContent = t.sl_err; return; }
      if (BE) {
        if (!BE.userId()) { err.innerHTML = t.be_login_first + ' <a href="#/login">' + t.go_login + '</a> · <a href="#/register">' + t.go_reg + "</a>"; return; }
        var dsel2 = C.doc ? userById(C.doc) : null, notes = [t.cs_sent].concat(dsel2 ? [wantedNote(dsel2, C.type)] : []);
        var phs = CSPH.slice(), csb = e.target.querySelector('button[type="submit"]');
        err.textContent = ""; if (csb) csb.disabled = true;
        BE.createConsult(Object.assign({}, C, { slot: C.slot && !C.asap ? new Date(C.slot).toISOString() : "" }), notes).then(function (cid) {
          if (phs.length) err.textContent = t.ph_sending;
          /* photos go up one by one after the application; one that fails can be sent again in the chat */
          return phs.reduce(function (p, ph) { return p.then(function (ok) { return BE.addMessage(cid, "p", C.name, "", ph).then(function () { return ok; }, function () { return false; }); }); }, Promise.resolve(true)).then(function (ok) {
            CS = null; CSPH = []; toast(ok ? t.cs_sent : t.ph_some_failed); go("#/consult/" + cid);
          });
        }, function (x) { if (csb) csb.disabled = false; if (x && x.code === "slot_taken" && C.doc) { delete TAKEN[C.doc]; CS.slot = 0; render(true); var e2 = $("cs-err"); if (e2) e2.textContent = beMsg(t, x); return; } err.textContent = beMsg(t, x); });
        return;
      }
      var cl2 = consults(), cu3 = me(), dsel = C.doc ? userById(C.doc) : null;
      var rec = { id: "c" + Date.now().toString(36), n: 1000 + cl2.length + 1, at: Date.now(), userId: cu3 && cu3.role === "patient" ? cu3.id : "", type: C.type, who: C.who, name: C.name, age: C.age, sex: C.sex, phone: C.phone, region: C.region, district: C.district, complaint: C.complaint, since: C.since, chronic: C.chronic, meds: C.meds, allergy: C.allergy, spec: C.spec, doc: C.asap ? "" : C.doc, asap: !!C.asap, slotAt: C.asap ? 0 : C.slot || 0, status: "new", doctorId: "", doctorName: "", msgs: [{ from: "s", text: t.cs_sent, at: Date.now() }] };
      if (dsel) rec.msgs.push({ from: "s", text: wantedNote(dsel, C.type), at: Date.now() });
      var full2 = false; CSPH.forEach(function (ph) { var fid = demoPhoto(ph); if (fid) rec.msgs.push({ from: "p", name: C.name, text: "", file: fid, at: Date.now() }); else full2 = true; });
      cl2.push(rec); saveConsults(cl2); CS = null; CSPH = []; toast(full2 ? t.ph_full : t.cs_sent); go("#/consult/" + rec.id); return;
    }
    if (id === "imform") { IM.text = $("im-text").value; IM.rows = imRows(IM.text); IM.results = null; IM.err = ""; render(true); return; }
    if (id === "claimform" && BE) {
      var cerr = $("cl-err"), pw1 = $("cl-pw").value, ctok = CL.token;
      if (pw1.length < 6) { cerr.textContent = t.e_pw; return; }
      if (pw1 !== $("cl-pw2").value) { cerr.textContent = t.im_pw_mismatch; return; }
      if (!$("cl-ok").checked) { cerr.textContent = t.im_claim_need_ok; return; }
      var cb = e.target.querySelector('button[type="submit"]'); cb.disabled = true; cerr.textContent = "";
      BE.claim(ctok, pw1).then(function () { CL = { token: "", info: null, err: "", loading: false }; toast(t.im_claimed); go("#/account"); },
        function (x) { cb.disabled = false; cerr.textContent = x.code === "invite" ? t.im_bad_link : beMsg(t, x); });
      return;
    }
    if (id === "poform" && BE && PO.form) {
      poCollect();
      var pf = PO.form, amt = Math.round(+pf.amount);
      if (!(amt > 0)) { pf.err = t.po_e_amount; render(true); return; }
      var pbtn = e.target.querySelector('button[type="submit"]'); if (pbtn) pbtn.disabled = true;
      BE.adminPayout({ doctor: pf.doctor, amount: amt, paid_on: pf.day, ref: pf.ref, note: pf.note }).then(function () { PO.form = null; PO.data = null; toast(t.po_saved); render(true); },
        function (x) { pf.err = { over: t.po_e_over, amount: t.po_e_amount, date: t.po_e_date }[x.code] || beMsg(t, x); render(true); });
      return;
    }
    if (id === "csmsg") {
      var inp3 = $("csmsg-in"), txt = inp3.value.trim(), ph3 = PH && PH.cid === e.target.dataset.id ? PH : null; if (!txt && !ph3) return;
      if (BE) {
        var me5 = me(), asDoc5 = !!(me5 && me5.role === "doctor"), cid5 = e.target.dataset.id, sb5 = e.target.querySelector('button[type="submit"]');
        inp3.value = ""; PH = null; if (ph3 && sb5) { sb5.disabled = true; sb5.textContent = t.ph_sending; }
        BE.addMessage(cid5, asDoc5 ? "d" : "p", asDoc5 ? me5.name : (consultById(cid5) || {}).name, txt, ph3).then(function () { render(true); var l5 = $("cslog"); if (l5) l5.scrollTop = l5.scrollHeight; if ($("csmsg-in")) $("csmsg-in").focus(); }, function (x) { PH = ph3; render(true); if ($("csmsg-in")) $("csmsg-in").value = txt; toast(x && x.code === "photos" ? t.e_photos : x && x.code === "photo" ? t.ph_bad : t.be_err); });
        return;
      }
      var cl3 = consults(), c3 = cl3.filter(function (x) { return x.id === e.target.dataset.id; })[0], du3 = me(), asDoc = du3 && du3.role === "doctor";
      var fid3 = ph3 ? demoPhoto(ph3) : ""; if (ph3 && !fid3) { toast(t.ph_full); return; }
      PH = null; c3.msgs.push({ from: asDoc ? "d" : "p", name: asDoc ? du3.name : c3.name, text: txt, file: fid3, at: Date.now() }); saveConsults(cl3); render(true);
      var lg2 = $("cslog"); if (lg2) lg2.scrollTop = lg2.scrollHeight; if ($("csmsg-in")) $("csmsg-in").focus(); return;
    }
    if (id === "onaform") {
      var od = $("ona-date").value, odoc = $("ona-doc").value, oerr = $("ona-err");
      if (!od) { oerr.textContent = ON.mode === "lmp" ? t.ona_lmp_l : t.ona_due_l; return; }
      var due = ON.mode === "lmp" ? (function () { var d = fromIso(od); d.setDate(d.getDate() + 280); return iso(d); })() : od;
      if (dayN(due) < -60 || dayN(due) > 300) { oerr.textContent = t.ona_err_date; return; }
      var odone = function () { ON.mode = "due"; ON.urgent = ON.ok = false; toast(t.ona_saved); render(true); };
      if (BE) { BE.pregSave(ON.mode === "lmp" ? { lmp: od, doctor: odoc } : { due: od, doctor: odoc }).then(odone, function (x) { oerr.textContent = x.code === "date" ? t.ona_err_date : beMsg(t, x); }); return; }
      var cur = myPreg() || { checks: [] }; cur.due = due; cur.doctor = odoc; cur.doctorName = odoc ? (userById(odoc) || {}).name || "" : ""; savePregDemo(cur); odone(); return;
    }
    if (id === "rxform") {
      rxCollect(); var rxid = e.target.dataset.id, rows = RX.rows.filter(function (r) { return r.name.trim(); }).map(function (r) { return { name: r.name.trim().slice(0, 120), how: r.how.trim().slice(0, 200), days: r.days ? Math.round(+r.days) : null }; });
      if (rows.some(function (r) { return r.days != null && !(r.days >= 1 && r.days <= 365); })) { $("rx-err").textContent = t.rx_err_days; return; }
      if (BE) { BE.consultRx(rxid, rows).then(function () { RX = null; toast(t.rx_saved); render(true); }, function (x) { $("rx-err").textContent = beMsg(t, x); }); return; }
      var xcl = consults(); xcl.forEach(function (c) { if (c.id === rxid) { c.rx = rows; c.rxAt = Date.now(); } }); saveConsults(xcl); RX = null; toast(t.rx_saved); render(true); return;
    }
    if (id === "rxoform") {
      rxoCollect(); var ocid = e.target.dataset.id, oerr = $("rxo-err");
      if (!RXO.region || RXO.addr.trim().length < 5 || !okPhone(RXO.phone)) { oerr.textContent = t.rx_err_fill; return; }
      if (!RXO.ok) { oerr.textContent = t.rx_err_ok; return; }
      var ord = { id: ocid, region: RXO.region, address: RXO.addr.trim(), phone: RXO.phone, note: RXO.note.trim() };
      if (BE) { BE.medOrder(ord).then(function () { RXO = null; toast(t.rx_sent); render(true); }, function (x) { oerr.textContent = beMsg(t, x); }); return; }
      var mol3 = medOrders(); mol3.unshift({ id: "mo" + Date.now().toString(36), consultId: ocid, status: "new", region: ord.region, address: ord.address, phone: ord.phone.replace(/\D/g, ""), note: ord.note, at: Date.now() }); store.set(KMO, mol3); RXO = null; toast(t.rx_sent); render(true); return;
    }
    if (id === "csrefer") {
      var adv = $("cs-adv").value.trim(), rid = e.target.dataset.id, ru = me();
      if (adv.length < 10) { $("csr-err").textContent = t.rf2_err; return; }
      if (BE) { BE.refer(rid, adv, t.rf2_sys).then(function () { toast(t.rf2_done); render(true); }, function (x) { $("csr-err").textContent = beMsg(t, x); }); return; }
      var rcl = consults(), rc = rcl.filter(function (x) { return x.id === rid; })[0];
      rc.status = "referred"; rc.doctorId = ru.id; rc.doctorName = ru.name; rc.closedAt = Date.now();
      rc.msgs.push({ from: "d", name: ru.name, text: adv, at: Date.now() }, { from: "s", text: t.rf2_sys, at: Date.now() }); saveConsults(rcl); toast(t.rf2_done); render(true); return;
    }
    if (id === "csfinish") {
      var o3 = document.querySelector('input[name="csout"]:checked'); if (!o3) { $("csf-err").textContent = t.vs_err; return; }
      if (BE) {
        var cid6 = e.target.dataset.id, me6 = me(), sum6 = $("cs-sum").value.trim();
        (sum6 ? BE.addMessage(cid6, "d", me6.name, sum6) : Promise.resolve()).then(function () { return BE.updateConsult(cid6, { status: "done", outcome: +o3.value }, t.cs_finished(t.on_out[+o3.value])); }).then(function () { render(true); }, function () { $("csf-err").textContent = t.be_err; });
        return;
      }
      var cl4 = consults(), c4 = cl4.filter(function (x) { return x.id === e.target.dataset.id; })[0], du4 = me(), sum = $("cs-sum").value.trim();
      if (sum) c4.msgs.push({ from: "d", name: du4.name, text: sum, at: Date.now() });
      c4.status = "done"; c4.outcome = +o3.value; c4.closedAt = Date.now(); c4.followupAt = Date.now();   /* demo: the "how are you feeling?" check shows at once */ c4.msgs.push({ from: "s", text: t.cs_finished(t.on_out[+o3.value]), at: Date.now() }); saveConsults(cl4); render(true); return;
    }
    if (id === "apform") {
      apCollect(); var A = AP, aer = $("ap-err"), afac = e.target.dataset.fac || "", acl = userById(A.cid);
      if (!A.day || !A.part || !A.name || !okPhone(A.phone)) { aer.textContent = t.ap_err_fill; return; }
      var adoc = A.doc ? userById(A.doc) : null;
      var areq = { clinic: A.cid, fac: afac, day: A.day, part: A.part, who: A.who, name: A.name, phone: A.phone, spec: adoc ? (adoc.profile || {}).spec || "" : A.spec, reason: A.reason, doctor: adoc ? adoc.id : "" };
      if (BE) {
        if (!BE.userId()) { aer.innerHTML = t.ap_login + ' <a href="#/login">' + t.go_login + '</a> · <a href="#/register">' + t.go_reg + "</a>"; return; }
        aer.textContent = ""; BE.createAppt(areq).then(function () { AP = null; toast(t.ap_sent); go("#/account/visits"); }, function (x) { aer.textContent = beMsg(t, x); });
        return;
      }
      var al2 = appts(), amu = me(), auid = amu ? amu.id : "";
      var aopen = al2.filter(function (x) { return x.userId === auid && apOpen(x); });
      if (aopen.some(function (x) { return x.clinicId === A.cid && x.day === A.day; })) { aer.textContent = t.e_ap_dup; return; }
      if (aopen.length >= 5) { aer.textContent = t.e_ap_limit; return; }
      al2.push({ id: "a" + Date.now().toString(36), n: 5001 + al2.length, at: Date.now(), userId: auid, clinicId: A.cid, clinicName: acl ? acl.name : "", fac: afac, day: A.day, part: A.part, who: A.who, name: A.name, phone: digits(A.phone), spec: areq.spec, reason: A.reason.slice(0, 500), doctorId: adoc ? adoc.id : "", doctorName: adoc ? adoc.name : "", status: "new", time: "", note: "" });
      saveAppts(al2); AP = null; toast(t.ap_sent); go("#/account/visits"); return;
    }
    if (id === "apreply") {
      apxCollect(); var X = APX, xid = e.target.dataset.id, xer = $("apx-err"), okm = X.mode === "ok";
      if (okm && !/^([01]\d|2[0-3]):[0-5]\d$/.test(X.time)) { xer.textContent = t.e_ap_time; return; }
      var xdone = function () { APX = null; toast(okm ? t.ap_done_ok : t.ap_done_no); render(true); };
      accCollect();
      if (BE) { BE.apptAction(xid, okm ? "confirm" : "decline", okm ? { day: X.day, time: X.time, note: X.note } : { note: X.note }).then(xdone, function (x) { xer.textContent = beMsg(t, x); }); return; }
      var al3 = appts(); al3.forEach(function (x) { if (x.id === xid && (x.status === "new" || x.status === "confirmed")) { x.status = okm ? "confirmed" : "declined"; if (okm) { x.day = X.day; x.time = X.time; } x.note = X.note.slice(0, 300); } }); saveAppts(al3); xdone(); return;
    }
    if (id === "rvform") {
      rvCollect(); var rk = e.target.dataset.kind, rid = e.target.dataset.id, rer = $("rv-err"), R0 = RV;
      if (!(R0.stars >= 1)) { rer.textContent = t.rv_err_stars; return; }
      var rdone = function () { RV = null; toast(t.rv_thanks); render(true); };
      if (BE) { var ro = { stars: R0.stars, body: R0.body.trim(), anon: R0.anon, att: R0.sub.att || null, exp: R0.sub.exp || null, wait: R0.sub.wait || null }; ro[rk === "c" ? "consult" : "appt"] = rid; BE.reviewCreate(ro).then(rdone, function (x) { rer.textContent = beMsg(t, x); }); return; }
      var rsrc = rk === "c" ? consultById(rid) : appts().filter(function (x) { return x.id === rid; })[0], rmu = me();
      if (!rsrc || myReview(rk, rid)) { rer.textContent = t.e_reviewed; return; }
      var nm = String((rmu && rmu.name) || (rk === "c" ? rsrc.name : rsrc.name) || "").trim().split(/\s+/);
      var rl = store.get(KR, []); rl.push({ id: "r" + Date.now().toString(36), target: rk === "c" ? rsrc.doctorId : rsrc.clinicId, stars: R0.stars, att: R0.sub.att, exp: R0.sub.exp, wait: R0.sub.wait, body: R0.body.trim().slice(0, 600), author: R0.anon ? "" : nm[0] + (nm[1] ? " " + nm[1].charAt(0) + "." : ""), hidden: false, reply: "", at: Date.now(), kind: rk, consult: rk === "c" ? rid : "", appt: rk === "v" ? rid : "", mine: true });
      store.set(KR, rl); rdone(); return;
    }
    if (id === "rvreply") {
      var rpid = e.target.dataset.id, rtxt = $("rvreply-in").value.trim(); accCollect();
      var rpdone = function () { RR = null; toast(t.rv_reply_done); render(true); };
      if (BE) { BE.reviewReply(rpid, rtxt).then(rpdone, function (x) { toast(beMsg(t, x)); }); return; }
      var rl2 = store.get(KR, []); rl2.forEach(function (x) { if (x.id === rpid) x.reply = rtxt.slice(0, 400); }); store.set(KR, rl2); rpdone(); return;
    }
    if (id === "hfform") { go("#/doctors?" + qs({ s: $("hf-s").value, r: $("hf-r").value, q: $("hf-q").value.trim(), lg: $("hf-lg").value, on: $("hf-on").checked ? "1" : "", fem: $("hf-fem").checked ? "1" : "", sort: $("hf-rate").checked ? "rating" : "" })); return; }
    if (id === "aiform") { var aiIn = $("ai-in"); aiSend(aiIn.value); return; }
    if (id === "prform") { go("#/prices?" + qs(prQuery())); return; }
    if (id === "docfilter") { go("#/doctors?" + qs(dfQuery())); return; }
    if (id === "docsearch") { go("#/doctors?" + qs({ s: $("hs-s").value, r: $("hs-r").value, q: $("hs-q").value.trim() })); return; }
    if (id === "regform") {
      var rv = function (x) { return $(x).value.trim(); }, name = rv("r-name"), em = rv("r-email").toLowerCase(), ph = rv("r-phone"), tg = rv("r-tg"), pw = $("r-pw").value, pw2 = $("r-pw2").value;
      var rprof = regProfile(), rbad = regCheck(t, rprof);
      if (rbad) { $("r-err").textContent = rbad[0]; $(rbad[1]).focus(); return; }
      var er = checkContact(t, name, em, ph, tg) || (pw.length < 6 ? t.e_pw : pw !== pw2 ? t.e_pw2 : "") || (findByContact(em, ph) ? t.e_exists : "");
      if (er) { $("r-err").textContent = er; return; }
      var nextUrl = function () { var n = afterAuth(); return EMAIL_CHECK && em && n === "#/account" ? acc("/verify") : n; };
      if (BE) {
        $("r-err").textContent = "";
        BE.signUp({ role: REGROLE, name: name, email: em, phone: ph ? digits(ph) : "", tg: tg ? "@" + tgName(tg) : "", password: pw, profile: rprof }).then(function (r) {
          if (r.needsConfirm) { $("r-err").textContent = t.be_confirm; return; }
          ACC = null; toast(t.welcome(name)); go(nextUrl());
        }, function (x) { $("r-err").textContent = beMsg(t, x); });
        return;
      }
      var nid = "u" + Date.now().toString(36);
      hashPw(pw, nid).then(function (h) {
        var list = users(); list.push({ id: nid, role: REGROLE, name: name, email: em, phone: ph ? digits(ph) : "", tg: tg ? "@" + tgName(tg) : "", pw: h, created: iso(today0()), updated: iso(today0()), profile: Object.assign(REGROLE === "doctor" ? { spec: "gp", modes: ["in", "on"], langs: ["uz"], work: [], svc: [] } : REGROLE === "clinic" ? { ctype: "clinic", own: "s", svc: [] } : {}, rprof) });
        saveUsers(list); store.set(KS, nid); ACC = null; toast(t.welcome(name)); go(nextUrl());
      });
      return;
    }
    if (id === "evform") {
      var code = String($("ev-code").value).replace(/\D/g, ""), everr = $("ev-err");
      if (code.length !== 6) { everr.textContent = t.ev_e_len; $("ev-code").focus(); return; }
      if (BE) { var evb = e.target.querySelector("[type=submit]"); evb.disabled = true; BE.emailVerify(code).then(function () { toast(t.ev_ok); render(true); }, function (x) { evb.disabled = false; var c = x && x.code; everr.textContent = c === "code" ? t.ev_e_code : c === "expired" ? t.ev_e_exp : c === "tries" ? t.ev_e_tries : beMsg(t, x); }); return; }
      if (code !== VER.code) { everr.textContent = t.ev_e_code; return; }
      var lv = users(), cuv = me(); lv.forEach(function (x) { if (x.id === cuv.id) x.emailVerified = true; }); saveUsers(lv); VER.code = ""; toast(t.ev_ok); render(true); return;
    }
    if (id === "fgform") {
      var fid = $("fg-id").value.trim(), ferr = $("fg-err"), fmail = fid.indexOf("@") > 0;
      if (!fid || (fmail ? !okEmail(fid) : !okPhone(fid))) { ferr.textContent = t.fg_e_id; return; }
      FG.id = fid;
      if (BE) { var fb = e.target.querySelector("[type=submit]"); fb.disabled = true; BE.pwForgot(fid).then(function (j) { FG.sent = j.sent || []; FG.step = 2; FG.at = Date.now(); render(true); }, function (x) { fb.disabled = false; ferr.textContent = x && x.code === "wait" ? t.fg_wait : beMsg(t, x); }); return; }
      var fu = findByContact(fmail ? fid.toLowerCase() : "", fmail ? "" : fid);
      FG.sent = fu ? [fu.email ? "email" : "sms"] : []; FG.code = fu ? String(Math.floor(Math.random() * 1e6)).padStart(6, "0") : ""; FG.uid = fu ? fu.id : ""; FG.step = 2; render(true); return;
    }
    if (id === "fg2form") {
      var fc = String($("fg-code").value).replace(/\D/g, ""), fp = $("fg-pw").value, f2 = $("fg2-err");
      if (fc.length !== 6) { f2.textContent = t.ev_e_len; return; }
      if (fp.length < 6) { f2.textContent = t.e_pw; return; }
      if (fp !== $("fg-pw2").value) { f2.textContent = t.e_pw2; return; }
      if (BE) { var fb2 = e.target.querySelector("[type=submit]"); fb2.disabled = true; BE.pwReset(FG.id, fc, fp).then(function () { FG = { step: 1, id: "", sent: [], code: "", at: 0 }; ACC = null; toast(t.fg_done); go("#/account"); }, function (x) { fb2.disabled = false; var c = x && x.code; f2.textContent = c === "code" ? t.ev_e_code : c === "expired" ? t.ev_e_exp : c === "tries" ? t.ev_e_tries : beMsg(t, x); }); return; }
      if (fc !== FG.code) { f2.textContent = t.ev_e_code; return; }
      hashPw(fp, FG.uid).then(function (h) { var lf = users(); lf.forEach(function (x) { if (x.id === FG.uid) x.pw = h; }); saveUsers(lf); store.set(KS, FG.uid); FG = { step: 1, id: "", sent: [], code: "", at: 0 }; ACC = null; toast(t.fg_done); go("#/account"); });
      return;
    }
    if (id === "rlform" && BE) {
      var rp = $("rl-pw").value, rerr = $("rl-err");
      if (rp.length < 6) { rerr.textContent = t.e_pw; return; }
      if (rp !== $("rl-pw2").value) { rerr.textContent = t.e_pw2; return; }
      var rb2 = e.target.querySelector("[type=submit]"); rb2.disabled = true;
      BE.pwLink(RL.token, rp).then(function () { RL = { token: "", name: "", err: "", loading: false }; ACC = null; toast(t.fg_done); go("#/account"); }, function (x) { rb2.disabled = false; rerr.textContent = x && x.code === "reset" ? t.fg_bad_link : beMsg(t, x); });
      return;
    }
    if (id === "admrlform") {
      var ac = $("adm-rl").value.trim(), aerr = $("adm-rl-out");
      if (!ac) return;
      BE.adminResetLink({ contact: ac }).then(function (j) { aerr.innerHTML = t.fg_adm_made + ' <input class="copyin" readonly value="' + esc(j.url) + '" onclick="this.select()">'; }, function (x) { aerr.textContent = x && x.code === "not_found" ? t.fg_adm_none : beMsg(t, x); });
      return;
    }
    if (id === "loginform") {
      if (BE) {
        var lid7 = $("l-id").value.trim();
        if (!lid7) { $("l-err").textContent = t.e_login; return; }
        BE.signIn(lid7, $("l-pw").value).then(function () { ACC = null; var mu7 = me(); toast(t.welcome(mu7 ? mu7.name : "")); go(afterAuth()); }, function (x) { $("l-err").textContent = beMsg(t, x); });
        return;
      }
      var lid = $("l-id").value.trim(), lpw = $("l-pw").value, isMail = lid.indexOf("@") > 0 && lid.indexOf(".") > 0;
      var cand = users().filter(function (x) { return isMail ? x.email === lid.toLowerCase() : (x.phone && x.phone === digits(lid)); })[0];
      if (!cand) { $("l-err").textContent = t.e_login; return; }
      hashPw(lpw, cand.id).then(function (h) { if (h !== cand.pw) { $("l-err").textContent = t.e_login; return; } store.set(KS, cand.id); ACC = null; toast(t.welcome(cand.name)); go(afterAuth()); });
      return;
    }
    if (id === "accform") {
      accCollect(); var cu2 = me(), A = ACC, em2 = (A.email || "").toLowerCase();
      var er2 = checkContact(t, A.name, em2, A.phone, A.tg) || (findByContact(em2, A.phone, cu2.id) ? t.e_exists : "");
      if (er2) { $("a-err").textContent = er2; $("a-err").scrollIntoView({ block: "center" }); return; }
      A.pr.svc = A.pr.svc.filter(function (x) { return x.name; }); A.pr.work = A.pr.work.filter(function (w) { return w && w.label; });
      if (BE) { BE.saveProfile({ role: cu2.role, name: A.name, email: em2, phone: A.phone ? digits(A.phone) : "", tg: A.tg ? "@" + tgName(A.tg) : "", profile: A.pr }).then(function () { ACC = null; toast(t.saved); render(true); }, function (x) { $("a-err").textContent = beMsg(t, x); }); return; }
      var l4 = users(); l4.forEach(function (x) { if (x.id === cu2.id) { if ((x.email || "") !== em2) x.emailVerified = false; x.name = A.name; x.email = em2; x.phone = A.phone ? digits(A.phone) : ""; x.tg = A.tg ? "@" + tgName(A.tg) : ""; x.profile = A.pr; x.updated = iso(today0()); } });
      saveUsers(l4); ACC = null; toast(t.saved); render(true); return;
    }
    if (id === "dform") {
      var o = { r: $("dr").value, d: $("dd").value, t: $("dt") ? $("dt").value : "", q: $("dq") ? $("dq").value.trim() : "", o: (function () { var b = document.querySelector('#downs [aria-pressed="true"]'), v = b ? b.dataset.ownsel : "s"; return v === "s" ? "" : v; })() };
      if (current.path === "/find" && current.q.near && !o.r && !o.d) o.near = "1";
      go("#/find?" + qs(o)); return;
    }
    if (id === "msform") {
      var g2 = function (x) { var n = $(x); return n ? n.value.trim() : ""; }, mf = modal.key ? facByKey[modal.key] : null, wrong = modal.kind === "wrong";
      var nameV = wrong ? (mf ? facName(mf) : "") : g2("ms-name"), note = g2("ms-note");
      if ((!wrong && !nameV) || (wrong && !note && !g2("ms-phone"))) { $("ms-err").textContent = t.ms_err; return; }
      var lines = [wrong ? t.ms_msg_wrong : t.ms_msg_missing, t.ms_name + ": " + nameV];
      if (mf) lines.push(t.fac_where + ": " + placeOf(mf), "OSM: " + mf.key, t.fac_coords + ": " + mf.lat + ", " + mf.lng);
      if (!wrong) lines.push(t.ms_where + ": " + g2("ms-where"));
      if (g2("ms-phone")) lines.push(t.ms_phone + ": " + g2("ms-phone"));
      if (note) lines.push(t.ms_note + " " + note);
      var msg = lines.join("\n"); $("ms-err").textContent = "";
      if (CONFIG.telegram) { window.open("https://t.me/" + encodeURIComponent(CONFIG.telegram) + "?text=" + encodeURIComponent(msg), "_blank", "noopener"); closeModal(); return; }
      var box = $("ms-box"); box.hidden = false; box.textContent = msg;
      try { navigator.clipboard.writeText(msg).then(function () { $("ms-status").textContent = t.ms_done; }, function () { $("ms-status").textContent = t.copy_fail; }); } catch (x) { $("ms-status").textContent = t.copy_fail; }
      return;
    }
    if (id === "bkform") {
      var name = $("bk-name").value.trim(), phone = $("bk-phone").value.trim(); modal.name = name; modal.phone = phone; modal.k = $("bk-svc").value;
      if (!name || !phone || !$("bk-ok").checked) { $("bk-err").textContent = t.bk_err; return; }
      if (!isFree(byId(modal.p), modal.m, modal.d, modal.t)) { modal.err = t.bk_taken; refreshModal(); render(true); return; }
      var list = bookings(); list.push({ id: Date.now(), p: modal.p, k: modal.k, d: modal.d, t: modal.t, m: modal.m, name: name, phone: phone }); saveBookings(list);
      modal.step = "done"; modal.err = ""; refreshModal(); render(true); return;
    }
    if (id === "rpform") {
      var why = +(document.querySelector('input[name="rpwhy"]:checked') || { value: 0 }).value, rs = store.get(K.reports, []);
      rs.push({ id: Date.now(), p: modal.p, why: why, note: $("rp-note").value.trim(), at: Date.now(), open: true }); store.set(K.reports, rs); closeModal(); toast(t.rp_thanks); return;
    }
    if (id === "vsform") {
      var out = document.querySelector('input[name="vsout"]:checked');
      if (!out) { $("vs-err").textContent = t.vs_err; return; }
      setStatus(modal.key, "done", { out: +out.value, sum: $("vs-note").value.trim() }); closeModal(); render(true); return;
    }
    if (id === "roomform") { var v = $("room-in").value.trim(); if (!v) return; modal.log.push(v); refreshModal(); var lg = $("roomlog"); if (lg) lg.scrollTop = lg.scrollHeight; $("room-in").focus(); return; }
    if (id === "priceform") {
      var p = byId(DS.pid), o2 = store.get(K.prices, {}), bad = false; o2[p.id] = o2[p.id] || {};
      p.svc.forEach(function (s) { if (s.c) return; var inp = $("pr-" + s.k), val = inp ? Math.round(+inp.value) : NaN; if (!(val > 0)) bad = true; else o2[p.id][s.k] = val; });
      if (bad) { $("pr-err").textContent = t.d_price_err; return; }
      store.set(K.prices, o2); var cf = store.get(K.conf, {}); cf[p.id] = iso(today0()); store.set(K.conf, cf); toast(t.d_saved); render(true); return;
    }
    if (id === "asform1") {
      var g = function (x) { return $(x).value.trim(); };
      AS.f = { name: g("as-name"), phone: g("as-phone"), village: g("as-village"), helper: g("as-helper"), sp: $("as-sp").value };
      if (!AS.f.name || !AS.f.phone || !AS.f.helper) { $("as-err").textContent = t.as_err; return; }
      AS.step = 2; render(false); return;
    }
    if (id === "asform3") {
      var pk = AS.pick;
      if (!isFree(byId(pk.p), "in", pk.d, pk.t)) { $("as-err3").textContent = t.bk_taken; return; }
      var nb = { id: Date.now(), p: pk.p, k: $("as-svc").value, d: pk.d, t: pk.t, m: "in", name: AS.f.name, phone: AS.f.phone, by: { helper: AS.f.helper, village: AS.f.village } };
      var l3 = bookings(); l3.push(nb); saveBookings(l3); AS.done = nb; render(false); return;
    }
  });

  document.addEventListener("change", function (e) {
    var id = e.target.id;
    if (id === "ap-doc") { apCollect(); render(true); return; }
    if (id === "cal-b") { var cq = Object.assign({}, current.q); if (e.target.value) cq.b = e.target.value; else delete cq.b; go(acc("/calendar") + (Object.keys(cq).length ? "?" + qs(cq) : "")); return; }
    if (id.indexOf("st-br-") === 0) {
      var sid = id.slice(6), nb = e.target.value;
      if (BE) { e.target.disabled = true; BE.staffBranch(sid, nb).then(function () { toast(L().cl_br_set); render(true); }, function (x) { e.target.disabled = false; toast(beMsg(L(), x)); }); return; }
      store.set(KSTA, demoStaff().map(function (x) { return x.id === sid ? Object.assign({}, x, { branchId: nb }) : x; })); toast(L().cl_br_set); render(true); return;
    }
    if (id === "doc-kind") { DOCS.kind = e.target.value; return; }
    if (id === "doc-file") {
      var dfile = e.target.files && e.target.files[0], dkind = $("doc-kind").value, du = me(); e.target.value = ""; if (!dfile || !du) return;
      DOCS.err = "";
      docRead(dfile).then(function (f) {
        var nm = dfile.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 120);
        if (BE) return BE.docUpload({ kind: dkind, name: nm, data: f.data }).then(function () { DOCS.list = null; toast(L().doc_added); render(true); });
        var dl = store.get(KDOC, []); dl.push({ id: "d" + Date.now().toString(36), user_id: du.id, kind: dkind, name: nm, mime: f.mime, url: f.url, size: f.size, created_at: new Date().toISOString() });
        try { store.set(KDOC, dl); toast(L().doc_added); } catch (x) { DOCS.err = L().doc_e_file; } render(true);
      }).catch(function (x) { DOCS.err = x && x.code === "limit" ? L().e_ap_limit : L().doc_e_file; render(true); });
      return;
    }
    if (id === "r-region") { regRegionChanged(); return; }
    if (id === "r-spec") { $("r-spec-o").hidden = e.target.value !== "other"; return; }
    if (id === "im-agree") { IM.agree = e.target.checked; return; }
    if (id === "im-file" && e.target.files && e.target.files[0]) { imRead(e.target.files[0]).then(function (txt) { IM.text = txt; IM.rows = imRows(txt); IM.results = null; IM.err = ""; render(true); }, function () { toast(L().be_err); }); return; }
    if (id === "cs-region") { csCollect(); CS.district = ""; render(true); return; }
    if (id === "cs-spec") { csCollect(); CS.doc = ""; render(true); return; }
    if (id.indexOf("df-") === 0) { go("#/doctors?" + qs(dfQuery())); return; }
    if (id.indexOf("pr-") === 0 && id !== "pr-q") { go("#/prices?" + qs(prQuery())); return; }
    if (id === "cs-doc") { csCollect(); CS.slot = 0; CS.slotDay = 0; render(true); return; }
    if (id === "doc-photo") {
      var pf0 = e.target.files && e.target.files[0]; e.target.value = ""; if (!pf0) return;
      shrinkPhoto(pf0, 480).then(function (ph) {
        if (BE) return BE.setPhoto(ph).then(function () { toast(L().ph2_done); render(true); });
        var ul3 = users(), u3 = ul3.filter(function (x) { return x.id === (me() || {}).id; })[0]; if (u3) { u3.photoUrl = ph.url; store.set("shifokor-users", ul3); } toast(L().ph2_done); render(true);
      }).catch(function (x) { toast(beMsg(L(), x && x.code ? x : { code: "photo" })); });
      return;
    }
    if (id === "cs-ph") { csCollect(); phPick(e.target, PH_FORM_MAX - CSPH.length, function (got) { csCollect(); CSPH = CSPH.concat(got).slice(0, PH_FORM_MAX); render(true); }); return; }
    if (id === "csmsg-ph") {
      var phcid = e.target.closest("form").dataset.id;
      phPick(e.target, 1, function (got) { var inp = $("csmsg-in"), tx = inp ? inp.value : ""; PH = { cid: phcid, url: got[0].url, data: got[0].data }; render(true); if ($("csmsg-in")) { $("csmsg-in").value = tx; $("csmsg-in").focus(); } });
      return;
    }
    if (id === "a-region") { accCollect(); ACC.pr.district = ""; render(true); return; }
    if (id === "dr") { $("dd").innerHTML = districtOptions(e.target.value, ""); return; }
    if (id === "fprice") { F.max = +e.target.value; render(true); }
    else if (id === "flang") { F.lang = e.target.value; render(true); }
    else if (id === "fsort") { F.sort = e.target.value; render(true); }
    else if (id === "dsel") { DS.pid = e.target.value; DS.day = 0; render(true); }
    else if (id === "bk-svc" && modal) modal.k = e.target.value;
  });
  document.addEventListener("mouseover", function (e) { var c = e.target.closest(".rcard[data-id]"); if (c) pinOn(c.dataset.id, true); });
  document.addEventListener("mouseout", function (e) { var c = e.target.closest(".rcard[data-id]"); if (c) pinOn(c.dataset.id, false); });
  $("drawer").addEventListener("mousedown", function (e) { if (e.target === $("drawer")) closeModal(); });
  /* Enter sends a Shifo_AI message, Shift+Enter makes a new line */
  document.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.target.id === "ai-in") { e.preventDefault(); $("aiform").requestSubmit(); } });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (AI.open && !modal && !$("ap-h")) { AI.open = false; aiDraw(); var af = document.querySelector(".aifab"); if (af) af.focus(); return; }
    var om = document.querySelector(".menu:not([hidden])");
    if (document.querySelector(".pshell.navopen")) { pnavSet(false); var mb = document.querySelector(".pmenu"); if (mb) mb.focus(); return; }
    if (modal) closeModal(); else if (om) { closeMenu(); om.previousElementSibling.focus(); } else if ($("ap-h")) go(apClose());
  });
  /* another tab booked or changed something: refresh so a taken slot disappears here too */
  window.addEventListener("storage", function (e) { if (e.key && e.key.indexOf("shifokor-") === 0) rerender(); });
  window.addEventListener("hashchange", function () { voDrop(); RS = null; CX = null; PH = null; cancelAsk = null; apAsk = null; APX = null; RR = null; PO.form = null; PO.del = ""; IM.del = ""; ON.urgent = ON.ok = ON.del = false; ON.famUrl = ""; render(false); });

  render(false);
  /* a patient anywhere on the site hears about a doctor's call once per ring */
  var rung = {};
  function ringCheck() {
    var u = me(); if (!u || (window.ShifokorCall && ShifokorCall.active())) return;
    var doc = u.role === "doctor";
    consults().forEach(function (c) {
      /* the patient hears the doctor's calls, the doctor hears the patient's */
      if ((doc ? c.doctorId !== u.id || c.callBy !== "p" : c.userId !== u.id || c.callBy === "p") || c.status !== "accepted" || !ringNow(c) || rung[c.id] === c.callAt) return;
      rung[c.id] = c.callAt;
      if (current.path !== "/consult/" + c.id) toast(doc ? L().cl_pat_toast(c.n) : L().cl_ring_toast(c.n));
      try { if (navigator.vibrate) navigator.vibrate([300, 150, 300]); } catch (x) {}
    });
  }
  function payCheck() {
    var id = paying(), c = id && consultById(id);
    if (c && c.payStatus === "paid") { try { sessionStorage.removeItem("shifokor-paying"); } catch (x) {} toast(L().pay_done); }
  }
  if (BE) BE.on(function () {
    ringCheck();
    payCheck();
    var p = current.path;
    if (p === "/consult" || p === "/register" || p === "/login") { hdr(); return; }
    if (p === "/account" || p === "/pro") accCollect();
    if ($("apform")) apCollect();
    if ($("apreply")) apxCollect();
    if ($("rvform")) rvCollect();
    if ($("rxform")) rxCollect();
    if ($("rxoform")) rxoCollect();
    if ($("poform")) poCollect();
    if ($("im-text")) IM.text = $("im-text").value;
    if ($("rvreply-in") && RR) RR.text = $("rvreply-in").value;
    var draft = $("csmsg-in") ? $("csmsg-in").value : null;
    var fe = document.activeElement, fid = fe && fe.id, sel = null;
    try { sel = fid && fe.selectionStart != null ? [fe.selectionStart, fe.selectionEnd] : null; } catch (x) {}
    rerender();
    if (draft && $("csmsg-in")) $("csmsg-in").value = draft;
    var nf = fid && $(fid); if (nf && nf !== document.activeElement) { nf.focus({ preventScroll: true }); try { if (sel) nf.setSelectionRange(sel[0], sel[1]); } catch (x) {} }
    var lg = $("cslog"); if (lg) lg.scrollTop = lg.scrollHeight;
  });
})();
