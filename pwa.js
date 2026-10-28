/* CIK STORE PWA: daftar service worker, tombol Install App, notifikasi push (.notifstore) */
(function () {
  var SNOOZE = 'cik_notif_snooze';
  var isOn = false, deferred = null;

  var standalone = function () {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  };
  var supported = function () { return ('serviceWorker' in navigator) && ('PushManager' in window) && ('Notification' in window); };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }

  function u8(b64) {
    var pad = '='.repeat((4 - b64.length % 4) % 4);
    var raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  function sameKey(sub, k) {
    try {
      var cur = sub.options && sub.options.applicationServerKey; if (!cur) return true;
      var a = new Uint8Array(cur); if (a.length !== k.length) return false;
      for (var i = 0; i < a.length; i++) if (a[i] !== k[i]) return false;
      return true;
    } catch (e) { return true; }
  }
  function toast(msg) {
    var t = document.createElement('div'); t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:9999;max-width:86%;padding:10px 16px;border-radius:12px;background:#17100f;color:#fff;font:600 13px Inter,system-ui,sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.35)';
    document.body.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 320); }, 2600);
  }

  async function getKey() {
    var r = await fetch('/api/notif-key', { cache: 'no-store' });
    var j = await r.json();
    if (!j || !j.publicKey) throw new Error((j && j.message) || 'Server notifikasi belum siap');
    return u8(j.publicKey);
  }
  async function subscribe() {
    var reg = await navigator.serviceWorker.ready;
    var key = await getKey();
    var sub = await reg.pushManager.getSubscription();
    if (sub && !sameKey(sub, key)) { try { await sub.unsubscribe(); } catch (e) {} sub = null; }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    var r = await fetch('/api/notif-subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub.toJSON() }) });
    var j = await r.json().catch(function () { return {}; });
    if (!j.status) throw new Error(j.message || 'Gagal menyimpan langganan');
    isOn = true; return sub;
  }
  async function enable() {
    if (!supported()) return { ok: false, reason: 'unsupported' };
    if (Notification.permission === 'denied') return { ok: false, reason: 'denied' };
    var perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (perm !== 'granted') return { ok: false, reason: perm };
    try { await subscribe(); return { ok: true }; } catch (e) { return { ok: false, reason: 'error', message: e.message }; }
  }
  async function disable() {
    try {
      var reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
      if (sub) {
        var ep = sub.endpoint; await sub.unsubscribe();
        fetch('/api/notif-subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unsubscribe', endpoint: ep }) }).catch(function () {});
      }
    } catch (e) {}
    isOn = false;
  }

  // ---- tombol di modal Profile ----
  function labels() {
    if (Notification.permission === 'denied') return 'Notifikasi Diblokir';
    return isOn ? 'Notifikasi Aktif ✓' : 'Aktifkan Notifikasi';
  }
  function refresh() {
    var b = document.getElementById('cikNotifBtn'); if (b) b.textContent = supported() ? labels() : 'Notifikasi tidak didukung';
    var i = document.getElementById('cikInstallBtn'); if (i) i.style.display = (standalone() || (!deferred && !isIOS())) ? 'none' : '';
  }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  async function toggleNotif() {
    if (!supported()) { toast(isIOS() ? 'iPhone: Install dulu ke Layar Utama, baru bisa notifikasi' : 'Browser ini belum mendukung notifikasi'); return; }
    if (isOn) { await disable(); refresh(); toast('Notifikasi dimatikan'); return; }
    if (Notification.permission === 'denied') { toast('Izinkan notifikasi lewat setelan situs di browser'); return; }
    var r = await enable(); refresh();
    if (r.ok) toast('Notifikasi aktif ✔');
    else if (r.reason === 'error') toast('Gagal: ' + (r.message || 'coba lagi nanti'));
    else toast('Izin notifikasi tidak diberikan');
  }
  async function install() {
    if (deferred) { deferred.prompt(); try { await deferred.userChoice; } catch (e) {} deferred = null; refresh(); return; }
    if (isIOS()) toast('Tekan tombol Share lalu "Add to Home Screen"');
    else toast('Buka menu browser lalu pilih "Install app" / "Tambahkan ke layar utama"');
  }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; refresh(); });
  window.addEventListener('appinstalled', function () { deferred = null; refresh(); toast('CIK STORE terpasang ✔'); });

  // ---- kartu ajakan di bawah layar ----
  var snoozed = function () { try { return !!sessionStorage.getItem(SNOOZE); } catch (e) { return false; } };
  var snooze = function () { try { sessionStorage.setItem(SNOOZE, '1'); } catch (e) {} };
  function showPrompt() {
    if (document.getElementById('cikNotifPrompt')) return;
    var el = document.createElement('div'); el.id = 'cikNotifPrompt';
    el.style.cssText = 'position:fixed;left:12px;right:12px;bottom:84px;z-index:9000;max-width:420px;margin:0 auto;padding:14px;border-radius:16px;background:#fff;color:#17100f;border:2px solid #17100f;box-shadow:4px 4px 0 #17100f;font-family:Inter,system-ui,sans-serif';
    el.innerHTML = '<div style="font-weight:800;font-size:14px;margin-bottom:3px">🔔 Aktifkan notifikasi?</div>' +
      '<div style="font-size:12px;color:#6c5450;line-height:1.45;margin-bottom:10px">Dapat info produk baru, promo & update CIK STORE langsung di HP, walau web ditutup.</div>' +
      '<div style="display:flex;gap:8px"><button id="cikNpYes" type="button" style="flex:1;padding:9px;border-radius:10px;border:2px solid #17100f;background:#ff1f3d;color:#fff;font-weight:800;font-size:12px">Aktifkan</button>' +
      '<button id="cikNpNo" type="button" style="flex:1;padding:9px;border-radius:10px;border:2px solid #17100f;background:#fff;color:#17100f;font-weight:700;font-size:12px">Nanti</button></div>';
    document.body.appendChild(el);
    document.getElementById('cikNpNo').onclick = function () { snooze(); el.remove(); };
    document.getElementById('cikNpYes').onclick = async function () {
      el.remove(); var r = await enable(); refresh();
      if (r.ok) toast('Notifikasi aktif ✔');
      else if (r.reason === 'error') toast('Gagal: ' + (r.message || 'coba lagi nanti'));
      else if (r.reason === 'denied') toast('Notifikasi diblokir, izinkan lewat setelan situs');
    };
  }

  async function init() {
    var nb = document.getElementById('cikNotifBtn'), ib = document.getElementById('cikInstallBtn');
    if (nb) nb.addEventListener('click', toggleNotif);
    if (ib) ib.addEventListener('click', install);
    if (!supported()) { refresh(); return; }
    try {
      var reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
      isOn = !!sub && Notification.permission === 'granted';
    } catch (e) {}
    refresh();
    if (Notification.permission === 'granted') { subscribe().then(refresh).catch(function () {}); return; }
    if (Notification.permission === 'default' && !snoozed()) setTimeout(function () { if (Notification.permission === 'default' && !snoozed()) showPrompt(); }, 7000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.CIKPwa = { enable: enable, disable: disable, install: install, toggle: toggleNotif };
})();
