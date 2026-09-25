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

// 5) Daftar Website & Aplikasi (buat menu "Website & App" di navigasi atas & bawah)
//    - Sekarang dipindah ke file PROMOSI/websiteApp.js (variabel WEBSITE_APP_LIST),
//      pastikan file itu dimuat SEBELUM main.js di index.html.

// 6) Komentar/chat admin (buat menu "Chat" di navigasi atas & bawah)
//    - Daftar chat-nya sekarang ada di file terpisah chatown.js (ADMIN_CHAT_LIST),
//      pastikan file itu dimuat SEBELUM main.js di index.html.

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
// activePromos = daftar SEMUA kode promo yang lagi aktif sekaligus
// (bukan cuma 1 kayak dulu). Tiap item:
// { code, scope: "all" | "category" | "product", target: null | "bahan_map" | "OVERHEAD_KIT", priceStr }
let activePromos = [];

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

// Cek promo mana yang berlaku buat 1 produk tertentu, dari SEMUA kode promo
// yang lagi aktif (activePromos bisa isi banyak kode sekaligus). Kalau ada
// lebih dari 1 promo yang cocok ke produk yang sama, yang paling spesifik
// menang: khusus produk > khusus kategori > umum (semua produk).
// Return string harga promo (misal "Rp 10.000") kalau ada yang berlaku,
// atau null kalau nggak ada.
function getPromoPriceFor(product){
  if(!activePromos.length) return null;

  const productKey = product.usn || slugifyKey(product.name);
  let productMatch = null;
  let categoryMatch = null;
  let allMatch = null;

  for(const promo of activePromos){
    if(promo.scope === "product" && promo.target === productKey){
      productMatch = promo;
    } else if(promo.scope === "category" && promo.target === product.category){
      categoryMatch = promo;
    } else if(promo.scope === "all" && !EXCLUDE_FROM_ALL_PROMO.includes(product.category)){
      allMatch = promo;
    }
  }

  const winner = productMatch || categoryMatch || allMatch;
  return winner ? winner.priceStr : null;
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

const CATEGORY_LABELS = { script: "SCRIPT", bahan: "Bahan", bahan_map: "BAHAN MAP", kit: "KIT", CC: "COLORING HD", jasa: "JASA" };

// Banner "LIMITED" + "U" ala item Unique di Roblox — dipake di kartu produk
// kalau field "limited" di product.js diisi true. Contoh produk di product.js:
//   {
//     name: "...",
//     limited: true,                 // wajib true biar fitur ini aktif
//     limitedDate: "2026-01-15",     // (opsional) mulai tanggal berapa jadi Limited. Kosongin ATAU diisi tanggal hari ini/yang udah lewat = langsung aktif SEKARANG.
//     offSaleDate: "2026-03-01",     // (opsional) mulai tanggal berapa jadi OFF SALE. Kosongin = gak pernah off sale otomatis lewat tanggal.
//     offSale: true,                 // (opsional) shortcut: langsung OFF SALE SEKARANG juga, gak perlu isi offSaleDate.
//   }
// Selama status-nya "limited" ATAU "offsale", tombol beli otomatis dimatiin (gak bisa dibeli):
//   - status "limited" -> tombol jadi "LIMITED"
//   - status "offsale" -> tombol jadi "OFF SALE"
const LIMITED_BADGE_MEDIA = `<span class="limited-banner"><span class="limited-tag"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 5.5 6 .9-4.3 4.3 1 6-5.7-3-5.7 3 1-6L3 8.4l6-.9z"/></svg> Limited</span><span class="limited-u">U</span></span>`;
const OFFSALE_BADGE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/></svg>`;

// Format tanggal singkat buat caption di badge Limited/Off Sale, misal "15 Jan 2026".
function formatTanggalSingkat(date){
  const tgl = date.getDate();
  const bulan = BULAN_ID[date.getMonth()].slice(0, 3);
  const tahun = date.getFullYear();
  return `${tgl} ${bulan} ${tahun}`;
}

// Hitung status Limited/Off Sale 1 produk berdasarkan tanggal limitedDate & offSaleDate.
// Return null (normal), atau { status: "limited"|"offsale", date: Date|null }
// Hitung status Limited/Off Sale 1 produk berdasarkan tanggal limitedDate & offSaleDate.
// Return null (belum ada fitur ini aktif), atau
// { status: "upcoming"|"limited"|"offsale", date: Date|null }
//   - "upcoming" -> belum masuk tanggal limitedDate: badge & catatan tanggal tetep MUNCUL
//                   (kasih tau bakal jadi Limited kapan), tapi produk MASIH BISA DIBELI.
//   - "limited"  -> udah masuk tanggal limitedDate (atau limited:true tanpa limitedDate
//                   = langsung aktif): gak bisa dibeli, tombol jadi "LIMITED".
//   - "offsale"  -> udah lewat offSaleDate: gak bisa dibeli, tombol jadi "OFF SALE".
function getLimitedStatus(product){
  if(!product.limited) return null;
  const now = Date.now();

  const limitedAt = product.limitedDate ? new Date(product.limitedDate) : null;
  const offSaleAt = product.offSaleDate ? new Date(product.offSaleDate) : null;
  // Shortcut: "offSale: true" = langsung OFF SALE dari sekarang, gak perlu isi offSaleDate.
  const offSaleNow = product.offSale === true;

  if(offSaleNow || (offSaleAt && !isNaN(offSaleAt.getTime()) && now >= offSaleAt.getTime())){
    return { status: "offsale", date: offSaleAt && !isNaN(offSaleAt.getTime()) ? offSaleAt : new Date() };
  }
  if(limitedAt && !isNaN(limitedAt.getTime()) && now < limitedAt.getTime()){
    return { status: "upcoming", date: limitedAt }; // badge tetep nongol, tapi masih bisa dibeli
  }
  return { status: "limited", date: limitedAt };
}

function limitedBadgeFor(limitedInfo){
  if(!limitedInfo) return "";
  if(limitedInfo.status === "offsale"){
    return `<span class="limited-banner offsale-banner"><span class="limited-tag offsale-tag">${OFFSALE_BADGE_SVG} Off Sale</span><span class="limited-u">U</span></span>`;
  }
  return LIMITED_BADGE_MEDIA;
}

function limitedStatusNote(limitedInfo){
  if(!limitedInfo) return "";
  if(limitedInfo.status === "offsale"){
    return `<div class="limited-status-note offsale-note">Off Sale sejak ${formatTanggalSingkat(limitedInfo.date)}</div>`;
  }
  if(limitedInfo.status === "upcoming"){
    return `<div class="limited-status-note upcoming-note">Limited mulai ${formatTanggalSingkat(limitedInfo.date)}</div>`;
  }
  if(limitedInfo.date) return `<div class="limited-status-note">Limited sejak ${formatTanggalSingkat(limitedInfo.date)}</div>`;
  return `<div class="limited-status-note">Limited — stok gak dijual lagi</div>`;
}

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
    const isJasa = p.category === "jasa";
    // Limited & Off Sale itu 2 status BEDA (liat getLimitedStatus), tapi dua-duanya
    // sama-sama bikin produk gak bisa dibeli. Status "upcoming" (belum masuk limitedDate)
    // beda sendiri: badge & catatan tanggalnya tetep MUNCUL, tapi MASIH BISA DIBELI.
    const limitedInfo = comingSoon ? null : getLimitedStatus(p);
    const isBlocked = !!limitedInfo && limitedInfo.status !== "upcoming";

    const card = document.createElement("div");
    card.className = "card" + (comingSoon ? " coming-soon-card" : "");
    card.innerHTML = `
      <div class="card-media">
        <span class="badge">${catLabel}</span>
        ${p.isNew && !comingSoon ? '<span class="new-badge">NEW</span>' : ''}
        ${p.popular && !comingSoon ? POPULAR_BADGE_MEDIA : ''}
        ${limitedBadgeFor(limitedInfo)}
        ${media}
      </div>
      <div class="card-body">
        <h3>
          ${p.name}
          <svg class="verified-badge" viewBox="0 0 24 24" fill="#3b9cff"><path d="M12 2l2.4 1.3 2.7-.4 1.3 2.4 2.4 1.3-.4 2.7 1.3 2.4L20.4 13l.4 2.7-2.4 1.3-1.3 2.4-2.7-.4L12 20.4l-2.4-1.3-2.7.4-1.3-2.4-2.4-1.3.4-2.7L2.2 11l1.3-2.4-.4-2.7 2.4-1.3L6.8 2.2l2.7.4z"/><path d="M9 12.2l2 2 4-4.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </h3>
        <p>${p.desc}</p>
        ${engineBadgesFor(p.engines) ? `<div class="engine-badges">${engineBadgesFor(p.engines)}</div>` : ""}
        ${limitedStatusNote(limitedInfo)}
        <div class="card-foot${isJasa ? " jasa-foot" : ""}">
          ${isJasa ? "" : `
          <div class="price-wrap">
            ${promoPrice ? `
              <span class="price struck">${p.price}</span>
              <span class="price-promo-card">${promoPrice}</span>
              <span class="promo-badge-card">PROMO</span>
            ` : `
              <span class="price">${p.price}</span>
              <span class="price-alt">atau ${shortPrice(p.price)}</span>
            `}
          </div>`}
          <button class="buy-btn${limitedInfo && limitedInfo.status === "offsale" ? " off-sale" : (limitedInfo && limitedInfo.status === "limited" ? " limited-btn" : "")}" data-idx="${PRODUCTS.indexOf(p)}" ${comingSoon || isBlocked ? "disabled" : ""}>${comingSoon ? "Segera" : (limitedInfo && limitedInfo.status === "offsale" ? "OFF SALE" : (limitedInfo && limitedInfo.status === "limited" ? "LIMITED" : (isJasa ? "Lihat" : "Beli")))}</button>
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
      const product = PRODUCTS[btn.dataset.idx];
      if(product.category === "jasa") openServiceModal(product);
      else openBuyModal(product);
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

/* MODAL JASA — dipake buat produk category "jasa": nampilin daftar
   layanan (field "services" di product.js) + tombol "Order" per item,
   gak pake QRIS/transfer soalnya harga & prosesnya nego lewat chat. */
const jasaOverlay = document.getElementById("modalJasaOverlay");
function openServiceModal(product){
  document.getElementById("modalJasaName").textContent = product.name;
  document.getElementById("modalJasaDesc").textContent = product.desc || "";

  const serviceList = document.getElementById("serviceList");
  const services = product.services || [];
  serviceList.innerHTML = services.map((s) => {
    // Harga sengaja ditampilin sebagai "???" (bukan harga aslinya) —
    // biar yang mau tau harga pastinya harus tekan "Order" dulu buat
    // DM/chat langsung ke owner.
    const orderMsg = `Halo, saya mau tanya harga & order layanan "${s.name}" dari "${product.name}" di CIK STORE.`;
    return `
      <li class="service-item">
        <div class="service-info">
          <span class="service-name">${s.name}</span>
          ${s.desc ? `<span class="service-desc">${s.desc}</span>` : ""}
          <span class="service-price">???</span>
        </div>
        <a class="btn btn-primary service-order-btn" target="_blank" rel="noopener" href="${waLink(orderMsg)}">Order</a>
      </li>`;
  }).join("");

  jasaOverlay.classList.add("open");
}
document.getElementById("modalJasaClose").addEventListener("click", ()=> jasaOverlay.classList.remove("open"));
jasaOverlay.addEventListener("click", (e)=>{ if(e.target === jasaOverlay) jasaOverlay.classList.remove("open"); });

/* KODE PROMO — section di luar, di bawah katalog produk */
const promoBtn = document.getElementById("promoBtn");
const promoInput = document.getElementById("promoInput");
const promoMsg = document.getElementById("promoMsg");

// Ditaruh di fungsi terpisah biar bisa dipicu dari klik tombol MAUPUN
// dari tombol "Enter/Go" di keyboard hp. Sebelumnya cuma nyantol ke
// klik tombol — jadi kalau user pencet "Enter" di keyboard duluan
// (kebiasaan umum di hp), kelihatannya kayak "gagal", padahal cuma
// belum ke-trigger sama sekali. Baru pas beneran tap tombolnya jalan.
async function submitPromoCode(){
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
    const inputCodeUpper = code.toUpperCase();

    if(data.valid){
      const alreadyActive = activePromos.some(p => p.code === inputCodeUpper);

      if(alreadyActive){
        promoMsg.textContent = "Kode promo ini sudah aktif.";
        promoMsg.className = "promo-msg error";
      } else {
        activePromos.push({
          code: inputCodeUpper,
          scope: data.scope,
          target: data.target,
          priceStr: formatRupiah(data.promoPrice)
        });

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
        promoInput.value = "";
      }
    } else {
      // Kode salah TIDAK menghapus promo yang udah aktif duluan —
      // dulu ini bug-nya: masukin kode ke-2 yang salah/beda bikin
      // promo pertama ikut ilang.
      promoMsg.textContent = "Kode promo salah atau sudah tidak berlaku.";
      promoMsg.className = "promo-msg error";
    }

    renderActivePromoList();
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
}

promoBtn.addEventListener("click", submitPromoCode);
promoInput.addEventListener("keydown", (e)=>{
  if(e.key === "Enter"){
    e.preventDefault();
    submitPromoCode();
  }
});

// Tampilin semua kode promo yang lagi aktif sekaligus, tiap satu bisa
// dihapus sendiri-sendiri pake tombol ×.
function renderActivePromoList(){
  const listEl = document.getElementById("activePromoList");
  if(!listEl) return;

  if(!activePromos.length){
    listEl.innerHTML = "";
    listEl.style.display = "none";
    return;
  }

  listEl.style.display = "flex";
  listEl.innerHTML = activePromos.map((promo, idx) => `
    <span class="promo-chip">
      ${promo.code}
      <button type="button" class="promo-chip-remove" data-idx="${idx}" aria-label="Hapus kode promo ${promo.code}">×</button>
    </span>
  `).join("");

  listEl.querySelectorAll(".promo-chip-remove").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      activePromos.splice(Number(btn.dataset.idx), 1);
      renderActivePromoList();
      renderProducts(getActiveFilter());
      if(buyOverlay.classList.contains("open") && currentProduct){
        openBuyModal(currentProduct);
      }
    });
  });
}
renderActivePromoList();

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

