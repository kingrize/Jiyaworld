<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import {
    ChevronLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    User,
    MapPin,
    Gamepad2,
    Hash,
    Zap,
} from "lucide-vue-next";

const router = useRouter();

const userId = ref("");
const zoneId = ref("");
const loading = ref(false);
const result = ref(null);
const errorMsg = ref("");

const checkAccount = async () => {
    if (!userId.value || !zoneId.value) {
        errorMsg.value = "User ID dan Zone ID wajib diisi.";
        return;
    }

    loading.value = true;
    errorMsg.value = "";
    result.value = null;

    try {
        // DETEKSI OTOMATIS: Lagi di Laptop (Local) atau di Cloud (Vercel)?
        const isLocalhost =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";

        // TENTUKAN JALUR
        // Localhost -> Lewat Vite Proxy (/api-local) yang sudah kita suntik Cookie
        // Vercel -> Lewat Serverless Function (/api/check) yang juga punya Cookie
        const baseUrl = isLocalhost
            ? "/api-local/stalk/mobile-legends"
            : "/api/check";
        const finalUrl = `${baseUrl}?userId=${userId.value}&zoneId=${zoneId.value}`;

        console.log(
            `Requesting via ${isLocalhost ? "Local Proxy (Vite)" : "Vercel Serverless"}...`,
        );

        const response = await axios.get(finalUrl);

        // Format data Localhost (langsung dari Ryzumi) dan Vercel (dibungkus wrapper) sedikit beda
        // Kita normalisasi di sini:
        const rawData = response.data;
        const finalData = isLocalhost ? rawData : rawData.data;

        // Validasi
        const nickname = finalData.username || finalData.nickname;
        const region = finalData.region;

        if (nickname) {
            result.value = {
                nickname: nickname,
                region: region || "Unknown Region",
                userId: userId.value,
                zoneId: zoneId.value,
                provider: "Ryzumi (VIP Access)",
            };
        } else {
            throw new Error("Data kosong / ID Salah");
        }
    } catch (err) {
        console.error(err);
        errorMsg.value = "Gagal. Cookie mungkin kadaluarsa atau ID Salah.";
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="max-w-xl mx-auto pt-2 pb-12">
        <div class="flex items-center gap-2 mb-6 px-1">
            <button
                @click="router.back()"
                class="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1e1f22] text-blue-600 transition-colors group"
            >
                <div class="flex items-center gap-1">
                    <ChevronLeft
                        :size="24"
                        class="group-active:-translate-x-1 transition-transform"
                    />
                    <span class="text-base font-medium">Back</span>
                </div>
            </button>
            <h1
                class="text-lg font-bold text-slate-900 dark:text-white mx-auto pr-12"
            >
                Checker
            </h1>
        </div>

        <div class="space-y-6">
            <div class="text-center space-y-2 px-4">
                <div
                    class="w-16 h-16 bg-blue-500 rounded-[22px] flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/30 mb-4"
                >
                    <Gamepad2 :size="32" />
                </div>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
                    Mobile Legends
                </h2>
                <p
                    class="text-slate-500 dark:text-gray-400 text-sm max-w-xs mx-auto"
                >
                    Cek Data Asli (Region Spesifik).
                </p>
            </div>

            <div
                class="bg-white dark:bg-[#1c1c1e] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm"
            >
                <div class="flex items-center px-4 py-1">
                    <label
                        class="w-24 text-sm font-medium text-slate-900 dark:text-white"
                        >User ID</label
                    >
                    <input
                        v-model="userId"
                        type="number"
                        placeholder="Contoh: 12345678"
                        class="flex-1 py-3 bg-transparent text-right text-slate-900 dark:text-white placeholder:text-gray-400 focus:outline-none font-mono no-spinner"
                    />
                </div>
                <div class="h-[1px] bg-gray-100 dark:bg-gray-800 ml-4"></div>
                <div class="flex items-center px-4 py-1">
                    <label
                        class="w-24 text-sm font-medium text-slate-900 dark:text-white"
                        >Zone ID</label
                    >
                    <input
                        v-model="zoneId"
                        type="number"
                        placeholder="1234"
                        class="flex-1 py-3 bg-transparent text-right text-slate-900 dark:text-white placeholder:text-gray-400 focus:outline-none font-mono no-spinner"
                    />
                </div>
            </div>

            <button
                @click="checkAccount"
                :disabled="loading"
                class="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Loader2 v-if="loading" :size="20" class="animate-spin" />
                <span v-else>Check Specific Region</span>
            </button>

            <transition name="slide-up">
                <div
                    v-if="result"
                    class="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl mt-8 relative overflow-hidden"
                >
                    <div
                        class="absolute top-0 right-0 bg-yellow-500/10 text-yellow-600 px-3 py-1 text-[10px] font-bold rounded-bl-xl flex items-center gap-1"
                    >
                        <Zap :size="10" fill="currentColor" />
                        PREMIUM DATA
                    </div>

                    <div class="flex items-center gap-4 mb-6">
                        <div
                            class="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400"
                        >
                            <CheckCircle2 :size="28" />
                        </div>
                        <div>
                            <p
                                class="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1"
                            >
                                Account Verified
                            </p>
                            <h3
                                class="text-xl font-black text-slate-900 dark:text-white"
                            >
                                {{ result.nickname }}
                            </h3>
                        </div>
                    </div>

                    <div
                        class="bg-gray-50 dark:bg-[#151517] rounded-xl overflow-hidden"
                    >
                        <div
                            class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800/50"
                        >
                            <div
                                class="flex items-center gap-3 text-slate-500 dark:text-gray-400"
                            >
                                <Hash :size="18" />
                                <span class="text-sm font-medium"
                                    >Account ID</span
                                >
                            </div>
                            <span
                                class="text-sm font-bold text-slate-900 dark:text-white font-mono"
                                >{{ result.userId }}</span
                            >
                        </div>
                        <div
                            class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800/50"
                        >
                            <div
                                class="flex items-center gap-3 text-slate-500 dark:text-gray-400"
                            >
                                <MapPin :size="18" />
                                <span class="text-sm font-medium"
                                    >Server Zone</span
                                >
                            </div>
                            <span
                                class="text-sm font-bold text-slate-900 dark:text-white font-mono"
                                >({{ result.zoneId }})</span
                            >
                        </div>
                        <div class="flex justify-between items-center p-4">
                            <div
                                class="flex items-center gap-3 text-slate-500 dark:text-gray-400"
                            >
                                <User :size="18" />
                                <span class="text-sm font-medium">Region</span>
                            </div>
                            <span
                                class="text-sm font-bold text-slate-900 dark:text-white"
                                >{{ result.region }}</span
                            >
                        </div>
                    </div>
                </div>
            </transition>

            <div
                v-if="errorMsg"
                class="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2"
            >
                <AlertCircle :size="18" />
                {{ errorMsg }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
.no-spinner {
    -moz-appearance: textfield;
}
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>
