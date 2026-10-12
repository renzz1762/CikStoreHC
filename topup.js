/* ============================================================
   HALAMAN TOP UP ROBUX VIA USERNAME — CIK STORE (topup.html)
   - TOPUP_COMING_SOON = true  -> tombol beli dikunci (masih coming soon).
     Ganti false kalau udah siap jualan -> tombol aktif, muncul QRIS/transfer
     + tombol kirim bukti ke WhatsApp (username & paket ikut terkirim).
   - TOPUP_LIST: rp = harga dalam RIBU rupiah (2 = Rp 2.000), robux = jumlah Robux
   - Logo Robux asli: taruh file di LOGOIMG/robux.png (otomatis nimpa ikon bawaan)
   ============================================================ */
const TOPUP_COMING_SOON = true;

// Samain dengan yang ada di main.js
const OWNER_WA   = "6283148944126";
const QRIS_IMAGE = "QRISIMG/qris.png";
const BANK_INFO  = "-------";

const TOPUP_LIST = [
  { rp: 2, robux: 10 },
  { rp: 4, robux: 20 },
  { rp: 5, robux: 25 },
  { rp: 6, robux: 30 },
  { rp: 7, robux: 35 },
  { rp: 8, robux: 40 },
  { rp: 9, robux: 45 },
  { rp: 10, robux: 55 },
  { rp: 11, robux: 60 },
  { rp: 12, robux: 65 },
  { rp: 13, robux: 70 },
  { rp: 14, robux: 75 },
  { rp: 15, robux: 80 },
  { rp: 17, robux: 90 },
  { rp: 18, robux: 95 },
  { rp: 19, robux: 100 },
  { rp: 20, robux: 110 },
  { rp: 25, robux: 135 },
  { rp: 28, robux: 150 },
  { rp: 30, robux: 160 },
  { rp: 38, robux: 200 },
  { rp: 40, robux: 210 },
  { rp: 45, robux: 235 },
  { rp: 50, robux: 265 },
  { rp: 57, robux: 300 },
  { rp: 76, robux: 400 },
  { rp: 80, robux: 420 },
  { rp: 90, robux: 475 },
  { rp: 95, robux: 500 },
  { rp: 100, robux: 525 }
];
// "rp" = harga dalam RIBU rupiah (2 = Rp 2.000), "robux" = jumlah Robux yang didapat.
// Badge HEMAT otomatis buat paket dengan Robux-per-rupiah paling banyak.
const BEST = Math.max(...TOPUP_LIST.map(t => t.robux / t.rp));
const SHOW_FIRST = 8;                         // jumlah paket tampil awal

