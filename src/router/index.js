import { createRouter, createWebHistory } from "vue-router";

import Dashboard from "../views/Dashboard.vue";
import Tools from "../views/Tools.vue";
// Import file baru kita
import MLChecker from "../views/apps/MLChecker.vue";
import Notes from "../views/Notes.vue";
import Settings from "../views/Settings.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: Dashboard,
    },
    {
      path: "/tools",
      name: "tools",
      component: Tools,
    },
    // --- ROUTE BARU ---
    {
      path: "/tools/ml-check", // URL Spesifik
      name: "ml-check",
      component: MLChecker,
    },
    // ------------------
    {
      path: "/notes",
      name: "notes",
      component: Notes,
    },
    {
      path: "/settings",
      name: "settings",
      component: Settings,
    },
  ],
});

export default router;
