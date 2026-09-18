/* ============================================================
   DAFTAR "BUY STOCK MAP"
   ============================================================
   - Ditampilin sebagai SATU daftar list (bukan kartu foto
     satu-satu), di section "Buy Stock Map".
   - Semua map di sini bisa dipasang baik di Roblox Studio
     maupun Roblox Studio Lite (badge-nya otomatis muncul di web).
   - Deskripsi TIDAK bilang "ready stock" — stock berubah-ubah,
     jadi tombol "Order via Saluran" ngarahin pembeli buat cek
     ketersediaan & harga terbaru langsung di Saluran WhatsApp.
   - Field "popular": true/false (opsional) -> kalau true, baris
     itu dapet tambahan label "POPULER" di samping badge Studio /
     Studio Lite. Default false kalau field-nya gak ditulis.
   - Tinggal tambah/hapus/ubah baris di array STOCKMAP_LIST buat
     ubah daftar map yang dijual.
   ============================================================ */

const STOCKMAP_LIST = [
  { name: "Map Club", desc: "Cek stock & harga terbaru di Saluran WhatsApp.", popular: true },
  { name: "Map Relapse", desc: "Cek stock & harga terbaru di Saluran WhatsApp." },
  { name: "Map Mount", desc: "Cek stock & harga terbaru di Saluran WhatsApp." },
  { name: "Map Dugem", desc: "Cek stock & harga terbaru di Saluran WhatsApp." },
  { name: "Map Party", desc: "Cek stock & harga terbaru di Saluran WhatsApp." },
];

// Biar file ini juga bisa dipakai (require) dari Netlify/Vercel Function kalau perlu.
if (typeof module !== "undefined") {
  module.exports = STOCKMAP_LIST;
}
