<script setup>
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
} from "lucide-vue-next";
</script>

<template>
    <div class="max-w-5xl mx-auto pt-0 md:pt-4 pb-12">
        <div
            class="bg-white dark:bg-[#111214] rounded-none md:rounded-[24px] shadow-none md:shadow-2xl overflow-hidden border-0 md:border border-gray-200 dark:border-[#1e1f22]"
        >
            <div
                class="h-32 md:h-52 bg-gradient-to-r from-[#5865F2] to-[#9875F7] relative group"
            >
                <button
                    class="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                >
                    <Edit3 :size="16" />
                </button>
            </div>

            <div class="px-5 md:px-10 pb-6 relative">
                <div
                    class="flex justify-between items-end -mt-12 md:-mt-16 mb-4"
                >
                    <div class="relative group cursor-pointer">
                        <div
                            class="w-24 h-24 md:w-36 md:h-36 rounded-full p-[6px] bg-white dark:bg-[#111214]"
                        >
                            <img
                                src="https://api.dicebear.com/9.x/micah/svg?seed=Arzyu"
                                class="w-full h-full object-cover rounded-full bg-gray-100 dark:bg-gray-800 hover:brightness-90 transition"
                            />
                        </div>

                        <div
                            class="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-7 h-7 md:w-9 md:h-9 bg-[#23a559] border-[5px] md:border-[6px] border-white dark:border-[#111214] rounded-full tooltip"
                            title="Online"
                        >
                            <div
                                class="md:hidden w-full h-full flex items-center justify-center"
                            >
                                <div
                                    class="w-1.5 h-1.5 bg-white/50 rounded-full"
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="bg-[#f2f3f5] dark:bg-[#1e1f22] border dark:border-[#2b2d31] p-1.5 rounded-xl flex gap-1 mb-1 md:mb-3"
                    >
                        <div
                            class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2b2d31] transition"
                            title="HypeSquad"
                        >
                            <Zap
                                :size="18"
                                class="text-amber-500 fill-amber-500"
                            />
                        </div>
                        <div
                            class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2b2d31] transition"
                            title="Developer"
                        >
                            <Code2 :size="18" class="text-blue-500" />
                        </div>
                        <div
                            class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2b2d31] transition"
                            title="Verified"
                        >
                            <BadgeCheck
                                :size="18"
                                class="text-green-500 fill-green-500/20"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <div
                        class="flex flex-col md:flex-row md:items-center gap-1 md:gap-3"
                    >
                        <h1
                            class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white"
                        >
                            Arzyu Developer
                        </h1>
                        <div class="flex items-center gap-2">
                            <span
                                class="text-slate-500 dark:text-gray-400 font-medium text-base md:text-lg"
                                >arzyu#0001</span
                            >
                            <span
                                class="px-1.5 py-0.5 rounded text-[10px] uppercase bg-[#5865F2] text-white font-bold tracking-wide"
                                >SYSTEM</span
                            >
                        </div>
                    </div>

                    <p
                        class="md:hidden text-sm text-slate-600 dark:text-gray-300 mt-2"
                    >
                        🚀 Building digital dreams.
                    </p>
                </div>

                <div class="h-[1px] bg-gray-100 dark:bg-[#2b2d31] my-6"></div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                    <div class="space-y-6 order-1 lg:order-2">
                        <h3
                            class="text-xs font-bold text-slate-900 dark:text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2"
                        >
                            <span
                                class="w-2 h-2 rounded-full bg-green-500"
                            ></span>
                            Activity Status
                        </h3>

                        <div
                            class="bg-gray-50 dark:bg-[#1e1f22] p-4 rounded-xl border border-gray-200 dark:border-[#2b2d31] transition hover:border-blue-500/30"
                        >
                            <div class="flex gap-4">
                                <div class="relative shrink-0">
                                    <div
                                        class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20"
                                    >
                                        <Code2 :size="32" />
                                    </div>
                                    <div
                                        class="absolute -bottom-1 -right-1 bg-[#1e1f22] rounded-full p-0.5"
                                    >
                                        <div
                                            class="w-5 h-5 bg-[#23a559] rounded-full border-2 border-[#1e1f22]"
                                        ></div>
                                    </div>
                                </div>

                                <div class="min-w-0 flex-1">
                                    <h4
                                        class="font-bold text-sm text-slate-900 dark:text-white"
                                    >
                                        Visual Studio Code
                                    </h4>
                                    <p
                                        class="text-xs text-slate-600 dark:text-gray-300 mt-1 truncate"
                                    >
                                        Editing
                                        <span class="font-mono text-blue-500"
                                            >Dashboard.vue</span
                                        >
                                    </p>
                                    <p
                                        class="text-xs text-slate-500 dark:text-gray-400 mt-0.5"
                                    >
                                        Workspace: Jiyaworld
                                    </p>
                                    <p
                                        class="text-xs text-slate-400 dark:text-gray-500 mt-1.5 font-mono"
                                    >
                                        03:12 elapsed
                                    </p>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-2 mt-4">
                                <button
                                    class="bg-white dark:bg-[#2b2d31] text-xs font-bold py-2 rounded-lg border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-[#35373c] text-slate-700 dark:text-white transition"
                                >
                                    Ask to Join
                                </button>
                                <button
                                    class="bg-white dark:bg-[#2b2d31] text-xs font-bold py-2 rounded-lg border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-[#35373c] text-slate-700 dark:text-white transition"
                                >
                                    Spectate
                                </button>
                            </div>
                        </div>

                        <div
                            class="bg-gray-50 dark:bg-[#1e1f22] p-4 rounded-xl border border-gray-200 dark:border-[#2b2d31] flex items-center gap-4"
                        >
                            <div
                                class="w-12 h-12 bg-[#1DB954] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/20 shrink-0"
                            >
                                <Music :size="24" />
                            </div>
                            <div class="min-w-0">
                                <h4
                                    class="font-bold text-xs text-[#1DB954] mb-0.5 uppercase tracking-wide"
                                >
                                    Listening to Spotify
                                </h4>
                                <p
                                    class="text-sm font-bold text-slate-900 dark:text-white truncate"
                                >
                                    Lofi Hip Hop Radio 24/7
                                </p>
                                <p
                                    class="text-xs text-slate-500 dark:text-gray-400 truncate"
                                >
                                    by Lofi Girl
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-2 space-y-8 order-2 lg:order-1">
                        <section>
                            <h3
                                class="text-xs font-bold text-slate-900 dark:text-gray-300 uppercase tracking-widest mb-4"
                            >
                                About Me
                            </h3>
                            <div
                                class="bg-gradient-to-br from-gray-50 to-white dark:from-[#1e1f22] dark:to-[#111214] p-5 rounded-2xl border border-gray-100 dark:border-[#2b2d31]"
                            >
                                <p
                                    class="text-sm md:text-base text-slate-600 dark:text-gray-300 leading-relaxed"
                                >
                                    👋 <strong>Halo!</strong> Saya seorang
                                    Fullstack Developer yang menikmati kopi
                                    hitam dan kode bersih. Saat ini sedang fokus
                                    membangun ekosistem personal dengan:
                                </p>

                                <div class="flex flex-wrap gap-2 mt-4">
                                    <span
                                        class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    >
                                        <Hash :size="12" class="mr-1" /> Vue.js
                                        3
                                    </span>
                                    <span
                                        class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    >
                                        <Hash :size="12" class="mr-1" />
                                        Firebase
                                    </span>
                                    <span
                                        class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    >
                                        <Hash :size="12" class="mr-1" />
                                        Tailwind
                                    </span>
                                </div>

                                <div
                                    class="mt-4 pt-4 border-t border-gray-200 dark:border-[#2b2d31] flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400"
                                >
                                    <MapPin :size="14" />
                                    <span>Bekasi, Indonesia</span>
                                    <span class="mx-1">•</span>
                                    <span
                                        >Local Time:
                                        {{
                                            new Date().toLocaleTimeString(
                                                "id-ID",
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                },
                                            )
                                        }}</span
                                    >
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3
                                class="text-xs font-bold text-slate-900 dark:text-gray-300 uppercase tracking-widest mb-4"
                            >
                                Connections
                            </h3>

                            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <a
                                    href="#"
                                    class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1e1f22] border border-gray-200 dark:border-[#2b2d31] rounded-xl hover:bg-gray-50 dark:hover:bg-[#2b2d31]/80 transition group"
                                >
                                    <Github
                                        :size="20"
                                        class="text-slate-900 dark:text-white"
                                    />
                                    <div class="min-w-0">
                                        <p
                                            class="text-xs text-slate-500 dark:text-gray-400 font-medium"
                                        >
                                            Github
                                        </p>
                                        <p
                                            class="text-sm font-bold text-slate-900 dark:text-gray-200 truncate group-hover:text-blue-500 transition"
                                        >
                                            arzyu-dev
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href="#"
                                    class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1e1f22] border border-gray-200 dark:border-[#2b2d31] rounded-xl hover:bg-gray-50 dark:hover:bg-[#2b2d31]/80 transition group"
                                >
                                    <Twitter
                                        :size="20"
                                        class="text-[#1DA1F2]"
                                    />
                                    <div class="min-w-0">
                                        <p
                                            class="text-xs text-slate-500 dark:text-gray-400 font-medium"
                                        >
                                            Twitter
                                        </p>
                                        <p
                                            class="text-sm font-bold text-slate-900 dark:text-gray-200 truncate group-hover:text-[#1DA1F2] transition"
                                        >
                                            @arzyu
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href="#"
                                    class="col-span-2 md:col-span-1 flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1e1f22] border border-gray-200 dark:border-[#2b2d31] rounded-xl hover:bg-gray-50 dark:hover:bg-[#2b2d31]/80 transition group"
                                >
                                    <Globe :size="20" class="text-indigo-500" />
                                    <div class="min-w-0">
                                        <p
                                            class="text-xs text-slate-500 dark:text-gray-400 font-medium"
                                        >
                                            Website
                                        </p>
                                        <p
                                            class="text-sm font-bold text-slate-900 dark:text-gray-200 truncate group-hover:text-indigo-500 transition"
                                        >
                                            jiyaworld.com
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
