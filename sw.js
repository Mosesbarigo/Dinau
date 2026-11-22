/* Old Man Limited - Loan Management PWA service worker.
   NETWORK-FIRST, self-healing. Bump CACHE on every deploy so the
   installed app always picks up the newest page instead of a stale copy. */
var CACHE = 'oldman-loan-v' + '20261111q';

self.addEventListener('install', function (e) {
  // take over right away so a new deploy is not stuck "waiting"
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k !== CACHE; })
                          .map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener('message', function (e) {
  if (e && e.data === 'skipWaiting') { self.skipWaiting(); }
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') { return; }

  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  // Never intercept Firebase / Google cloud traffic (must hit the live network).
  if (/(firebaseio|firebasedatabase|firebaseapp|googleapis|gstatic|identitytoolkit|cloudfunctions|google-analytics|firebaseinstallations)\./.test(url.hostname)) {
    return;
  }
  // Only manage our own same-origin assets; let any CDN go straight to network.
  if (url.origin !== self.location.origin) { return; }

  e.respondWith((async function () {
    try {
      var net = await fetch(req, { cache: 'no-store' });
      try {
        var cache = await caches.open(CACHE);
        cache.put(req, net.clone());
      } catch (err) {}
      return net;
    } catch (err) {
      var cached = await caches.match(req);
      if (cached) { return cached; }
      throw err;
    }
  })());
});
