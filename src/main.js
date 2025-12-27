import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router"; // <--- 1. Import Router

// Hapus console.log db yang tadi (biar bersih)

const app = createApp(App);

app.use(router); // <--- 2. Gunakan Router
app.mount("#app");
