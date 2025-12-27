<script setup>
import { ref, onMounted } from "vue";
import { Plus, X, BookOpen, Clock } from "lucide-vue-next";
// Import fungsi Database
import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";

// --- STATE MANAGEMENT ---
const notes = ref([]); // Menyimpan daftar catatan
const showModal = ref(false); // Mengatur buka/tutup modal
const newNote = ref({ title: "", content: "", tags: "" }); // Form data
const isLoading = ref(false);

// --- DATABASE LOGIC ---

// 1. Baca Data secara Realtime
onMounted(() => {
    // Ambil koleksi 'technical_notes', urutkan dari yang terbaru
    const q = query(
        collection(db, "technical_notes"),
        orderBy("createdAt", "desc"),
    );

    // onSnapshot = Live update (kalau ada data baru, otomatis muncul tanpa refresh)
    onSnapshot(q, (snapshot) => {
        notes.value = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    });
});

// 2. Tambah Catatan Baru
const addNote = async () => {
    if (!newNote.value.title || !newNote.value.content)
        return alert("Judul & Isi wajib diisi!");

    isLoading.value = true;
    try {
        await addDoc(collection(db, "technical_notes"), {
            title: newNote.value.title,
            content: newNote.value.content,
            tags: newNote.value.tags.split(",").map((tag) => tag.trim()), // Ubah "Vue, Firebase" jadi Array
            createdAt: serverTimestamp(), // Waktu server
        });

        // Reset Form & Tutup Modal
        newNote.value = { title: "", content: "", tags: "" };
        showModal.value = false;
    } catch (error) {
        console.error("Gagal menyimpan:", error);
        alert("Terjadi kesalahan sistem");
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div>
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">
                    Technical Notes
                </h1>
                <p class="text-slate-500 mt-1">
                    Dokumentasi & snippet kodingan.
                </p>
            </div>
            <button
                @click="showModal = true"
                class="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition shadow-lg shadow-slate-900/20 active:scale-95"
            >
                <Plus :size="18" />
                Buat Catatan
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
                v-for="note in notes"
                :key="note.id"
                class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition group flex flex-col h-full"
            >
                <div class="mb-4">
                    <div class="flex flex-wrap gap-2 mb-3">
                        <span
                            v-for="tag in note.tags"
                            :key="tag"
                            class="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                        >
                            {{ tag }}
                        </span>
                    </div>
                    <h3
                        class="text-xl font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition"
                    >
                        {{ note.title }}
                    </h3>
                </div>

                <p class="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                    {{ note.content }}
                </p>

                <div
                    class="flex items-center gap-2 text-xs text-slate-400 font-medium pt-4 border-t border-gray-50"
                >
                    <Clock :size="14" />
                    <span>Baru saja</span>
                </div>
            </div>

            <div
                v-if="notes.length === 0"
                class="col-span-full py-20 text-center"
            >
                <div
                    class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"
                >
                    <BookOpen :size="32" />
                </div>
                <p class="text-slate-500 font-medium">
                    Belum ada catatan teknis.
                </p>
                <p class="text-slate-400 text-sm">
                    Mulai tulis dokumentasi pertamamu.
                </p>
            </div>
        </div>

        <div
            v-if="showModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div
                @click="showModal = false"
                class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            ></div>

            <div
                class="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-200"
            >
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-slate-900">
                        Catatan Baru
                    </h2>
                    <button
                        @click="showModal = false"
                        class="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition"
                    >
                        <X :size="20" />
                    </button>
                </div>

                <form @submit.prevent="addNote" class="space-y-4">
                    <div>
                        <label
                            class="block text-sm font-bold text-slate-700 mb-2"
                            >Judul</label
                        >
                        <input
                            v-model="newNote.title"
                            type="text"
                            placeholder="Contoh: Setup Firebase Vue 3"
                            class="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium placeholder:text-gray-400"
                            required
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-bold text-slate-700 mb-2"
                            >Tags (Pisahkan koma)</label
                        >
                        <input
                            v-model="newNote.tags"
                            type="text"
                            placeholder="Vue, Tutorial, Backend"
                            class="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-bold text-slate-700 mb-2"
                            >Isi Catatan</label
                        >
                        <textarea
                            v-model="newNote.content"
                            rows="4"
                            placeholder="Tulis sesuatu..."
                            class="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium placeholder:text-gray-400 resize-none"
                            required
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {{ isLoading ? "Menyimpan..." : "Simpan Catatan" }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>
