/* Shifokor's service worker: the site opens from the home screen like an app and still shows itself without
   internet. Pages come from the network first (so a new version shows at once) and from the cache when offline;
   files with a version in their address (?v=...) and images come from the cache, refreshed in the background.
   The server's answers (/api/) are never cached: they are personal and must be current. */
var CACHE = "shifokor-v1", MAX = 160;
self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(["/", "/icon.svg", "/icon-192.png"]); }).catch(function () {}));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
function trim(c) { c.keys().then(function (keys) { if (keys.length > MAX) keys.slice(0, keys.length - MAX).forEach(function (k) { c.delete(k); }); }); }
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.indexOf("/api/") === 0 || url.pathname === "/config.js" || url.pathname === "/sw.js") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (r) { if (url.pathname === "/" && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put("/", copy); }); } return r; })
      .catch(function () { return caches.match("/").then(function (r) { return r || new Response("Internet yo‘q / No connection", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }); }); }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req).then(function (hit) {
      var net = fetch(req).then(function (r) { if (r.ok) { c.put(req, r.clone()); trim(c); } return r; });
      return hit ? (net.catch(function () {}), hit) : net;
    });
  }));
});
