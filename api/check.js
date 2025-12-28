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

    // Konfigurasi Header berdasarkan Log Sukses Terbaru
    const response = await axios.get(targetUrl, {
      params: {
        userId,
        zoneId,
      },
      headers: {
        // User-Agent HARUS SAMA PERSIS dengan yang ada di log sukses (Firefox 146.0)
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",

        // Referer penting untuk menyamar seolah dari dokumentasi resmi
        Referer: "https://api.ryzumi.vip/docs/",

        // Format response yang diminta
        Accept: "application/json",

        // Cookie cf_clearance TERBARU dari log kamu.
        // PENTING: Cookie ini punya masa berlaku. Jika nanti error 403 lagi, berarti cookie ini expired.
        Cookie:
          "cf_clearance=n_XxH6SHpga4wuI9cmMxVXKaHQLvfHUNr7mj4RPmgC4-1766961685-1.2.1.1-q_S0HF986_WzyeBSBhd2ehnuk8Fu_.rgV5KpPqPc7rdApzxQpxci6NFNkO0a1FHVgnjqnix5HcTpYJacoxt0Zb._jLJoeoQlv0WxYb08uVkekbg9459K1pNF9Rj3VOiQhEA.zqG9AXBe3EQiG7ntvU_xneU98_RMnFHHrA1wMHwEjNt1Qdh8A6WQvXcdUVa_Lenh.UHPLuAkAYQZ6B639LOC.XDqwuqo27BE2rB4WELyFeChbnO2KNwG2Jot5Dwk",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("API Proxy Error:", error.message);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Deteksi Cloudflare Challenge
      if (typeof data === "string" && data.includes("<!DOCTYPE html>")) {
        return res.status(403).json({
          message:
            "Akses Ditolak Cloudflare. Cookie 'cf_clearance' mungkin expired atau IP Vercel diblokir.",
          suggestion:
            "Update Cookie di api/check.js dengan yang baru dari browser.",
        });
      }

      return res.status(status).json({
        message: data?.message || "Error from Target API",
        details: data,
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
