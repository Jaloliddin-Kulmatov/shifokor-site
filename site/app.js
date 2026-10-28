(function () {
  /* Set this to the Telegram bot or account name (without @) once it exists. Join forms then open a prefilled message there. */
  var CONFIG = { telegram: "" };

  var $ = function (id) { return document.getElementById(id); };
  var all = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var num = function (n) { return Number(n).toLocaleString("en-US"); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  /* ---------------- icons ---------------- */
  var ICONS = {
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    hosp: '<rect x="4" y="7" width="16" height="14" rx="2"/><path d="M12 10v6M9 13h6M9 7V4h6v3"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
    siren: '<path d="M7 18v-5a5 5 0 0110 0v5M5 18h14M12 3v2M4.5 6.5l1.4 1.4M19.5 6.5l-1.4 1.4"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/>',
    nav: '<path d="M3 11l18-8-8 18-2-8z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
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
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>'
  };
  var ic = function (n) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + "</svg>"; };

  /* ---------------- copy and state ---------------- */
  var T = window.SHIFOKOR_T;
  var lang = "en";
  try { var sl = localStorage.getItem("shifokor-lang"); if (sl && T[sl]) lang = sl; else { var nl = (navigator.language || "").slice(0, 2); lang = T[nl] ? nl : "uz"; } } catch (e) {}
  var L = function () { return T[lang]; };
  var unit = function () { return lang === "ru" ? "сум" : lang === "uz" ? "so‘m" : "soums"; };

  var S = { mode: "in" };                                   /* search form mode */
  var F = { cov: false, max: 0, lang: "", sort: "soon" };    /* result filters */
  var cal = {};                                             /* calendar paging per clinic */
  var modal = null;                                         /* open drawer */
  var cancelAsk = null;                                     /* visit awaiting cancel confirmation */
  var mapOn = window.innerWidth > 760, pendingMap = null, mapInst = null, markers = {};
  var DS = { pid: "p1", day: 0 };                           /* clinic workspace */
  var AS = { step: 1, f: { sp: "dental" }, pick: null, done: null };   /* village assist */

  var K = { bookings: "shifokor-bookings", status: "shifokor-status", prices: "shifokor-prices", conf: "shifokor-conf", reports: "shifokor-reports" };
  var store = {
    get: function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var bookings = function () { return store.get(K.bookings, []); };
  var saveBookings = function (l) { store.set(K.bookings, l); };
  var BE = window.SB || null;   /* Supabase connection from backend.js, or null in demo mode */
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
    var h = location.hash.replace(/^#/, "") || "/", q = {}, i = h.indexOf("?");
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
  function heroArt() {
    var t = L(), p1 = byId("p1"), nf = nextFree(p1, "in"), s1 = svcOf(p1, "dental_consult");
    return '<div class="art"><svg viewBox="0 0 440 400" role="img" aria-label="' + esc(t.art_alt) + '">' + ART + "</svg>" +
      (nf ? '<div class="art-chip c1"><i>' + ic("cal") + "</i><span><small>" + t.next_free + "</small>" + whenTxt(nf.d, nf.t) + "</span></div>" : "") +
      '<div class="art-chip c2"><i>' + ic("tag") + "</i><span><small>" + t.sv.dental_consult + "</small>" + priceTxt(p1, s1) + "</span></div>" +
      '<div class="art-chip c3"><i>' + ic("bell") + "</i><span>" + t.b_h[2] + "</span></div></div>";
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
    return '<div class="band deep"><div class="wrap hero"><div><div class="eyebrow">' + t.dir_eye + "</div><h1>" + t.dir_h1 + '</h1><p class="sub">' + t.dir_p + "</p>" + dirForm({}) + '</div>' + heroArt() + "</div></div>" +
      homeDoctorSearch() + '<div class="wrap panels"><div class="panel rural"><div class="icobox">' + ic("home") + "</div><div><h3>" + t.rural_h + "</h3><p>" + t.rural_p + '</p></div><div class="stat">' + t.stats(STATE_N, REG.length, DIS.length) + "</div></div></div>" +
      '<div class="wrap pad"><div class="benefits">' + [["cal", 0], ["tag", 1], ["bell", 2], ["free", 3]].map(function (x) { return '<div class="benefit"><div class="ico">' + ic(x[0]) + "</div><h3>" + t.b_h[x[1]] + "</h3><p>" + t.b_p[x[1]] + "</p></div>"; }).join("") + "</div></div>" +
      '<div class="band alt"><div class="wrap pad"><div class="sechead"><div><h2>' + t.reg_h + '</h2><p class="lead">' + t.reg_p + '</p></div><a class="btn ghost" href="#/browse/areas">' + t.br_regions + ' →</a></div><div class="tiles">' + regionTiles() + "</div></div></div>" +
      '<div class="wrap pad split how"><div><h2>' + t.how_h + "</h2>" + steps([t.st_h, t.st_p]) + "</div>" + phoneMock() + "</div>" +
      '<div class="band alt"><div class="wrap pad split"><div><div class="eyebrow">' + t.on_eye + "</div><h2>" + t.on_h + '</h2><p class="lead">' + t.on_p + '</p><div class="outcomes">' + t.on_out.map(function (o) { return '<div class="out">' + o + "</div>"; }).join("") + '</div><p style="margin-top:22px"><a class="btn" href="#/consult">' + ic("chat") + t.nav_consult + '</a></p></div><div class="box"><h3>' + t.on_safe_h + '</h3><ul class="list">' + t.on_safe.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul><div class="emerg">' + t.on_emerg + "</div></div></div></div>" +
      '<div class="wrap pad"><div class="cta-band"><div><h2>' + t.cta_h + "</h2><p>" + t.cta_p + '</p></div><div class="btns"><a class="btn light big" href="#/clinics">' + t.cta_b + '</a><a class="btn ghost big" style="color:var(--deep-ink);border-color:var(--deep-line)" href="#/dashboard">' + t.d_open + "</a></div></div></div>" +
      '<div class="wrap" style="padding-bottom:56px"><h2>' + t.faq_h + '</h2><div class="faq">' + t.faq.map(function (q) { return "<details><summary>" + q[0] + "</summary><p>" + q[1] + "</p></details>"; }).join("") + "</div></div>" +
      '<div class="band alt"><div class="wrap pad join" id="join">' + joinIntro() + joinForm("patient") + "</div></div>";
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
    var body = list.length ? (up.length ? '<div class="subh">' + t.v_up + '</div><div class="visits">' + up.map(function (b) { return visitRow(b, map); }).join("") + "</div>" : "") + (past.length ? '<div class="subh">' + t.v_past + '</div><div class="visits">' + past.map(function (b) { return visitRow(b, map); }).join("") + "</div>" : "")
      : '<div class="empty" style="margin-top:22px">' + t.v_empty + '<p style="margin-top:14px"><a class="btn" href="#/">' + t.v_find + "</a></p></div>";
    var mu = me(), mine = consults().filter(function (c) { return !c.userId || (mu && mu.id === c.userId); }).sort(function (a, b) { return b.at - a.at; });
    body = '<div class="sechead" style="margin-top:8px"><div class="subh" style="margin:18px 0 4px">' + t.cs_mine_h + '</div><a class="btn ghost sm" href="#/consult">' + ic("plus") + t.cs_new_btn + "</a></div>" + (mine.length ? '<div class="visits">' + mine.map(csRow).join("") + "</div>" : '<p class="muted">' + t.cs_none + "</p>") + body;
    return '<div class="wrap pad" style="max-width:900px"><div class="sechead"><div><h1 style="font-size:clamp(1.8rem,1.4rem + 2vw,2.6rem)">' + t.v_h + '</h1><p class="lead">' + t.v_p + '</p></div><span class="sample">' + t.sample + "</span></div>" + body + '<p class="muted" style="margin-top:18px;font-size:.9rem">' + ic("bell") + " " + t.bk_remind + "</p></div>";
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
  function initMap(items) {
    var el = $("map"); if (!el) return;
    var LF = window.L; if (!LF || !LF.map) { el.innerHTML = '<div class="empty" style="margin:12px">' + L().map_off + "</div>"; return; }
    mapInst = LF.map(el, { scrollWheelZoom: false, dragging: !LF.Browser.mobile, tap: false }).setView(CENTER, 13);
    LF.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(mapInst);
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
    var t = L();
    return '<form class="sform dform" id="dform" role="search"><div class="seg" id="downs" role="group" aria-label="' + esc(t.f_own) + '">' + ["s", "p", "all"].map(function (o) { return '<button type="button" data-ownsel="' + o + '" aria-pressed="' + ((q.o || "s") === o) + '">' + ic(o === "s" ? "shield" : o === "p" ? "tag" : "check") + t.own_f[o] + "</button>"; }).join("") + '</div><div class="srow4">' +
      '<div class="sf"><label for="dr">' + t.f_region + '</label><select id="dr"><option value="">' + t.all_regions + "</option>" + REG.slice().sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (r) { return '<option value="' + r.code + '"' + (q.r === r.code ? " selected" : "") + ">" + esc(nmL(r)) + "</option>"; }).join("") + "</select></div>" +
      '<div class="sf"><label for="dd">' + t.f_district + '</label><select id="dd">' + districtOptions(q.r, q.d) + "</select></div>" +
      '<div class="sf"><label for="dt">' + t.f_type + '</label><select id="dt"><option value="">' + t.all_types + "</option>" + CAT_ORDER.map(function (c) { return '<option value="' + c + '"' + (q.t === c ? " selected" : "") + ">" + t.cat[c] + "</option>"; }).join("") + "</select></div>" +
      '<button class="btn big" type="submit">' + ic("search") + t.s_go + "</button></div>" +
      '<div class="srow-b"><div class="sf grow"><label for="dq">' + t.f_name + '</label><input id="dq" autocomplete="off" placeholder="' + esc(t.f_name_ph) + '" value="' + esc(q.q || "") + '"></div><button type="button" class="btn ghost near" data-act="near">' + ic("nav") + t.near_btn + "</button></div>" +
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
    return '<article class="fcard" data-key="' + f.key + '"><div class="ficon c-' + f.cat + '">' + ic(CAT_IC[f.cat]) + '</div><div class="fmain"><h3><a href="#/f/' + f.key + '">' + esc(facName(f)) + '</a></h3><div class="spec">' + t.cat[f.cat] + '</div><div class="badges">' + ownBadge(f) + '<span class="badge plain">' + (dd.city ? t.city : t.village) + "</span>" + (f.km != null && f.km < 500 ? '<span class="badge">' + t.km(f.km < 10 ? f.km.toFixed(1) : Math.round(f.km)) + "</span>" : "") + '</div><div class="meta">' + ic("pin") + esc(placeOf(f)) + '</div></div><div class="facts"><a class="btn sm" href="' + dl.y + '" target="_blank" rel="noopener">' + ic("nav") + t.fac_dir + '</a><a class="btn ghost sm" href="#/f/' + f.key + '">' + t.view + "</a></div></article>";
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
    return       '<div class="wrap"><a class="back" href="#/find?' + qs({ r: REG[dd.r].code, d: dd.code }) + '">‹ ' + esc(nmL(dd)) + '</a><div class="pf"><div><div class="who"><div class="ficon big c-' + f.cat + '">' + ic(CAT_IC[f.cat]) + "</div><div><h1>" + esc(facName(f)) + '</h1><div class="spec">' + t.cat[f.cat] + '</div><div class="badges">' + ownBadge(f) + '<span class="badge plain">' + (dd.city ? t.city : t.village) + "</span></div></div></div>" +
      '<div class="sect"><dl class="kv">' + row(t.fac_where, esc(placeOf(f))) + row(t.fac_addr, f.street || f.town ? esc([f.street, f.town].filter(Boolean).join(", ")) : none) + row(t.fac_hours, f.hours ? esc(f.hours) : none) + row(t.fac_phone, none) + row(t.fac_own, t.own[f.own] + ' <span class="muted">· ' + t.fac_own_note + "</span>") +
      row(t.fac_coords, '<span class="nums">' + coords + '</span> <button class="linkbtn" type="button" data-act="copycoords" data-c="' + coords + '">' + t.copy + "</button>") + '</dl><p style="margin-top:12px"><button class="linkbtn" type="button" data-act="wrong" data-key="' + f.key + '">' + t.fac_wrong + "</button></p></div>" +
      (function () { var c = clinicForFac(f.key), ds = c ? doctorsAt(c) : users().filter(function (u) { return u.role === "doctor" && (u.profile.work || []).some(function (w) { return w.t === "f" && w.key === f.key; }); });
        if (!c) return ds.length ? '<div class="sect"><h2 style="font-size:1.2rem;margin:0 0 10px">' + t.c_docs_h + '</h2><div class="results" style="padding:0">' + ds.map(docCard).join("") + "</div></div>" : ""; return '<div class="sect"><div class="note-box ok-box"><b>' + t.reg_note + '</b><div style="margin-top:10px"><a class="btn sm" href="#/c/' + c.id + '">' + t.see_profile + "</a></div></div>" + (ds.length ? '<h2 style="font-size:1.2rem;margin:18px 0 10px">' + t.c_docs_h + '</h2><div class="results" style="padding:0">' + ds.map(docCard).join("") + "</div>" : "") + "</div>"; })() +
      '<div class="sect box"><h3>' + t.rural_h + "</h3><p>" + t.rural_p + "</p></div>" +
      '<div class="sect"><div class="note-box">' + t.fac_book_no + '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><a class="btn ghost sm" href="#/assist">' + ic("home") + t.fac_assist + '</a><a class="btn ghost sm" href="#/search">' + t.fac_demo + "</a></div></div></div>" +
      '<p class="fine" style="margin-top:22px">' + t.fac_src + "</p></div>" +
      '<aside class="stick"><h2>' + t.fac_map + '</h2><div id="map" class="map small" role="region" aria-label="' + t.p_loc + '"></div><div class="stack" style="margin-top:12px"><a class="btn block" href="' + dl.y + '" target="_blank" rel="noopener">' + ic("nav") + t.fac_dir_y + '</a><a class="btn ghost block" href="' + dl.g + '" target="_blank" rel="noopener">' + t.fac_dir_g + "</a></div></aside></div></div>";
  }
  function initFacMap(list, single) {
    var el = $("map"); if (!el) return;
    var LF = window.L; if (!LF || !LF.map) { el.innerHTML = '<div class="empty" style="margin:12px">' + L().map_off + "</div>"; return; }
    mapInst = LF.map(el, { scrollWheelZoom: false, dragging: !LF.Browser.mobile, tap: false }).setView([41.3, 64.6], 6);
    LF.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(mapInst);
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
  var userById = function (id) { return users().filter(function (u) { return u.id === id; })[0] || null; };
  var me = function () { var id = store.get(KS, null); return id ? userById(id) : null; };
  var REGROLE = "patient", ACC = null, ACC_DEL = false;
  var DOC_SP = ["gp", "therapist", "pediatrics", "gyn", "cardio", "neuro", "surgery", "dental", "ent", "eye", "derm", "uro", "endo", "other"];
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
    var fac = clinic.profile && clinic.profile.fac;
    return users().filter(function (u) { return u.role === "doctor" && (u.profile.work || []).some(function (w) { return (w.t === "c" && w.id === clinic.id) || (fac && w.t === "f" && w.key === fac); }); });
  }
  function clinicForFac(key) { return users().filter(function (u) { return u.role === "clinic" && u.profile && u.profile.fac === key; })[0] || null; }
  function personAv(u) { return '<div class="pav" aria-hidden="true">' + esc(initials(u.name)) + "</div>"; }

  function viewRegister() {
    var t = L(), clinic = REGROLE === "clinic";
    var roles = ["patient", "doctor", "clinic"].map(function (r) { return '<button type="button" class="rolecard" data-regrole="' + r + '" aria-pressed="' + (REGROLE === r) + '"><span class="icobox">' + ic(r === "patient" ? "heart" : r === "doctor" ? "shield" : "hosp") + "</span><b>" + t.role[r] + "</b><span>" + t.role_d[r] + "</span></button>"; }).join("");
    var f = function (id, label, type, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '"' + (extra || "") + "></div>"; };
    return '<div class="wrap pad acc"><h1>' + t.reg_h + '</h1><p class="lead">' + t.reg_p + '</p><div class="demo" style="margin:16px 0 22px">' + t.acc_demo + '</div><div class="roles" role="group">' + roles + "</div>" +
      '<form class="form" id="regform" novalidate>' + f("r-name", clinic ? t.f_clinicname : t.f_fullname, "text", ' autocomplete="' + (clinic ? "organization" : "name") + '"') +
      '<div class="two">' + f("r-email", t.f_email, "email", ' autocomplete="email" inputmode="email"') + f("r-phone", t.f_phone2, "tel", ' autocomplete="tel" inputmode="tel" placeholder="+998"') + '</div><p class="fine" style="margin:-4px 0 14px">' + t.or_note + "</p>" +
      f("r-tg", t.f_tg, "text", ' autocomplete="off" placeholder="' + t.f_tg_ph + '"') +
      '<div class="two">' + f("r-pw", t.f_pw, "password", ' autocomplete="new-password"') + f("r-pw2", t.f_pw2, "password", ' autocomplete="new-password"') + "</div>" +
      '<div class="err" id="r-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.reg_btn + '</button><p class="muted" style="margin-top:14px;text-align:center">' + t.have_acc + ' <a href="#/login">' + t.go_login + "</a></p></form></div>";
  }
  function viewLogin() {
    var t = L();
    return '<div class="wrap pad acc" style="max-width:520px"><h1>' + t.login_h + '</h1><div class="demo" style="margin:16px 0 22px">' + t.acc_demo + '</div><form class="form" id="loginform" novalidate>' +
      '<div class="fld"><label for="l-id">' + t.login_id + '</label><input id="l-id" autocomplete="username"></div><div class="fld"><label for="l-pw">' + t.f_pw + '</label><input id="l-pw" type="password" autocomplete="current-password"></div>' +
      '<div class="err" id="l-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.login_btn + '</button><p class="muted" style="margin-top:14px;text-align:center">' + t.no_acc + ' <a href="#/register">' + t.go_reg + "</a></p></form></div>";
  }

  /* account editor keeps unsaved edits in ACC so adding a row does not lose what was typed */
  function accStart(u) { ACC = { id: u.id, name: u.name, email: u.email || "", phone: u.phone ? fmtPhone(u.phone) : "", tg: u.tg || "", pr: JSON.parse(JSON.stringify(u.profile || {})) }; ACC.pr.work = ACC.pr.work || []; ACC.pr.svc = ACC.pr.svc || []; ACC.pr.langs = ACC.pr.langs || []; ACC.pr.modes = ACC.pr.modes || ["in"]; }
  function accCollect() {
    if (!ACC) return; var v = function (id) { var el = $(id); return el ? el.value.trim() : undefined; }, pr = ACC.pr;
    ["name", "email", "phone", "tg"].forEach(function (k) { var x = v("a-" + k); if (x !== undefined) ACC[k] = x; });
    var map = { "a-region": "region", "a-district": "district", "p-village": "village", "d-spec": "spec", "d-spec-other": "spec_other", "d-years": "years", "d-lic": "lic", "d-edu": "edu", "d-bio": "bio", "c-type": "ctype", "c-own": "own", "c-addr": "addr", "c-hours": "hours", "c-lic": "lic", "c-about": "about" };
    Object.keys(map).forEach(function (id) { var x = v(id); if (x !== undefined) pr[map[id]] = x; });
    if ($("c-claim")) { var m = matchPlace(v("c-claim")); pr.fac = m && m.t === "f" ? m.key : ""; pr.claim = v("c-claim"); }
    if ($("d-langs")) pr.langs = all("#d-langs input:checked").map(function (i) { return i.value; });
    if ($("d-modes")) pr.modes = all("#d-modes input:checked").map(function (i) { return i.value; });
    if ($("wp-list")) pr.work = all("#wp-list input").map(function (i) { return matchPlace(i.value); }).filter(Boolean);
    if ($("svc-list")) pr.svc = all("#svc-list .svcrow").map(function (row) { var n = row.querySelector(".s-n").value.trim(), pz = row.querySelector(".s-p").value.trim(), on = row.querySelector(".s-o"); return { name: n, price: pz === "" ? "" : Math.max(0, Math.round(+pz) || 0), online: on ? on.checked : false }; });
  }
  function viewAccount() {
    var t = L(), u = me(); if (!u) return viewLogin();
    if (!ACC || ACC.id !== u.id) accStart(u);
    var a = ACC, pr = a.pr, role = u.role;
    var fi = function (id, label, val, type, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + (type || "text") + '" value="' + esc(val || "") + '"' + (extra || "") + "></div>"; };
    var ta = function (id, label, val, ph) { return '<div class="fld"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" maxlength="1500" placeholder="' + esc(ph || "") + '">' + esc(val || "") + "</textarea></div>"; };
    var regionSel = '<div class="two"><div class="fld"><label for="a-region">' + t.f_region + '</label><select id="a-region"><option value="">—</option>' + REG.slice().sort(function (x, y) { return nmL(x).localeCompare(nmL(y)); }).map(function (r) { return '<option value="' + r.code + '"' + (pr.region === r.code ? " selected" : "") + ">" + esc(nmL(r)) + "</option>"; }).join("") + '</select></div><div class="fld"><label for="a-district">' + t.f_district + '</label><select id="a-district">' + districtOptions(pr.region, pr.district) + "</select></div></div>";
    var contact = '<fieldset class="accsec"><legend>' + t.sec_contact + "</legend>" + fi("a-name", role === "clinic" ? t.f_clinicname : t.f_fullname, a.name) + '<div class="two">' + fi("a-email", t.f_email, a.email, "email", BE ? " readonly" : "") + fi("a-phone", t.f_phone2, a.phone, "tel", ' inputmode="tel" placeholder="+998"') + "</div>" + fi("a-tg", t.f_tg, a.tg, "text", ' placeholder="' + t.f_tg_ph + '"') + "</fieldset>";
    var svcRows = function (withOnline) {
      return '<div id="svc-list">' + pr.svc.map(function (sv, i) { return '<div class="svcrow"><input class="s-n" aria-label="' + t.svc_name + '" placeholder="' + esc(t.svc_name_ph) + '" value="' + esc(sv.name) + '"><input class="s-p" type="number" min="0" step="1000" inputmode="numeric" aria-label="' + t.svc_price + '" placeholder="' + t.svc_price + '" value="' + esc(sv.price) + '">' + (withOnline ? '<label class="mini"><input class="s-o" type="checkbox"' + (sv.online ? " checked" : "") + ">" + t.svc_online + "</label>" : "") + '<button class="linkbtn" type="button" data-svcdel="' + i + '">' + t.svc_remove + "</button></div>"; }).join("") + '</div><button class="btn ghost sm" type="button" data-act="svcadd">' + ic("plus") + t.svc_add + "</button>";
    };
    var body = "";
    if (role === "patient") body = '<fieldset class="accsec"><legend>' + t.sec_loc + "</legend>" + regionSel + fi("p-village", t.p_village, pr.village) + '<p class="fine">' + t.p_hint + "</p></fieldset>";
    if (role === "doctor") {
      body = '<fieldset class="accsec"><legend>' + t.sec_basic + '</legend><div class="two"><div class="fld"><label for="d-spec">' + t.d_spec + '</label><select id="d-spec">' + DOC_SP.map(function (k) { return '<option value="' + k + '"' + (pr.spec === k ? " selected" : "") + ">" + t.docsp[k] + "</option>"; }).join("") + "</select></div>" + fi("d-spec-other", t.d_spec_other, pr.spec_other) + "</div>" +
        '<div class="two">' + fi("d-years", t.d_years, pr.years, "number", ' min="0" max="70"') + fi("d-lic", t.d_lic, pr.lic) + "</div>" +
        '<div class="fld"><span class="flabel">' + t.d_langs + '</span><div class="checks" id="d-langs">' + ["uz", "ru", "en", "kaa", "tg"].map(function (l) { var n = { kaa: "Qaraqalpaq", tg: "Tojik" }[l] || t.lg[l]; return '<label class="mini"><input type="checkbox" value="' + l + '"' + (pr.langs.indexOf(l) > -1 ? " checked" : "") + ">" + n + "</label>"; }).join("") + "</div></div>" +
        '<div class="fld"><span class="flabel">' + t.d_modes + '</span><div class="checks" id="d-modes">' + [["in", t.tab_in], ["on", t.tab_on]].map(function (m) { return '<label class="mini"><input type="checkbox" value="' + m[0] + '"' + (pr.modes.indexOf(m[0]) > -1 ? " checked" : "") + ">" + m[1] + "</label>"; }).join("") + "</div></div>" +
        ta("d-bio", t.d_bio, pr.bio, t.d_bio_ph) + "</fieldset>" +
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
    return '<div class="wrap pad acc"><div class="sechead"><div><div class="eyebrow">' + t.role[role] + "</div><h1>" + esc(u.name) + '</h1></div><div class="btns">' + (pub ? '<a class="btn ghost sm" href="' + pub + '">' + t.acc_view + "</a>" : "") + '<button class="btn ghost sm" type="button" data-act="logout">' + t.logout + '</button></div></div><div class="demo" style="margin:14px 0 20px">' + t.acc_demo + "</div>" +
      (role === "doctor" ? docInbox(u) : "") + '<form class="form accform" id="accform" novalidate>' + contact + body + '<div class="err" id="a-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.acc_save + "</button></form>" +
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
    return '<div class="wrap"><a class="back" href="#/doctors">‹ ' + t.nav_doctors + '</a><div class="pf"><div><div class="who">' + personAv(u) + "<div><h1>" + esc(u.name) + '</h1><div class="spec">' + esc(specName(pr)) + (pr.years ? " · " + t.exp(pr.years) : "") + '</div><div class="badges"><span class="badge">' + t.on_sh + '</span><span class="badge warn">' + t.verified_no + "</span>" + ((pr.modes || []).indexOf("on") > -1 ? '<span class="badge plain">' + ic("video") + t.online_b + "</span>" : "") + "</div></div></div>" +
      (pr.bio ? '<div class="sect"><p class="lead" style="margin:0">' + esc(pr.bio) + "</p></div>" : "") +
      ((pr.work || []).length ? '<div class="sect"><h2>' + t.works_at + '</h2><ul class="list">' + pr.work.map(function (w) { return "<li>" + wpLink(w) + "</li>"; }).join("") + "</ul></div>" : "") +
      ((pr.svc || []).some(function (x) { return x.name; }) ? '<div class="sect"><h2>' + t.svc_h + "</h2>" + svcTable(pr.svc, true) + "</div>" : "") +
      (pr.edu ? '<div class="sect"><h2>' + t.sec_bg + '</h2><p class="pre">' + esc(pr.edu) + "</p></div>" : "") +
      '<div class="sect"><dl class="kv">' + (langs ? "<dt>" + t.p_langs + "</dt><dd>" + esc(langs) + "</dd>" : "") + (region ? "<dt>" + t.p_area + "</dt><dd>" + esc(region) + "</dd>" : "") + (pr.lic ? "<dt>" + t.d_lic + "</dt><dd>" + esc(pr.lic) + ' <span class="muted">· ' + t.verified_no + "</span></dd>" : "") + "</dl></div>" +
      '<p class="fine" style="margin-top:20px">' + t.acc_demo + (u.updated ? " · " + t.updated(fmt(fromIso(u.updated), { day: "numeric", month: "short" })) : "") + "</p></div>" +
      '<aside class="stick"><h2>' + esc(u.name) + '</h2><div class="stack">' + ((pr.modes || []).indexOf("on") > -1 ? '<a class="btn" href="#/consult?' + qs({ doc: u.id }) + '">' + ic("chat") + t.cs_req_doc + "</a>" : "") + tgBtn(u) + "</div></aside></div></div>";
  }
  function viewClinicAcc(id) {
    var t = L(), u = userById(id); if (!u || u.role !== "clinic") return '<div class="wrap pad"><div class="empty">' + t.not_found + "</div></div>";
    var pr = u.profile || {}, f = pr.fac ? facByKey[pr.fac] : null, d = pr.district && disByCode[pr.district], docs = doctorsAt(u);
    if (f) pendingMap = { fac: [f], single: true };
    var place = d ? nmL(d) + ", " + nmL(REG[d.r]) : f ? placeOf(f) : "";
    var dl = f ? dirLinks(f) : null;
    return '<div class="wrap"><a class="back" href="#/doctors">‹ ' + t.clinics_reg_h + '</a><div class="pf"><div><div class="who"><div class="ficon big c-' + (pr.ctype || "clinic") + '">' + ic(CAT_IC[pr.ctype || "clinic"]) + "</div><div><h1>" + esc(u.name) + '</h1><div class="spec">' + t.cat[pr.ctype || "clinic"] + '</div><div class="badges"><span class="badge">' + t.on_sh + "</span>" + (pr.own ? '<span class="badge ' + (pr.own === "s" ? "ok" : "plain") + '">' + t.own[pr.own] + "</span>" : "") + '<span class="badge warn">' + t.verified_no + "</span></div></div></div>" +
      (pr.about ? '<div class="sect"><p class="lead" style="margin:0">' + esc(pr.about) + "</p></div>" : "") +
      '<div class="sect"><dl class="kv">' + (place ? "<dt>" + t.fac_where + "</dt><dd>" + esc(place) + "</dd>" : "") + (pr.addr ? "<dt>" + t.fac_addr + "</dt><dd>" + esc(pr.addr) + "</dd>" : "") + (pr.hours ? "<dt>" + t.fac_hours + "</dt><dd>" + esc(pr.hours) + "</dd>" : "") + (u.phone ? "<dt>" + t.fac_phone + '</dt><dd class="nums">' + esc(fmtPhone(u.phone)) + "</dd>" : "") + (pr.lic ? "<dt>" + t.c_lic + "</dt><dd>" + esc(pr.lic) + "</dd>" : "") + "</dl></div>" +
      ((pr.svc || []).some(function (x) { return x.name; }) ? '<div class="sect"><h2>' + t.svc_h + "</h2>" + svcTable(pr.svc, false) + (u.updated ? '<p style="margin-top:10px"><span class="confline">' + t.updated(fmt(fromIso(u.updated), { day: "numeric", month: "short" })) + "</span></p>" : "") + "</div>" : "") +
      '<div class="sect"><h2>' + t.c_docs_h + "</h2>" + (docs.length ? '<div class="results" style="padding:0">' + docs.map(docCard).join("") + "</div>" : '<p class="muted">' + t.c_no_docs + "</p>") + "</div>" +
      '<p class="fine" style="margin-top:20px">' + t.acc_demo + "</p></div>" +
      '<aside class="stick"><h2>' + t.fac_map + "</h2>" + (f ? '<div id="map" class="map small" role="region" aria-label="' + t.p_loc + '"></div>' : "") + '<div class="stack" style="margin-top:12px">' + tgBtn(u) + (dl ? '<a class="btn ghost block" href="' + dl.y + '" target="_blank" rel="noopener">' + ic("nav") + t.fac_dir_y + "</a>" : "") + "</div></aside></div></div>";
  }
  function docCard(u) {
    var t = L(), pr = u.profile || {}, w = (pr.work || [])[0];
    return '<article class="fcard"><div class="pav sm">' + esc(initials(u.name)) + '</div><div class="fmain"><h3><a href="#/doc/' + u.id + '">' + esc(u.name) + '</a></h3><div class="spec">' + esc(specName(pr)) + (pr.years ? " · " + t.exp(pr.years) : "") + "</div>" + (w ? '<div class="meta">' + ic("hosp") + esc(wpLabel(w)) + "</div>" : "") + '</div><div class="facts"><a class="btn ghost sm" href="#/doc/' + u.id + '">' + t.view + "</a></div></article>";
  }
  function viewDoctors(q) {
    var t = L(), qq = (q.q || "").trim().toLowerCase(), list = users().filter(function (u) { var pr = u.profile || {}; return u.role === "doctor" && (!q.s || pr.spec === q.s) && (!q.r || pr.region === q.r) && (!qq || (u.name + " " + specName(pr) + " " + (pr.work || []).map(wpLabel).join(" ")).toLowerCase().indexOf(qq) > -1); });
    var clinics = users().filter(function (u) { return u.role === "clinic" && (!q.r || (u.profile || {}).region === q.r); });
    var sel = '<form class="filters" id="docfilter"><label class="sel">' + t.d_spec + ' <select id="df-s"><option value="">' + t.all_specs + "</option>" + DOC_SP.map(function (k) { return '<option value="' + k + '"' + (q.s === k ? " selected" : "") + ">" + t.docsp[k] + "</option>"; }).join("") + '</select></label><label class="sel">' + t.ds_name + ' <input id="df-q" class="pinput" style="width:180px;text-align:left" value="' + esc(q.q || "") + '" placeholder="' + esc(t.ds_name_ph) + '"></label><label class="sel">' + t.f_region + ' <select id="df-r"><option value="">' + t.all_regions + "</option>" + REG.map(function (r) { return '<option value="' + r.code + '"' + (q.r === r.code ? " selected" : "") + ">" + esc(nmL(r)) + "</option>"; }).join("") + "</select></label></form>";
    return '<div class="band deep"><div class="wrap bhead"><div class="eyebrow">' + t.nav_doctors + "</div><h1>" + t.doctors_h + '</h1><p class="sub">' + t.doctors_p + '</p><p style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn light" href="#/register" data-regrole-link="doctor">' + t.reg_doc_cta + '</a><a class="btn ghost" style="color:var(--deep-ink);border-color:var(--deep-line)" href="#/register" data-regrole-link="clinic">' + t.reg_clinic_cta + "</a></p></div></div>" +
      '<div class="wrap pad" style="padding-top:20px">' + sel + '<div class="results" style="padding:14px 0 0">' + (list.length ? list.map(docCard).join("") : '<div class="empty">' + t.no_doctors + "</div>") + "</div>" +
      '<h2 style="margin:40px 0 14px;font-size:1.4rem">' + t.clinics_reg_h + '</h2><div class="results" style="padding:0">' + (clinics.length ? clinics.map(function (c) { var pr = c.profile || {}; return '<article class="fcard"><div class="ficon c-' + (pr.ctype || "clinic") + '">' + ic(CAT_IC[pr.ctype || "clinic"]) + '</div><div class="fmain"><h3><a href="#/c/' + c.id + '">' + esc(c.name) + '</a></h3><div class="spec">' + t.cat[pr.ctype || "clinic"] + "</div>" + (pr.district && disByCode[pr.district] ? '<div class="meta">' + ic("pin") + esc(nmL(disByCode[pr.district]) + ", " + nmL(REG[disByCode[pr.district].r])) + "</div>" : "") + '</div><div class="facts"><a class="btn ghost sm" href="#/c/' + c.id + '">' + t.view + "</a></div></article>"; }).join("") : '<div class="empty">' + t.no_clinics_reg + "</div>") + "</div></div>";
  }


  /* ---------------- consultation applications and online / text consultation (demo) ---------------- */
  var KC = "shifokor-consults";
  var consults = function () { return store.get(KC, []); };
  var saveConsults = function (l) { store.set(KC, l); };
  var consultById = function (id) { return consults().filter(function (c) { return c.id === id; })[0] || null; };
  var CS = null;
  function csStart(q) {
    var u = me(), pr = (u && u.profile) || {};
    CS = { docQ: q.doc || "", type: "text", safe: "", who: "self", name: u && u.role === "patient" ? u.name : "", age: "", sex: "f", phone: u && u.phone ? fmtPhone(u.phone) : "", region: pr.region || "", district: pr.district || "", complaint: "", since: "1", chronic: "", meds: "", allergy: "", spec: "", doc: q.doc || "", consent: false };
    var d = q.doc ? userById(q.doc) : null; if (d) CS.spec = (d.profile || {}).spec || "";
  }
  function csCollect() {
    if (!CS) return;
    var map = { "cs-name": "name", "cs-age": "age", "cs-sex": "sex", "cs-phone": "phone", "cs-region": "region", "cs-district": "district", "cs-complaint": "complaint", "cs-since": "since", "cs-chronic": "chronic", "cs-meds": "meds", "cs-allergy": "allergy", "cs-spec": "spec", "cs-doc": "doc" };
    Object.keys(map).forEach(function (id) { var el = $(id); if (el) CS[map[id]] = el.value.trim(); });
    var c = $("cs-consent"); if (c) CS.consent = c.checked;
  }
  var onlineDoctors = function (spec) { return users().filter(function (u) { var pr = u.profile || {}; return u.role === "doctor" && (pr.modes || []).indexOf("on") > -1 && (!spec || pr.spec === spec); }); };
  function viewConsult(q) {
    var t = L(); if (!CS || CS.docQ !== (q.doc || "")) csStart(q);
    var c = CS, fi = function (id, label, val, type, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + (type || "text") + '" value="' + esc(val || "") + '"' + (extra || "") + "></div>"; };
    var types = ["text", "audio", "video"].map(function (k) { return '<button type="button" class="rolecard" data-cstype="' + k + '" aria-pressed="' + (c.type === k) + '"><span class="icobox">' + ic(k === "text" ? "chat" : k === "audio" ? "mic" : "video") + "</span><b>" + t.cs_types[k][0] + "</b><span>" + t.cs_types[k][1] + "</span></button>"; }).join("");
    var safety = '<ul class="rflist">' + t.rf_list.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul><div class="seg" role="group" aria-label="' + esc(t.cs_safe_h) + '"><button type="button" data-cssafe="ok" aria-pressed="' + (c.safe === "ok") + '">' + ic("check") + t.cs_safe_ok + '</button><button type="button" data-cssafe="bad" aria-pressed="' + (c.safe === "bad") + '">' + t.cs_safe_bad + "</button></div>" +
      (c.safe === "bad" ? '<div class="emerg" style="margin-top:14px"><b>' + t.em_h + ".</b> " + t.em_p + ' <a class="btn danger sm" style="margin-left:6px" href="tel:103">' + ic("phone") + t.em_call + "</a></div>" : "");
    var dis = '<div class="two"><div class="fld"><label for="cs-region">' + t.f_region + '</label><select id="cs-region"><option value="">—</option>' + REG.slice().sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (r) { return '<option value="' + r.code + '"' + (c.region === r.code ? " selected" : "") + ">" + esc(nmL(r)) + "</option>"; }).join("") + '</select></div><div class="fld"><label for="cs-district">' + t.f_district + '</label><select id="cs-district">' + districtOptions(c.region, c.district) + "</select></div></div>";
    var docs = onlineDoctors(c.spec);
    var form = c.safe === "bad" ? "" :
      '<fieldset class="accsec"><legend>' + t.cs_pat_h + '</legend><div class="seg" role="group" style="margin-bottom:14px">' + ["self", "child", "other"].map(function (k) { return '<button type="button" data-csfor="' + k + '" aria-pressed="' + (c.who === k) + '">' + t.cs_for[k] + "</button>"; }).join("") + "</div>" +
      '<div class="two">' + fi("cs-name", t.cs_pname, c.name, "text", ' autocomplete="name"') + fi("cs-age", t.cs_age, c.age, "number", ' min="0" max="120" inputmode="numeric"') + "</div>" +
      '<div class="two"><div class="fld"><label for="cs-sex">' + t.cs_sex + '</label><select id="cs-sex">' + ["f", "m"].map(function (k) { return '<option value="' + k + '"' + (c.sex === k ? " selected" : "") + ">" + t.cs_sexes[k] + "</option>"; }).join("") + "</select></div>" + fi("cs-phone", t.cs_phone, c.phone, "tel", ' inputmode="tel" placeholder="+998" autocomplete="tel"') + "</div>" + dis + "</fieldset>" +
      '<fieldset class="accsec"><legend>' + t.cs_prob_h + '</legend><div class="fld"><label for="cs-complaint">' + t.cs_complaint + '</label><textarea id="cs-complaint" maxlength="1500" placeholder="' + esc(t.cs_complaint_ph) + '">' + esc(c.complaint) + "</textarea></div>" +
      '<div class="fld"><label for="cs-since">' + t.cs_since + '</label><select id="cs-since">' + t.cs_sinces.map(function (x, i) { return '<option value="' + i + '"' + (String(c.since) === String(i) ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></div>" +
      fi("cs-chronic", t.cs_chronic, c.chronic) + '<div class="two">' + fi("cs-meds", t.cs_meds, c.meds) + fi("cs-allergy", t.cs_allergy, c.allergy) + "</div></fieldset>" +
      '<fieldset class="accsec"><legend>' + t.cs_doc_h + '</legend><div class="two"><div class="fld"><label for="cs-spec">' + t.d_spec + '</label><select id="cs-spec"><option value="">' + t.cs_spec_any + "</option>" + DOC_SP.filter(function (k) { return k !== "other"; }).map(function (k) { return '<option value="' + k + '"' + (c.spec === k ? " selected" : "") + ">" + t.docsp[k] + "</option>"; }).join("") + '</select></div><div class="fld"><label for="cs-doc">' + t.cs_doc_pick + '</label><select id="cs-doc"><option value="">' + t.cs_doc_any + "</option>" + docs.map(function (d) { return '<option value="' + d.id + '"' + (c.doc === d.id ? " selected" : "") + ">" + esc(d.name) + " · " + esc(specName(d.profile || {})) + "</option>"; }).join("") + "</select></div></div></fieldset>" +
      '<label class="chk"><input type="checkbox" id="cs-consent"' + (c.consent ? " checked" : "") + "><span>" + t.cs_consent + '</span></label><div class="err" id="cs-err" aria-live="polite"></div><button class="btn big block" type="submit">' + t.cs_send + "</button>";
    return '<div class="band deep"><div class="wrap bhead"><div class="eyebrow">' + t.nav_consult + "</div><h1>" + t.cs_h + '</h1><p class="sub">' + t.cs_p + "</p></div></div>" +
      '<div class="wrap pad acc" style="padding-top:28px">' + steps([t.cs_steps_h, t.cs_steps_p]) + '<div class="demo" style="margin:28px 0 20px">' + t.cs_demo + "</div>" +
      '<form class="form accform" id="csform" novalidate><fieldset class="accsec"><legend>' + t.cs_type + '</legend><div class="roles">' + types + "</div></fieldset>" +
      '<fieldset class="accsec"><legend>' + t.cs_safe_h + '</legend><p class="muted">' + t.rf_p + "</p>" + safety + "</fieldset>" + form + "</form></div>";
  }
  function csBadge(st) { var t = L(); return '<span class="badge ' + (st === "done" ? "ok" : st === "accepted" ? "" : "warn") + '">' + t.cs_st[st] + "</span>"; }
  function csRow(c) { var t = L(); return '<a class="visit cs-row" href="#/consult/' + c.id + '"><div class="date"><span>' + fmt(new Date(c.at), { month: "short" }) + "</span><b>" + new Date(c.at).getDate() + '</b></div><div><h3>' + t.cs_no(c.n) + " " + csBadge(c.status) + '</h3><div class="muted" style="font-size:.92rem">' + t.cs_types[c.type][0] + " · " + esc(c.name) + " · " + esc(c.complaint.slice(0, 80)) + (c.complaint.length > 80 ? "…" : "") + '</div></div><div class="acts">' + ic(c.type === "text" ? "chat" : c.type === "audio" ? "mic" : "video") + "</div></a>"; }
  function docInbox(u) {
    var t = L(), sp = (u.profile || {}).spec;
    var list = consults().filter(function (c) { return c.doctorId === u.id || (c.status === "new" && (c.doc ? c.doc === u.id : !c.spec || c.spec === sp || (sp === "gp" && !c.spec))); }).sort(function (a, b) { return b.at - a.at; });
    return '<div class="dcard" style="margin-bottom:22px"><h2>' + t.cs_doc_list_h + "</h2>" + (list.length ? '<div class="visits">' + list.map(csRow).join("") + "</div>" : '<p class="muted" style="margin-top:8px">' + t.cs_none + "</p>") + "</div>";
  }
  function viewConsultThread(id) {
    var t = L(), c = consultById(id); if (!c) return '<div class="wrap pad"><div class="empty">' + t.not_found + "</div></div>";
    var u = me(), isDoc = !!(u && u.role === "doctor"), mineDoc = isDoc && c.doctorId === u.id;
    var dd = c.district && disByCode[c.district], area = dd ? nmL(dd) + ", " + nmL(REG[dd.r]) : c.region && regByCode[c.region] ? nmL(regByCode[c.region]) : "—";
    var row = function (k, v) { return v ? "<dt>" + k + "</dt><dd>" + v + "</dd>" : ""; };
    var details = '<dl class="kv">' + row(t.cs_type_lbl, t.cs_types[c.type][0]) + row(t.cs_for_lbl, t.cs_for[c.who]) + row(t.cs_pname, esc(c.name)) + row(t.cs_age, esc(c.age)) + row(t.cs_sex, t.cs_sexes[c.sex]) + row(t.cs_phone, '<span class="nums">' + esc(isDoc || !c.userId || (u && u.id === c.userId) ? c.phone : maskPhone(c.phone)) + "</span>") + row(t.cs_area, esc(area)) + row(t.cs_since, t.cs_sinces[+c.since]) + "</dl>" +
      '<h3 style="margin:16px 0 6px">' + t.cs_complaint + '</h3><p class="pre">' + esc(c.complaint) + "</p>" +
      '<dl class="kv" style="margin-top:14px">' + row(t.cs_chronic, esc(c.chronic)) + row(t.cs_meds, esc(c.meds)) + row(t.cs_allergy, esc(c.allergy)) + row(t.cs_wanted, c.spec ? t.docsp[c.spec] : t.cs_spec_any) + row(t.cs_doctor, c.doctorId ? '<a href="#/doc/' + c.doctorId + '">' + esc(c.doctorName) + "</a>" : "") + "</dl>";
    var msgs = c.msgs.map(function (m) { if (m.from === "s") return '<div class="sys">' + esc(m.text) + "</div>"; var mine = (isDoc && m.from === "d") || (!isDoc && m.from === "p"); return '<div class="' + (mine ? "me" : "them") + '">' + (m.from === "d" && !mine ? "<b>" + esc(m.name) + "</b>" : "") + esc(m.text) + '<small>' + fmt(new Date(m.at), { day: "numeric", month: "short" }) + " " + pad(new Date(m.at).getHours()) + ":" + pad(new Date(m.at).getMinutes()) + "</small></div>"; }).join("");
    var canWrite = c.status !== "done" && (!isDoc || mineDoc);
    var actions = "";
    if (isDoc && c.status === "new") actions = '<button class="btn" type="button" data-cs="accept" data-id="' + c.id + '">' + ic("check") + t.cs_accept + "</button>";
    if (mineDoc && c.status === "accepted") actions = (c.type !== "text" ? '<button class="btn" type="button" data-cs="call" data-id="' + c.id + '">' + ic(c.type === "video" ? "video" : "mic") + t.cs_call + "</button>" : "") +
      '<details class="finish"><summary>' + t.cs_finish + '</summary><form id="csfinish" data-id="' + c.id + '" novalidate><div class="radio">' + t.on_out.map(function (o, i) { return '<label><input type="radio" name="csout" value="' + i + '">' + o + "</label>"; }).join("") + '</div><div class="fld"><label for="cs-sum">' + t.vs_note + '</label><textarea id="cs-sum" maxlength="600"></textarea></div><div class="err" id="csf-err"></div><button class="btn" type="submit">' + t.vs_save + "</button></form></details>";
    if (!isDoc && c.status === "accepted" && c.call) actions = '<button class="btn" type="button" data-cs="join" data-id="' + c.id + '">' + ic(c.type === "video" ? "video" : "mic") + t.cs_join + "</button>";
    return '<div class="wrap"><a class="back" href="' + (isDoc ? "#/account" : "#/visits") + '">‹ ' + (isDoc ? t.nav_account : t.nav_visits) + '</a><div class="sechead" style="padding-top:12px"><div><h1 style="font-size:clamp(1.6rem,1.3rem + 1.4vw,2.3rem)">' + t.cs_no(c.n) + "</h1><div class=\"badges\">" + csBadge(c.status) + '<span class="badge plain">' + t.cs_types[c.type][0] + "</span></div></div>" + (isDoc ? '<span class="sample">' + t.cs_doc_view + "</span>" : "") + "</div>" +
      '<div class="pf" style="padding-top:18px"><div><div class="dcard"><h2>' + t.cs_details + "</h2>" + details + "</div>" + (isDoc && !mineDoc && c.status !== "new" ? "" : "") + '<p class="fine" style="margin-top:14px">' + t.cs_demo + "</p></div>" +
      '<aside class="dcard chatcard"><h2>' + t.cs_thread + '</h2><div class="room-log" id="cslog">' + (msgs || '<div class="sys">' + t.cs_sent + "</div>") + "</div>" +
      (canWrite ? '<form class="room-send" id="csmsg" data-id="' + c.id + '" style="margin-top:10px"><input id="csmsg-in" class="pinput" style="width:100%;text-align:left" placeholder="' + esc(t.cs_write) + '" aria-label="' + esc(t.cs_write) + '" autocomplete="off"><button class="btn" type="submit">' + t.cs_send_msg + "</button></form>" : "") +
      (actions ? '<div class="stack" style="margin-top:12px">' + actions + "</div>" : "") + (!isDoc && c.status === "new" ? "" : "") + '<p class="fine" style="margin-top:10px">' + t.cs_sms_note + "</p></aside></div></div>";
  }
  function homeDoctorSearch() {
    var t = L(), list = users().filter(function (u) { return u.role === "doctor"; }).slice(-3).reverse();
    return '<div class="wrap" style="padding-top:20px"><div class="panel docsearch"><div><h3>' + t.ds_h + '</h3><p class="muted" style="font-size:.95rem">' + t.ds_p + '</p></div><form id="docsearch" class="dsrow" role="search"><div class="sf"><label for="hs-s">' + t.d_spec + '</label><select id="hs-s"><option value="">' + t.all_specs + "</option>" + DOC_SP.map(function (k) { return '<option value="' + k + '">' + t.docsp[k] + "</option>"; }).join("") + '</select></div><div class="sf"><label for="hs-r">' + t.f_region + '</label><select id="hs-r"><option value="">' + t.all_regions + "</option>" + REG.slice().sort(function (a, b) { return nmL(a).localeCompare(nmL(b)); }).map(function (r) { return '<option value="' + r.code + '">' + esc(nmL(r)) + "</option>"; }).join("") + '</select></div><div class="sf"><label for="hs-q">' + t.ds_name + '</label><input id="hs-q" autocomplete="off" placeholder="' + esc(t.ds_name_ph) + '"></div><button class="btn" type="submit">' + ic("search") + t.ds_go + "</button></form>" +
      (list.length ? '<div class="results" style="padding:6px 0 0;grid-column:1/-1">' + list.map(docCard).join("") + "</div>" : "") + "</div></div>";
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
    if (m.type === "call") {
      var mb2 = function (k, icn, label) { return '<button class="chip" type="button" data-rmode="' + k + '" aria-pressed="' + (m.media === k) + '">' + ic(icn) + label + "</button>"; };
      return '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="dh">' + head() + '<h2 id="dh">' + t.cs_types[m.media === "video" ? "video" : "audio"][0] + '</h2><p class="muted" style="margin-top:4px">' + esc(m.title) + '</p><div class="room-modes" style="margin:16px 0">' + mb2("audio", "mic", t.rm_audio) + mb2("video", "video", t.rm_video) + '</div><div class="callbox">' + ic(m.media === "video" ? "video" : "mic") + "<p>" + t.cs_call_demo + '</p></div><p style="margin-top:18px"><button class="btn danger" type="button" data-act="close">' + t.rm_leave + "</button></p></div>";
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
  function render(keepScroll) {
    var t = L(), h = parseHash(), path = h.path, q = h.q, html, route = "home";
    current = h; document.documentElement.lang = lang === "uz" ? "uz-Latn" : lang;
    if (path === "/search") html = viewSearch(q);
    else if (path.indexOf("/p/") === 0) html = viewProfile(path.slice(3), q);
    else if (path === "/find") html = viewFind(q);
    else if (path === "/register") { html = viewRegister(); route = "account"; }
    else if (path === "/login") { html = me() ? viewAccount() : viewLogin(); route = "account"; }
    else if (path === "/account") { html = viewAccount(); route = "account"; }
    else if (path === "/consult") { html = viewConsult(q); route = "consult"; }
    else if (path.indexOf("/consult/") === 0) { html = viewConsultThread(path.slice(9)); route = "consult"; }
    else if (path === "/doctors") { html = viewDoctors(q); route = "doctors"; }
    else if (path.indexOf("/doc/") === 0) { html = viewDoc(path.slice(5)); route = "doctors"; }
    else if (path.indexOf("/c/") === 0) { html = viewClinicAcc(path.slice(3)); route = "doctors"; }
    else if (path.indexOf("/f/") === 0) html = viewFacility(path.slice(3));
    else if (path === "/browse" || path.indexOf("/browse/") === 0) { html = viewBrowse(path.slice(8)); route = "browse"; }
    else if (path === "/visits") { html = viewVisits(); route = "visits"; }
    else if (path === "/clinics") { html = viewClinics(); route = "clinics"; }
    else if (path === "/dashboard") { html = viewDashboard(); route = "dashboard"; }
    else if (path === "/assist") { html = viewAssist(); route = "assist"; }
    else html = viewHome();
    var y = window.scrollY; destroyMap(); $("app").innerHTML = html;
    if (pendingMap) { var items = pendingMap; pendingMap = null; if (items.fac) initFacMap(items.fac, items.single); else initMap(items); }
    all("[data-t]").forEach(function (el) { var v = t[el.dataset.t]; if (typeof v === "string") el.innerHTML = v; });
    all("[data-r]").forEach(function (a) { if (a.dataset.r === route) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    if (route === "browse") $("browseBtn").setAttribute("aria-current", "page"); else $("browseBtn").removeAttribute("aria-current");
    all("#lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.l === lang)); });
    document.title = "Shifokor: " + (lang === "ru" ? "запись к врачу в Фергане" : lang === "uz" ? "Farg‘onada shifokorga yozilish" : "book a doctor in Fergana");
    var ab = $("acctBtn"), mu = me(); if (ab) { ab.textContent = mu ? mu.name.split(" ")[0] : t.nav_login; ab.setAttribute("href", mu ? "#/account" : "#/login"); }
    closeMenu();
    if (keepScroll) window.scrollTo(0, y); else { window.scrollTo(0, 0); $("app").focus({ preventScroll: true }); }
  }
  function go(hash) { if (location.hash === hash) render(true); else location.hash = hash; }
  function rerender() { render(true); refreshModal(); }

  /* ---------------- events ---------------- */
  function closeMenu() { var m = $("menu"); if (m && !m.hidden) { m.hidden = true; $("browseBtn").setAttribute("aria-expanded", "false"); } }
  function openBooking(o) { var p = byId(o.p), u = me(); openModal({ type: "book", step: "rf", p: o.p, d: o.d, t: o.t, m: o.m, k: svcsFor(p, o.m)[0].k, name: u ? u.name : "", phone: u && u.phone ? fmtPhone(u.phone) : "" }); }

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dd")) closeMenu();
    if (e.target.closest("#browseBtn")) { var mn = $("menu"); mn.hidden = !mn.hidden; $("browseBtn").setAttribute("aria-expanded", String(!mn.hidden)); return; }
    if (e.target.closest("#menu a")) { closeMenu(); return; }
    var el = e.target.closest("button, a"); if (!el) return;
    var ds = el.dataset, t = L();

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
    if (ds.cssafe) { csCollect(); CS.safe = ds.cssafe; render(true); return; }
    if (ds.csfor) { csCollect(); CS.who = ds.csfor; render(true); return; }
    if (ds.cs) {
      var cl = consults(), cc = cl.filter(function (x) { return x.id === ds.id; })[0], du = me(); if (!cc) return;
      if (BE && ds.cs === "accept") { if (!du || du.role !== "doctor") { toast(t.cs_only_doc); return; } BE.updateConsult(cc.id, { status: "accepted", doctor_id: du.id, doctor_name: du.name }, t.cs_accepted(du.name)).then(function () { render(true); }, function () { toast(t.be_err); }); return; }
      if (BE && ds.cs === "call") { BE.updateConsult(cc.id, { call: true }, t.cs_call_msg(cc.type)).then(function () { render(true); }, function () { toast(t.be_err); }); openModal({ type: "call", media: cc.type, title: t.cs_no(cc.n) }); return; }
      if (ds.cs === "accept") { if (!du || du.role !== "doctor") { toast(t.cs_only_doc); return; } cc.status = "accepted"; cc.doctorId = du.id; cc.doctorName = du.name; cc.msgs.push({ from: "s", text: t.cs_accepted(du.name), at: Date.now() }); saveConsults(cl); render(true); return; }
      if (ds.cs === "call") { cc.call = true; cc.msgs.push({ from: "s", text: t.cs_call_msg(cc.type), at: Date.now() }); saveConsults(cl); render(true); openModal({ type: "call", media: cc.type, title: t.cs_no(cc.n) }); return; }
      if (ds.cs === "join") { openModal({ type: "call", media: cc.type, title: t.cs_no(cc.n) }); return; }
    }
    if (ds.regrole) { REGROLE = ds.regrole; var keep = { n: $("r-name").value, e: $("r-email").value, p: $("r-phone").value, g: $("r-tg").value }; render(true); $("r-name").value = keep.n; $("r-email").value = keep.e; $("r-phone").value = keep.p; $("r-tg").value = keep.g; return; }
    if (ds.regroleLink) { REGROLE = ds.regroleLink; return; }
    if (ds.act === "svcadd") { accCollect(); ACC.pr.svc.push({ name: "", price: "", online: false }); render(true); var rows = all("#svc-list .s-n"); if (rows.length) rows[rows.length - 1].focus(); return; }
    if (ds.svcdel != null) { accCollect(); ACC.pr.svc.splice(+ds.svcdel, 1); render(true); return; }
    if (ds.act === "wpadd") { accCollect(); ACC.pr.work.push({ t: "x", label: "" }); render(true); var ws = all("#wp-list input"); if (ws.length) ws[ws.length - 1].focus(); return; }
    if (ds.wpdel != null) { accCollect(); ACC.pr.work.splice(+ds.wpdel, 1); render(true); return; }
    if (ds.act === "logout" && BE) { BE.signOut().then(function () { ACC = null; toast(t.logged_out); go("#/"); }); return; }
    if (ds.act === "accdel-yes" && BE) { BE.deleteAccount().then(function () { ACC = null; ACC_DEL = false; toast(t.acc_deleted); go("#/"); }, function () { toast(t.be_err); }); return; }
    if (ds.act === "logout") { store.set(KS, null); ACC = null; toast(t.logged_out); go("#/"); return; }
    if (ds.act === "accdel") { ACC_DEL = true; render(true); return; }
    if (ds.act === "accdel-no") { ACC_DEL = false; render(true); return; }
    if (ds.act === "accdel-yes") { var cu = me(); saveUsers(users().filter(function (x) { return x.id !== cu.id; })); store.set(KS, null); ACC = null; ACC_DEL = false; toast(t.acc_deleted); go("#/"); return; }
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
    if (el.matches("#lang button")) { lang = ds.l; try { localStorage.setItem("shifokor-lang", lang); } catch (x) {} render(true); refreshModal(); return; }
  });

  document.addEventListener("submit", function (e) {
    var id = e.target.id, t = L(); e.preventDefault();
    if (id === "sform") {
      var mode = $("smode").querySelector('[aria-pressed="true"]').dataset.m, raw = $("sq").value.trim(), o = { q: raw, a: $("sa").value, m: mode === "on" ? "on" : "" };
      S.mode = mode; Object.keys(t.sp).forEach(function (k) { if (t.sp[k].toLowerCase() === raw.toLowerCase()) { o.s = k; o.q = ""; } });
      Object.keys(t.sv).forEach(function (k) { if (t.sv[k].toLowerCase() === raw.toLowerCase()) { o.v = k; o.q = ""; } });
      F.max = 0; F.lang = ""; go("#/search?" + qs(o)); return;
    }
    if (id === "form") { submitJoin(); return; }
    if (id === "csform") {
      csCollect(); var C = CS, err = $("cs-err");
      if (C.safe !== "ok") { err.textContent = t.cs_err_safe; return; }
      if (!C.name || !(+C.age >= 0 && C.age !== "") || !okPhone(C.phone) || C.complaint.length < 10) { err.textContent = t.cs_err_fill; return; }
      if (!C.consent) { err.textContent = t.cs_err_consent; return; }
      if (BE) {
        if (!BE.userId()) { err.innerHTML = t.be_login_first + ' <a href="#/login">' + t.go_login + '</a> · <a href="#/register">' + t.go_reg + "</a>"; return; }
        var dsel2 = C.doc ? userById(C.doc) : null, notes = [t.cs_sent].concat(dsel2 ? [t.cs_wanted + ": " + dsel2.name] : []);
        err.textContent = ""; BE.createConsult(C, notes).then(function (cid) { CS = null; toast(t.cs_sent); go("#/consult/" + cid); }, function (x) { err.textContent = t.be_err + " (" + (x.message || "") + ")"; });
        return;
      }
      var cl2 = consults(), cu3 = me(), dsel = C.doc ? userById(C.doc) : null;
      var rec = { id: "c" + Date.now().toString(36), n: 1000 + cl2.length + 1, at: Date.now(), userId: cu3 && cu3.role === "patient" ? cu3.id : "", type: C.type, who: C.who, name: C.name, age: C.age, sex: C.sex, phone: C.phone, region: C.region, district: C.district, complaint: C.complaint, since: C.since, chronic: C.chronic, meds: C.meds, allergy: C.allergy, spec: C.spec, doc: C.doc, status: "new", doctorId: "", doctorName: "", msgs: [{ from: "s", text: t.cs_sent, at: Date.now() }] };
      if (dsel) rec.msgs.push({ from: "s", text: t.cs_wanted + ": " + dsel.name, at: Date.now() });
      cl2.push(rec); saveConsults(cl2); CS = null; toast(t.cs_sent); go("#/consult/" + rec.id); return;
    }
    if (id === "csmsg") {
      var inp3 = $("csmsg-in"), txt = inp3.value.trim(); if (!txt) return;
      if (BE) {
        var me5 = me(), asDoc5 = !!(me5 && me5.role === "doctor"), cid5 = e.target.dataset.id;
        inp3.value = ""; BE.addMessage(cid5, asDoc5 ? "d" : "p", asDoc5 ? me5.name : (consultById(cid5) || {}).name, txt).then(function () { render(true); var l5 = $("cslog"); if (l5) l5.scrollTop = l5.scrollHeight; if ($("csmsg-in")) $("csmsg-in").focus(); }, function () { inp3.value = txt; toast(t.be_err); });
        return;
      }
      var cl3 = consults(), c3 = cl3.filter(function (x) { return x.id === e.target.dataset.id; })[0], du3 = me(), asDoc = du3 && du3.role === "doctor";
      c3.msgs.push({ from: asDoc ? "d" : "p", name: asDoc ? du3.name : c3.name, text: txt, at: Date.now() }); saveConsults(cl3); render(true);
      var lg2 = $("cslog"); if (lg2) lg2.scrollTop = lg2.scrollHeight; if ($("csmsg-in")) $("csmsg-in").focus(); return;
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
      c4.status = "done"; c4.outcome = +o3.value; c4.msgs.push({ from: "s", text: t.cs_finished(t.on_out[+o3.value]), at: Date.now() }); saveConsults(cl4); render(true); return;
    }
    if (id === "docsearch") { go("#/doctors?" + qs({ s: $("hs-s").value, r: $("hs-r").value, q: $("hs-q").value.trim() })); return; }
    if (id === "regform") {
      var rv = function (x) { return $(x).value.trim(); }, name = rv("r-name"), em = rv("r-email").toLowerCase(), ph = rv("r-phone"), tg = rv("r-tg"), pw = $("r-pw").value, pw2 = $("r-pw2").value;
      var er = checkContact(t, name, em, ph, tg) || (pw.length < 6 ? t.e_pw : pw !== pw2 ? t.e_pw2 : "") || (findByContact(em, ph) ? t.e_exists : "");
      if (er) { $("r-err").textContent = er; return; }
      if (BE) {
        if (!em) { $("r-err").textContent = t.be_email_req; return; }
        $("r-err").textContent = "";
        BE.signUp({ role: REGROLE, name: name, email: em, phone: ph ? digits(ph) : "", tg: tg ? "@" + tgName(tg) : "", password: pw }).then(function (r) {
          if (r.needsConfirm) { $("r-err").textContent = t.be_confirm; return; }
          ACC = null; toast(t.welcome(name)); go("#/account");
        }, function (x) { $("r-err").textContent = /registered|exists/i.test(x.message || "") ? t.e_exists : t.be_err + " (" + (x.message || "") + ")"; });
        return;
      }
      var nid = "u" + Date.now().toString(36);
      hashPw(pw, nid).then(function (h) {
        var list = users(); list.push({ id: nid, role: REGROLE, name: name, email: em, phone: ph ? digits(ph) : "", tg: tg ? "@" + tgName(tg) : "", pw: h, created: iso(today0()), updated: iso(today0()), profile: REGROLE === "doctor" ? { spec: "gp", modes: ["in"], langs: ["uz"], work: [], svc: [] } : REGROLE === "clinic" ? { ctype: "clinic", own: "s", svc: [] } : {} });
        saveUsers(list); store.set(KS, nid); ACC = null; toast(t.welcome(name)); go("#/account");
      });
      return;
    }
    if (id === "loginform") {
      if (BE) {
        var lid7 = $("l-id").value.trim().toLowerCase();
        if (!okEmail(lid7)) { $("l-err").textContent = t.be_email_login; return; }
        BE.signIn(lid7, $("l-pw").value).then(function () { ACC = null; var mu7 = me(); toast(t.welcome(mu7 ? mu7.name : "")); go("#/account"); }, function (x) { var m7 = x.message || ""; $("l-err").textContent = /confirm/i.test(m7) ? t.be_confirm : /invalid|credential/i.test(m7) ? t.e_login : t.be_err + " (" + m7 + ")"; });
        return;
      }
      var lid = $("l-id").value.trim(), lpw = $("l-pw").value, isMail = lid.indexOf("@") > 0 && lid.indexOf(".") > 0;
      var cand = users().filter(function (x) { return isMail ? x.email === lid.toLowerCase() : (x.phone && x.phone === digits(lid)); })[0];
      if (!cand) { $("l-err").textContent = t.e_login; return; }
      hashPw(lpw, cand.id).then(function (h) { if (h !== cand.pw) { $("l-err").textContent = t.e_login; return; } store.set(KS, cand.id); ACC = null; toast(t.welcome(cand.name)); go("#/account"); });
      return;
    }
    if (id === "accform") {
      accCollect(); var cu2 = me(), A = ACC, em2 = (A.email || "").toLowerCase();
      var er2 = checkContact(t, A.name, em2, A.phone, A.tg) || (findByContact(em2, A.phone, cu2.id) ? t.e_exists : "");
      if (er2) { $("a-err").textContent = er2; $("a-err").scrollIntoView({ block: "center" }); return; }
      A.pr.svc = A.pr.svc.filter(function (x) { return x.name; }); A.pr.work = A.pr.work.filter(function (w) { return w && w.label; });
      if (BE) { BE.saveProfile({ role: cu2.role, name: A.name, phone: A.phone ? digits(A.phone) : "", tg: A.tg ? "@" + tgName(A.tg) : "", profile: A.pr }).then(function () { ACC = null; toast(t.saved); render(true); }, function (x) { $("a-err").textContent = t.be_err + " (" + (x.message || "") + ")"; }); return; }
      var l4 = users(); l4.forEach(function (x) { if (x.id === cu2.id) { x.name = A.name; x.email = em2; x.phone = A.phone ? digits(A.phone) : ""; x.tg = A.tg ? "@" + tgName(A.tg) : ""; x.profile = A.pr; x.updated = iso(today0()); } });
      saveUsers(l4); ACC = null; toast(t.saved); render(true); return;
    }
    if (id === "dform") {
      var o = { r: $("dr").value, d: $("dd").value, t: $("dt").value, q: $("dq").value.trim(), o: (function () { var b = document.querySelector('#downs [aria-pressed="true"]'), v = b ? b.dataset.ownsel : "s"; return v === "s" ? "" : v; })() };
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
    if (id === "cs-region") { csCollect(); CS.district = ""; render(true); return; }
    if (id === "cs-spec") { csCollect(); CS.doc = ""; render(true); return; }
    if (id === "df-q") { go("#/doctors?" + qs({ s: $("df-s").value, r: $("df-r").value, q: e.target.value.trim() })); return; }
    if (id === "a-region") { accCollect(); ACC.pr.district = ""; render(true); return; }
    if (id === "df-s" || id === "df-r") { go("#/doctors?" + qs({ s: $("df-s").value, r: $("df-r").value, q: $("df-q") ? $("df-q").value.trim() : "" })); return; }
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
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (modal) closeModal(); else if (!$("menu").hidden) { closeMenu(); $("browseBtn").focus(); }
  });
  /* another tab booked or changed something: refresh so a taken slot disappears here too */
  window.addEventListener("storage", function (e) { if (e.key && e.key.indexOf("shifokor-") === 0) rerender(); });
  window.addEventListener("hashchange", function () { cancelAsk = null; render(false); });

  render(false);
  if (BE) BE.on(function () {
    var p = current.path;
    if (p === "/consult" || p === "/register" || p === "/login") { var ab = $("acctBtn"), mu = me(); if (ab) { ab.textContent = mu ? mu.name.split(" ")[0] : L().nav_login; ab.setAttribute("href", mu ? "#/account" : "#/login"); } return; }
    if (p === "/account") accCollect();
    rerender();
    var lg = $("cslog"); if (lg) lg.scrollTop = lg.scrollHeight;
  });
})();
