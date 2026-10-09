# Catatan Perubahan — CIK STORE (update 2)

## Buy Stock Map
Sekarang cuma SATU kartu list (bukan kartu foto satu-satu). Isinya:
Map Club, Map Relapse, Map Mount, Map Dugem, Map Party (edit di `stockmap.js`).
Tiap baris ada badge "Studio" & "Studio Lite" nandain kalau map itu bisa
dipasang di Roblox Studio maupun Roblox Studio Lite, plus keterangan ini
juga ditulis di atas daftarnya. Tombol tiap baris tetap "Order via Saluran"
→ langsung ke Saluran WhatsApp.

## Testimoni
Kartu slider foto sama ajakan "Cek Saluran WhatsApp" sekarang JADI SATU
kartu (sebelumnya kepisah 2 kotak).

## Jasa
Tab "Jasa" sekarang juga cuma SATU kartu list, isinya tagline, daftar
"Tersedia" (tag), catatan nego harga, terus daftar semua jasa jadi satu
list (bukan kartu produk satu-satu lagi). "Jasa Bikin Aplikasi" dan
"Jasa Bikin Website" digabung jadi satu baris "Jasa Bikin Aplikasi &
Website". Tombol "Order" di tiap baris langsung buka chat WA ke owner.
Edit daftarnya di `product.js` (cari `JASA_LIST` dan `JASA_TERSEDIA`).

## Catatan lain
- Logo Roblox Studio/Studio Lite di web ini pakai ikon generik (bukan
  logo asli Roblox) biar aman dari hak cipta/merek dagang — cuma
  penanda "Studio" / "Studio Lite" aja.
- Folder `JASAIMG/` dan `BUYSTOCKIMG/` gak dipakai lagi karena section
  jasa & stock map sekarang format list tanpa foto.

## Blacklist (update 3)
Overlay blacklist muncul pas masuk web (bisa di-X, Esc, atau klik luar), isinya 2 foto saluran berdampingan + penjelasan. Menu "Blacklist" ada di navbar atas & bottom nav = daftar lengkap + bukti. Edit daftar di `blacklist.js` (BLACKLIST_LIST), foto di `BLACKLISTIMG/`. Nomor HP di screenshot sengaja gak dipasang.

## Redesign tema (update 4) — gaya HC_FLINDER / RBX Finder
Tampilan diganti jadi neo-brutalist light: background krem hangat + grid tipis merah, aksen merah #ff1f3d,
border hitam 2px, bayangan keras (offset), font Bricolage Grotesque + Inter + JetBrains Mono.
Yang diubah: `style.css` (ditulis ulang total), link font & tombol "Lihat Katalog" di `index.html`,
warna CSS tambahan di `blacklist.js`. Nama class, isi JS, produk, dan semua fitur TIDAK diubah.
Palet ada di `:root` paling atas `style.css` — tinggal ganti kalau mau warna lain.

## Update 5
- Produk bisa banyak foto: `img: ["a.jpg","b.jpg"]` -> ada panah + titik + bisa digeser (kayak testimoni).
- Seller di bawah tiap produk: default CikRorw + centang biru (klik = profile). Produk bukan dari CikRorw: isi `seller: "Nama"` (tanpa centang).
- Centang biru di samping nama produk dihapus.
- Overlay blacklist (popup awal) diganti overlay Follow Saluran WA + TikTok (`follow.js`). Menu Blacklist di navbar tetap ada.
- TikTok baru: tiktok.com/@cikhub_01. Nama owner: CikRorw. Foto owner & banner hero diganti.
- Fix kartu produk panjang di HP lain: ukuran isi kartu ikut lebar kartu (container query) + teks dibatasi baris.
- Produk baru: Hangout Kit V3 - KECHE (2 foto). Harga di product.js masih placeholder Rp 25.000, ganti sesuai harga asli.
