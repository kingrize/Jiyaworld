// File: api/check.js
// Ini berjalan di Server Vercel (Backend), bukan di Browser User.

export default async function handler(req, res) {
  // 1. Ambil ID dari request
  const { userId, zoneId } = req.query;

  if (!userId || !zoneId) {
    return res.status(400).json({ error: "ID Wajib diisi" });
  }

  // 2. Daftar API Target (Prioritas Region Spesifik)
  // Kita manipulasi Header seolah-olah ini Browser Chrome
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    Referer: "https://google.com",
  };

  // List URL yang menyediakan Region
  const targets = [
    // TARGET 1: Ryzumi (Paling lengkap regionnya)
    `https://api.ryzumi.vip/api/stalk/mobile-legends?userId=${userId}&zoneId=${zoneId}`,

    // TARGET 2: API Alternative (Jika Ryzumi blokir Vercel)
    // Menggunakan endpoint publik lain yang sering dipakai checker
    `https://api.isan.eu.org/nickname/ml?id=${userId}&zone=${zoneId}`,
  ];

  for (const url of targets) {
    try {
      console.log("Menembak:", url);
      const response = await fetch(url, { headers });
      const data = await response.json();

      // Cek apakah data valid
      if (data.username || data.name || data.success) {
        // Normalisasi Data (Agar formatnya seragam)
        const nickname = data.username || data.name;
        // Ambil region jika ada, jika tidak ada (API Isan), biarkan null nanti diurus frontend
        const region = data.region || null;

        return res.status(200).json({
          success: true,
          nickname: nickname,
          region: region, // Kirim apa adanya (bisa region spesifik atau null)
          source: url.includes("ryzumi") ? "Ryzumi" : "Isan",
        });
      }
    } catch (error) {
      console.error("Gagal menembak:", url);
      // Lanjut ke target berikutnya
    }
  }

  // Jika semua gagal
  return res
    .status(500)
    .json({ error: "Gagal mengambil data dari semua server." });
}
