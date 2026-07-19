const CACHE = "opdurak-v2";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => clients.claim())
));
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  // Seiten-Navigation IMMER frisch vom Netz holen (mit ETag-Revalidierung),
  // damit Updates sofort ankommen; Cache nur als Offline-Fallback.
  const isNav = e.request.mode === "navigate" || e.request.destination === "document";
  const req = isNav ? new Request(e.request.url, { cache: "no-cache" }) : e.request;
  e.respondWith(
    fetch(req).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request))
  );
});
