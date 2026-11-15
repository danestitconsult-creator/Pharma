/* PharmaDesk service worker: caches the app shell and Firebase SDK files for offline use.
   Bump VERSION whenever you deploy changes so users get the update. */
const VERSION = "v5";
const CACHE = "pharmadesk-" + VERSION;
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./favicon.ico",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon.svg"];

// Live data and auth calls must never be cached or intercepted.
const LIVE = ["firestore.googleapis.com", "identitytoolkit.googleapis.com", "securetoken.googleapis.com", "firebaseinstallations.googleapis.com"];
// Static third-party files that are safe to cache for offline use.
const STATIC_HOSTS = ["www.gstatic.com", "fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("pharmadesk-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || LIVE.includes(url.hostname)) return;

  // Page loads: network first so deploys show up, fall back to the cached shell offline.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }

  // Own files and static CDN files: serve cached copy immediately, refresh in the background.
  if (url.origin === location.origin || STATIC_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.open(CACHE).then(async cache => {
      const hit = await cache.match(req);
      const fresh = fetch(req).then(res => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || fresh;
    }));
  }
});
