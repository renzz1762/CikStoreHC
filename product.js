/* ============================================================
   DAFTAR PRODUK — edit / tambah / hapus produk di array bawah ini
   ============================================================
   - category: "script", "bahan", "bahan_map", atau "kit"
       * "bahan_map"  = kategori khusus "BAHAN MAP", dipisah dari
         "bahan" biasa supaya bisa dikasih kode promo sendiri
         (lihat CODE_PROMO_BAHAN_MAP di bawah)
   - img: link foto produk (boleh URL dari internet, atau taruh file
     di folder PRODUCT/ lalu tulis path-nya, contoh: "PRODUCT/nama.jpg")
     kosongkan ("") kalau belum ada foto
   - features: daftar fitur produk, muncul di popup pas tombol "Beli" ditekan
   - isNew: true/false — kalau true, muncul label "NEW" di kartu produk

   ============================================================
   FITUR "COMING SOON" (produk belum rilis)
   ============================================================
   Status coming soon & jam/tanggal rilis produk DIATUR DARI SERVER
   (Environment Variables di Vercel), BUKAN di file ini.

   Supaya server tahu produk mana yang dimaksud, tiap produk punya
   "KEY". Ada 2 cara:

   1) CARA GAMPANG (disaranin) — isi field "usn" di objek produknya,
      bebas mau nulis apa aja (huruf besar semua, underscore), itu
      langsung jadi KEY-nya. Gak perlu mikirin auto-convert nama lagi.
        usn: "HANGOUT_KIT_V2"

   2) Kalau field "usn" DIKOSONGIN / gak ditulis, KEY otomatis dibikin
      dari nama produk: huruf besar semua, spasi & simbol jadi "_".
      Contoh: nama produk "Overhead Kit" -> KEY = OVERHEAD_KIT

   Di dashboard Vercel -> Project -> Settings -> Environment Variables,
   tambahin (KEY-nya HARUS SAMA PERSIS kayak "usn" di atas):
     COMINGSOON_PRODUCT_HANGOUT_KIT_V2 = 17-08-2026 12:00

   Format value WAJIB: DD-MM-YYYY HH:mm (jam pakai WIB / UTC+7)
   Contoh lain: 05-01-2027 09:30

   Kalau env var itu ADA dan waktunya masih di masa depan, produk
   "Overhead Kit" otomatis ketutup overlay gelap "Coming Soon" +
   nama produk + tanggal, hari, dan jam rilis + hitung mundur live.
   Begitu waktunya lewat, overlay otomatis hilang sendiri (gak perlu
   refresh manual / edit apa-apa lagi).

   PENTING: abis nambah/ubah/hapus env var di Vercel, WAJIB redeploy
   dulu (Deployments -> titik tiga di deployment terakhir -> Redeploy),
   soalnya env var baru gak otomatis kepakai di deployment yang lama.

   Kalau env var-nya dihapus dari Vercel, produk balik normal lagi
   (abis redeploy).
   ============================================================

   ============================================================
   KODE PROMO KHUSUS PER-KATEGORI / PER-PRODUK
   ============================================================
   Selain kode promo umum (KODE_PROMO / HARGA_PROMO, diatur di
   bawah ini juga lewat Vercel, berlaku ke SEMUA produk), sekarang
   bisa juga bikin kode promo yang CUMA berlaku buat:

   A) satu KATEGORI tertentu, contoh kategori "BAHAN MAP":
        CODE_PROMO_BAHAN_MAP  = (kode promonya, min 6 karakter)
        HARGA_PROMO_BAHAN_MAP = (harga promonya, contoh 10000)
      -> otomatis berlaku ke SEMUA produk yang category-nya "bahan_map"

   B) satu PRODUK tertentu aja, pake KEY dari nama produk (sama
      persis aturan di atas), contoh buat produk "Overhead Kit":
        CODE_PROMO_OVERHEAD_KIT  = (kode promonya)
        HARGA_PROMO_OVERHEAD_KIT = (harga promonya)
      -> cuma berlaku buat produk "Overhead Kit" doang

   CATATAN: kategori "bahan_map" udah di-set supaya DIKECUALIKAN dari
   promo umum (lihat EXCLUDE_FROM_ALL_PROMO di main.js) — jadi produk
   kategori ini CUMA bisa dapet promo lewat CODE_PROMO_BAHAN_MAP di
   atas, gak ikut kepotong kalau orang pake kode promo umum.

   Semua env var ini ditambahin di dashboard Vercel, bisa berapa
   pun banyaknya, gak perlu edit kode sama sekali.
   ============================================================
*/

const PRODUCTS = [
  {
    name: "Script Relapse Bukit",
    desc: "CUMA BUTUH 1 SCRIPT AJAH BIAR JADI BUKIT BUKIT - RINGAN DAN SIMPLE",
    price: "Rp 15.000",
    category: "script",
    img: "PRODUCT/RelapseBukit.png",
    isNew: true,
    features: [
      "Tinggal masukin 1 script, langsung jalan",
      "Ringan, ga bikin lag",
      "Cocok buat pemula, ga perlu setup ribet"
    ]
  },
  {
    name: "HANGOUT KIT",
    desc: "HANGOUT KIT SIMPLE DAN RINGAN SIMPLE FULL FITUR",
    price: "Rp 25.000",
    category: "kit",
    img: "PRODUCT/HangoutKit.png",
    isNew: true,
    features: [
      "Kit lengkap siap pakai",
      "Tampilan simpel dan ringan",
      "File rapi, gampang di-custom ulang"
    ]
  },
  {
    // Contoh produk buat testing fitur "Coming Soon".
    // KEY otomatis dari nama ini = OVERHEAD_KIT
    // Set env var COMINGSOON_PRODUCT_OVERHEAD_KIT di Netlify buat nyoba.
    // Kalau produknya udah gak "coming soon" lagi / gak dipake, hapus aja objek ini.
    name: "Hangout Kit V2",
    usn: "HANGOUT_KIT_V2",
    desc: "HANGOUT KIT V2 — SEGERA RILIS, PANTENG TERUS YAWH",
    price: "Rp 15.000",
    category: "bahan_map",
    img: "PRODUCT/HangoutKitV2.png",
    isNew: true,
    features: [
      "Kit lengkap siap pakai",
      "Fitur lengkap, ringan",
      "File rapi, gampang di-custom ulang"
    ]
  },
];

// Biar file ini juga bisa dipakai (require) dari Netlify Function kalau perlu.
if (typeof module !== "undefined") {
  module.exports = PRODUCTS;
}