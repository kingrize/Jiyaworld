import { createRouter, createWebHistory } from "vue-router";

// Lazy Load Components (Performa lebih cepat)
const Dashboard = () => import("../views/Dashboard.vue");
const Tools = () => import("../views/Tools.vue");
const MLChecker = () => import("../views/apps/MLChecker.vue");
const Notes = () => import("../views/Notes.vue");
const Settings = () => import("../views/Settings.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: Dashboard,
      meta: { title: "Overview - Arzyu.Hub" },
    },
    {
      path: "/tools",
      name: "tools",
      component: Tools,
      meta: { title: "Tools - Arzyu.Hub" },
    },
    {
      path: "/tools/ml-check",
      name: "ml-check",
      component: MLChecker,
      meta: { title: "ML Checker - Arzyu.Hub" },
    },
    {
      path: "/notes",
      name: "notes",
      component: Notes,
      meta: { title: "Notes - Arzyu.Hub" },
    },
    {
      path: "/settings",
      name: "settings",
      component: Settings,
      meta: { title: "Settings - Arzyu.Hub" },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, behavior: "smooth" };
  },
});

// Update Judul Tab Browser
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "Arzyu.Hub";
  next();
});

export default router;
