# CIK STORE - PWA + Notifikasi Push

## Deploy (Vercel + GitHub)
1. Upload isi folder ini ke repo GitHub (root repo = isi folder ini), Vercel auto-deploy.
2. Vercel -> Project -> Storage -> Create -> **Upstash Redis** -> Connect ke project ini.
3. Vercel -> Settings -> Environment Variables -> tambah `NOTIF_SECRET` = e59e226d709e28adf4a89f73ef53bba0f872236da2f819b6
   (harus sama dengan `secret` notifstore di bot: src/commands/notif.js). Lalu **Redeploy**.
4. Di bot, isi `url` notifstore dengan domain Vercel store kamu.
5. Tes: buka web di Chrome HP -> Aktifkan Notifikasi -> kirim `.notifstore halo`.

## Install PWA
Chrome Android: tombol "Install App" di menu Profile (atau menu browser -> Install app).
iPhone: Share -> Add to Home Screen (notif cuma jalan kalau sudah di-install).

## Catatan icon notif
- `icon-192.png` = foto logo (muncul di kanan notif)
- `badge-96.png` = siluet putih TRANSPARAN (ikon kecil di samping nama situs). Jangan diganti gambar penuh, nanti jadi kotak putih.
