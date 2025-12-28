<script setup>
import { RouterView, RouterLink, useRoute } from "vue-router";
import {
    Home,
    LayoutGrid,
    Settings,
    BookOpen,
    Moon,
    Sun,
    Menu,
} from "lucide-vue-next";
import { ref, onMounted } from "vue";

const route = useRoute();
const isActive = (path) => {
    // Logic agar sub-route (misal /tools/ml-check) tetap mengaktifkan menu parent (/tools)
    if (path === "/" && route.path !== "/") return false;
    return route.path.startsWith(path);
};

// --- LOGIC DARK MODE ---
const isDark = ref(false);

onMounted(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && systemDark)) {
        isDark.value = true;
        document.documentElement.classList.add("dark");
    } else {
        isDark.value = false;
        document.documentElement.classList.remove("dark");
    }
});

const toggleTheme = () => {
    isDark.value = !isDark.value;
    if (isDark.value) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
};
</script>

<template>
    <div
        class="min-h-screen flex font-sans bg-[#f8f9fa] dark:bg-[#09090b] text-[#1C1C1E] dark:text-white transition-colors duration-300"
    >
        <!-- SIDEBAR (Desktop) -->
        <aside
            class="hidden md:flex flex-col w-[280px] h-screen sticky top-0 border-r border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl pl-6 pr-4 py-8 z-50"
        >
            <div class="flex items-center gap-3 mb-10 px-2">
                <div
                    class="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-bold text-lg ring-1 ring-white/10"
                >
                    A
                </div>
                <div>
                    <h1 class="font-bold text-xl tracking-tight leading-none">
                        Arzyu<span class="text-blue-600">.Hub</span>
                    </h1>
                    <p
                        class="text-[11px] text-gray-500 font-medium mt-0.5 tracking-wide"
                    >
                        PERSONAL WORKSPACE
                    </p>
                </div>
            </div>

            <nav class="space-y-1.5 flex-1">
                <p
                    class="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3"
                >
                    Menu
                </p>

                <RouterLink
                    to="/"
                    class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm"
                    :class="
                        isActive('/')
                            ? 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    "
                >
                    <Home
                        :size="20"
                        :class="
                            isActive('/')
                                ? 'fill-blue-600 dark:fill-blue-400'
                                : 'fill-none'
                        "
                    />
                    Overview
                </RouterLink>

                <RouterLink
                    to="/tools"
                    class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm"
                    :class="
                        isActive('/tools')
                            ? 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    "
                >
                    <LayoutGrid
                        :size="20"
                        :class="
                            isActive('/tools')
                                ? 'fill-blue-600 dark:fill-blue-400'
                                : 'fill-none'
                        "
                    />
                    Utility Tools
                </RouterLink>

                <RouterLink
                    to="/notes"
                    class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm"
                    :class="
                        isActive('/notes')
                            ? 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    "
                >
                    <BookOpen
                        :size="20"
                        :class="
                            isActive('/notes')
                                ? 'fill-blue-600 dark:fill-blue-400'
                                : 'fill-none'
                        "
                    />
                    Tech Notes
                </RouterLink>
            </nav>

            <div
                class="mt-auto space-y-2 border-t border-gray-100 dark:border-white/5 pt-4"
            >
                <button
                    @click="toggleTheme"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                >
                    <Sun v-if="!isDark" :size="18" />
                    <Moon v-else :size="18" />
                    <span>{{ isDark ? "Light Mode" : "Dark Mode" }}</span>
                </button>

                <RouterLink
                    to="/settings"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5Ql transition"
                >
                    <Settings :size="18" />
                    Settings
                </RouterLink>
            </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="flex-1 min-w-0 relative">
            <!-- Mobile Header -->
            <div
                class="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-white/5"
            >
                <div class="flex items-center gap-2">
                    <div
                        class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    >
                        A
                    </div>
                    <h1
                        class="font-bold text-base dark:text-white tracking-tight"
                    >
                        Arzyu.Hub
                    </h1>
                </div>
                <button
                    @click="toggleTheme"
                    class="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-600 dark:text-gray-300"
                >
                    <Moon v-if="!isDark" :size="18" />
                    <Sun v-else :size="18" class="text-white" />
                </button>
            </div>

            <!-- Content Area -->
            <div class="max-w-[1200px] mx-auto p-4 md:p-8 pb-32 md:pb-12">
                <RouterView v-slot="{ Component }">
                    <Transition name="page" mode="out-in">
                        <component :is="Component" />
                    </Transition>
                </RouterView>
            </div>
        </main>

        <!-- MOBILE BOTTOM NAV (Floating) -->
        <nav
            class="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[350px] bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 rounded-full p-2 flex justify-between items-center z-50"
        >
            <RouterLink
                to="/"
                class="p-3.5 rounded-full transition-all"
                :class="
                    isActive('/')
                        ? 'bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 scale-105'
                        : 'text-gray-400'
                "
            >
                <Home
                    :size="22"
                    :class="isActive('/') ? 'fill-current' : 'fill-none'"
                />
            </RouterLink>
            <RouterLink
                to="/tools"
                class="p-3.5 rounded-full transition-all"
                :class="
                    isActive('/tools')
                        ? 'bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 scale-105'
                        : 'text-gray-400'
                "
            >
                <LayoutGrid
                    :size="22"
                    :class="isActive('/tools') ? 'fill-current' : 'fill-none'"
                />
            </RouterLink>
            <RouterLink
                to="/notes"
                class="p-3.5 rounded-full transition-all"
                :class="
                    isActive('/notes')
                        ? 'bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 scale-105'
                        : 'text-gray-400'
                "
            >
                <BookOpen
                    :size="22"
                    :class="isActive('/notes') ? 'fill-current' : 'fill-none'"
                />
            </RouterLink>
            <RouterLink
                to="/settings"
                class="p-3.5 rounded-full transition-all"
                :class="
                    isActive('/settings')
                        ? 'bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 scale-105'
                        : 'text-gray-400'
                "
            >
                <Settings :size="22" />
            </RouterLink>
        </nav>
    </div>
</template>

<style>
/* Global Transitions */
.page-enter-active,
.page-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}
.page-enter-from,
.page-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>
