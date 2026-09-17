/* ============================================================
   PENGATURAN TOKO — edit bagian ini sesuai kebutuhan
   (Daftar produk sekarang ada di file product.js)
   ============================================================ */

// 1) Nomor WhatsApp owner (format: kode negara tanpa +, tanpa spasi/strip)
const OWNER_WA = "6283148944126"; // <-- GANTI dengan nomor WhatsApp owner CIK STORE

// 2) Info pembayaran
//    - Taruh gambar QRIS kamu di folder QRISIMG/ lalu tulis nama filenya di bawah
const QRIS_IMAGE = "QRISIMG/qris.png"; // <-- ganti nama file kalau beda
const BANK_INFO = "-------"; // <-- GANTI sesuai rekening kamu

// 3) Profil owner (buat menu Profile di navigasi bawah)
//    - Taruh foto owner di folder OWNERIMG/ lalu tulis nama filenya di OWNER_PHOTO
const OWNER_NAME = "Owner CIK STORE"; // <-- GANTI nama kamu
const OWNER_ROLE = "Penjual Script & Bahan Website"; // <-- GANTI kalau mau
const OWNER_BIO = "Jual script, source code, dan bahan-bahan website siap pakai. Chat aja kalau ada yang mau ditanyain sebelum beli."; // <-- GANTI bio kamu
const OWNER_PHOTO = "OWNERIMG/owner.png"; // <-- ganti nama file kalau beda

// 4) Daftar saluran (dipakai di tombol "Saluran" atas & menu Info bawah)
//    - icon boleh: "channel" atau "tiktok" (sudah disediain ikonnya), atau isi svg sendiri
const SALURAN_LIST = [
  { name: "Saluran WhatsApp", link: "https://whatsapp.com/channel/0029Vb5aoKwEwEjpsmaQol3A", icon: "channel" }, // <-- GANTI link
  { name: "TikTok", link: "https://tiktok.com/@cikhub_", icon: "tiktok" } // <-- GANTI link
];

/* ============================================================
   Logic — tidak perlu diedit
   (PRODUCTS diambil dari product.js, pastikan file itu dimuat
    sebelum main.js di index.html)
   ============================================================ */

function waLink(text){ return `https://wa.me/${OWNER_WA}?text=${encodeURIComponent(text)}`; }

// Ubah "Rp 75.000" jadi versi singkat "75k"
function shortPrice(priceStr){
  const num = parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
  if(!num) return "";
  if(num % 1000 === 0) return `${num / 1000}k`;
  return `${Math.round(num / 1000)}k`;
}

/* ============================================================
   KODE PROMO — dicek lewat Netlify Function (server), bukan
   di file ini. Kode & harga promo diatur di dashboard Netlify:
   Site configuration -> Environment variables.

   1) Promo berlaku ke SEMUA produk:
        KODE_PROMO   (minimal 6 karakter, contoh: 257GF9)
        HARGA_PROMO  (contoh: 10.000)

   2) Promo khusus 1 KATEGORI, contoh kategori "BAHAN MAP":
        CODE_PROMO_BAHAN_MAP
        HARGA_PROMO_BAHAN_MAP

   3) Promo khusus 1 PRODUK aja, pake KEY dari nama produk
      (huruf besar, spasi jadi underscore), contoh produk
      "Overhead Kit":
        CODE_PROMO_OVERHEAD_KIT
        HARGA_PROMO_OVERHEAD_KIT

   Ganti nilainya kapan aja di Netlify, otomatis berubah di sini
   tanpa perlu edit kode.
   ============================================================ */
const PROMO_ENDPOINT = "/api/promo";
const COMINGSOON_ENDPOINT = "/api/comingsoon";

function formatRupiah(value){
  const digits = String(value).replace(/[^0-9]/g, "");
  if(!digits) return "Rp 0";
  return "Rp " + Number(digits).toLocaleString("id-ID");
}

