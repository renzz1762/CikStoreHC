/* ============================================================
   FUNGSI CEK PRODUK "COMING SOON"
   Jalan di server (Vercel Serverless Function). Scan semua
   Environment Variables yang namanya diawali "COMINGSOON_PRODUCT_",
   terus kirim balik daftar KEY produk + jam rilisnya ke browser.

   Cara pakai di dashboard Vercel -> Project -> Settings ->
   Environment Variables:
     COMINGSOON_PRODUCT_OVERHEAD_KIT = 17-08-2026 12:00

   KEY (di belakang "COMINGSOON_PRODUCT_") harus sama persis
   sama nama produk yang udah diubah otomatis di main.js
   (huruf besar semua, spasi/simbol jadi underscore).
   Contoh: produk "Overhead Kit" -> KEY = OVERHEAD_KIT

   Format value WAJIB: DD-MM-YYYY HH:mm (jam WIB / UTC+7)

   PENTING: setelah nambah/ubah environment variable di Vercel,
   harus REDEPLOY biar perubahan kepakai.
   ============================================================ */

module.exports = async (req, res) => {
  const items = [];

  for (const envKey of Object.keys(process.env)) {
    if (!envKey.startsWith("COMINGSOON_PRODUCT_")) continue;

    const key = envKey.slice("COMINGSOON_PRODUCT_".length);
    const raw = String(process.env[envKey] || "").trim();
    if (!raw) continue;

    const releaseAt = parseReleaseDate(raw);
    if (!releaseAt) continue;

    items.push({ key, releaseAt: releaseAt.toISOString() });
  }

  res.status(200).setHeader("Content-Type", "application/json").json({ items });
};

function parseReleaseDate(raw) {
  // Format utama: "17-08-2026 12:00" (DD-MM-YYYY HH:mm), asumsi WIB (UTC+7)
  const m = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (m) {
    const [, d, mo, y, h, mi] = m;
    const iso = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(h).padStart(2, "0")}:${mi}:00+07:00`;
    const dt = new Date(iso);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // Fallback: coba format lain yang dikenali JS (misal ISO 8601)
  const dt2 = new Date(raw);
  return isNaN(dt2.getTime()) ? null : dt2;
}
