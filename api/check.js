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
    // GANTI PROVIDER: Menggunakan Isan (api.isan.eu.org)
    // Provider ini lebih stabil untuk penggunaan Server-to-Server (Vercel)
    const targetUrl = "https://api.isan.eu.org/nickname/ml";

    const response = await axios.get(targetUrl, {
      params: {
        id: userId, // Isan menggunakan parameter 'id'
        server: zoneId, // Isan menggunakan parameter 'server'
      },
      headers: {
        // User-Agent standar cukup untuk Isan
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const data = response.data;

    // Normalisasi Respon
    // Isan mengembalikan: { success: true, name: "Nickname", ... }
    // Kita ubah agar sesuai dengan format yang diharapkan Frontend (nickname)
    if (data.name) {
      return res.status(200).json({
        success: true,
        nickname: data.name, // Mapping 'name' ke 'nickname'
        userId: userId,
        zoneId: zoneId,
      });
    } else if (data.success === false) {
      return res.status(404).json({ message: "ID atau Server salah" });
    } else {
      // Fallback jika format response berbeda
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error("API Proxy Error:", error.message);

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
