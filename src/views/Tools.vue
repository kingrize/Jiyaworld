<script setup>
import { RouterLink } from "vue-router";
import {
    Gamepad2,
    Search,
    QrCode,
    Wifi,
    Smartphone,
    ShieldCheck,
    Zap,
} from "lucide-vue-next";

// Daftar Tools
const tools = [
    {
        name: "MLBB Checker",
        desc: "Cek validitas akun Mobile Legends real-time.",
        icon: Gamepad2,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        link: "/tools/ml-check", // Route aktif
        isComingSoon: false,
    },
    {
        name: "IP Locator",
        desc: "Lacak lokasi detail dari alamat IP.",
        icon: Search,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-500/10",
        link: "#",
        isComingSoon: true,
    },
    {
        name: "QR Generator",
        desc: "Buat kode QR custom dengan cepat.",
        icon: QrCode,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-500/10",
        link: "#",
        isComingSoon: true,
    },
    {
        name: "Device Info",
        desc: "Cek spesifikasi device pengguna.",
        icon: Smartphone,
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-500/10",
        link: "#",
        isComingSoon: true,
    },
];
</script>

<template>
    <div class="space-y-6">
        <div>
            <h1
                class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
                Utility Tools
            </h1>
            <p class="text-slate-500 dark:text-gray-400 mt-1">
                Kumpulan alat bantu produktivitas.
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RouterLink
                v-for="(tool, index) in tools"
                :key="index"
                :to="tool.link"
                class="group relative bg-white dark:bg-[#111214] p-5 rounded-2xl border border-gray-100 dark:border-[#1e1f22] hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all hover:shadow-lg dark:hover:bg-[#151618] flex items-start gap-4 overflow-hidden"
                :class="{
                    'opacity-60 cursor-not-allowed grayscale':
                        tool.isComingSoon,
                }"
            >
                <div
                    :class="`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tool.bg} ${tool.color}`"
                >
                    <component :is="tool.icon" :size="24" />
                </div>

                <div>
                    <h3
                        class="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors"
                    >
                        {{ tool.name }}
                    </h3>
                    <p
                        class="text-xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed"
                    >
                        {{ tool.desc }}
                    </p>
                </div>

                <div v-if="tool.isComingSoon" class="absolute top-3 right-3">
                    <span
                        class="text-[10px] font-bold bg-gray-100 dark:bg-[#1e1f22] text-gray-400 px-2 py-1 rounded-md"
                        >SOON</span
                    >
                </div>
            </RouterLink>
        </div>
    </div>
</template>