let currentProduct = null;
// sitePromo sekarang berbentuk objek:
// { scope: "all" | "category" | "product", target: null | "bahan_map" | "OVERHEAD_KIT", priceStr }
let sitePromo = null;

// Ubah nama produk jadi KEY buat matching sama env var Netlify.
// Contoh: "Overhead Kit" -> "OVERHEAD_KIT"
function slugifyKey(name){
  return String(name || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Kategori yang DIKECUALIKAN dari promo umum (KODE_PROMO / HARGA_PROMO).
// Produk di kategori ini CUMA bisa kena promo lewat kode promo khusus
// kategori/produk-nya sendiri (CODE_PROMO_<KEY>), gak ikut kena walau
// orang masukin kode promo umum. Tambahin nama kategori lain di sini
// kalau perlu (harus sama persis kayak field "category" di product.js).
const EXCLUDE_FROM_ALL_PROMO = ["bahan_map"];

// Cek promo mana yang berlaku buat 1 produk tertentu. Return string harga
// promo (misal "Rp 10.000") kalau berlaku, atau null kalau nggak.
function getPromoPriceFor(product){
  if(!sitePromo) return null;
  if(sitePromo.scope === "all"){
    if(EXCLUDE_FROM_ALL_PROMO.includes(product.category)) return null;
    return sitePromo.priceStr;
  }
  if(sitePromo.scope === "category" && sitePromo.target === product.category) return sitePromo.priceStr;
  if(sitePromo.scope === "product" && sitePromo.target === (product.usn || slugifyKey(product.name))) return sitePromo.priceStr;
  return null;
}

function effectivePrice(product){
  return getPromoPriceFor(product) || product.price;
}

function updateWaLinks(){
  if(!currentProduct) return;
  const priceStr = effectivePrice(currentProduct);
  const tfMsg = `Halo, saya sudah transfer untuk produk "${currentProduct.name}" (${priceStr}) di CIK STORE. Ini saya kirimkan bukti transfernya (lampirkan screenshot ya).`;
  const askMsg = `Halo, saya mau tanya-tanya dulu soal produk "${currentProduct.name}" di CIK STORE.`;
  document.getElementById("modalTfBtn").href = waLink(tfMsg);
  document.getElementById("modalAskBtn").href = waLink(askMsg);
}

function getActiveFilter(){
  const activeTab = document.querySelector(".tab.active");
  return activeTab ? activeTab.dataset.filter : "semua";
}

["heroChatBtn","ctaChatBtn","footChatBtn"].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.href = waLink("Halo, saya mau tanya-tanya produk di CIK STORE.");
});

const fallbackIcon = `
  <svg class="fallback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M4 4h16v16H4z" stroke-linejoin="round"/>
    <path d="M4 15l4.5-4.5L12 14l3-3 5 5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="8.5" cy="8.5" r="1.4"/>
  </svg>`;

function handleImgError(imgEl){
  imgEl.outerHTML = fallbackIcon;
}

const CATEGORY_LABELS = { script: "Script", bahan: "Bahan", bahan_map: "BAHAN MAP", kit: "KIT", CC: "COLORING HD" };

/* ============================================================
   COMING SOON — status & jam rilis diambil dari Netlify Function,
   yang bacanya dari Environment Variables COMINGSOON_PRODUCT_<KEY>.
   Lihat komentar lengkap soal format di product.js.
   ============================================================ */
let comingSoonMap = {}; // { KEY: Date }
let countdownTimer = null;

const HARI_ID = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const BULAN_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function formatTanggalIndo(date){
  const hari = HARI_ID[date.getDay()];
  const tgl = date.getDate();
  const bulan = BULAN_ID[date.getMonth()];
  const tahun = date.getFullYear();
  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");
  return `${hari}, ${tgl} ${bulan} ${tahun} - ${jam}:${menit} WIB`;
}

function formatCountdown(ms){
  if(ms <= 0) return "00j 00m 00d";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const hariPart = d > 0 ? `${d}h ` : "";
  return `${hariPart}${String(h).padStart(2,"0")}j ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}d`;
}

