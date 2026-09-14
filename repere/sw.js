/* Repère — cache hors connexion.
   Réseau d'abord (donc jamais de version périmée quand ça marche),
   cache en secours quand le réseau manque. */
const CACHE = "repere-v1";
const BASE = ["./", "./index.html", "./app.css"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;                       // on ne touche pas aux envois
  if (new URL(e.request.url).origin !== location.origin) return; // ni à l'API, ni aux tuiles
  e.respondWith(
    fetch(e.request)
      .then(r => { const copie = r.clone();
                   caches.open(CACHE).then(c => c.put(e.request, copie)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
