<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import {
    ChevronLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Gamepad2,
    Hash,
    Zap,
    History,
    MapPin,
    Globe,
} from "lucide-vue-next";

const router = useRouter();

const userId = ref("");
const zoneId = ref("");
const loading = ref(false);
const result = ref(null);
const errorMsg = ref("");
const history = ref([]);

// Load history saat mounted
onMounted(() => {
    const saved = localStorage.getItem("ml_check_history");
    if (saved) history.value = JSON.parse(saved);
});

const saveToHistory = (data) => {
    const newEntry = {
        nickname: data.nickname,
        id: `${data.userId} (${data.zoneId})`,
        timestamp: Date.now(),
    };

    const filtered = history.value.filter((h) => h.id !== newEntry.id);
    const updated = [newEntry, ...filtered].slice(0, 3);

    history.value = updated;
    localStorage.setItem("ml_check_history", JSON.stringify(updated));
};

const clearHistory = () => {
    history.value = [];
    localStorage.removeItem("ml_check_history");
};

const checkAccount = async () => {
    if (!userId.value || !zoneId.value) {
        errorMsg.value = "User ID dan Zone ID wajib diisi.";
        return;
    }

    loading.value = true;
    errorMsg.value = "";
    result.value = null;

    try {
        const isLocalhost =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";
        let targetUrl;

        // Catatan: Jika isLocalhost, kita bergantung pada vite.config.js untuk menyuntikkan Header & Cookie.
        if (isLocalhost) {
            targetUrl = "/api-local/stalk/mobile-legends";
        } else {
            targetUrl = "/api/check";
        }

        const response = await axios.get(targetUrl, {
            params: {
                userId: userId.value,
                zoneId: zoneId.value,
            },
            headers: {
                Accept: "application/json",
            },
        });

        console.log("API Response:", response.data);

        const data = response.data;
        let playerData = null;

        // Flexible parsing logic
        if (data.username || data.nickname) {
            playerData = data;
        } else if (data.data && (data.data.username || data.data.nickname)) {
            playerData = data.data;
        } else if (
            data.result &&
            (data.result.username || data.result.nickname)
        ) {
            playerData = data.result;
        }

        if (playerData) {
            const nickname = playerData.username || playerData.nickname;
            const resData = {
                nickname: nickname,
                region: playerData.region || "Unknown Server",
                userId: userId.value,
                zoneId: zoneId.value,
            };
            result.value = resData;
            saveToHistory(resData);
        } else {
            throw new Error("Akun tidak ditemukan atau ID salah.");
        }
    } catch (err) {
        console.error("Check Error:", err);

        if (err.response) {
            // Handle specific HTTP errors
            if (err.response.status === 403) {
                errorMsg.value =
                    "Akses Ditolak (403). Cookie/Token di vite.config.js mungkin expired.";
            } else if (err.response.data && err.response.data.message) {
                errorMsg.value = `Gagal: ${err.response.data.message}`;
            } else {
                errorMsg.value = `Error Server (${err.response.status}). Coba lagi nanti.`;
            }
        } else {
            errorMsg.value =
                "Koneksi gagal. Cek internet atau konfigurasi proxy.";
        }
    } finally {
        loading.value = false;
    }
};

const useHistory = (item) => {
    const parts = item.id.split("(");
    userId.value = parts[0].trim();
    zoneId.value = parts[1].replace(")", "").trim();
    checkAccount();
};
</script>

