import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // PROXY SAKTI: Ini jembatan Localhost -> Ryzumi
      "/api-local": {
        target: "https://api.ryzumi.vip",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-local/, "/api"), // Hapus awalan /api-local saat kirim ke Ryzumi

        // INI BAGIAN PENTINGNYA (PENYAMARAN)
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Kita paksa request membawa Identitas & Cookie yang valid
            proxyReq.setHeader(
              "User-Agent",
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0",
            );
            proxyReq.setHeader(
              "Accept",
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            );
            proxyReq.setHeader("Accept-Language", "en-US,en;q=0.5");
            // COOKIE DARI LOG ANDA (Jangan diubah kecuali kadaluarsa)
            proxyReq.setHeader(
              "Cookie",
              "cf_clearance=qYICNYfmGwtiBLQpEDTqLjBCuGtNHqKQ77goZ52zIkk-1766853688-1.2.1.1-hgicEl0E8g1BGBLoprsuXfXy3oFtjHyc2Y5ih2h9855vaj9zXRj_NPiQoEU.BCD3hQyny_EwITjA.oUESsQF.V9RarZ7yNNa6P7sq5E816fSZqs3Wd9HfU_ebp5GCVkCC0GVSFEw952jkORmpOUUvzUVDmaXEH4cGE8Sdi8ohIh3uQ12hwK9Dcdrn7w.TPe5zPtxLp1iiE9Br__Ckdp6ERCHgsdClOUzcYJgvuiRe9upSsPTTc4mL8WFZN8LIC7D",
            );
          });
        },
      },
    },
  },
});
