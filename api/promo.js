/* ============================================================
   FUNGSI CEK KODE PROMO
   Jalan di server (Vercel Serverless Function), bukan di browser
   — jadi kode & harga promo asli aman, orang cuma bisa "coba-coba"
   lewat form.

   Ada 3 jenis promo, diatur lewat Environment Variables
   di dashboard Vercel (BUKAN di file ini):
   Project -> Settings -> Environment Variables

   1) PROMO UMUM (berlaku ke SEMUA produk):
        KODE_PROMO   -> contoh: 257GF9
        HARGA_PROMO  -> contoh: 10000

   2) PROMO KHUSUS 1 KATEGORI (nama kategori huruf besar,
      spasi jadi underscore). Contoh kategori "bahan_map"
      (label "BAHAN MAP"):
        CODE_PROMO_BAHAN_MAP
        HARGA_PROMO_BAHAN_MAP

   3) PROMO KHUSUS 1 PRODUK (KEY dari nama produk: huruf besar,
      spasi/simbol jadi underscore). Contoh produk "Overhead Kit":
        CODE_PROMO_OVERHEAD_KIT
        HARGA_PROMO_OVERHEAD_KIT

   Nama kategori yang dikenal sebagai KATEGORI (bukan produk)
   didaftarin di CATEGORY_KEYS di bawah. Kalau nanti nambah
   kategori baru, tambahin juga di sini.

   PENTING: setelah nambah/ubah environment variable di Vercel,
   harus REDEPLOY biar perubahan kepakai.
   ============================================================ */

const CATEGORY_KEYS = ["SCRIPT", "BAHAN", "BAHAN_MAP", "KIT"];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch (e) {
      res.status(400).json({ error: "Body tidak valid" });
      return;
    }
  }
  body = body || {};

  const inputCode = String(body.code || "").trim().toUpperCase();

  if (!inputCode || inputCode.length < 6) {
    respond(res, { valid: false });
    return;
  }

  // 1) Cek promo UMUM (berlaku ke semua produk)
  const ALL_CODE = String(process.env.KODE_PROMO || "").trim().toUpperCase();
  if (ALL_CODE && inputCode === ALL_CODE) {
    respond(res, {
      valid: true,
      scope: "all",
      target: null,
      promoPrice: process.env.HARGA_PROMO || ""
    });
    return;
  }

  // 2) Cek promo KATEGORI / PRODUK lewat pola env CODE_PROMO_<KEY>
  for (const envKey of Object.keys(process.env)) {
    if (!envKey.startsWith("CODE_PROMO_")) continue;

    const suffix = envKey.slice("CODE_PROMO_".length); // contoh: BAHAN_MAP atau OVERHEAD_KIT
    const codeVal = String(process.env[envKey] || "").trim().toUpperCase();
    if (!codeVal || inputCode !== codeVal) continue;

    const priceEnvKey = "HARGA_PROMO_" + suffix;
    const promoPrice = process.env[priceEnvKey] || "";
    const isCategory = CATEGORY_KEYS.includes(suffix);

    respond(res, {
      valid: true,
      scope: isCategory ? "category" : "product",
      target: isCategory ? suffix.toLowerCase() : suffix,
      promoPrice
    });
    return;
  }

  // 3) Gak ketemu -> invalid
  respond(res, { valid: false });
};

function respond(res, data) {
  const payload = data.valid === false ? { valid: false } : data;
  res.status(200).setHeader("Content-Type", "application/json").json(payload);
}
