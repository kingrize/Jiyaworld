<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
    Code2,
    Github,
    Twitter,
    Globe,
    Hash,
    Music,
    BadgeCheck,
    Zap,
    Edit3,
    MapPin,
    Clock,
    ArrowUpRight,
} from "lucide-vue-next";

// --- Realtime Clock Logic ---
const currentTime = ref("");
let timer;

const updateTime = () => {
    currentTime.value = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    });
};

onMounted(() => {
    updateTime();
    timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});

// Mock Data for Skills
const techStacks = [
    {
        name: "Vue.js 3",
        color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    },
    {
        name: "Firebase",
        color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    },
    {
        name: "Tailwind",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    },
    {
        name: "Node.js",
        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    },
];

const socials = [
    {
        name: "Github",
        handle: "arzyu-dev",
        icon: Github,
        link: "https://github.com",
        color: "hover:text-gray-900 dark:hover:text-white",
    },
    {
        name: "Twitter",
        handle: "@arzyu",
        icon: Twitter,
        link: "https://twitter.com",
        color: "hover:text-[#1DA1F2]",
    },
    {
        name: "Website",
        handle: "jiyaworld.com",
        icon: Globe,
        link: "https://jiyaworld.com",
        color: "hover:text-indigo-500",
    },
];
</script>

