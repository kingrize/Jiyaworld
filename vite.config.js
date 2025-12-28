import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue()],
    server: {
      proxy: {
        // PROXY SAKTI: Ini jembatan Localhost -> Ryzumi
        "/api-local": {
          target: "https://api.ryzumi.vip",
          changeOrigin: true,
          secure: false, // Abaikan SSL error jika ada
          rewrite: (path) => path.replace(/^\/api-local/, "/api"),
          configure: (proxy, options) => {
            proxy.on("proxyReq", (proxyReq, req, res) => {
              // 1. User-Agent (PENTING: Harus sama dengan browser asli)
              proxyReq.setHeader(
                "User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",
              );

              // 2. Referer (PENTING: Agar seolah-olah request dari web dokumentasi mereka)
              proxyReq.setHeader("Referer", "https://api.ryzumi.vip/docs/");

              // 3. Cookie cf_clearance (PENTING: Cookie ini expired-nya cepat, jika error 403 lagi, update ini)
              proxyReq.setHeader(
                "Cookie",
                "cf_clearance=PtvseIEO5MpVUtVSLm62rtuzZ7ttZQGabCQzmO149Jc-1766960965-1.2.1.1-6oxo9d3HzXHgOl_SXtlylPQDLjYCFfmg3403USQlCHjHPIY43D.lqRMq.hvOVUZ4iGn8.nd0tqxKHn9AHvFCNKiPk3ff6Uu01KSlzsV8ADOrxuLGUu_G3gLr4FEztI_7xjLHhOiFR3qVLih_IhjuDJpPSsCTN2qZ_Nfcfd9kKjt2xiVzqDS3ACH2mC200E1XLV4XYql0cmjGlKP1xYv33WkX1oawmOttyKOYd8qp1.beaXy2Y4KFOLQl4viqUQTO",
              );

              // 4. Header tambahan untuk bypass proteksi
              proxyReq.setHeader("Accept", "application/json");
              proxyReq.setHeader("Accept-Language", "en-US,en;q=0.5");
              proxyReq.setHeader("Sec-Fetch-Dest", "empty");
              proxyReq.setHeader("Sec-Fetch-Mode", "cors");
              proxyReq.setHeader("Sec-Fetch-Site", "same-origin");
            });
          },
        },
      },
    },
  };
});
