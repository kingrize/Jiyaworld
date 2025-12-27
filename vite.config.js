import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    // INI KUNCINYA: Kita buat proxy lokal
    proxy: {
      "/api-ml": {
        target: "https://api.ryzumi.vip", // Target Asli
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-ml/, "/api"), // Hapus awalan '/api-ml' saat kirim ke sana
      },
    },
  },
});