async function loadComingSoon(){
  try{
    const res = await fetch(COMINGSOON_ENDPOINT);
    const data = await res.json();
    const newMap = {};
    (data.items || []).forEach(item=>{
      const t = new Date(item.releaseAt);
      if(!isNaN(t.getTime())) newMap[item.key] = t;
    });
    comingSoonMap = newMap;
  } catch(err){
    comingSoonMap = {};
  }
  renderProducts(getActiveFilter());
  startCountdownTicker();
}

function getComingSoonInfo(product){
  const key = product.usn || slugifyKey(product.name);
  const releaseAt = comingSoonMap[key];
  if(!releaseAt) return null;
  if(releaseAt.getTime() <= Date.now()) return null; // waktunya udah lewat, anggap normal
  return { releaseAt };
}

function startCountdownTicker(){
  if(countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(()=>{
    let anyFinished = false;
    document.querySelectorAll(".coming-soon-countdown").forEach(el=>{
      const releaseAt = Number(el.dataset.release);
      const diff = releaseAt - Date.now();
      if(diff <= 0){ anyFinished = true; return; }
      el.textContent = formatCountdown(diff);
    });
    if(anyFinished) renderProducts(getActiveFilter());
  }, 1000);
}

function renderProducts(filter){
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";
  const list = filter === "semua" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  list.forEach((p) => {
    const catLabel = CATEGORY_LABELS[p.category] || p.category;
    const media = p.img
      ? `<img src="${p.img}" alt="${p.name}" onerror="handleImgError(this)">`
      : fallbackIcon;

    const comingSoon = getComingSoonInfo(p);
    const promoPrice = getPromoPriceFor(p);

    const card = document.createElement("div");
    card.className = "card" + (comingSoon ? " coming-soon-card" : "");
    card.innerHTML = `
      <div class="card-media">
        <span class="badge">${catLabel}</span>
        ${p.isNew && !comingSoon ? '<span class="new-badge">NEW</span>' : ''}
        ${media}
      </div>
      <div class="card-body">
        <h3>
          ${p.name}
          <svg class="verified-badge" viewBox="0 0 24 24" fill="#1478d4"><path d="M12 2l2.4 1.3 2.7-.4 1.3 2.4 2.4 1.3-.4 2.7 1.3 2.4L20.4 13l.4 2.7-2.4 1.3-1.3 2.4-2.7-.4L12 20.4l-2.4-1.3-2.7.4-1.3-2.4-2.4-1.3.4-2.7L2.2 11l1.3-2.4-.4-2.7 2.4-1.3L6.8 2.2l2.7.4z"/><path d="M9 12.2l2 2 4-4.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </h3>
        <p>${p.desc}</p>
        <div class="card-foot">
          <div class="price-wrap">
            ${promoPrice ? `
              <span class="price struck">${p.price}</span>
              <span class="price-promo-card">${promoPrice}</span>
              <span class="promo-badge-card">PROMO</span>
            ` : `
              <span class="price">${p.price}</span>
              <span class="price-alt">atau ${shortPrice(p.price)}</span>
            `}
          </div>
          <button class="buy-btn" data-idx="${PRODUCTS.indexOf(p)}" ${comingSoon ? "disabled" : ""}>${comingSoon ? "Segera" : "Beli"}</button>
        </div>
      </div>
      ${comingSoon ? `
        <div class="coming-soon-overlay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          <span class="coming-soon-label">Coming Soon</span>
          <span class="coming-soon-name">${p.name}</span>
          <span class="coming-soon-date">Rilis: ${formatTanggalIndo(comingSoon.releaseAt)}</span>
          <span class="coming-soon-countdown" data-release="${comingSoon.releaseAt.getTime()}">${formatCountdown(comingSoon.releaseAt.getTime() - Date.now())}</span>
        </div>
      ` : ""}
    `;
    grid.appendChild(card);
  });

  document.getElementById("statProduk").textContent = PRODUCTS.length;

  grid.querySelectorAll(".buy-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(btn.disabled) return;
      openBuyModal(PRODUCTS[btn.dataset.idx]);
    });
  });
}

