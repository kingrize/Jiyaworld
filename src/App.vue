<script setup>
import { RouterView, RouterLink, useRoute } from "vue-router";
import {
    Home,
    LayoutGrid,
    Settings,
    BookOpen,
    Moon,
    Sun,
} from "lucide-vue-next";
import { ref, onMounted } from "vue";

const route = useRoute();
const isActive = (path) => route.path === path;

// --- LOGIC DARK MODE ---
const isDark = ref(false);

// Cek saat web pertama dibuka
onMounted(() => {
    // Cek apakah user pernah simpan settingan sebelumnya
    const savedTheme = localStorage.getItem("theme");
    // Atau cek settingan laptop user (System Preferences)
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

// Fungsi Toggle (Dipanggil dari tombol)
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
        class="min-h-screen flex font-sans bg-[#F2F2F7] text-[#1C1C1E] dark:bg-[#000000] dark:text-white transition-colors duration-300"
    >
        <aside
            class="hidden md:flex flex-col w-[280px] bg-white dark:bg-[#1C1C1E] h-screen sticky top-0 border-r border-gray-200/60 dark:border-gray-800 pl-6 pr-4 py-8 transition-colors duration-300"
        >
            <div class="flex items-center gap-3 mb-12 px-2">
                <div
                    class="w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center text-white font-bold text-lg"
                >
                    A
                </div>
                <div>
                    <h1 class="font-bold text-xl tracking-tight leading-none">
                        Arzyu<span class="text-blue-600">.Hub</span>
                    </h1>
                    <p class="text-xs text-gray-400 font-medium mt-1">
                        Personal Space
                    </p>
                </div>
            </div>

            <nav class="space-y-1 flex-1">
                <p
                    class="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2"
                >
                    Menu
                </p>

                <RouterLink
                    to="/"
                    class="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 font-medium text-[15px]"
                    :class="
                        isActive('/')
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    "
                >
                    <Home
                        :size="22"
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
                    class="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 font-medium text-[15px]"
                    :class="
                        isActive('/tools')
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    "
                >
                    <LayoutGrid
                        :size="22"
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
                    class="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-200 font-medium text-[15px]"
                    :class="
                        isActive('/notes')
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    "
                >
                    <BookOpen :size="22" />
                    Tech Notes
                </RouterLink>
            </nav>

            <div class="mt-auto space-y-2">
                <button
                    @click="toggleTheme"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                    <Sun v-if="!isDark" :size="20" />
                    <Moon v-else :size="20" />
                    <span>{{ isDark ? "Light Mode" : "Dark Mode" }}</span>
                </button>

                <RouterLink
                    to="/settings"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                    <Settings :size="20" />
                    Settings
                </RouterLink>
            </div>
        </aside>

        <main class="flex-1 min-w-0">
            <div
                class="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800"
            >
                <h1 class="font-bold text-lg dark:text-white">Arzyu.Hub</h1>
                <button
                    @click="toggleTheme"
                    class="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"
                >
                    <Moon v-if="!isDark" :size="20" />
                    <Sun v-else :size="20" class="text-white" />
                </button>
            </div>

            <div class="max-w-[1400px] mx-auto p-6 md:p-10 pb-32">
                <RouterView v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </RouterView>
            </div>
        </main>

        <nav
            class="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/20 dark:border-gray-800 shadow-2xl shadow-gray-300/50 dark:shadow-black/50 rounded-3xl p-2 flex justify-around items-center z-50"
        >
            <RouterLink
                to="/"
                class="p-3 rounded-2xl"
                :class="
                    isActive('/')
                        ? 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400'
                "
            >
                <Home
                    :size="24"
                    :class="
                        isActive('/')
                            ? 'fill-blue-600 dark:fill-blue-400'
                            : 'fill-none'
                    "
                />
            </RouterLink>
            <RouterLink
                to="/tools"
                class="p-3 rounded-2xl"
                :class="
                    isActive('/tools')
                        ? 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400'
                "
            >
                <LayoutGrid
                    :size="24"
                    :class="
                        isActive('/tools')
                            ? 'fill-blue-600 dark:fill-blue-400'
                            : 'fill-none'
                    "
                />
            </RouterLink>
            <RouterLink
                to="/settings"
                class="p-3 rounded-2xl text-gray-400"
                :class="isActive('/settings') ? 'text-blue-600' : ''"
            >
                <Settings :size="24" />
            </RouterLink>
        </nav>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
