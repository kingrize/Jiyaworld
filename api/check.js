import axios from "axios";

export default async function handler(req, res) {
  // Ambil parameter dari query URL
  const { userId, zoneId } = req.query;

  if (!userId || !zoneId) {
    return res
      .status(400)
      .json({ message: "User ID and Zone ID are required" });
  }

  try {
    const targetUrl = "https://api.ryzumi.vip/api/stalk/mobile-legends";

    // OPSI TERAKHIR: Mode Minimalis (Mirip CURL)
    // Cloudflare sering memblokir request antar-server yang membawa Cookie IP berbeda.
    // Kita coba HAPUS Cookie dan Referer, hanya gunakan User-Agent standar.
    const response = await axios.get(targetUrl, {
      params: {
        userId,
        zoneId,
      },
      headers: {
        // Gunakan User-Agent Chrome standar (lebih umum diterima daripada Firefox developer edition)
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("API Proxy Error:", error.message);

    // Fallback: Jika Ryzumi gagal/blokir (403), kita coba kembalikan pesan yang jelas
    if (error.response && error.response.status === 403) {
      return res.status(403).json({
        message: "Akses Ditolak Cloudflare (IP Vercel Diblokir).",
        suggestion:
          "API Ryzumi memblokir IP Datacenter. Fitur ini hanya akan jalan di Localhost.",
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data?.message || "Error from Target API",
        details: error.response.data,
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
