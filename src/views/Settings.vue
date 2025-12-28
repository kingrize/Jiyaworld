<script setup>
import { Settings as IconSettings, Construction } from "lucide-vue-next";
</script>

<template>
    <div class="space-y-8 animate-fade-in">
        <div>
            <h1
                class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
                Settings
            </h1>
            <p class="text-slate-500 dark:text-gray-400 mt-1">
                Konfigurasi tampilan & akun.
            </p>
        </div>

        <div
            class="bg-white dark:bg-[#18181b] rounded-[32px] border border-gray-200 dark:border-white/5 min-h-[400px] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group"
        >
            <div
                class="absolute inset-0 bg-gradient-to-tr from-gray-50 via-transparent to-transparent dark:from-white/5 opacity-50"
            ></div>

            <div class="relative z-10">
                <div
                    class="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-gray-400 mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"
                >
                    <Construction :size="40" />
                </div>

                <h3
                    class="text-xl font-bold text-slate-900 dark:text-white mb-2"
                >
                    Under Development
                </h3>
                <p
                    class="text-slate-500 dark:text-gray-400 text-sm max-w-xs mx-auto leading-relaxed"
                >
                    Kami sedang meracik fitur pengaturan yang canggih untukmu.
                    Nantikan update selanjutnya!
                </p>
            </div>
        </div>
    </div>
</template>
