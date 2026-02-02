"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Maximize,
    Minimize,
    Home,
    List,
} from "lucide-react";
import styles from "../../manhwa.module.css";
import { saveToHistory, API_BASE, createChapterSlug } from "@/lib/manhwa";

// ============================================================
// TYPES
// ============================================================
interface ChapterData {
    pages: string[];
    chapter: string;
    title?: string;
    prevChapter?: string | null;
    nextChapter?: string | null;
}

interface Navigation {
    prev: string | null;
    next: string | null;
}

// ============================================================
// READER PAGE
// ============================================================
export default function ReaderPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const chapter = params.chapter as string;

    const scrollRef = useRef<HTMLDivElement>(null);

    // Data states
    const [pages, setPages] = useState<string[]>([]);
    const [comicTitle, setComicTitle] = useState<string>("");
    const [navigation, setNavigation] = useState<Navigation>({
        prev: null,
        next: null,
    });

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [showUI, setShowUI] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Fetch chapter pages
    useEffect(() => {
        async function fetchPages() {
            setLoading(true);
            setError(null);

            try {
                // Try to get chapter link from session storage
                const storedData = sessionStorage.getItem(`manhwa_reader_${slug}`);
                let chapterLink = "";

                if (storedData) {
                    const data = JSON.parse(storedData);
                    chapterLink = data.chapterLink;
                    setComicTitle(data.comicTitle || slug);
                }

                if (!chapterLink) {
                    // If no stored data, try to get comic detail and find the chapter
                    setError("No chapter data available. Please go back and select a chapter.");
                    setLoading(false);
                    return;
                }

                // The API expects: /chapter{link} where link already has a leading slash
                // e.g. /chapter/manga-title/chapter-1
                // chapterLink is like: /manga-title/chapter-1
                const cleanLink = chapterLink.startsWith("/")
                    ? chapterLink
                    : `/${chapterLink}`;

                // Fetch chapter pages - note: no slash between "chapter" and the link
                const res = await fetch(`${API_BASE}/chapter${cleanLink}`);
                if (!res.ok) throw new Error("Failed to fetch chapter");

                const data = await res.json();

                // API returns 'images' not 'pages'
                const images = data.images || data.pages || [];

                if (images.length > 0) {
                    setPages(images);

                    // Navigation comes from data.navigation object
                    const nav = data.navigation || {};
                    setNavigation({
                        prev: nav.previousChapter || data.prevChapter || null,
                        next: nav.nextChapter || data.nextChapter || null,
                    });

                    // Save to history
                    doSaveHistory();
                } else {
                    throw new Error("No pages found in this chapter");
                }
            } catch (err) {
                console.error("Error fetching pages:", err);
                setError("Failed to load chapter pages. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        fetchPages();
    }, [slug, chapter]);

    // Save reading history with complete metadata
    const doSaveHistory = useCallback(() => {
        try {
            const storedData = sessionStorage.getItem(`manhwa_reader_${slug}`);
            if (!storedData) return;

            const data = JSON.parse(storedData);
            const comic = data.comic || {};

            // Save complete metadata for history display
            saveToHistory({
                slug,
                title: data.comicTitle || comic.title || slug,
                image: comic.image || "/placeholder-comic.png",
                processedLink: comic.processedLink || data.processedLink || "",
                lastChapter: chapter,
                lastChapterLink: data.chapterLink,
            });
        } catch (e) {
            console.error("Error saving history:", e);
        }
    }, [slug, chapter]);

    // Handle scroll progress
    useEffect(() => {
        const handleScroll = () => {
            if (!scrollRef.current) return;

            const scrollTop = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, progress)));
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Handle tap to toggle UI
    const handleTapToToggle = () => {
        setShowUI((prev) => !prev);
    };

    // Navigate to chapter
    const navigateToChapter = (chapterLink: string | null) => {
        if (!chapterLink) return;

        // Extract chapter number from link (e.g., "/manga-title/chapter-123" → "chapter-123")
        const parts = chapterLink.split("/");
        const lastPart = parts[parts.length - 1] || "";

        // Create a URL-safe slug from the chapter part
        const chapterSlug = createChapterSlug(lastPart) || createChapterSlug(`chapter-${lastPart}`);

        // Update session storage with new chapter link
        const storedData = sessionStorage.getItem(`manhwa_reader_${slug}`);
        if (storedData) {
            const data = JSON.parse(storedData);
            sessionStorage.setItem(
                `manhwa_reader_${slug}`,
                JSON.stringify({
                    ...data,
                    chapterLink: chapterLink,
                    chapterNumber: lastPart,
                    chapterSlug: chapterSlug,
                })
            );
        }

        router.push(`/manhwa/${slug}/${chapterSlug}`);
    };

    // Toggle fullscreen
    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (e) {
            console.error("Fullscreen error:", e);
        }
    };

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    if (loading) {
        return (
            <div className={styles.readerLoading}>
                <Loader2 size={40} className={styles.loadingSpinner} />
                <p>Loading chapter...</p>
            </div>
        );
    }

    if (error) {
        return (
            <main className={styles.readerPage}>
                <nav className={styles.readerNavbar}>
                    <Link href={`/manhwa/${slug}`} className={styles.backBtn}>
                        <ArrowLeft size={18} />
                    </Link>
                    <span className={styles.readerTitle}>Error</span>
                    <div style={{ width: 36 }} />
                </nav>
                <div className={styles.readerLoading}>
                    <p>{error}</p>
                    <Link href={`/manhwa/${slug}`} className={styles.secondaryBtn}>
                        <List size={16} />
                        Back to Chapters
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main
            className={`${styles.readerPage} ${isFullscreen ? styles.fullscreen : ""}`}
            onClick={handleTapToToggle}
        >
            {/* Top Navigation */}
            <nav className={`${styles.readerNavbar} ${!showUI ? styles.hidden : ""}`}>
                <Link
                    href={`/manhwa/${slug}`}
                    className={styles.backBtn}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ArrowLeft size={18} />
                </Link>
                <span className={styles.readerTitle}>
                    {comicTitle}
                    <span className={styles.readerChapter}>Ch. {chapter}</span>
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFullscreen();
                    }}
                    className={styles.iconBtn}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
            </nav>

            {/* Progress Bar */}
            <div
                className={`${styles.readerProgress} ${!showUI ? styles.hidden : ""}`}
            >
                <div
                    className={styles.readerProgressBar}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Reader Content */}
            <div className={styles.readerContent} ref={scrollRef}>
                <div className={styles.readerImages}>
                    {pages.map((page, index) => (
                        <Image
                            key={index}
                            src={page}
                            alt={`Page ${index + 1}`}
                            width={900}
                            height={1400}
                            priority={index < 3}
                            className={styles.readerImage}
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            <footer
                className={`${styles.readerFooter} ${!showUI ? styles.hidden : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => navigateToChapter(navigation.prev)}
                    disabled={!navigation.prev}
                    className={styles.navBtn}
                >
                    <ChevronLeft size={18} />
                    Prev
                </button>

                <span className={styles.chapterInfo}>
                    Chapter {chapter}
                </span>

                <button
                    onClick={() => navigateToChapter(navigation.next)}
                    disabled={!navigation.next}
                    className={styles.navBtn}
                >
                    Next
                    <ChevronRight size={18} />
                </button>
            </footer>
        </main>
    );
}
