// api/ml-stalk.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    const { userId, zoneId } = req.query;

    if (!userId || !zoneId) {
      return res.status(400).json({
        success: false,
        message: "userId dan zoneId wajib diisi",
      });
    }

    const response = await axios.get(
      "https://api.ryzumi.vip/api/stalk/mobile-legends",
      {
        params: { userId, zoneId },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          Referer: "https://api.ryzumi.vip/",
          Origin: "https://api.ryzumi.vip",
        },
        timeout: 10000,
      },
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Gagal mengambil data Mobile Legends",
      error: error.response?.data || error.message,
    });
  }
}
