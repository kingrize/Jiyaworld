import axios from "axios";

export default async function handler(req, res) {
  // Ambil parameter dari query URL (misal: /api/check?userId=123&zoneId=456)
  const { userId, zoneId } = req.query;

  if (!userId || !zoneId) {
    return res
      .status(400)
      .json({ message: "User ID and Zone ID are required" });
  }

  try {
    const targetUrl = "https://api.ryzumi.vip/api/stalk/mobile-legends";

    // Kita gunakan Header & Cookie SAMA PERSIS dengan yang ada di vite.config.js
    // Agar Cloudflare target mengira ini adalah request dari browser valid
    const response = await axios.get(targetUrl, {
      params: {
        userId,
        zoneId,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",
        Referer: "https://api.ryzumi.vip/docs/",
        Cookie:
          "cf_clearance=PtvseIEO5MpVUtVSLm62rtuzZ7ttZQGabCQzmO149Jc-1766960965-1.2.1.1-6oxo9d3HzXHgOl_SXtlylPQDLjYCFfmg3403USQlCHjHPIY43D.lqRMq.hvOVUZ4iGn8.nd0tqxKHn9AHvFCNKiPk3ff6Uu01KSlzsV8ADOrxuLGUu_G3gLr4FEztI_7xjLHhOiFR3qVLih_IhjuDJpPSsCTN2qZ_Nfcfd9kKjt2xiVzqDS3ACH2mC200E1XLV4XYql0cmjGlKP1xYv33WkX1oawmOttyKOYd8qp1.beaXy2Y4KFOLQl4viqUQTO",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
    });

    // Kirim balik data sukses dari API Ryzumi ke Frontend
    res.status(200).json(response.data);
  } catch (error) {
    console.error("API Proxy Error:", error.message);

    // Handle error jika API target menolak (misal 403 atau 404)
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data?.message || "Error from Target API",
        details: error.response.data,
      });
    }

    // Handle error server internal
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
