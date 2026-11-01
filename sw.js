// CIK STORE service worker: PWA offline shell + Web Push
const CACHE = 'cik-store';
const SHELL = ['/', '/index.html', '/topup.html', '/style.css', '/topup.css', '/main.js', '/product.js', '/topup.js', '/pwa.js',
  '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/badge-96.png', '/LOGOIMG/logo.png', '/theme-extra.css', '/theme-switch.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => fetch(u, { cache: 'reload' }).then((r) => r.ok && c.put(u, r)).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    const old = ks.filter((k) => k !== CACHE);
    await Promise.all(old.map((k) => caches.delete(k)));
    await self.clients.claim();
    // kalau ini update dari versi lama (cache lama ada), reload tab yang lagi kebuka biar langsung kebaca versi baru
    if (old.length) {
      const list = await self.clients.matchAll({ type: 'window' });
      list.forEach((c) => { try { c.navigate(c.url); } catch (err) {} });
    }
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) return;
  if (url.origin !== self.location.origin) return;          // font/CDN/dll biar browser yang urus
  if (url.pathname.startsWith('/api/')) return;             // API selalu langsung ke server

  // Halaman: network first, kalau offline pakai cache
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  // JS/CSS: network first (biar update langsung kebaca)
  if (/\.(js|css|json|webmanifest)$/.test(url.pathname)) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }))
    );
    return;
  }

  // Gambar dll: network first (cek ke server dulu, kalau gambar diganti langsung ikut ganti), offline baru pakai cache
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }))
  );
});

// ---------- WEB PUSH (.notifstore) ----------
self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (err) { d = { body: event.data ? event.data.text() : '' }; }
  const o = self.location.origin;
  event.waitUntil(self.registration.showNotification(d.title || 'Notifikasi dari CIK STORE', {
    body: d.body || '',
    icon: d.icon || (o + '/icon-192.png'),
    badge: d.badge || (o + '/badge-96.png'),   // badge = siluet transparan (bukan kotak putih)
    tag: d.tag || ('cik-' + Date.now()),
    renotify: true,
    vibrate: [120, 60, 120],
    timestamp: d.ts || Date.now(),
    data: { url: d.url || '/' }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.startsWith(self.location.origin) && 'focus' in c) {
          return c.focus().then((f) => (f && 'navigate' in f && target !== self.location.origin + '/') ? f.navigate(target) : f);
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
