/* ????? ? Service Worker (hors-ligne) */
const VERSION = "adhkar-v2.7.4";
const MUSHAF_CACHE = "mushaf-pages-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./names-info-1.js",
  "./names-info-2.js",
  "./names-info-3.js",
  "./sheikh-answers.js",
  "./orad-data.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION && !k.startsWith("mushaf-pages-")).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* navigation + assets : cache-first, puis r?seau */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  /* fichiers de polices Google : cache-first */
  if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(VERSION).then((cache) => cache.put(event.request, clone));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  if (event.request.method !== "GET") return;

  /* pages du mushaf (archive.org) : cache-first -> lecture hors-ligne une fois la page vue/t?l?charg?e */
  if (url.hostname === "archive.org" && url.pathname.includes("/yusufmazouz1986_gmail/page/n")) {
    event.respondWith(
      caches.open(MUSHAF_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const res = await fetch(event.request);
          if (res && (res.status === 200 || res.type === "opaque")) {
            cache.put(event.request, res.clone()).catch(() => {});
          }
          return res;
        } catch (e) {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  /* navigations (pages) : network-first -> HTML toujours frais si en ligne,
     fallback cache si hors-ligne. */
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(VERSION).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* autres assets : cache-first, puis r?seau */
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((res) => {
          if (res && res.status === 200 && url.origin === self.location.origin) {
            const clone = res.clone();
            caches.open(VERSION).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

/* clic sur notification -> ouvre l'app */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow("./");
    })
  );
});