<template>
    <div class="animate-fade-in space-y-6">
        <!-- HEADER / BANNER -->
        <div
            class="relative bg-white dark:bg-[#18181b] rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 shadow-sm"
        >
            <div
                class="h-40 md:h-52 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden"
            >
                <div
                    class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"
                ></div>
                <!-- Optional: Edit Cover Button -->
                <button
                    class="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-xl backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                >
                    <Edit3 :size="16" />
                </button>
            </div>

            <div class="px-6 md:px-10 pb-8">
                <div
                    class="flex flex-col md:flex-row justify-between items-start md:items-end -mt-14 md:-mt-16 mb-4 relative z-10"
                >
                    <div
                        class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6"
                    >
                        <!-- Avatar -->
                        <div class="relative group">
                            <div
                                class="w-28 h-28 md:w-36 md:h-36 rounded-3xl p-1.5 bg-white dark:bg-[#18181b] shadow-xl"
                            >
                                <img
                                    src="https://api.dicebear.com/9.x/micah/svg?seed=Arzyu"
                                    class="w-full h-full object-cover rounded-2xl bg-gray-100 dark:bg-[#27272a]"
                                />
                            </div>
                            <!-- Status Indicator -->
                            <div
                                class="absolute -bottom-1 -right-1 md:bottom-1 md:right-1 w-8 h-8 bg-[#18181b] rounded-full flex items-center justify-center"
                            >
                                <div
                                    class="w-5 h-5 bg-green-500 rounded-full border-[3px] border-[#18181b]"
                                    title="Online"
                                ></div>
                            </div>
                        </div>

                        <!-- Name & Badges -->
                        <div class="text-center md:text-left mb-2 md:mb-4">
                            <div
                                class="flex items-center gap-2 justify-center md:justify-start"
                            >
                                <h1
                                    class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight"
                                >
                                    Arzyu Developer
                                </h1>
                                <BadgeCheck
                                    :size="24"
                                    class="text-blue-500 fill-blue-500/10"
                                />
                            </div>
                            <div
                                class="flex items-center gap-3 justify-center md:justify-start mt-1"
                            >
                                <span
                                    class="text-slate-500 dark:text-gray-400 font-medium"
                                    >arzyu#0001</span
                                >
                                <span
                                    class="w-1 h-1 bg-gray-300 rounded-full"
                                ></span>
                                <span
                                    class="px-2 py-0.5 rounded-md text-[10px] uppercase bg-indigo-500/10 text-indigo-500 font-bold tracking-wider border border-indigo-500/20"
                                    >System</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Badges Row -->
                    <div
                        class="hidden md:flex gap-2 mb-4 bg-gray-50 dark:bg-white/5 p-1.5 rounded-xl border border-gray-200 dark:border-white/5"
                    >
                        <div
                            class="p-2 rounded-lg hover:bg-white dark:hover:bg-white/10 transition cursor-help group relative"
                            title="HypeSquad"
                        >
                            <Zap
                                :size="20"
                                class="text-amber-500 fill-amber-500 transition group-hover:scale-110"
                            />
                        </div>
                        <div
                            class="p-2 rounded-lg hover:bg-white dark:hover:bg-white/10 transition cursor-help group relative"
                            title="Developer"
                        >
                            <Code2
                                :size="20"
                                class="text-blue-500 transition group-hover:scale-110"
                            />
                        </div>
                    </div>
                </div>

                <div class="h-px bg-gray-100 dark:bg-white/5 my-6"></div>

                <!-- CONTENT GRID -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- LEFT COLUMN: Status & Activity -->
                    <div class="space-y-6 lg:col-span-1 order-2 lg:order-1">
                        <!-- VS Code Status -->
                        <div
                            class="bg-gray-50 dark:bg-[#202023] p-5 rounded-2xl border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-colors group"
                        >
                            <h3
                                class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"
                            >
                                <span class="relative flex h-2 w-2">
                                    <span
                                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
                                    ></span>
                                    <span
                                        class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"
                                    ></span>
                                </span>
                                Coding Now
                            </h3>
                            <div class="flex gap-4">
                                <div class="relative shrink-0">
                                    <div
                                        class="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20"
                                    >
                                        <Code2 :size="28" />
                                    </div>
                                    <div
                                        class="absolute -bottom-1 -right-1 bg-[#202023] rounded-full p-0.5"
                                    >
                                        <div
                                            class="w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#202023]"
                                        ></div>
                                    </div>
                                </div>
                                <div class="min-w-0">
                                    <h4
                                        class="font-bold text-sm text-slate-900 dark:text-white"
                                    >
                                        Visual Studio Code
                                    </h4>
                                    <p
                                        class="text-xs text-slate-600 dark:text-gray-400 mt-0.5 truncate"
                                    >
                                        Editing
                                        <span
                                            class="font-mono text-blue-500 bg-blue-500/10 px-1 rounded"
                                            >Dashboard.vue</span
                                        >
                                    </p>
                                    <p
                                        class="text-xs text-slate-400 dark:text-gray-500 mt-1"
                                    >
                                        Project: Jiyaworld
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Spotify Status -->
                        <div
                            class="bg-gray-50 dark:bg-[#202023] p-5 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center gap-4 group"
                        >
                            <div
                                class="w-12 h-12 bg-[#1DB954] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/20 shrink-0 group-hover:scale-105 transition-transform"
                            >
                                <Music :size="24" />
                            </div>
                            <div class="min-w-0 overflow-hidden">
                                <h4
                                    class="font-bold text-[10px] text-[#1DB954] mb-0.5 uppercase tracking-wide"
                                >
                                    Listening to Spotify
                                </h4>
                                <div class="relative w-full overflow-hidden">
                                    <p
                                        class="text-sm font-bold text-slate-900 dark:text-white truncate"
                                    >
                                        Lofi Hip Hop Radio
                                    </p>
                                </div>
                                <p
                                    class="text-xs text-slate-500 dark:text-gray-400 truncate"
                                >
                                    by Lofi Girl
                                </p>
                            </div>
                            <div class="ml-auto">
                                <div class="flex gap-0.5 items-end h-4">
                                    <span
                                        class="w-1 bg-[#1DB954] rounded-full animate-[pulse_1s_ease-in-out_infinite] h-2"
                                    ></span>
                                    <span
                                        class="w-1 bg-[#1DB954] rounded-full animate-[pulse_1.5s_ease-in-out_infinite] h-4"
                                    ></span>
                                    <span
                                        class="w-1 bg-[#1DB954] rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-3"
                                    ></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN: About & Connections -->
                    <div class="lg:col-span-2 space-y-6 order-1 lg:order-2">
                        <!-- About Card -->
                        <div
                            class="bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-gray-100 dark:border-white/5"
                        >
                            <h3
                                class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4"
                            >
                                About Me
                            </h3>
                            <p
                                class="text-slate-600 dark:text-gray-300 leading-relaxed mb-6"
                            >
                                👋 <strong>Halo!</strong> Saya seorang Fullstack
                                Developer yang menikmati kopi hitam dan kode
                                bersih. Saat ini sedang fokus membangun
                                ekosistem personal space untuk meningkatkan
                                produktivitas.
                            </p>

                            <div class="flex flex-wrap gap-2 mb-6">
                                <span
                                    v-for="tech in techStacks"
                                    :key="tech.name"
                                    :class="`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border border-transparent ${tech.color}`"
                                >
                                    <Hash
                                        :size="12"
                                        class="mr-1.5 opacity-70"
                                    />
                                    {{ tech.name }}
                                </span>
                            </div>

                            <div
                                class="pt-5 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400"
                            >
                                <div
                                    class="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg"
                                >
                                    <MapPin :size="14" />
                                    <span>Bekasi, Indonesia</span>
                                </div>
                                <div
                                    class="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg min-w-[140px]"
                                >
                                    <Clock :size="14" />
                                    <span>{{ currentTime }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Connections Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <a
                                v-for="social in socials"
                                :key="social.name"
                                :href="social.link"
                                target="_blank"
                                class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition group"
                            >
                                <component
                                    :is="social.icon"
                                    :size="20"
                                    class="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                                />
                                <div class="flex-1 min-w-0">
                                    <p
                                        class="text-[10px] text-gray-400 font-bold uppercase"
                                    >
                                        {{ social.name }}
                                    </p>
                                    <p
                                        :class="`text-sm font-bold text-slate-900 dark:text-gray-200 truncate transition-colors ${social.color}`"
                                    >
                                        {{ social.handle }}
                                    </p>
                                </div>
                                <ArrowUpRight
                                    :size="16"
                                    class="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