/* MODAL BELI (QRIS + Transfer) */
const buyOverlay = document.getElementById("modalOverlay");
function openBuyModal(product){
  currentProduct = product;

  document.getElementById("modalProductName").textContent = product.name;

  const priceBox = document.getElementById("modalProductPrice");
  const promoPrice = getPromoPriceFor(product);
  if(promoPrice){
    priceBox.innerHTML = `
      <span class="price-original struck">${product.price}</span>
      <span class="price-promo">${promoPrice}</span>
      <span class="promo-tag">PROMO</span>
      <span class="price-alt">atau ${shortPrice(promoPrice)}</span>
    `;
  } else {
    priceBox.innerHTML = `${product.price} <span class="price-alt">atau ${shortPrice(product.price)}</span>`;
  }

  const featureBlock = document.getElementById("featureBlock");
  const featureList = document.getElementById("featureList");
  if(product.features && product.features.length){
    featureList.innerHTML = product.features.map(f => `
      <li>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        <span>${f}</span>
      </li>`).join("");
    featureBlock.style.display = "";
  } else {
    featureBlock.style.display = "none";
  }

  const qrisBox = document.getElementById("qrisBox");
  qrisBox.innerHTML = `<img src="${QRIS_IMAGE}" alt="QRIS CIK STORE" onerror="this.parentElement.innerHTML='<span class=&quot;placeholder-text&quot;>Gambar QRIS belum ketemu.<br>Taruh file QRIS di folder QRISIMG/ ya.</span>'">`;

  document.getElementById("bankInfoText").textContent = BANK_INFO;

  updateWaLinks();

  buyOverlay.classList.add("open");
}
document.getElementById("modalClose").addEventListener("click", ()=> buyOverlay.classList.remove("open"));
buyOverlay.addEventListener("click", (e)=>{ if(e.target === buyOverlay) buyOverlay.classList.remove("open"); });

/* KODE PROMO — section di luar, di bawah katalog produk */
const promoBtn = document.getElementById("promoBtn");
const promoInput = document.getElementById("promoInput");
const promoMsg = document.getElementById("promoMsg");

promoBtn.addEventListener("click", async ()=>{
  const code = promoInput.value.trim();

  if(code.length < 6){
    promoMsg.textContent = "Kode promo minimal 6 karakter.";
    promoMsg.className = "promo-msg error";
    return;
  }

  const originalLabel = promoBtn.textContent;
  promoBtn.disabled = true;
  promoBtn.textContent = "Mengecek...";
  promoMsg.textContent = "";
  promoMsg.className = "promo-msg";

  try{
    const res = await fetch(PROMO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await res.json();

    if(data.valid){
      sitePromo = { scope: data.scope, target: data.target, priceStr: formatRupiah(data.promoPrice) };

      let scopeMsg = "Harga promo otomatis kepasang di semua produk.";
      if(data.scope === "category"){
        const label = CATEGORY_LABELS[data.target] || data.target;
        scopeMsg = `Harga promo otomatis kepasang khusus produk kategori "${label.toUpperCase()}".`;
      } else if(data.scope === "product"){
        const matched = PRODUCTS.find(p => slugifyKey(p.name) === data.target);
        scopeMsg = `Harga promo otomatis kepasang khusus produk "${matched ? matched.name : data.target}".`;
      }

      promoMsg.textContent = "Kode promo berhasil dipakai! " + scopeMsg;
      promoMsg.className = "promo-msg success";
    } else {
      sitePromo = null;
      promoMsg.textContent = "Kode promo salah atau sudah tidak berlaku.";
      promoMsg.className = "promo-msg error";
    }

    renderProducts(getActiveFilter());
    if(buyOverlay.classList.contains("open") && currentProduct){
      openBuyModal(currentProduct);
    }
  } catch(err){
    promoMsg.textContent = "Gagal menghubungi server, coba lagi.";
    promoMsg.className = "promo-msg error";
  } finally {
    promoBtn.disabled = false;
    promoBtn.textContent = originalLabel;
  }
});

/* FILTER TABS */
document.querySelectorAll(".tab").forEach(tab=>{
  tab.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");
    renderProducts(tab.dataset.filter);
  });
});

