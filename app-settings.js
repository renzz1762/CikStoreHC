/* ============================================================
   APP & TEMA — CIK STORE
   Toast kecil + modal "Aplikasi & Tema" (download PWA/APK, ganti tema,
   anti lag). Edit APK_DOWNLOAD_URL di bawah buat isi link APK-nya.
   ============================================================ */
(function () {
    // <-- ISI LINK DOWNLOAD APK DI SINI (MediaFire/Drive/dll). Kosong = tombol
    // tetap bisa dipencet, muncul pesan "belum tersedia".
    var APK_DOWNLOAD_URL = '';

    window.toastGlobal = function (msg) {
        var t = document.createElement('div');
        t.textContent = msg;
        t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:9999;max-width:86%;padding:10px 16px;border-radius:12px;background:var(--ink,#17100f);color:#fff;font:600 13px Inter,system-ui,sans-serif;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.35)';
        document.body.appendChild(t);
        setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 320); }, 2600);
    };

    function renderSettings() {
        var box = document.getElementById('appSettingsBody');
        if (!box) return;
        box.innerHTML =
            (typeof ThemeSwitch !== 'undefined' ? ThemeSwitch.cardHtml() : '') +
            (typeof AntiLag !== 'undefined' ? AntiLag.cardHtml() : '');
    }

    function openDownload(url) {
        url = String(url || '').trim();
        if (!url) { toastGlobal('Link APK belum tersedia, pakai tombol Install (PWA) aja dulu'); return; }
        window.open(url, '_blank', 'noopener');
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderSettings();

        var overlay = document.getElementById('modalAppOverlay');
        var openBtns = [document.getElementById('navAppBtn'), document.getElementById('appNavBtn')];
        var closeBtn = document.getElementById('modalAppClose');
        var apkBtn = document.getElementById('appApkBtn');

        openBtns.forEach(function (openBtn) {
            if (openBtn && overlay) openBtn.addEventListener('click', function () {
                renderSettings(); overlay.classList.add('open');
                document.querySelectorAll('.bn-item').forEach(function (i) { i.classList.remove('active'); });
                if (openBtn.classList.contains('bn-item')) openBtn.classList.add('active');
            });
        });
        if (closeBtn && overlay) closeBtn.addEventListener('click', function () { overlay.classList.remove('open'); });
        if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
        if (apkBtn) apkBtn.addEventListener('click', function () { openDownload(APK_DOWNLOAD_URL); });
    });
})();
