/* ============================================================
   DAFTAR CHAT ADMIN — dipakai di menu "Chat" (navigasi atas & bawah).
   - "photo"  : foto dari folder PPIMG/ (kosongin = otomatis pake PPIMG/owner.png)
   - "name"   : nama yang muncul di chat (kosongin = pake OWNER_NAME dari main.js)
   - "time"   : label waktu, bebas isi teks apa aja (misal "Baru saja", "Hari ini")
   - "text"   : isi chatnya
   Tambah/hapus item sesuka hati — urutan dari atas ke bawah = urutan tampil.
   File ini HARUS dimuat SEBELUM main.js di index.html.
   ============================================================ */
const ADMIN_CHAT_LIST = [
  {
    name: "Owner CIK STORE",
    photo: "PPIMG/owner.png",
    time: "2026-09-25 | 8:18",
    text: "Halo! Makasih udah mampir ke CIK STORE 🙌 Kalau ada yang mau ditanyain soal produk sebelum beli, langsung chat aja ya, fast respon kok."
  },
  {
    name: "Owner CIK STORE",
    photo: "PPIMG/owner.png",
    time: "2026-09-25 | 8:18",
    text: "Buat produk yang ada label LIMITED, stoknya emang udah dibatasin dari awal — begitu status-nya jadi Off Sale, produk itu udah gak dijual lagi ya."
  }
];