document.getElementById("searchBtn").addEventListener("click", ()=>{
  document.getElementById("katalog").scrollIntoView({behavior:"smooth"});
});

/* IKON SALURAN */
const icons = {
  channel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a2 2 0 002 2h1l4 4V5L6 9H5a2 2 0 00-2 2z"/><path d="M16 8a5 5 0 010 8"/><path d="M19 5a9 9 0 010 14"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.4 2.2 1.8 3.7 4 4v3c-1.5 0-2.9-.4-4-1.2v6.4a5.7 5.7 0 11-5.7-5.7c.3 0 .6 0 .9.1v3.1a2.6 2.6 0 102 2.5V3h2.8z"/></svg>`
};

function renderSaluran(container){
  container.innerHTML = SALURAN_LIST.map(s => `
    <a href="${s.link}" target="_blank" rel="noopener">
      <span class="saluran-icon">${icons[s.icon] || icons.channel}</span>
      ${s.name}
    </a>
  `).join("");
}
renderSaluran(document.getElementById("infoPopover"));
renderSaluran(document.getElementById("saluranPopover"));

/* TOMBOL SALURAN (header atas) */
const saluranPopover = document.getElementById("saluranPopover");
const navSaluranBtn = document.getElementById("navSaluranBtn");
navSaluranBtn.addEventListener("click", (e)=>{
  e.stopPropagation();
  saluranPopover.classList.toggle("open");
});
document.addEventListener("click", (e)=>{
  if(!saluranPopover.contains(e.target) && e.target !== navSaluranBtn && !navSaluranBtn.contains(e.target)){
    saluranPopover.classList.remove("open");
  }
});

/* PROFILE MODAL */
const profileOverlay = document.getElementById("profileOverlay");
document.getElementById("profileName").textContent = OWNER_NAME;
document.getElementById("profileRole").textContent = OWNER_ROLE;
document.getElementById("profileBio").textContent = OWNER_BIO;
document.getElementById("profilePhoto").src = OWNER_PHOTO;
document.getElementById("profileChatBtn").href = waLink("Halo, saya mau tanya-tanya soal CIK STORE.");

document.getElementById("profileNavBtn").addEventListener("click", ()=> profileOverlay.classList.add("open"));
document.getElementById("profileClose").addEventListener("click", ()=> profileOverlay.classList.remove("open"));
profileOverlay.addEventListener("click", (e)=>{ if(e.target === profileOverlay) profileOverlay.classList.remove("open"); });

/* BOTTOM NAV — status aktif */
document.querySelectorAll(".bn-item[data-target]").forEach(item=>{
  item.addEventListener("click", ()=>{
    infoPopoverEl.classList.remove("open");
    document.querySelectorAll(".bn-item").forEach(i=>i.classList.remove("active"));
    item.classList.add("active");
  });
});

/* INFO NAV (bawah) */
const infoPopoverEl = document.getElementById("infoPopover");
const infoNavBtn = document.getElementById("infoNavBtn");
infoNavBtn.addEventListener("click", (e)=>{
  e.stopPropagation();
  infoPopoverEl.classList.toggle("open");
  document.querySelectorAll(".bn-item").forEach(i=>i.classList.remove("active"));
  infoNavBtn.classList.add("active");
});
document.addEventListener("click", (e)=>{
  if(!infoPopoverEl.contains(e.target) && e.target !== infoNavBtn && !infoNavBtn.contains(e.target)){
    infoPopoverEl.classList.remove("open");
  }
});

renderProducts("semua");
loadComingSoon();
setInterval(loadComingSoon, 5 * 60 * 1000); // refresh status coming soon tiap 5 menit