/* Server connection: accounts, profiles, consultation applications, messages and visit requests through /api/app.
   The browser never sees the database connection string; it only holds a sign-in token.
   Without config.api (local preview, or no DATABASE_URL on Vercel) window.SB stays null and the site runs in demo mode.
   Server data is mirrored into the same localStorage keys the app already reads, so the views stay unchanged. */
(function () {
  var C = window.SHIFOKOR_CONFIG || {};
  if (!C.api) { window.SB = null; return; }

  var TK = "shifokor-token", token = null, uid = null, listeners = [], ready = false, busy = null, last = "", notify = { tg: false, sms: false };
  try { token = localStorage.getItem(TK); } catch (e) {}
  var set = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  function setToken(t) { token = t || null; try { if (token) localStorage.setItem(TK, token); else localStorage.removeItem(TK); } catch (e) {} }

  async function call(action, data) {
    var headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    var r = await fetch(C.api, { method: "POST", headers: headers, body: JSON.stringify(Object.assign({ action: action }, data || {})) });
    var j = {};
    try { j = await r.json(); } catch (e) {}
    if (!r.ok) { var err = new Error(j.error || "server"); err.code = j.error || "server"; err.status = r.status; throw err; }
    return j;
  }

  function toUser(u) {
    return { id: u.id, role: u.role, name: u.name, email: u.email || "", phone: u.phone || "", tg: u.tg || "", profile: u.profile || {}, updated: String(u.updated_at || "").slice(0, 10), verified: !!u.verified, tgLinked: !!u.tg_linked, admin: !!u.admin, remote: true };
  }
  function toConsult(c) {
    return {
      id: c.id, n: Number(c.n), at: Date.parse(c.created_at), userId: c.patient_id, type: c.type, who: c.who, name: c.name,
      age: c.age == null ? "" : String(c.age), sex: c.sex || "f", phone: c.phone, region: c.region || "", district: c.district || "",
      complaint: c.complaint, since: String(c.since == null ? 1 : c.since), chronic: c.chronic || "", meds: c.meds || "", allergy: c.allergy || "",
      spec: c.spec || "", doc: c.doc || "", status: c.status, doctorId: c.doctor_id || "", doctorName: c.doctor_name || "", call: !!c.call, outcome: c.outcome,
      msgs: (c.messages || []).map(function (m) { return { from: m.kind, name: m.name || "", text: m.body, at: Date.parse(m.created_at) }; })
    };
  }

  function toAppt(a) {
    return {
      id: a.id, n: Number(a.n), at: Date.parse(a.created_at), userId: a.patient_id, clinicId: a.clinic_id, clinicName: a.clinic_name, fac: a.fac || "",
      day: String(a.day).slice(0, 10), part: a.part, who: a.who, name: a.name, phone: a.phone, spec: a.spec || "", reason: a.reason || "",
      status: a.status, time: a.appt_time || "", note: a.note || ""
    };
  }

  function toReview(r) {
    return { id: r.id, target: r.target_id, stars: r.stars, body: r.body || "", author: r.author || "", hidden: !!r.hidden, reply: r.reply || "", at: Date.parse(r.created_at), kind: r.by_consult ? "c" : "v", consult: r.consult_id || "", appt: r.appt_id || "", mine: !!r.mine };
  }

  function refresh() {
    if (busy) return busy;
    busy = (async function () {
      var j;
      try { j = await call("sync"); }
      catch (e) { if (e.status === 401 && token) { setToken(null); j = await call("sync"); } else throw e; }
      uid = j.me ? j.me.id : null;
      notify = j.notify || notify;
      if (!uid && token) setToken(null);
      set("shifokor-users", (j.users || []).map(toUser));
      set("shifokor-session", uid);
      set("shifokor-consults", (j.consults || []).map(toConsult));
      set("shifokor-appts", (j.appts || []).map(toAppt));
      set("shifokor-reviews", (j.reviews || []).map(toReview));
      ready = true;
      var raw = JSON.stringify(j), changed = raw !== last; last = raw;
      if (changed) listeners.forEach(function (f) { try { f(); } catch (e) { console.warn(e); } });   /* polls that bring nothing new don't redraw the page */
    })().finally(function () { busy = null; });
    return busy;
  }

  /* no live push: check for new applications and replies every few seconds while the page is open */
  setInterval(function () { if (token && document.visibilityState === "visible") refresh().catch(function () {}); }, 6000);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") refresh().catch(function () {}); });
  setTimeout(function () { refresh().catch(function (e) { console.warn("Shifokor server:", e.code || e.message); }); }, 0);

  window.SB = {
    on: function (fn) { listeners.push(fn); },
    ready: function () { return ready; },
    refresh: refresh,
    userId: function () { return uid; },
    signUp: async function (o) { var j = await call("signup", o); setToken(j.token); await refresh(); return { needsConfirm: false }; },
    signIn: async function (id, password) { var j = await call("login", { id: id, password: password }); setToken(j.token); await refresh(); },
    signOut: async function () { try { await call("logout"); } catch (e) {} setToken(null); await refresh(); },
    deleteAccount: async function () { await call("delete_account"); setToken(null); await refresh(); },
    saveProfile: async function (u) { await call("save_profile", u); await refresh(); },
    createConsult: async function (r, notes) { var j = await call("create_consult", { c: r, notes: notes || [] }); await refresh(); return j.id; },
    addMessage: async function (cid, kind, name, body) { await call("message", { id: cid, body: body }); await refresh(); },
    notify: function () { return notify; },
    /* opens the bot in Telegram; pressing Start there links this account */
    tgLink: async function () { return (await call("tg_link")).url; },
    tgUnlink: async function () { await call("tg_unlink"); await refresh(); },
    adminList: function () { return call("admin_list"); },
    adminReview: function (id, hidden) { return call("admin_review", { id: id, hidden: hidden }); },
    /* o: { consult | appt, stars, body, anon } */
    reviewCreate: async function (o) { await call("review_create", o); await refresh(); },
    reviewReply: async function (id, reply) { await call("review_reply", { id: id, reply: reply }); await refresh(); },
    adminVerify: function (id, ok) { return call("admin_verify", { id: id, ok: ok }); },
    adminTgSetup: function () { return call("admin_tg_setup"); },
    createAppt: async function (a) { var j = await call("create_appt", { a: a }); await refresh(); return j.id; },
    /* action: "confirm" (data: day, time, note), "decline" (note) or "cancel" */
    apptAction: async function (id, action, data) { await call("appt_" + action, Object.assign({ id: id }, data || {})); await refresh(); },
    updateConsult: async function (cid, patch, note) {
      var action = patch.status === "accepted" ? "accept" : patch.status === "done" ? "finish" : patch.call ? "call" : "";
      if (!action) return;
      await call(action, { id: cid, outcome: patch.outcome, note: note || "" });
      await refresh();
    }
  };
})();
