/* Supabase connection: accounts, profiles, consultation applications and live messages.
   Without a project URL and public key in config.js, window.SB stays null and the site runs in demo mode.
   Remote data is mirrored into the same localStorage keys the app already reads, so the views stay unchanged. */
(function () {
  var C = window.SHIFOKOR_CONFIG || {};
  if (!C.supabaseUrl || !C.supabaseKey || !window.supabase || !window.supabase.createClient) { window.SB = null; return; }

  var sb = window.supabase.createClient(C.supabaseUrl, C.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });
  var set = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var uid = null, session = null, listeners = [], chan = null, ready = false, busy = null;

  function toUser(p) {
    return { id: p.id, role: p.role, name: p.name, email: "", phone: p.phone || "", tg: p.tg || "", profile: p.profile || {}, updated: String(p.updated_at || "").slice(0, 10), remote: true };
  }
  function toConsult(c) {
    var msgs = (c.consult_messages || []).slice().sort(function (a, b) { return a.id - b.id; });
    return {
      id: c.id, n: c.n, at: Date.parse(c.created_at), userId: c.patient_id, type: c.type, who: c.who, name: c.name,
      age: c.age == null ? "" : String(c.age), sex: c.sex || "f", phone: c.phone, region: c.region || "", district: c.district || "",
      complaint: c.complaint, since: String(c.since == null ? 1 : c.since), chronic: c.chronic || "", meds: c.meds || "", allergy: c.allergy || "",
      spec: c.spec || "", doc: c.doc || "", status: c.status, doctorId: c.doctor_id || "", doctorName: c.doctor_name || "", call: !!c.call, outcome: c.outcome,
      msgs: msgs.map(function (m) { return { from: m.kind, name: m.name || "", text: m.body, at: Date.parse(m.created_at) }; })
    };
  }

  function refresh() {
    if (busy) return busy;
    busy = (async function () {
      var s = (await sb.auth.getSession()).data.session;
      session = s; uid = s ? s.user.id : null;
      var pr = await sb.from("profiles").select("id, role, name, phone, tg, profile, updated_at").order("created_at");
      if (pr.error) throw pr.error;
      var list = (pr.data || []).map(toUser);
      if (s) {
        var mine = list.filter(function (u) { return u.id === uid; })[0];
        if (mine) { mine.email = s.user.email || ""; var md = s.user.user_metadata || {}; if (!mine.phone && md.phone) mine.phone = md.phone; }
      }
      set("shifokor-users", list);
      set("shifokor-session", uid);
      if (uid) {
        var cs = await sb.from("consults").select("*, consult_messages(*)").order("created_at", { ascending: false });
        if (cs.error) throw cs.error;
        set("shifokor-consults", (cs.data || []).map(toConsult));
      } else set("shifokor-consults", []);
      ready = true;
      listeners.forEach(function (f) { try { f(); } catch (e) { console.warn(e); } });
    })().finally(function () { busy = null; });
    return busy;
  }

  function subscribe() {
    if (chan) { sb.removeChannel(chan); chan = null; }
    if (!uid) return;
    chan = sb.channel("shifokor-live-" + uid)
      .on("postgres_changes", { event: "*", schema: "public", table: "consults" }, function () { refresh().catch(console.warn); })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "consult_messages" }, function () { refresh().catch(console.warn); })
      .subscribe();
  }

  sb.auth.onAuthStateChange(function (ev) {
    if (ev === "INITIAL_SESSION" || ev === "SIGNED_IN" || ev === "SIGNED_OUT") setTimeout(function () { refresh().then(subscribe).catch(console.warn); }, 0);
  });

  function check(res) { if (res.error) throw res.error; return res.data; }

  window.SB = {
    on: function (fn) { listeners.push(fn); },
    ready: function () { return ready; },
    refresh: refresh,
    userId: function () { return uid; },

    signUp: async function (o) {
      var res = await sb.auth.signUp({ email: o.email, password: o.password, options: { data: { role: o.role, name: o.name, phone: o.phone || "", tg: o.tg || "" } } });
      check(res);
      if (!res.data.session) return { needsConfirm: true };
      await refresh(); return { needsConfirm: false };
    },
    signIn: async function (email, password) {
      check(await sb.auth.signInWithPassword({ email: email, password: password }));
      await refresh();
    },
    signOut: async function () { await sb.auth.signOut(); await refresh(); },
    deleteAccount: async function () { check(await sb.rpc("delete_my_account")); await sb.auth.signOut(); await refresh(); },

    saveProfile: async function (u) {
      var row = { name: u.name, phone: u.role === "doctor" ? null : (u.phone || null), tg: u.tg || null, profile: u.profile || {} };
      check(await sb.from("profiles").update(row).eq("id", uid));
      if (u.role === "doctor") check(await sb.auth.updateUser({ data: { phone: u.phone || "", tg: u.tg || "", name: u.name } }));
      await refresh();
    },

    createConsult: async function (r, notes) {
      var row = {
        type: r.type, who: r.who, name: r.name, age: r.age === "" ? null : +r.age, sex: r.sex, phone: r.phone,
        region: r.region || null, district: r.district || null, complaint: r.complaint, since: +r.since,
        chronic: r.chronic || null, meds: r.meds || null, allergy: r.allergy || null, spec: r.spec || null, doc: r.doc || null
      };
      var c = check(await sb.from("consults").insert(row).select("id, n").single());
      var msgs = (notes || []).map(function (t) { return { consult_id: c.id, kind: "s", body: t }; });
      if (msgs.length) check(await sb.from("consult_messages").insert(msgs));
      await refresh();
      return c.id;
    },
    addMessage: async function (cid, kind, name, body) {
      check(await sb.from("consult_messages").insert({ consult_id: cid, kind: kind, name: name || null, body: body }));
      await refresh();
    },
    updateConsult: async function (cid, patch, note) {
      check(await sb.from("consults").update(patch).eq("id", cid));
      if (note) check(await sb.from("consult_messages").insert({ consult_id: cid, kind: "s", body: note }));
      await refresh();
    }
  };
})();