(function(){
  const $ = (id) => document.getElementById(id);
  const rp = (ribu) => "Rp " + (ribu * 1000).toLocaleString("id-ID");
  const nf = (n) => n.toLocaleString("id-ID");
  const waLink = (t) => `https://wa.me/${OWNER_WA}?text=${encodeURIComponent(t)}`;

  // Logo Robux (koin hexagon emas). File LOGOIMG/robux.png nimpa kalau ada.
  const LOGO = `<span class="rbx"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 1.8l12.6 7.3v14.6L16 31 3.4 23.7V9.1z" fill="#ffb400" stroke="#17100f" stroke-width="2" stroke-linejoin="round"/>
    <path d="M16 6.4l8.6 5v9.2l-8.6 5-8.6-5v-9.2z" fill="#fff3c4" stroke="#17100f" stroke-width="2" stroke-linejoin="round"/>
    <path d="M16 11.2l4.4 2.5v4.6L16 20.8l-4.4-2.5v-4.6z" fill="#17100f"/>
  </svg><img src="LOGOIMG/robux.png" alt="" onerror="this.remove()"></span>`;

  document.querySelectorAll("[data-logo]").forEach(el => el.innerHTML = LOGO);

  let selected = null;
  let expanded = false;
  const listEl = $("tpPkgs"), moreBtn = $("tpMore");
  const userEl = $("tpUser"), hintEl = $("tpHint");
  const buyBtn = $("tpBuy"), soonEl = $("tpSoon");

  function renderList(){
    const items = expanded ? TOPUP_LIST : TOPUP_LIST.slice(0, SHOW_FIRST);
    listEl.innerHTML = items.map(t => {
      const i = TOPUP_LIST.indexOf(t);
      return `<button type="button" class="tp-pkg${t.robux / t.rp === BEST ? " hot" : ""}${selected === i ? " sel" : ""}" data-i="${i}">
        ${LOGO}<div><b>${nf(t.robux)} Robux</b><span class="p">${rp(t.rp)}</span></div></button>`;
    }).join("");
    moreBtn.textContent = expanded ? "Lihat lebih sedikit" : `Lihat semua paket (${TOPUP_LIST.length})`;
  }

  // Aturan username Roblox: 3-20 karakter, huruf/angka/underscore (maks 1), underscore gak boleh di awal/akhir
  function checkUser(v){
    if(!v) return { ok:false, msg:"" };
    if(v.length < 3 || v.length > 20) return { ok:false, msg:"Username harus 3–20 karakter." };
    if(!/^[A-Za-z0-9_]+$/.test(v)) return { ok:false, msg:"Cuma boleh huruf, angka, dan underscore (_)." };
    if(v.startsWith("_") || v.endsWith("_")) return { ok:false, msg:"Underscore gak boleh di awal atau akhir." };
    if((v.match(/_/g) || []).length > 1) return { ok:false, msg:"Underscore maksimal satu." };
    return { ok:true, msg:"" };
  }

  function update(){
    const u = userEl.value.trim();
    const c = checkUser(u);
    userEl.classList.toggle("bad", !!u && !c.ok);
    hintEl.classList.toggle("bad", !!u && !c.ok);
    hintEl.textContent = u && !c.ok ? c.msg : (u ? "Pastikan username-nya bener ya, bukan display name." : "Username, bukan display name & bukan password.");

    const t = selected !== null ? TOPUP_LIST[selected] : null;
    $("sumUser").textContent = c.ok ? u : "Belum diisi";
    $("sumPkg").textContent  = t ? `${nf(t.robux)} Robux` : "Belum dipilih";
    $("sumTotal").textContent = t ? rp(t.rp) : "Rp 0";

    const ready = c.ok && t;
    if(TOPUP_COMING_SOON){
      buyBtn.disabled = false;
      buyBtn.setAttribute("aria-disabled","true");
      buyBtn.textContent = "Segera hadir";
    } else {
      buyBtn.removeAttribute("aria-disabled");
      buyBtn.disabled = !ready;
      buyBtn.textContent = ready ? "Lanjut bayar" : (c.ok ? "Pilih paket dulu" : "Isi username dulu");
    }
  }

  listEl.addEventListener("click", (e) => {
    const b = e.target.closest(".tp-pkg"); if(!b) return;
    selected = Number(b.dataset.i);
    renderList(); update();
    if(window.innerWidth <= 860) $("tpSum").scrollIntoView({ behavior:"smooth", block:"nearest" });
  });
  moreBtn.addEventListener("click", () => { expanded = !expanded; renderList(); });
  userEl.addEventListener("input", update);

  // tombol "Segera hadir" ditekan -> catatan goyang
  $("tpBuyWrap").addEventListener("click", () => {
    if(!TOPUP_COMING_SOON) return;
    soonEl.classList.remove("shake"); void soonEl.offsetWidth; soonEl.classList.add("shake");
  });

  buyBtn.addEventListener("click", () => {
    if(TOPUP_COMING_SOON || selected === null) return;
    const u = userEl.value.trim(), t = TOPUP_LIST[selected];
    $("qrisBox").innerHTML = `<img src="${QRIS_IMAGE}" alt="QRIS CIK STORE" onerror="this.parentElement.textContent='Gambar QRIS belum ada.'">`;
    $("bankTxt").textContent = BANK_INFO;
    $("payTotal").textContent = rp(t.rp);
    $("payBtn").href = waLink(`Halo CIK STORE, saya sudah transfer.\n\nTop Up Robux via Username\nUsername Roblox: ${u}\nPaket: ${nf(t.robux)} Robux\nTotal: ${rp(t.rp)}\n\nIni bukti transfernya:`);
    $("tpPay").classList.add("open");
    $("tpPay").scrollIntoView({ behavior:"smooth", block:"start" });
  });

  $("tpAsk").href = waLink("Halo CIK STORE, saya mau tanya soal Top Up Robux via username.");

  if(TOPUP_COMING_SOON){
    $("tpBadge").style.display = "";
  } else {
    $("tpBadge").style.display = "none";
    soonEl.style.display = "none";
  }
  // stats banner
  $("stMin").textContent = rp(Math.min(...TOPUP_LIST.map(t => t.rp)));
  $("stCount").textContent = TOPUP_LIST.length;
  $("stMax").textContent = nf(Math.max(...TOPUP_LIST.map(t => t.robux)));

  // Tombol Saluran di header (sama kayak halaman utama)
  const SALURAN_LIST = [
    { name: "Saluran WhatsApp", link: "https://whatsapp.com/channel/0029Vb5aoKwEwEjpsmaQol3A", icon: "channel" },
    { name: "TikTok", link: "https://www.tiktok.com/@cikhub_01", icon: "tiktok" }
  ];
  const ICONS = {
    channel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a2 2 0 002 2h1l4 4V5L6 9H5a2 2 0 00-2 2z"/><path d="M16 8a5 5 0 010 8"/><path d="M19 5a9 9 0 010 14"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.4 2.2 1.8 3.7 4 4v3c-1.5 0-2.9-.4-4-1.2v6.4a5.7 5.7 0 11-5.7-5.7c.3 0 .6 0 .9.1v3.1a2.6 2.6 0 102 2.5V3h2.8z"/></svg>`
  };
  const pop = $("saluranPopover"), sBtn = $("navSaluranBtn");
  pop.innerHTML = SALURAN_LIST.map(x => `<a href="${x.link}" target="_blank" rel="noopener"><span class="saluran-icon">${ICONS[x.icon] || ICONS.channel}</span>${x.name}</a>`).join("");
  sBtn.addEventListener("click", (e) => { e.stopPropagation(); pop.classList.toggle("open"); });
  document.addEventListener("click", (e) => { if(!pop.contains(e.target) && !sBtn.contains(e.target)) pop.classList.remove("open"); });

  renderList(); update();
})();
