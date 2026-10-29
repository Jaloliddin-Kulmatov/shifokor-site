/* Calls in an online consultation: audio or video straight between the patient's and the doctor's browsers (WebRTC,
   encrypted by the browsers). The server only passes the set-up messages; nothing is recorded.
   The doctor always makes the offer. Each side says "hello" when it opens the call: the doctor answers a patient's hello
   with an offer, the patient answers a doctor's hello with its own hello. So whoever comes first waits, and either side
   can drop out and come back.
   Without a server (demo mode) the set-up messages go between tabs of this browser, so a call can be tried in two tabs.
   The call screen lives outside #app, so the page redrawing underneath never touches the video. */
(function () {
  var ICONS = {
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    micoff: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M4 4l16 16"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3z"/>',
    videooff: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3zM3 3l18 18"/>',
    flip: '<path d="M4 8h3.5l2-3h5l2 3H20v11H4z"/><path d="M9 13a3 3 0 015-2.2M15 13a3 3 0 01-5 2.2M14 9.5v1.5h-1.5M10 16.5V15h1.5"/>',
    end: '<path d="M3 14.5c5-5 13-5 18 0l-2.5 2.5-3.5-2v-2.5a12 12 0 00-6 0V15l-3.5 2z"/>',
    chat: '<path d="M4 5h16v11H8l-4 4z"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>'
  };
  var ic = function (n) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + "</svg>"; };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var rid = function () { return Math.random().toString(36).slice(2, 10); };
  var mmss = function (sec) { var m = Math.floor(sec / 60), x = sec % 60; return (m < 10 ? "0" : "") + m + ":" + (x < 10 ? "0" : "") + x; };
  var warn = function (e) { console.warn("call", e && (e.name || e.message || e)); };
  var cur = null;

  /* set-up messages through the server: checked every second until connected, then every few seconds for a hang-up */
  function serverLink(cid) {
    var SB = window.SB, after = 0, stop = false, timer = null, wait = 1000;
    return {
      start: function (onSig) {
        return SB.signals(cid, -1).then(function (j) {
          after = j.last || 0;
          var poll = function () {
            if (stop) return;
            SB.signals(cid, after).then(function (r) {
              (r.signals || []).forEach(function (x) { after = Math.max(after, x.id); if (!stop) onSig(x.kind, x.body); });
            }, function (e) { if (e.code === "closed" || e.code === "forbidden" || e.code === "not_found" || e.code === "auth") onSig("closed"); })
              .then(function () { if (!stop) timer = setTimeout(poll, wait); });
          };
          timer = setTimeout(poll, 300);
          return j.ice || [];
        });
      },
      send: function (kind, body, keep) { return SB.signal(cid, kind, body ? JSON.stringify(body) : "", keep); },
      pace: function (ms) { wait = ms; },
      stop: function () { stop = true; clearTimeout(timer); }
    };
  }
  /* demo mode: between tabs of this browser */
  function demoLink(cid, role) {
    var ch = window.BroadcastChannel ? new BroadcastChannel("shifokor-call-" + cid) : null;
    return {
      start: function (onSig) { if (ch) ch.onmessage = function (e) { var m = e.data || {}; if (m.from !== role) onSig(m.kind, m.body); }; return Promise.resolve([]); },
      send: function (kind, body) { if (ch) ch.postMessage({ from: role, kind: kind, body: body ? JSON.stringify(body) : "" }); return Promise.resolve({}); },
      pace: function () {},
      stop: function () { if (ch) ch.close(); }
    };
  }

  /* o: { cid, role: "d" | "p", media: "audio" | "video", title, peer, t: copy, done(seconds) } */
  function open(o) {
    if (cur) { cur.el.classList.remove("mini"); return; }
    var t = o.t, video = o.media === "video";
    var s = { pc: null, dc: null, gen: "", local: null, ice: [], link: null, started: 0, on: false, closed: false, mic: true, cam: video, facing: "user", cams: 0,
      making: false, offerAt: 0, offerGot: 0, fails: 0, failT: null, tick: null, retry: null, wake: null, them: { mic: true, cam: true } };

    var el = document.createElement("div");
    el.className = "call" + (video ? " is-video" : "");
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "call-h");
    el.innerHTML =
      '<div class="call-stage"><video class="call-them" playsinline autoplay></video>' +
        '<div class="call-face"><span class="call-av">' + ic("user") + '</span><b class="call-peer">' + esc(o.peer || "") + "</b></div>" +
        '<span class="call-flag" hidden></span>' +
        '<video class="call-me" playsinline autoplay muted></video>' +
        '<button class="call-tap" type="button" hidden>' + esc(t.cl_tap) + "</button></div>" +
      '<div class="call-top"><div><h2 id="call-h">' + esc(t.cs_types[video ? "video" : "audio"][0]) + " · " + esc(o.title) + '</h2><p class="call-st" aria-live="polite"></p></div><span class="call-time nums"></span></div>' +
      '<div class="call-bar">' +
        '<button type="button" class="cb" data-c="mic"></button>' +
        (video ? '<button type="button" class="cb" data-c="cam"></button><button type="button" class="cb" data-c="flip" hidden title="' + esc(t.cl_flip) + '" aria-label="' + esc(t.cl_flip) + '">' + ic("flip") + "</button>" : "") +
        '<button type="button" class="cb" data-c="mini" title="' + esc(t.cl_mini) + '" aria-label="' + esc(t.cl_mini) + '">' + ic("chat") + "</button>" +
        '<button type="button" class="cb end" data-c="end" title="' + esc(t.cl_end) + '" aria-label="' + esc(t.cl_end) + '">' + ic("end") + "</button>" +
        '<button type="button" class="cb" data-c="full" title="' + esc(t.cl_full) + '" aria-label="' + esc(t.cl_full) + '">' + ic("expand") + "</button></div>" +
      '<p class="call-note">' + esc(t.cl_note) + (o.demo ? " " + esc(t.cl_demo) : "") + "</p>";
    document.body.appendChild(el);
    var q = function (c) { return el.querySelector(c); };
    var them = q(".call-them"), mine = q(".call-me"), stEl = q(".call-st"), timeEl = q(".call-time"), flag = q(".call-flag"), tap = q(".call-tap");
    cur = { el: el, end: end };

    function status(txt, kind) { stEl.textContent = txt || ""; el.dataset.st = kind || ""; }
    function btns() {
      var a = s.local && s.local.getAudioTracks()[0], v = s.local && s.local.getVideoTracks()[0];
      var bm = q('[data-c="mic"]'), bc = q('[data-c="cam"]'), bf = q('[data-c="flip"]');
      bm.innerHTML = ic(s.mic ? "mic" : "micoff"); bm.setAttribute("aria-pressed", String(!s.mic)); bm.title = s.mic ? t.cl_mic_off : t.cl_mic_on; bm.setAttribute("aria-label", bm.title); bm.disabled = !a;
      if (bc) { bc.innerHTML = ic(s.cam ? "video" : "videooff"); bc.setAttribute("aria-pressed", String(!s.cam)); bc.title = s.cam ? t.cl_cam_off : t.cl_cam_on; bc.setAttribute("aria-label", bc.title); bc.disabled = !v; }
      if (bf) bf.hidden = !(v && s.cam && s.cams > 1);
      el.classList.toggle("me-off", !(v && s.cam));
    }
    /* the other side's picture shows only while their camera sends something */
    function view() {
      var showV = video && them.videoWidth > 0 && s.them.cam !== false;
      el.classList.toggle("them-on", showV);
      var f = s.them.mic === false ? t.cl_their_mic : video && s.on && s.them.cam === false ? t.cl_their_cam : "";
      flag.hidden = !f; flag.textContent = f;
    }
    them.addEventListener("resize", view); them.addEventListener("loadedmetadata", view);
    function play() { them.muted = false; var p = them.play(); if (p && p.catch) p.catch(function () { tap.hidden = false; }); }
    tap.addEventListener("click", function () { tap.hidden = true; play(); });
    them.addEventListener("playing", function () { tap.hidden = true; });

    function tellState() { if (s.dc && s.dc.readyState === "open") try { s.dc.send(JSON.stringify({ mic: s.mic, cam: s.cam })); } catch (e) {} }
    function ctl(dc) {
      s.dc = dc;
      dc.onopen = tellState;
      dc.onmessage = function (e) { try { var m = JSON.parse(e.data); s.them = { mic: m.mic !== false, cam: m.cam !== false }; view(); } catch (x) {} };
    }

    function getMedia() {
      var a = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
      var v = { facingMode: s.facing, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } };
      return navigator.mediaDevices.getUserMedia({ audio: a, video: video ? v : false }).catch(function (e) {
        if (!video || !e || e.name === "NotAllowedError" || e.name === "SecurityError") throw e;
        s.cam = false; s.noCam = true;   /* no camera, or it's busy in another app: the call goes on with voice */
        return navigator.mediaDevices.getUserMedia({ audio: a });
      });
    }

    function closePc() {
      if (s.pc) { try { s.pc.close(); } catch (e) {} }
      s.pc = null; s.dc = null; s.making = false;
      clearTimeout(s.failT);
    }
    function newPc() {
      closePc();
      var pc = new RTCPeerConnection({ iceServers: s.ice });
      s.pc = pc;
      pc.ontrack = function (e) { if (s.pc !== pc) return; them.srcObject = e.streams[0] || new MediaStream([e.track]); e.track.onunmute = view; e.track.onmute = view; play(); };
      var mapIce = { checking: "connecting", connected: "connected", completed: "connected", disconnected: "disconnected", failed: "failed" };
      pc.onconnectionstatechange = function () { if (s.pc === pc) onState(pc.connectionState); };
      pc.oniceconnectionstatechange = function () { if (s.pc === pc && pc.connectionState === undefined) onState(mapIce[pc.iceConnectionState] || ""); };
      return pc;
    }
    /* the whole offer or answer goes in one message, with the network addresses found within 3 seconds */
    function gathered(pc) {
      return new Promise(function (res) {
        if (pc.iceGatheringState === "complete") return res();
        var tm, chk = function () { if (pc.iceGatheringState === "complete") done(); };
        var done = function () { pc.removeEventListener("icegatheringstatechange", chk); clearTimeout(tm); res(); };
        pc.addEventListener("icegatheringstatechange", chk);
        tm = setTimeout(done, 3000);
      });
    }
    function offer(force) {
      if (s.closed || !s.local || s.making) return;
      if (!force && s.pc && s.pc.signalingState === "have-local-offer" && Date.now() - s.offerAt < 5000) return;
      if (!s.on) status(t.cl_connecting, "wait");
      var pc = newPc(), g = s.gen = rid();
      s.making = true;
      s.local.getTracks().forEach(function (tr) { pc.addTrack(tr, s.local); });
      if (video && !s.local.getVideoTracks().length) pc.addTransceiver("video", { direction: "recvonly" });
      ctl(pc.createDataChannel("ctl"));
      pc.createOffer().then(function (d) { return pc.setLocalDescription(d); }).then(function () { return gathered(pc); }).then(function () {
        if (s.pc !== pc || s.closed) return;
        s.offerAt = Date.now();
        return s.link.send("offer", { g: g, sdp: { type: "offer", sdp: pc.localDescription.sdp } });
      }).catch(warn).then(function () { if (s.pc === pc) s.making = false; });
    }
    function answer(m) {
      if (!m || !m.g || !m.sdp || s.closed || !s.local) return;
      s.offerGot = Date.now(); if (!s.on) status(t.cl_connecting, "wait");
      var pc = newPc(); s.gen = m.g;
      pc.ondatachannel = function (e) { if (s.pc === pc) ctl(e.channel); };
      pc.setRemoteDescription(m.sdp).then(function () {
        s.local.getTracks().forEach(function (tr) { pc.addTrack(tr, s.local); });
        return pc.createAnswer();
      }).then(function (d) { return pc.setLocalDescription(d); }).then(function () { return gathered(pc); }).then(function () {
        if (s.pc !== pc || s.closed) return;
        return s.link.send("answer", { g: m.g, sdp: { type: "answer", sdp: pc.localDescription.sdp } });
      }).catch(warn);
    }
    function onSig(kind, body) {
      if (s.closed) return;
      if (kind === "closed") { status(t.cl_closed, "err"); stopAll(); return; }
      var m = null; try { m = body ? JSON.parse(body) : {}; } catch (e) { return; }
      if (kind === "hello") { if (o.role === "d") offer(false); else s.link.send("hello").catch(warn); }
      else if (kind === "offer" && o.role === "p") answer(m);
      else if (kind === "answer" && o.role === "d" && m.g === s.gen && s.pc && s.pc.signalingState === "have-local-offer") s.pc.setRemoteDescription(m.sdp).catch(warn);
      else if (kind === "bye") { closePc(); s.on = false; el.classList.remove("them-on"); flag.hidden = true; status(t.cl_left, "wait"); s.link.pace(1000); }
    }
    function onState(st) {
      if (st === "connected") {
        clearTimeout(s.failT); s.fails = 0; s.on = true; status(t.cl_on, "on"); s.link.pace(3000);
        if (!s.started) { s.started = Date.now(); s.tick = setInterval(function () { timeEl.textContent = mmss(Math.round((Date.now() - s.started) / 1000)); }, 1000); }
        lightVideo(); tellState(); awake();
      } else if (st === "disconnected") {
        status(video ? t.cl_weak_v : t.cl_weak, "wait");
        clearTimeout(s.failT); s.failT = setTimeout(recover, 6000);
      } else if (st === "failed") recover();
    }
    /* a lost connection: the doctor sends a fresh offer, the patient asks for one */
    function recover() {
      if (s.closed) return;
      s.on = false; s.fails++; s.link.pace(1000);
      status(s.fails >= 3 ? t.cl_fail : video ? t.cl_weak_v : t.cl_weak, s.fails >= 3 ? "err" : "wait");
      if (o.role === "d") offer(true); else { s.offerGot = 0; s.link.send("hello").catch(warn); }
    }
    /* video at most ~600 kbit/s: enough for a doctor to see a rash, light on mobile data */
    function lightVideo() {
      if (!s.pc || !s.pc.getSenders) return;
      s.pc.getSenders().forEach(function (sn) {
        if (!sn.track || sn.track.kind !== "video" || !sn.getParameters) return;
        try { var p = sn.getParameters(); if (!p.encodings || !p.encodings.length) p.encodings = [{}]; p.encodings[0].maxBitrate = 600000; sn.setParameters(p).catch(function () {}); } catch (e) {}
      });
    }
    function awake() { try { if (!s.wake && navigator.wakeLock) navigator.wakeLock.request("screen").then(function (w) { s.wake = w; w.addEventListener("release", function () { s.wake = null; }); }, function () {}); } catch (e) {} }
    function onVis() { if (document.visibilityState === "visible" && s.on) awake(); }
    document.addEventListener("visibilitychange", onVis);

    function stopAll() {
      clearInterval(s.tick); clearInterval(s.retry); clearTimeout(s.failT);
      if (s.link) s.link.stop();
      closePc();
      if (s.local) s.local.getTracks().forEach(function (tr) { tr.stop(); });
      if (s.wake) { try { s.wake.release(); } catch (e) {} }
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onHide);
      el.classList.add("over");
    }
    function end() {
      if (s.closed) return;
      s.closed = true;
      if (s.link && s.local) s.link.send("bye", null, true).catch(function () {});
      stopAll();
      el.remove(); cur = null;
      if (o.done) o.done(s.started ? Math.round((Date.now() - s.started) / 1000) : 0);
    }
    function onHide() { end(); }
    window.addEventListener("pagehide", onHide);

    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-c]"); if (!b) return;
      var c = b.dataset.c, a = s.local && s.local.getAudioTracks()[0], v = s.local && s.local.getVideoTracks()[0];
      if (c === "end") end();
      else if (c === "retry") { b.remove(); start(); }
      else if (c === "mini") { el.classList.add("mini"); q('[data-c="full"]').focus(); }
      else if (c === "full") { el.classList.remove("mini"); q('[data-c="end"]').focus(); }
      else if (c === "mic" && a) { s.mic = !s.mic; a.enabled = s.mic; btns(); tellState(); }
      else if (c === "cam" && v) { s.cam = !s.cam; v.enabled = s.cam; btns(); tellState(); }
      else if (c === "flip" && v) flip(v);
    });
    /* front and back camera on a phone, so the patient can show a rash or a wound. Many phones can't open both
       cameras at once, so the current one stops first; if the other one won't open, the first comes back. */
    function flip(v) {
      var next = s.facing === "user" ? "environment" : "user", on = v.enabled;
      var sn = s.pc && s.pc.getSenders().filter(function (x) { return x.track === v; })[0];
      var cam = function (f) { return navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: f }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } } }); };
      var use = function (ns, f) {
        var nv = ns.getVideoTracks()[0]; nv.enabled = on;
        s.local.removeTrack(v); s.local.addTrack(nv); s.facing = f;
        mine.srcObject = s.local; el.classList.toggle("back", f === "environment"); btns();
        return sn ? sn.replaceTrack(nv) : null;
      };
      v.stop();
      cam(next).then(function (ns) { return use(ns, next); }, function (e) { warn(e); return cam(s.facing).then(function (ns) { return use(ns, s.facing); }); }).catch(warn);
    }

    function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.RTCPeerConnection || !window.isSecureContext) { status(t.cl_unsup, "err"); btns(); return; }
      status(t.cl_asking, "wait");
      getMedia().then(function (stream) {
        if (s.closed) { stream.getTracks().forEach(function (tr) { tr.stop(); }); return; }
        s.local = stream; mine.srcObject = stream; btns();
        if (s.noCam) status(t.cl_nocam, "wait");
        if (video && navigator.mediaDevices.enumerateDevices) navigator.mediaDevices.enumerateDevices().then(function (ds) { s.cams = ds.filter(function (d) { return d.kind === "videoinput"; }).length; btns(); }, function () {});
        s.link = o.demo ? demoLink(o.cid, o.role) : serverLink(o.cid);
        return s.link.start(onSig).then(function (ice) {
          s.ice = ice;
          if (s.closed) return;
          if (!s.noCam) status(o.role === "d" ? t.cl_wait_doc : t.cl_wait_pat, "wait");
          return s.link.send("hello").then(function () {
            /* a hello that got lost, or a doctor busy with an earlier offer: ask again while nothing is connected */
            if (o.role === "p") s.retry = setInterval(function () { if (!s.on && !s.closed && Date.now() - s.offerGot > 8000) s.link.send("hello").catch(warn); }, 8000);
          });
        });
      }).catch(function (e) {
        warn(e);
        if (s.closed) return;
        if (s.local) { s.local.getTracks().forEach(function (tr) { tr.stop(); }); s.local = null; }
        if (s.link) { s.link.stop(); s.link = null; }
        var name = e && e.name;
        status(name === "NotAllowedError" || name === "SecurityError" ? (video ? t.cl_denied_v : t.cl_denied) : name === "NotFoundError" ? t.cl_nodev : e && e.code === "closed" ? t.cl_closed : t.cl_fail, "err");
        btns();
        if (!(e && e.code === "closed") && !q('[data-c="retry"]')) q(".call-bar").insertAdjacentHTML("afterbegin", '<button type="button" class="btn sm call-retry" data-c="retry">' + esc(t.cl_retry) + "</button>");
      });
    }
    btns();
    q('[data-c="end"]').focus();
    start();
  }

  window.ShifokorCall = { open: open, active: function () { return !!cur; } };
})();
