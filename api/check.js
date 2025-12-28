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

    // Konfigurasi Header
    const response = await axios.get(targetUrl, {
      params: {
        userId,
        zoneId,
      },
      headers: {
        // Gunakan User-Agent umum agar dianggap browser valid
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://api.ryzumi.vip/docs/",
        Accept: "application/json",
        // PENTING: Cookie dihapus.
        // Cookie cf_clearance terikat pada IP. Mengirim cookie IP Local dari Server Vercel akan memicu Auto-Block (403).
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("API Proxy Error:", error.message);

    if (error.response) {
      // Error dari API Target (403, 404, dll)
      // Kita return status aslinya agar frontend tahu reason-nya
      return res.status(error.response.status).json({
        message: error.response.data?.message || "Error from Target API",
        details: error.response.data,
      });
    }

    // Error Jaringan / Internal
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
