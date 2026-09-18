/* ============================================================
   DAFTAR PRODUK — edit / tambah / hapus produk di array bawah ini
   ============================================================
   - category: "script", "bahan", "bahan_map", "kit", "CC", atau "jasa"
       * "bahan_map"  = kategori khusus "BAHAN MAP", dipisah dari
         "bahan" biasa supaya bisa dikasih kode promo sendiri
         (lihat CODE_PROMO_BAHAN_MAP di bawah)
       * "jasa" = kategori LAYANAN (bukan produk file siap beli).
         Produk kategori ini GAK butuh field "price" dan GAK ada
         tombol "Beli"/QRIS — tombolnya otomatis jadi "Lihat", yang
         pas ditekan nampilin popup daftar layanan dari field
         "services" (array of {name, desc, price}), tiap layanan
         punya tombol "Order" sendiri ke WhatsApp. Contoh lengkapnya
         ada di produk "Jasa Custom Script & Kit" di bawah.
   - img: link foto produk (boleh URL dari internet, atau taruh file
     di folder PRODUCT/ lalu tulis path-nya, contoh: "PRODUCT/nama.jpg")
     kosongkan ("") kalau belum ada foto
   - features: daftar fitur produk, muncul di popup pas tombol "Beli" ditekan
   - isNew: true/false — kalau true, muncul label "NEW" di kartu produk
   - engines: ["studio", "lite"] (opsional) — kalau diisi, kartu produk
     nampilin label kecil "Studio" / "Studio Lite" (bisa pilih salah satu
     atau dua-duanya sekaligus), nandain produk itu bisa dipasang di engine
     mana aja. Kosongin / hapus field-nya kalau produk gak relevan (misal
     bukan map/kit Roblox), gak bakal ada label yang muncul.
   - popular: true/false (opsional) — kalau true, muncul label tambahan
     "★ POPULER" di samping label Studio/Studio Lite (bisa dipasang bareng,
     jadi satu produk bisa punya 3 label sekaligus: Studio, Studio Lite,
     POPULER).

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
    price: "Rp 10.000",
    category: "script",
    img: "PRODUCT/RelapseBukit.png",
    isNew: true,
    engines: ["studio", "lite"],
    features: [
      "Tinggal masukin 1 script, langsung jalan",
      "Ringan, ga bikin lag",
      "Cocok buat pemula, ga perlu setup ribet"
    ]
  },
  {
    name: "Hangout Kit V1",
    desc: "HANGOUT KIT SIMPLE DAN RINGAN SIMPLE FULL FITUR",
    price: "Rp 20.000",
    category: "kit",
    img: "PRODUCT/HangoutKit.png",
    isNew: true,
    popular: true,
    engines: ["studio", "lite"],
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
    desc: "HANGOUT KIT V2-OVERHEAD BAGUS RINGAN DAN SIMPLE",
    price: "Rp 15.000",
    category: "bahan_map",
    img: "PRODUCT/HangoutKitV2.png",
    isNew: true,
    popular: true,
    engines: ["studio", "lite"],
    features: [
      "Kit lengkap siap pakai",
      "Fitur lengkap, ringan",
      "File rapi, gampang di-custom ulang"
    ]
  },
  {
    // Contoh produk kategori "jasa" (layanan) — beda dari produk biasa:
    // - GAK pake field "price" & GAK ada tombol "Beli"/QRIS, soalnya
    //   harga & prosesnya nego/order langsung ke owner.
    // - Tombol di kartu produknya otomatis jadi "Lihat", pas ditekan
    //   muncul popup daftar layanan dari field "services" di bawah,
    //   tiap layanan punya tombol "Order" sendiri (langsung ke WhatsApp).
    // - Tinggal tambah/hapus/ubah item di array "services" buat
    //   ngatur daftar yang bisa di-order.
    name: "Jasa Custom Script & Kit",
    desc: "BUTUH SCRIPT ATAU KIT YANG DIBUAT KHUSUS SESUAI KEBUTUHAN? CEK DAFTAR LAYANANNYA DI SINI.",
    category: "jasa",
    img: "JASAIMG/JasaCustom.png",
    isNew: true,
    popular: true,
    engines: ["studio", "lite"],
    services: [
      { name: "Custom Script Sederhana", desc: "Script simple sesuai request, 1-2 fungsi.", price: "Rp ???" },
      { name: "Custom Kit Lengkap", desc: "Kit custom full fitur sesuai kebutuhan game kamu.", price: "Rp ???" },
      { name: "Konsultasi & Perbaikan Script", desc: "Bantu benerin script yang error / gak jalan.", price: "Rp ???" }
    ]
  },
  {
    name: "Jasa Bikin Website & Apk",
    desc: "BUTUH WEBSITE ATAU APK YANG DIBUAT KHUSUS SESUAI KEBUTUHAN? CEK DAFTAR LAYANANNYA DI SINI.",
    category: "jasa",
    img: "JASAIMG/CostumApk.png",
    isNew: true,
    popular: true,
    services: [
      { name: "Jasa Bikin Website", desc: "NERIMA JASA BIKIN WRBSITE AI , WEBSITE JUALAN , WEBSITE STREAM , WEBSITE COMIC , WEBSITE MUSIC NO IKLAN , WEBSITE PROMOSI DAN DLL", price: "Rp ???" },
      { name: "Jasa Bikin Apk", desc: "NERIMA JASA BIKIN APK , APK PROMOSI , APK JUALAN , APK STREAM , APK COMIC , APK MUSIC NO IKLAN , APK AI DAN DLL", price: "Rp ???" }
    ]
  },
  {
    name: "COLORING HD [AM]",
    usn : "COLORING_HD",
    desc: "COLORING HD / CC HD - SIMPLE DAN BAGUS",
    price: "Rp 5.000",
    category: "CC",
    img: "PRODUCT/Cchd.png",
    isNew: true,
    features: [
      "Coloring siap pakai",
      "Coloring simple hd",
      "Coloring abu abu"
    ]
  },
];

// Biar file ini juga bisa dipakai (require) dari Netlify Function kalau perlu.
if (typeof module !== "undefined") {
  module.exports = PRODUCTS;
}