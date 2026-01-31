import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase - handles both client and server contexts
function getFirebaseApp(): FirebaseApp | null {
    if (typeof window === "undefined" || !firebaseConfig.apiKey) {
        return null;
    }
    try {
        return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        return null;
    }
}

const app = getFirebaseApp();

// Create auth and db instances - these may be null on server-side
const auth: Auth | null = app ? getAuth(app) : null;
const db: Firestore | null = app ? getFirestore(app) : null;

// Helper to get auth with null check (for components that need auth)
export function getAuthInstance(): Auth {
    if (!auth) {
        throw new Error("Firebase Auth is not initialized. Ensure you're running on the client side.");
    }
    return auth;
}

// Helper to get db with null check
export function getDbInstance(): Firestore {
    if (!db) {
        throw new Error("Firebase Firestore is not initialized. Ensure you're running on the client side.");
    }
    return db;
}

export { app, auth, db };
