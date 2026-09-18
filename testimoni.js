/* ============================================================
   DAFTAR TESTIMONI PEMBELI
   ============================================================
   - Foto testimoni ukurannya bakal ditampilin persegi (1:1),
     jadi usahain pilih foto yang mepet persegi biar gak kepotong.

   ADA 2 CARA ISI FOTO:

   1) CARA GAMPANG (otomatis) — kosongin field "img" (biarin ""),
      terus taruh file fotonya di folder TESTIMONIIMG/ dengan nama
      angka urut sesuai urutan testimoni di bawah:
        Testimoni ke-1 -> TESTIMONIIMG/1.png  (atau 1.jpg)
        Testimoni ke-2 -> TESTIMONIIMG/2.png  (atau 2.jpg)
        Testimoni ke-3 -> TESTIMONIIMG/3.png  (atau 3.jpg)
      Boleh campur .png sama .jpg, sistemnya otomatis coba dua-duanya.

   2) CARA PAKAI LINK — isi field "img" dengan link foto langsung
      (URL http/https), nanti itu yang dipake, gak perlu taruh file
      di folder TESTIMONIIMG/ lagi.

   - Field "name" opsional, buat nama/keterangan singkat yang
     muncul di pojok bawah foto. Boleh dikosongin ("").

   - Tinggal tambah atau hapus baris di array TESTIMONI_LIST buat
     nambah / ngurangin jumlah testimoni yang tampil di web.
   ============================================================ */

const TESTIMONI_LIST = [
  { name: "TESTIMONI", img: "TESTIMONIIMG/1.jpg" },
  { name: "TESTIMONI", img: "TESTIMONIIMG/2.jpg" },
  { name: "TESTIMONI", img: "TESTIMONIIMG/8.png" },
  { name: "TESTIMONI", img: "TESTIMONIIMG/4.png" },
  { name: "TESTIMONI", img: "TESTIMONIIMG/7.png" },
  { name: "TESTIMONI", img: "TESTIMONIIMG/6.jpg" },
];

// Biar file ini juga bisa dipakai (require) dari Netlify/Vercel Function kalau perlu.
if (typeof module !== "undefined") {
  module.exports = TESTIMONI_LIST;
}
