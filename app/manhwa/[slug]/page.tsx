"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FloatingSidebar } from "@/components/floating-sidebar";
import {
    BookOpen,
    ArrowLeft,
    LayoutGrid,
    Loader2,
    Play,
    Clock,
    Home,
    ChevronRight,
} from "lucide-react";
import styles from "../manhwa.module.css";
import {
    API_BASE,
    getComicHistory,
    type Chapter,
    type ComicDetail,
    type ReadingHistoryEntry
} from "@/lib/manhwa";

// ============================================================
// TYPES
// ============================================================
interface ComicState {
    title: string;
    image: string;
    chapter: string;
    source?: string;
    processedLink: string;
}

// ============================================================
// MAIN DETAIL PAGE
// ============================================================
export default function ManhwaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Data states
    const [comic, setComic] = useState<ComicState | null>(null);
    const [comicDetail, setComicDetail] = useState<ComicDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ReadingHistoryEntry | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load comic data from session storage or fetch from trending/latest
    useEffect(() => {
        async function loadComic() {
            try {
                // Try to get from session storage first
                const storedComic = sessionStorage.getItem(`manhwa_${slug}`);
                if (storedComic) {
                    const data = JSON.parse(storedComic);
                    // Ensure processedLink is included in comic state
                    const comicWithLink: ComicState = {
                        ...data.comic,
                        processedLink: data.processedLink,
                    };
                    setComic(comicWithLink);
                    await fetchComicDetail(data.processedLink);
                    return;
                }

                // Otherwise, search for it in latest/trending
                const [latestRes, trendingRes] = await Promise.all([
                    fetch(`${API_BASE}/terbaru`),
                    fetch(`${API_BASE}/trending`),
                ]);

                const latestData = await latestRes.json();
                const trendingData = await trendingRes.json();

                const allComics = [
                    ...(latestData.comics || []),
                    ...(trendingData.comics || []),
                ];

                // Find comic by slug
                const found = allComics.find((c: { title: string }) => {
                    const comicSlug = c.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                    return comicSlug === slug;
                });

                if (found) {
                    const processedLink = found.link
                        .replace("/manga/", "/")
                        .replace("/plus/", "/");

                    const comicData: ComicState = {
                        title: found.title,
                        image: found.image && !found.image.includes("lazy.jpg")
                            ? found.image
                            : "/placeholder-comic.png",
                        chapter: found.chapter,
                        source: "Latest",
                        processedLink: processedLink,
                    };

                    setComic(comicData);
                    await fetchComicDetail(processedLink);
                } else {
                    setError("Manhwa not found");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error loading comic:", err);
                setError("Failed to load manhwa");
                setLoading(false);
            }
        }

        async function fetchComicDetail(processedLink: string) {
            try {
                const cleanLink = processedLink.startsWith("/")
                    ? processedLink.substring(1)
                    : processedLink;

                const res = await fetch(`${API_BASE}/comic/${cleanLink}`);
                if (!res.ok) throw new Error("Failed to fetch details");

                const data = await res.json();
                setComicDetail(data);
            } catch (err) {
                console.error("Error fetching comic detail:", err);
                // Set minimal detail on error
                setComicDetail({
                    synopsis: "Synopsis not available.",
                    chapters: [],
                    creator: "Unknown",
                });
            } finally {
                setLoading(false);
            }
        }

        // Load reading history using shared function
        function loadHistory() {
            const historyEntry = getComicHistory(slug);
            if (historyEntry) {
                setHistory(historyEntry);
            }
        }

        if (slug) {
            loadComic();
            loadHistory();
        }
    }, [slug]);

    // Handle reading a chapter
    const handleReadChapter = (chapter: Chapter) => {
        // Store state for reader page
        sessionStorage.setItem(
            `manhwa_reader_${slug}`,
            JSON.stringify({
                chapterLink: chapter.link,
                comicTitle: comic?.title,
                chapterNumber: chapter.chapter,
                comic: comic,
            })
        );

        router.push(`/manhwa/${slug}/${chapter.chapter}`);
    };

    // Handle read from start
    const handleReadFromStart = () => {
        if (comicDetail?.chapters && comicDetail.chapters.length > 0) {
            // Get first chapter (usually last in array)
            const firstChapter = comicDetail.chapters[comicDetail.chapters.length - 1];
            handleReadChapter(firstChapter);
        }
    };

    // Handle continue reading
    const handleContinueReading = () => {
        if (history) {
            handleReadChapter({
                chapter: history.lastChapter,
                link: history.lastChapterLink,
            });
        }
    };

    if (!mounted) {
        return (
            <div className={styles.loadingScreen}>
                <Loader2 size={32} className={styles.loadingSpinner} />
            </div>
        );
    }

    if (loading) {
        return (
            <main className={styles.detailPage}>
                <nav className={styles.navbar}>
                    <div className={styles.navLeft}>
                        <Link href="/manhwa" className={styles.backBtn}>
                            <ArrowLeft size={18} />
                        </Link>
                        <div className={styles.navBrand}>
                            <BookOpen size={18} className={styles.navIcon} />
                            <span>Loading...</span>
                        </div>
                    </div>
                </nav>
                <div className={styles.loadingScreen}>
                    <Loader2 size={32} className={styles.loadingSpinner} />
                    <p>Loading manhwa...</p>
                </div>
            </main>
        );
    }

    if (error || !comic) {
        return (
            <main className={styles.detailPage}>
                <nav className={styles.navbar}>
                    <div className={styles.navLeft}>
                        <Link href="/manhwa" className={styles.backBtn}>
                            <ArrowLeft size={18} />
                        </Link>
                        <div className={styles.navBrand}>
                            <BookOpen size={18} className={styles.navIcon} />
                            <span>Error</span>
                        </div>
                    </div>
                </nav>
                <div className={styles.detailContent}>
                    <div className={styles.errorBanner}>
                        <p>{error || "Manhwa not found"}</p>
                        <Link href="/manhwa" className={styles.secondaryBtn}>
                            <Home size={16} />
                            Back to Manhwa
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.detailPage}>
            <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navLeft}>
                    <Link href="/manhwa" className={styles.backBtn}>
                        <ArrowLeft size={18} />
                    </Link>
                    <div className={styles.navBrand}>
                        <BookOpen size={18} className={styles.navIcon} />
                        <span>Detail</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={styles.menuBtn}
                    aria-label="Open Menu"
                >
                    <LayoutGrid size={20} />
                </button>
            </nav>

            {/* Content */}
            <div className={styles.detailContent}>
                {/* Hero Section */}
                <div className={styles.detailHero}>
                    <div className={styles.detailPoster}>
                        <Image
                            src={comic.image}
                            alt={comic.title}
                            width={200}
                            height={300}
                            priority
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder-comic.png";
                            }}
                        />
                    </div>

                    <div className={styles.detailInfo}>
                        <h1 className={styles.detailTitle}>{comic.title}</h1>

                        <div className={styles.detailMeta}>
                            <span className={styles.detailBadge}>
                                <Clock size={12} />
                                {comic.chapter}
                            </span>
                            {comicDetail?.chapters && (
                                <span className={styles.detailBadge}>
                                    {comicDetail.chapters.length} Chapters
                                </span>
                            )}
                        </div>

                        {comicDetail?.synopsis && (
                            <p className={styles.detailSynopsis}>
                                {comicDetail.synopsis}
                            </p>
                        )}

                        <div className={styles.detailActions}>
                            <button
                                onClick={handleReadFromStart}
                                className={styles.readBtn}
                                disabled={!comicDetail?.chapters?.length}
                            >
                                <Play size={16} fill="currentColor" />
                                Read from Start
                            </button>
                            <Link href="/manhwa" className={styles.secondaryBtn}>
                                <Home size={16} />
                                Home
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Continue Reading Card */}
                {history && (
                    <div className={styles.continueCard}>
                        <Clock size={20} className={styles.continueIcon} />
                        <div className={styles.continueText}>
                            <div className={styles.continueLabel}>Continue Reading</div>
                            <div className={styles.continueChapter}>
                                Chapter {history.lastChapter}
                            </div>
                        </div>
                        <button
                            onClick={handleContinueReading}
                            className={styles.continueBtn}
                        >
                            <Play size={14} />
                            Continue
                        </button>
                    </div>
                )}

                {/* Chapter List */}
                {comicDetail?.chapters && comicDetail.chapters.length > 0 && (
                    <div className={styles.chapterSection}>
                        <div className={styles.chapterHeader}>
                            <h2 className={styles.chapterTitle}>Chapters</h2>
                            <span className={styles.chapterCount}>
                                {comicDetail.chapters.length} chapters
                            </span>
                        </div>

                        <div className={styles.chapterGrid}>
                            {comicDetail.chapters.map((chapter, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleReadChapter(chapter)}
                                    className={`${styles.chapterBtn} ${history?.lastChapter === chapter.chapter
                                        ? styles.chapterBtnActive
                                        : ""
                                        }`}
                                >
                                    {chapter.chapter}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
