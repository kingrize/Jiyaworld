// File: api/check.js
export default async function handler(req, res) {
  const { userId, zoneId } = req.query;

  if (!userId || !zoneId) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const targetUrl = `https://api.ryzumi.vip/api/stalk/mobile-legends?userId=${userId}&zoneId=${zoneId}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        // --- DATA DARI LOG BROWSER ANDA ---
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        // INI KUNCI SAKTINYA (cf_clearance):
        Cookie:
          "cf_clearance=qYICNYfmGwtiBLQpEDTqLjBCuGtNHqKQ77goZ52zIkk-1766853688-1.2.1.1-hgicEl0E8g1BGBLoprsuXfXy3oFtjHyc2Y5ih2h9855vaj9zXRj_NPiQoEU.BCD3hQyny_EwITjA.oUESsQF.V9RarZ7yNNa6P7sq5E816fSZqs3Wd9HfU_ebp5GCVkCC0GVSFEw952jkORmpOUUvzUVDmaXEH4cGE8Sdi8ohIh3uQ12hwK9Dcdrn7w.TPe5zPtxLp1iiE9Br__Ckdp6ERCHgsdClOUzcYJgvuiRe9upSsPTTc4mL8WFZN8LIC7D",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
      },
    });

    const data = await response.json();

    // Cek apakah berhasil
    if (data.username) {
      return res.status(200).json({
        success: true,
        data: {
          nickname: data.username,
          // DATA REGION ASLI DARI RYZUMI AKAN MUNCUL DISINI
          region: data.region || "Unknown",
          userId: userId,
          zoneId: zoneId,
        },
      });
    } else {
      return res.status(404).json({ error: "ID Not Found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
}
