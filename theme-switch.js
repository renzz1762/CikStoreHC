/* ============================================================
   GANTI TEMA — CIK STORE
   Tema tersedia (tema Klasik/krem sudah DIHAPUS):
     glass   = kaca gelap transparan (DEFAULT)
     comic   = tampilan comic navy + kuning/merah/cyan
   Pilihan disimpan di localStorage key "cik_theme".
   Kerjanya: set atribut html[data-theme], dibaca sama theme-extra.css.
   ============================================================ */
(function () {
    var KEY = 'cik_theme';
    var DEFAULT = 'glass';
    var THEMES = {
        glass:   { label: 'Glass',   desc: 'Kaca gelap transparan', icon: '🌙' },
        comic:   { label: 'Comic',   desc: 'Navy + kuning, border tebal ala komik', icon: '⚡' }
    };
    var ORDER = ['glass', 'comic'];

    function read() { try { var v = localStorage.getItem(KEY); if (v && THEMES[v]) return v; } catch (e) {} return DEFAULT; }
    function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

    function apply(name) {
        if (!THEMES[name]) name = DEFAULT;
        document.documentElement.setAttribute('data-theme', name);
        return name;
    }

    var current = apply(read());

    function set(name) {
        if (!THEMES[name]) return;
        current = apply(name);
        write(current);
        refreshUi();
        try { if (typeof toastGlobal === 'function') toastGlobal('Tema: ' + THEMES[current].label); } catch (e) {}
    }

    function refreshUi() {
        var opts = document.querySelectorAll('[data-theme-opt]');
        for (var i = 0; i < opts.length; i++) {
            var on = opts[i].getAttribute('data-theme-opt') === current;
            opts[i].classList.toggle('active', on);
        }
        var lbl = document.getElementById('theme-current-label');
        if (lbl) lbl.textContent = THEMES[current].label;
    }

    function cardHtml() {
        var rows = ORDER.map(function (n) {
            var t = THEMES[n], on = n === current;
            return '<button type="button" data-theme-opt="' + n + '" onclick="ThemeSwitch.set(\'' + n + '\')" class="opt-row' + (on ? ' active' : '') + '">' +
                '<span style="font-size:16px">' + t.icon + '</span>' +
                '<span><strong>' + t.label + '</strong><span>' + t.desc + '</span></span>' +
                '<span class="opt-check">✔</span>' +
                '</button>';
        }).join('');
        return '<div class="opt-card">' +
            '<h4>🎨 Ganti Tema <span id="theme-current-label" class="opt-badge">' + THEMES[current].label + '</span></h4>' +
            rows + '</div>';
    }

    window.ThemeSwitch = { get: function () { return current; }, set: set, cardHtml: cardHtml, themes: THEMES };
})();