/* TOMBOL SALURAN WA DI PANEL PROMO */
const promoSaluranBtn = document.getElementById("promoSaluranBtn");
if(promoSaluranBtn){
  const waSaluran = SALURAN_LIST.find(s => s.icon === "channel") || SALURAN_LIST[0];
  if(waSaluran){
    promoSaluranBtn.href = waSaluran.link;
  } else {
    promoSaluranBtn.style.display = "none";
  }
}

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
document.getElementById("profileName").innerHTML = `${OWNER_NAME} <svg class="verified-badge" viewBox="0 0 24 24" fill="#3b9cff"><path d="M12 2l2.4 1.3 2.7-.4 1.3 2.4 2.4 1.3-.4 2.7 1.3 2.4L20.4 13l.4 2.7-2.4 1.3-1.3 2.4-2.7-.4L12 20.4l-2.4-1.3-2.7.4-1.3-2.4-2.4-1.3.4-2.7L2.2 11l1.3-2.4-.4-2.7 2.4-1.3L6.8 2.2l2.7.4z"/><path d="M9 12.2l2 2 4-4.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
document.getElementById("profileRole").textContent = OWNER_ROLE;
document.getElementById("profileBio").textContent = OWNER_BIO;
document.getElementById("profilePhoto").src = OWNER_PHOTO;
document.getElementById("profileChatBtn").href = waLink("Halo, saya mau tanya-tanya soal CIK STORE.");

document.getElementById("profileNavBtn").addEventListener("click", ()=> profileOverlay.classList.add("open"));
document.getElementById("profileClose").addEventListener("click", ()=> profileOverlay.classList.remove("open"));
profileOverlay.addEventListener("click", (e)=>{ if(e.target === profileOverlay) profileOverlay.classList.remove("open"); });

/* MODAL DAFTAR WEBSITE & APLIKASI */
const WEBAPP_ICON_GLOBE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.8 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.8-3.8-9S9.5 5.5 12 3z"/></svg>`;
const WEBAPP_ICON_APP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2.5"/><path d="M11 18h2"/></svg>`;
const WEBAPP_ICON_ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>`;

function webAppIconFor(type){
  const t = (type || "").toLowerCase();
  if(t.includes("app") || t.includes("aplikasi")) return WEBAPP_ICON_APP;
  return WEBAPP_ICON_GLOBE;
}

function renderWebsiteAppList(){
  const listEl = document.getElementById("websiteAppList");
  if(!listEl) return;

  if(!WEBSITE_APP_LIST.length){
    listEl.innerHTML = `<li class="webapp-item"><div class="webapp-info"><span class="webapp-desc">Belum ada website/aplikasi yang ditambahin. Tinggal isi array WEBSITE_APP_LIST di PROMOSI/websiteApp.js.</span></div></li>`;
    return;
  }

  listEl.innerHTML = WEBSITE_APP_LIST.map((item, idx) => `
    <li class="webapp-item" style="animation-delay:${idx * 90}ms">
      <span class="webapp-icon">${webAppIconFor(item.type)}</span>
      <div class="webapp-info">
        <span class="webapp-name">${item.name}</span>
        ${item.desc ? `<span class="webapp-desc">${item.desc}</span>` : ""}
        ${item.type ? `<span class="webapp-type">${item.type.toUpperCase()}</span>` : ""}
      </div>
      <a class="btn btn-ghost webapp-btn" target="_blank" rel="noopener" href="${item.link}">Buka ${WEBAPP_ICON_ARROW}</a>
    </li>`).join("");
}
renderWebsiteAppList();

const websiteOverlay = document.getElementById("modalWebsiteOverlay");
function openWebsiteModal(){ if(websiteOverlay) websiteOverlay.classList.add("open"); }

const navWebsiteBtn = document.getElementById("navWebsiteBtn");
if(navWebsiteBtn) navWebsiteBtn.addEventListener("click", openWebsiteModal);

const websiteNavBtn = document.getElementById("websiteNavBtn");
if(websiteNavBtn) websiteNavBtn.addEventListener("click", ()=>{
  openWebsiteModal();
  infoPopoverEl.classList.remove("open");
  document.querySelectorAll(".bn-item").forEach(i=>i.classList.remove("active"));
  websiteNavBtn.classList.add("active");
});

const modalWebsiteClose = document.getElementById("modalWebsiteClose");
if(modalWebsiteClose) modalWebsiteClose.addEventListener("click", ()=> websiteOverlay.classList.remove("open"));
if(websiteOverlay) websiteOverlay.addEventListener("click", (e)=>{ if(e.target === websiteOverlay) websiteOverlay.classList.remove("open"); });

/* MODAL CHAT — komentar pin dari admin/owner, pake foto dari PPIMG/ */
function renderAdminComment(){
  const list = document.getElementById("adminChatList");
  if(!list) return;

  if(typeof ADMIN_CHAT_LIST === "undefined" || !ADMIN_CHAT_LIST.length){
    list.innerHTML = `<p class="modal-note" style="margin:0;">Belum ada chat. Tinggal isi array ADMIN_CHAT_LIST di chatown.js.</p>`;
    return;
  }

  list.innerHTML = ADMIN_CHAT_LIST.map((chat, idx) => `
    <div class="admin-comment" style="animation-delay:${idx * 140}ms">
      <span class="admin-comment-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5"/></svg>
        <img src="${chat.photo || "PPIMG/owner.png"}" alt="Foto ${chat.name || "Admin"}" onerror="this.style.display='none'">
      </span>
      <div class="admin-comment-body">
        <div class="admin-comment-head">
          <span class="admin-comment-name">${chat.name || OWNER_NAME}</span>
          <span class="admin-comment-tag">OWNER</span>
          <span class="admin-comment-time">${chat.time || ""}</span>
        </div>
        <p class="admin-comment-bubble">${chat.text || ""}</p>
      </div>
    </div>
  `).join("");
}
renderAdminComment();

const chatOverlay = document.getElementById("modalChatOverlay");
function openChatModal(){
  if(!chatOverlay) return;
  renderAdminComment(); // render ulang tiap dibuka biar animasinya replay
  chatOverlay.classList.add("open");
}

const navChatBtn = document.getElementById("navChatBtn");
if(navChatBtn) navChatBtn.addEventListener("click", openChatModal);

const chatNavBtn = document.getElementById("chatNavBtn");
if(chatNavBtn) chatNavBtn.addEventListener("click", ()=>{
  openChatModal();
  infoPopoverEl.classList.remove("open");
  document.querySelectorAll(".bn-item").forEach(i=>i.classList.remove("active"));
  chatNavBtn.classList.add("active");
});

const modalChatClose = document.getElementById("modalChatClose");
if(modalChatClose) modalChatClose.addEventListener("click", ()=> chatOverlay.classList.remove("open"));
if(chatOverlay) chatOverlay.addEventListener("click", (e)=>{ if(e.target === chatOverlay) chatOverlay.classList.remove("open"); });

const modalChatBtn = document.getElementById("modalChatBtn");
if(modalChatBtn) modalChatBtn.href = waLink("Halo, saya mau tanya-tanya soal CIK STORE.");

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

/* ============================================================
   SLIDER TESTIMONI
   Daftar testimoninya ada di file testimoni.js (TESTIMONI_LIST).
   Ditampilin 3 foto sekaligus per halaman; kalau testimoninya
   lebih dari 3, geser/tekan panah buat pindah ke 3 foto berikutnya.
   ============================================================ */
const TESTI_PER_PAGE = 3;
let testiIndex = 0;
let testiTotalPages = 1;

// Kalau field "img" kosong, coba ambil dari TESTIMONIIMG/<nomor>.png,
// gagal -> coba .jpg, gagal lagi -> tampilin ikon fallback.
const testiFallbackHtml = `<div class="testi-fallback">${fallbackIcon}<span>Belum ada foto</span></div>`;

function testiHandleImgError(imgEl, idx){
  if(imgEl.dataset.explicit){
    imgEl.outerHTML = testiFallbackHtml;
    return;
  }
  if(!imgEl.dataset.tried){
    imgEl.dataset.tried = "1";
    imgEl.src = `TESTIMONIIMG/${idx + 1}.jpg`;
    return;
  }
  imgEl.outerHTML = testiFallbackHtml;
}

function testiImgTag(item, idx){
  const hasLink = item.img && item.img.trim().length > 0;
  const src = hasLink ? item.img : `TESTIMONIIMG/${idx + 1}.png`;
  const explicitAttr = hasLink ? ' data-explicit="1"' : '';
  return `<img src="${src}" alt="Testimoni ${idx + 1}"${explicitAttr} onerror="testiHandleImgError(this, ${idx})">`;
}

function renderTestimoni(){
  const testiSection = document.getElementById("testimoni");
  const track = document.getElementById("testiTrack");
  const dots = document.getElementById("testiDots");
  const prevBtn = document.getElementById("testiPrev");
  const nextBtn = document.getElementById("testiNext");
  const hint = document.getElementById("testiHint");
  if(!testiSection || !track || !dots) return;

  if(typeof TESTIMONI_LIST === "undefined" || !TESTIMONI_LIST.length){
    testiSection.style.display = "none";
    return;
  }

  // Bagi testimoni jadi kelompok 3-3 per halaman
  const pages = [];
  for(let i = 0; i < TESTIMONI_LIST.length; i += TESTI_PER_PAGE){
    pages.push(TESTIMONI_LIST.slice(i, i + TESTI_PER_PAGE));
  }
  testiTotalPages = pages.length;

  track.innerHTML = pages.map((page, pageIdx) => `
    <div class="testi-page">
      ${page.map((item, i) => {
        const idx = pageIdx * TESTI_PER_PAGE + i;
        return `
          <div class="testi-item">
            ${testiImgTag(item, idx)}
            ${item.name ? `<span class="testi-name">${item.name}</span>` : ""}
          </div>`;
      }).join("")}
    </div>
  `).join("");

  const multiPage = testiTotalPages > 1;
  dots.innerHTML = multiPage ? pages.map((_, idx) => `
    <button class="testi-dot${idx === 0 ? " active" : ""}" data-idx="${idx}" aria-label="Halaman testimoni ke-${idx + 1}">${idx + 1}</button>
  `).join("") : "";
  dots.style.display = multiPage ? "" : "none";
  if(prevBtn) prevBtn.style.display = multiPage ? "" : "none";
  if(nextBtn) nextBtn.style.display = multiPage ? "" : "none";
  if(hint) hint.style.display = multiPage ? "" : "none";

  dots.querySelectorAll(".testi-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      goToTesti(Number(dot.dataset.idx));
      hideTestiHint();
    });
  });

  goToTesti(0);
}

function goToTesti(idx){
  const track = document.getElementById("testiTrack");
  if(!track || !testiTotalPages) return;
  testiIndex = Math.max(0, Math.min(idx, testiTotalPages - 1));
  // FIX TOTAL: dulu posisi slide dihitung manual pake transform +
  // drag jari sendiri (rawan geser kepotong/wrap-around -> kelihatan
  // "keluar layar"/blank). Sekarang pindah ke scroll native bawaan
  // browser (scroll-snap) — jauh lebih kebal, karena scroll horizontal
  // di dalam kotak ini ditangani sepenuhnya sama browser sendiri,
  // gak akan pernah nyangkut di posisi "antara" dua halaman.
  track.scrollTo({ left: testiIndex * track.clientWidth, behavior: "smooth" });
  document.querySelectorAll(".testi-dot").forEach((d, i) => d.classList.toggle("active", i === testiIndex));
  updateTestiNavState();
}

// Redupin/nonaktifin tombol prev/next pas udah di ujung, biar jelas
// gak ada halaman lagi (dan gak salah geser ke arah yang gak ada apa-apanya).
function updateTestiNavState(){
  const prevBtn = document.getElementById("testiPrev");
  const nextBtn = document.getElementById("testiNext");
  if(prevBtn) prevBtn.classList.toggle("is-disabled", testiIndex <= 0);
  if(nextBtn) nextBtn.classList.toggle("is-disabled", testiIndex >= testiTotalPages - 1);
}

function hideTestiHint(){
  const hint = document.getElementById("testiHint");
  if(hint) hint.classList.add("hide");
}

const testiPrevBtn = document.getElementById("testiPrev");
const testiNextBtn = document.getElementById("testiNext");
if(testiPrevBtn) testiPrevBtn.addEventListener("click", () => { goToTesti(testiIndex - 1); hideTestiHint(); });
if(testiNextBtn) testiNextBtn.addEventListener("click", () => { goToTesti(testiIndex + 1); hideTestiHint(); });

/* Geser (swipe) pake jari di HP — sekarang PAKE SCROLL NATIVE BROWSER,
   bukan hitung transform manual lagi. Jari geser = scroll biasa di
   dalam kotak testi-track (CSS: overflow-x:auto + scroll-snap-type),
   browser yang urus semuanya (klem otomatis di ujung, gak akan pernah
   nyangkut blank/setengah kepotong). Kita cuma dengerin event "scroll"
   buat nyamain state dot & tombol prev/next pas user geser manual. */
(function initTestiScrollSync(){
  const track = document.getElementById("testiTrack");
  if(!track) return;
  let scrollTimer = null;
  track.addEventListener("scroll", () => {
    if(scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if(!track.clientWidth) return;
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      testiIndex = Math.max(0, Math.min(idx, testiTotalPages - 1));
      document.querySelectorAll(".testi-dot").forEach((d, i) => d.classList.toggle("active", i === testiIndex));
      updateTestiNavState();
    }, 80);
    hideTestiHint();
  }, { passive: true });
})();

const testiSaluranBtn = document.getElementById("testiSaluranBtn");
if(testiSaluranBtn){
  const waSaluran = SALURAN_LIST.find(s => s.icon === "channel") || SALURAN_LIST[0];
  if(waSaluran) testiSaluranBtn.href = waSaluran.link;
}

renderTestimoni();

// Badge "Studio" / "Studio Lite" — dipake di kartu produk
// (produk yang mau nampilin badge ini tinggal kasih field engines: ["studio","lite"]).
const ENGINE_BADGE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4a2 2 0 001-1.7z"/><path d="M3.3 7l8.7 5 8.7-5M12 22V12"/></svg>`;
// Badge "POPULER" sekarang ditaruh di card-media (bawah label NEW),
// bukan dempet sama badge Studio/Studio Lite lagi.
const POPULAR_BADGE_MEDIA = `<span class="popular-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.9l-6.4 3.8 1.7-7.3-5.6-4.9 7.4-.6z"/></svg> Populer</span>`;

// Bikin badge engine per produk berdasarkan field "engines" (array: "studio" / "lite").
// Kalau field-nya gak diisi di product.js, gak ada badge yang muncul (gak maksa semua produk).
function engineBadgesFor(engines){
  if(!Array.isArray(engines) || !engines.length) return "";
  const parts = [];
  if(engines.includes("studio")) parts.push(`<span class="engine-badge">${ENGINE_BADGE_SVG} Studio</span>`);
  if(engines.includes("lite")) parts.push(`<span class="engine-badge">${ENGINE_BADGE_SVG} Studio Lite</span>`);
  return parts.join("");
}

renderProducts("semua");
loadComingSoon();
setInterval(loadComingSoon, 5 * 60 * 1000); // refresh status coming soon tiap 5 menit