/* lib/mods/service.ts */

/**
 * Mod Service
 * 
 * Firestore CRUD operations for mod posts.
 * Admin-only write operations, public read.
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    writeBatch,
    query,
    where,
    orderBy,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    ModPost,
    ModVersion,
    ModFormData,
    VersionFormData,
    ModListItem,
    getLatestVersion,
} from "./types";

const COLLECTION_NAME = "mods";

// Helper: Convert Firestore Timestamp to Date string
function convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
    const result = { ...data };
    for (const key of Object.keys(result)) {
        const value = result[key];
        if (value instanceof Timestamp) {
            result[key] = value.toDate().toISOString();
        } else if (Array.isArray(value)) {
            result[key] = value.map((item) => {
                if (typeof item === "object" && item !== null) {
                    return convertTimestamps(item as Record<string, unknown>);
                }
                return item;
            });
        } else if (typeof value === "object" && value !== null) {
            result[key] = convertTimestamps(value as Record<string, unknown>);
        }
    }
    return result;
}

// ============================================
// READ OPERATIONS (Public)
// ============================================

/**
 * Get all published mods for public listing
 */
export async function getPublishedMods(): Promise<ModPost[]> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("published", "==", true),
        orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = convertTimestamps(doc.data() as Record<string, unknown>);
        return { id: doc.id, ...data } as ModPost;
    });
}

/**
 * Get all mods (admin view, includes drafts)
 */
export async function getAllMods(): Promise<ModPost[]> {
    const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = convertTimestamps(doc.data() as Record<string, unknown>);
        return { id: doc.id, ...data } as ModPost;
    });
}

/**
 * Get a mod by slug (public)
 */
export async function getModBySlug(slug: string): Promise<ModPost | null> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("slug", "==", slug),
        where("published", "==", true)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = convertTimestamps(doc.data() as Record<string, unknown>);
    return { id: doc.id, ...data } as ModPost;
}

/**
 * Get a mod by ID (admin)
 */
export async function getModById(id: string): Promise<ModPost | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    const data = convertTimestamps(snapshot.data() as Record<string, unknown>);
    return { id: snapshot.id, ...data } as ModPost;
}

/**
 * Convert mods to list items for list view
 */
export function toListItems(mods: ModPost[]): ModListItem[] {
    return mods.map((mod) => {
        const latest = getLatestVersion(mod);
        return {
            id: mod.id,
            name: mod.name,
            slug: mod.slug,
            game: mod.game,
            type: mod.type,
            status: mod.status,
            published: mod.published,
            latestVersion: latest?.version || "—",
            updatedAt: mod.updatedAt,
        };
    });
}

// ============================================
// WRITE OPERATIONS (Admin only)
// ============================================

/**
 * Create a new mod post
 */
export async function createMod(data: ModFormData, initialVersion?: VersionFormData): Promise<string> {
    const batch = writeBatch(db);
    const modRef = doc(collection(db, COLLECTION_NAME));
    const now = Timestamp.now();

    const versions: ModVersion[] = initialVersion
        ? [{
            ...initialVersion,
            isLatest: true,
            createdAt: now.toDate().toISOString(),
        }]
        : [];

    const modData = {
        name: data.name,
        slug: data.slug,
        game: data.game,
        type: data.type,
        status: initialVersion?.status || "stable",
        published: data.published,
        createdAt: now,
        updatedAt: now,
        description: data.description,
        features: data.features,
        requirements: data.requirements,
        installationSteps: data.installationSteps,
        warnings: data.warnings,
        versions,
    };

    batch.set(modRef, modData);

    // Create shortlink if version details are present
    if (initialVersion && initialVersion.downloadSlug && initialVersion.downloadUrl) {
        const shortLinkRef = doc(db, "shortlinks", initialVersion.downloadSlug);
        batch.set(shortLinkRef, {
            url: initialVersion.downloadUrl,
            name: data.name,
            size: initialVersion.fileSize,
            game: data.game,
            version: initialVersion.version,
            status: initialVersion.status,
            type: data.type,
            fileType: initialVersion.downloadUrl.endsWith(".apk") ? ".apk" : ".zip", // Basic inference
            modId: modRef.id,
            createdAt: now
        });
    }

    await batch.commit();
    return modRef.id;
}

/**
 * Update a mod post
 */
export async function updateMod(id: string, data: Partial<ModFormData>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

/**
 * Add a new version to a mod
 */
export async function addVersion(modId: string, versionData: VersionFormData): Promise<void> {
    const mod = await getModById(modId);
    if (!mod) throw new Error("Mod not found");

    const batch = writeBatch(db);
    const modRef = doc(db, COLLECTION_NAME, modId);
    const now = Timestamp.now();

    // Mark all existing versions as not latest
    const updatedVersions = mod.versions.map((v) => ({
        ...v,
        isLatest: false,
    }));

    // Add new version as latest
    const newVersion: ModVersion = {
        ...versionData,
        isLatest: true,
        createdAt: now.toDate().toISOString(),
    };

    updatedVersions.unshift(newVersion);

    batch.update(modRef, {
        versions: updatedVersions,
        status: versionData.status,
        updatedAt: now,
    });

    // Create shortlink
    if (versionData.downloadSlug && versionData.downloadUrl) {
        const shortLinkRef = doc(db, "shortlinks", versionData.downloadSlug);
        batch.set(shortLinkRef, {
            url: versionData.downloadUrl,
            name: mod.name,
            size: versionData.fileSize,
            game: mod.game,
            version: versionData.version,
            status: versionData.status,
            type: mod.type,
            fileType: versionData.downloadUrl.endsWith(".apk") ? ".apk" : ".zip",
            modId: modId,
            createdAt: now
        });
    }

    await batch.commit();
}

/**
 * Toggle published status
 */
export async function togglePublished(id: string, published: boolean): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
        published,
        updatedAt: Timestamp.now(),
    });
}

/**
 * Delete a mod post
 */
export async function deleteMod(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

// ============================================
// VALIDATION
// ============================================

/**
 * Check if a slug is unique
 */
export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    const q = query(
        collection(db, COLLECTION_NAME),
        where("slug", "==", slug)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return true;

    // If we're updating, check if the existing doc is the one we're updating
    if (excludeId && snapshot.docs.length === 1 && snapshot.docs[0].id === excludeId) {
        return true;
    }

    return false;
}
