import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Analytics opsional, tapi kita biarkan saja agar tidak error
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB2H6xENGdqissnpUn6QWXfpM9BS5X67Wo",
  authDomain: "jiyaworld.firebaseapp.com",
  projectId: "jiyaworld",
  storageBucket: "jiyaworld.firebasestorage.app",
  messagingSenderId: "49947992138",
  appId: "1:49947992138:web:25df54d8a57940821e46b3",
  measurementId: "G-0PRP0ZEN2B",
};

// 1. Inisialisasi Aplikasi Utama
const app = initializeApp(firebaseConfig);

// 2. Inisialisasi Database (Firestore) -> INI PENTING
const db = getFirestore(app);

// 3. Inisialisasi Analytics (Opsional)
const analytics = getAnalytics(app);

// 4. Export 'db' supaya bisa dipanggil di file lain
export { db, analytics };
