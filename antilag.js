/* ============================================================
   ANTI LAG — CIK STORE
   Mode: auto (default) | on | off   (disimpan di localStorage "cik_antilag")
   - auto: aktif otomatis di HP RAM kecil / CPU sedikit / hemat data /
     reduced-motion, atau kalau FPS terukur rendah setelah web kebuka.
   - Saat aktif: blur kaca, shadow blur, animasi & transisi berat dimatikan,
     animasi dijeda saat tab di background.
   - Semua gambar otomatis lazy-load + decode async (aktif di semua mode).
   ============================================================ */
(function () {
    var KEY = 'cik_antilag', root = document.documentElement;
    var LABELS = { auto: ['Otomatis', 'Deteksi HP & FPS, hidup sendiri kalau perlu', '🪄'],
                   on:   ['Aktif', 'Efek berat dimatikan, paling ringan', '⚡'],
                   off:  ['Mati', 'Tampilan penuh dengan semua efek', '✨'] };
    var ORDER = ['auto', 'on', 'off'];
    function read() { try { var v = localStorage.getItem(KEY); if (LABELS[v]) return v; } catch (e) {} return 'auto'; }
    function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
    var mode = read(), slowFps = false;

    function weakDevice() {
        var n = navigator, c = n.connection || {};
        try {
            if (n.deviceMemory && n.deviceMemory <= 4) return true;
            if (n.hardwareConcurrency && n.hardwareConcurrency <= 4) return true;
            if (c.saveData || /(^|-)2g|3g/.test(c.effectiveType || '')) return true;
            if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
        } catch (e) {}
        return false;
    }
    function isOn() { return mode === 'on' || (mode === 'auto' && (slowFps || weakDevice())); }
    function apply() {
        var on = isOn();
        root.classList.toggle('perf-lite', on);
        root.setAttribute('data-antilag', on ? 'on' : 'off');
        window.CIK_LITE = on;
    }

    // ---- CSS ----
    var st = document.createElement('style');
    st.id = 'antilag-css';
    st.textContent =
    'html.perf-lite *,html.perf-lite *::before,html.perf-lite *::after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}' +
    'html.perf-lite{scroll-behavior:auto!important}' +
    'html.perf-lite .card,html.perf-lite .modal,html.perf-lite .section-head,html.perf-lite header,html.perf-lite .pay-block{box-shadow:none!important}' +
    'html.perf-lite .card:hover{transform:none!important}' +
    'html.perf-lite *{transition-duration:.12s!important;animation-duration:.12s!important}' +
    'html.hc-hidden *,html.hc-hidden *::before,html.hc-hidden *::after{animation-play-state:paused!important}';
    (document.head || root).appendChild(st);

    apply();

    document.addEventListener('visibilitychange', function () {
        root.classList.toggle('hc-hidden', document.hidden);
    });

    // ---- gambar: lazy + async decode (semua mode) ----
    function tune(img) {
        if (img.nodeType !== 1 || img.tagName !== 'IMG') return;
        if (!img.hasAttribute('loading')) img.loading = 'lazy';
        if (!img.hasAttribute('decoding')) img.decoding = 'async';
    }
    function tuneTree(node) {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'IMG') { tune(node); return; }
        var imgs = node.getElementsByTagName ? node.getElementsByTagName('img') : [];
        for (var i = 0; i < imgs.length; i++) tune(imgs[i]);
    }
    function startObserver() {
        try {
            tuneTree(document.body);
            new MutationObserver(function (list) {
                for (var i = 0; i < list.length; i++) {
                    var a = list[i].addedNodes;
                    for (var j = 0; j < a.length; j++) tuneTree(a[j]);
                }
            }).observe(document.body, { childList: true, subtree: true });
        } catch (e) {}
    }
    if (document.body) startObserver(); else document.addEventListener('DOMContentLoaded', startObserver);

    // ---- ukur FPS (mode auto saja): kalau < 40 fps -> aktifkan lite ----
    function probe() {
        if (mode !== 'auto' || slowFps || document.hidden) return;
        var frames = 0, t0 = 0, dead = false;
        function tick(t) {
            if (dead) return;
            if (!t0) t0 = t;
            frames++;
            if (t - t0 < 2500) { requestAnimationFrame(tick); return; }
            var fps = frames * 1000 / (t - t0);
            if (fps < 40 && !document.hidden) { slowFps = true; apply(); refreshUi(); }
        }
        document.addEventListener('visibilitychange', function once() { dead = true; document.removeEventListener('visibilitychange', once); });
        requestAnimationFrame(tick);
    }
    window.addEventListener('load', function () { setTimeout(probe, 3500); });

    function statusText() { return isOn() ? 'AKTIF' : 'MATI'; }
    function refreshUi() {
        var opts = document.querySelectorAll('[data-antilag-opt]');
        for (var i = 0; i < opts.length; i++) {
            opts[i].classList.toggle('active', opts[i].getAttribute('data-antilag-opt') === mode);
        }
        var lbl = document.getElementById('antilag-status');
        if (lbl) lbl.textContent = statusText();
    }
    function set(m) {
        if (!LABELS[m]) return;
        mode = m; write(m); if (m !== 'auto') slowFps = false;
        apply(); refreshUi();
        if (m === 'auto') probe();
        try { if (typeof toastGlobal === 'function') toastGlobal('Anti Lag: ' + LABELS[m][0]); } catch (e) {}
    }
    function cardHtml() {
        var rows = ORDER.map(function (k) {
            var L = LABELS[k], on = k === mode;
            return '<button type="button" data-antilag-opt="' + k + '" onclick="AntiLag.set(\'' + k + '\')" class="opt-row' + (on ? ' active' : '') + '">' +
                '<span style="font-size:16px">' + L[2] + '</span>' +
                '<span><strong>' + L[0] + '</strong><span>' + L[1] + '</span></span>' +
                '<span class="opt-check">✔</span></button>';
        }).join('');
        return '<div class="opt-card">' +
            '<h4>⚙️ Anti Lag <span id="antilag-status" class="opt-badge">' + statusText() + '</span></h4>' + rows +
            '<p class="opt-hint">Buat HP kentang: matiin shadow &amp; animasi berat biar scroll dan buka web lebih lancar.</p></div>';
    }
    window.AntiLag = { set: set, get: function () { return mode; }, active: isOn, cardHtml: cardHtml };
})();