<template>
    <div class="max-w-xl mx-auto pt-2 pb-12 animate-fade-in">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-8">
            <button
                @click="router.back()"
                class="p-2.5 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
            >
                <ChevronLeft :size="24" />
            </button>
            <div>
                <h1 class="text-xl font-bold text-slate-900 dark:text-white">
                    MLBB Checker
                </h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    Verifikasi akun real-time
                </p>
            </div>
        </div>

        <div class="space-y-6">
            <!-- Input Card -->
            <div
                class="bg-white dark:bg-[#18181b] rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-sm"
            >
                <div class="flex items-center gap-4 mb-6">
                    <div
                        class="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400"
                    >
                        <Gamepad2 :size="24" />
                    </div>
                    <div>
                        <h2 class="font-bold text-slate-900 dark:text-white">
                            Input ID Player
                        </h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Masukkan ID dan Server (4-5 digit)
                        </p>
                    </div>
                </div>

                <div class="flex gap-4 mb-6">
                    <div class="flex-1 space-y-2">
                        <label class="text-xs font-bold text-gray-500 uppercase"
                            >User ID</label
                        >
                        <input
                            v-model="userId"
                            type="number"
                            placeholder="12345678"
                            class="w-full bg-gray-50 dark:bg-[#202023] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all no-spinner"
                        />
                    </div>
                    <div class="w-1/3 space-y-2">
                        <label class="text-xs font-bold text-gray-500 uppercase"
                            >Zone ID</label
                        >
                        <input
                            v-model="zoneId"
                            type="number"
                            placeholder="1234"
                            class="w-full bg-gray-50 dark:bg-[#202023] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all no-spinner"
                        />
                    </div>
                </div>

                <button
                    @click="checkAccount"
                    :disabled="loading"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Loader2 v-if="loading" :size="20" class="animate-spin" />
                    <span v-else>Check Account</span>
                </button>
            </div>

            <!-- History Section -->
            <div v-if="history.length > 0 && !result" class="animate-fade-in">
                <div class="flex items-center justify-between mb-3 px-1">
                    <h3
                        class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"
                    >
                        <History :size="14" /> Recent Checks
                    </h3>
                    <button
                        @click="clearHistory"
                        class="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                    >
                        Clear
                    </button>
                </div>
                <div class="space-y-2">
                    <div
                        v-for="(item, idx) in history"
                        :key="idx"
                        @click="useHistory(item)"
                        class="bg-white dark:bg-[#18181b] p-3 rounded-xl border border-gray-200 dark:border-white/5 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition"
                    >
                        <div>
                            <p
                                class="text-sm font-bold text-slate-900 dark:text-white"
                            >
                                {{ item.nickname }}
                            </p>
                            <p class="text-xs text-gray-500 font-mono">
                                {{ item.id }}
                            </p>
                        </div>
                        <div class="text-xs text-gray-400">Re-check</div>
                    </div>
                </div>
            </div>

            <!-- Result Card -->
            <transition name="slide-up">
                <div
                    v-if="result"
                    class="bg-white dark:bg-[#18181b] rounded-3xl p-6 border-2 border-blue-500/10 dark:border-blue-500/20 shadow-xl relative overflow-hidden"
                >
                    <div
                        class="absolute top-0 right-0 bg-gradient-to-bl from-blue-500 to-indigo-600 text-white px-4 py-1.5 text-[10px] font-bold rounded-bl-2xl flex items-center gap-1 shadow-lg"
                    >
                        <Zap :size="12" fill="currentColor" /> VALID
                    </div>

                    <div class="flex items-center gap-4 mb-8">
                        <div
                            class="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 ring-4 ring-green-50 dark:ring-green-900/10"
                        >
                            <CheckCircle2 :size="32" />
                        </div>
                        <div>
                            <p
                                class="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1"
                            >
                                Verified Account
                            </p>
                            <h3
                                class="text-2xl font-black text-slate-900 dark:text-white"
                            >
                                {{ result.nickname }}
                            </h3>
                        </div>
                    </div>

                    <div
                        class="bg-gray-50 dark:bg-[#202023] rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-white/5 border border-gray-100 dark:border-white/5"
                    >
                        <div class="flex justify-between items-center p-4">
                            <div
                                class="flex items-center gap-3 text-slate-500 dark:text-gray-400"
                            >
                                <Hash :size="16" />
                                <span class="text-xs font-bold uppercase"
                                    >ID</span
                                >
                            </div>
                            <span
                                class="text-sm font-bold text-slate-900 dark:text-white font-mono"
                                >{{ result.userId }}</span
                            >
                        </div>
                        <div class="flex justify-between items-center p-4">
                            <div
                                class="flex items-center gap-3 text-slate-500 dark:text-gray-400"
                            >
                                <MapPin :size="16" />
                                <span class="text-xs font-bold uppercase"
                                    >Server</span
                                >
                            </div>
                            <span
                                class="text-sm font-bold text-slate-900 dark:text-white font-mono"
                                >{{ result.zoneId }}</span
                            >
                        </div>
                        <div
                            class="flex justify-between items-center p-4 bg-blue-50/50 dark:bg-blue-500/5"
                        >
                            <div
                                class="flex items-center gap-3 text-slate-500 dark:text-gray-400"
                            >
                                <Globe :size="16" />
                                <span class="text-xs font-bold uppercase"
                                    >Region</span
                                >
                            </div>
                            <span
                                class="text-sm font-bold text-blue-600 dark:text-blue-400"
                                >{{ result.region }}</span
                            >
                        </div>
                    </div>
                </div>
            </transition>

            <!-- Error Alert -->
            <div
                v-if="errorMsg"
                class="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100 dark:border-red-500/20 animate-in fade-in slide-in-from-top-2"
            >
                <AlertCircle :size="20" />
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
</style>
