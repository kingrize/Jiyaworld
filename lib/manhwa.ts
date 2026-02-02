// ============================================================
// MANHWA SHARED UTILITIES
// Centralized types and functions for manhwa feature
// ============================================================

// ============================================================
// TYPES
// ============================================================

export interface Comic {
    title: string;
    image: string;
    chapter: string;
    slug: string;
    processedLink: string;
    source?: string;
    type?: string;
    genre?: string;
    link?: string;
}

export interface Chapter {
    chapter: string;
    link: string;
}

export interface ComicDetail {
    synopsis?: string;
    chapters?: Chapter[];
    creator?: string;
}

export interface ReadingHistoryEntry {
    slug: string;
    title: string;
    image: string;
    processedLink: string;
    lastChapter: string;
    lastChapterLink: string;
    timestamp: number;
}

export interface ReadingHistory {
    [slug: string]: ReadingHistoryEntry;
}

// ============================================================
// API CONFIG
// ============================================================

export const API_BASE = "https://www.sankavollerei.com/comic";

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Create a URL-friendly slug from a comic title
 */
export function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Process a comic link to normalize format
 */
export function processLink(link: string): string {
    return link.replace("/manga/", "/").replace("/plus/", "/");
}

/**
 * Create a URL-safe slug from a chapter name
 * Example: "Chapter 201" → "chapter-201"
 */
export function createChapterSlug(chapter: string): string {
    return chapter
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// ============================================================
// READING HISTORY MANAGEMENT
// ============================================================

const HISTORY_KEY = "comicHistory";
const MAX_HISTORY_ENTRIES = 50;

/**
 * Get all reading history entries, sorted by most recent
 */
export function getReadingHistory(): ReadingHistoryEntry[] {
    if (typeof window === "undefined") return [];

    try {
        const data = localStorage.getItem(HISTORY_KEY);
        if (!data) return [];

        const history: ReadingHistory = JSON.parse(data);

        // Convert to array and sort by timestamp (most recent first)
        return Object.values(history)
            .filter(entry => entry.title && entry.slug) // Filter out invalid entries
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch (e) {
        console.error("Error loading reading history:", e);
        return [];
    }
}

/**
 * Get a specific comic's reading history
 */
export function getComicHistory(slug: string): ReadingHistoryEntry | null {
    if (typeof window === "undefined") return null;

    try {
        const data = localStorage.getItem(HISTORY_KEY);
        if (!data) return null;

        const history: ReadingHistory = JSON.parse(data);
        return history[slug] || null;
    } catch (e) {
        console.error("Error loading comic history:", e);
        return null;
    }
}

/**
 * Save reading progress for a comic
 */
export function saveToHistory(entry: Omit<ReadingHistoryEntry, "timestamp">): void {
    if (typeof window === "undefined") return;

    try {
        const data = localStorage.getItem(HISTORY_KEY);
        const history: ReadingHistory = data ? JSON.parse(data) : {};

        // Update or create entry with timestamp
        history[entry.slug] = {
            ...entry,
            timestamp: Date.now(),
        };

        // Limit history size - remove oldest entries
        const entries = Object.entries(history);
        if (entries.length > MAX_HISTORY_ENTRIES) {
            entries.sort(([, a], [, b]) => (b.timestamp || 0) - (a.timestamp || 0));
            const trimmed = Object.fromEntries(entries.slice(0, MAX_HISTORY_ENTRIES));
            localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
        } else {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        }
    } catch (e) {
        console.error("Error saving to history:", e);
    }
}

/**
 * Remove a comic from reading history
 */
export function removeFromHistory(slug: string): void {
    if (typeof window === "undefined") return;

    try {
        const data = localStorage.getItem(HISTORY_KEY);
        if (!data) return;

        const history: ReadingHistory = JSON.parse(data);
        delete history[slug];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("Error removing from history:", e);
    }
}

/**
 * Clear all reading history
 */
export function clearHistory(): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
        console.error("Error clearing history:", e);
    }
}

// ============================================================
// DATA PROCESSING
// ============================================================

/**
 * Process raw comic data from API into normalized Comic type
 */
export function processComic(rawComic: {
    title: string;
    image: string;
    link: string;
    chapter: string;
    type?: string;
    genre?: string;
    popularity?: string;
}): Comic {
    const slug = createSlug(rawComic.title);
    const processedLink = processLink(rawComic.link);
    const imageUrl = rawComic.image && !rawComic.image.includes("lazy.jpg")
        ? rawComic.image
        : "/placeholder-comic.png";

    return {
        title: rawComic.title,
        image: imageUrl,
        chapter: rawComic.chapter,
        slug,
        processedLink,
        type: rawComic.type,
        genre: rawComic.genre,
        link: rawComic.link,
    };
}

/**
 * Filter out unwanted comics (APK downloads, etc.)
 */
export function filterValidComics<T extends { title: string; chapter: string }>(comics: T[]): T[] {
    return comics.filter(
        (item) =>
            !item.title.toLowerCase().includes("apk") &&
            !item.chapter.toLowerCase().includes("download")
    );
}

// ============================================================
// PUSTAKA (LIBRARY) DATA TYPES AND PROCESSING
// Response format from /pustaka/{page} endpoint
// ============================================================

/**
 * Raw comic data from /pustaka/{page} endpoint
 * This has a different shape than /terbaru or /trending
 */
export interface PustakaComic {
    title: string;
    thumbnail: string;
    detailUrl: string;
    latestChapter?: {
        title: string;
    };
    type?: string;
    genre?: string;
}

/**
 * Process raw pustaka comic data into normalized Comic type
 */
export function processPustakaComic(rawComic: PustakaComic): Comic {
    const slug = createSlug(rawComic.title);
    // Extract chapter number from "Chapter 123" format
    const chapterNumber = rawComic.latestChapter?.title.split(' ').pop() || 'N/A';
    // Convert detailUrl to processedLink format (remove /detail-komik/ prefix)
    const processedLink = rawComic.detailUrl.replace('/detail-komik/', '');

    return {
        title: rawComic.title,
        image: rawComic.thumbnail || '/placeholder-comic.png',
        chapter: chapterNumber,
        slug,
        processedLink,
        source: 'Library',
        type: rawComic.type,
        genre: rawComic.genre,
    };
}

/**
 * Filter out unwanted pustaka comics (APK downloads, etc.)
 */
export function filterValidPustakaComics(comics: PustakaComic[]): PustakaComic[] {
    return comics.filter(
        (item) =>
            !item.title.toLowerCase().includes("apk") &&
            (!item.latestChapter || !item.latestChapter.title.toLowerCase().includes("download"))
    );
}

