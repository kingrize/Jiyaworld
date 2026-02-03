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
    ChevronDown,
    ChevronUp,
    BookMarked,
    Bookmark,
    Star,
    User,
    Calendar,
    Hash,
    Layers,
} from "lucide-react";
import styles from "./detail.module.css";
import {
    API_BASE,
    getComicHistory,
    createChapterSlug,
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
// MAIN DETAIL PAGE - REDESIGNED
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

    // UI states
    const [synopsisExpanded, setSynopsisExpanded] = useState(false);
    const [showAllChapters, setShowAllChapters] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load comic data from session storage or fetch
    useEffect(() => {
        async function loadComic() {
            try {
                // Try to get from session storage first
                const storedComic = sessionStorage.getItem(`manhwa_${slug}`);
                if (storedComic) {
                    const data = JSON.parse(storedComic);
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
                    ...(trendingData.comics || trendingData.trending || []),
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
                setComicDetail({
                    synopsis: "Synopsis not available.",
                    chapters: [],
                    creator: "Unknown",
                });
            } finally {
                setLoading(false);
            }
        }

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
        const chapterSlug = createChapterSlug(chapter.chapter);
        sessionStorage.setItem(
            `manhwa_reader_${slug}`,
            JSON.stringify({
                chapterLink: chapter.link,
                comicTitle: comic?.title,
                chapterNumber: chapter.chapter,
                chapterSlug: chapterSlug,
                comic: comic,
            })
        );
        router.push(`/manhwa/${slug}/${chapterSlug}`);
    };

    const handleReadFromStart = () => {
        if (comicDetail?.chapters && comicDetail.chapters.length > 0) {
            const firstChapter = comicDetail.chapters[comicDetail.chapters.length - 1];
            handleReadChapter(firstChapter);
        }
    };

    const handleContinueReading = () => {
        if (history) {
            handleReadChapter({
                chapter: history.lastChapter,
                link: history.lastChapterLink,
            });
        }
    };

    // Get visible chapters (first 20 or all)
    const visibleChapters = showAllChapters
        ? comicDetail?.chapters || []
        : (comicDetail?.chapters || []).slice(0, 20);

    // Detect type from title/source
    const detectType = () => {
        const title = comic?.title?.toLowerCase() || "";
        if (title.includes("manhwa") || title.includes("korean")) return "Manhwa";
        if (title.includes("manhua") || title.includes("chinese")) return "Manhua";
        return "Manga";
    };

    if (!mounted) {
        return (
            <div className={styles.loadingScreen}>
                <Loader2 size={32} className={styles.spinner} />
            </div>
        );
    }

    if (loading) {
        return (
            <main className={styles.detailPage}>
                <nav className={styles.navbar}>
                    <Link href="/manhwa" className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </Link>
                    <span className={styles.navTitle}>Loading...</span>
                    <div className={styles.navSpacer} />
                </nav>
                <div className={styles.loadingScreen}>
                    <Loader2 size={40} className={styles.spinner} />
                    <p className={styles.loadingText}>Loading manhwa...</p>
                </div>
            </main>
        );
    }

    if (error || !comic) {
        return (
            <main className={styles.detailPage}>
                <nav className={styles.navbar}>
                    <Link href="/manhwa" className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </Link>
                    <span className={styles.navTitle}>Error</span>
                    <div className={styles.navSpacer} />
                </nav>
                <div className={styles.errorContainer}>
                    <BookOpen size={64} className={styles.errorIcon} />
                    <h2 className={styles.errorTitle}>{error || "Manhwa not found"}</h2>
                    <p className={styles.errorText}>The manhwa you're looking for doesn't exist or has been removed.</p>
                    <Link href="/manhwa" className={styles.errorBtn}>
                        <Home size={18} />
                        Back to Manhwa
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.detailPage}>
            <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Minimal Navbar */}
            <nav className={styles.navbar}>
                <Link href="/manhwa" className={styles.backBtn}>
                    <ArrowLeft size={20} />
                </Link>
                <span className={styles.navTitle}>Details</span>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={styles.menuBtn}
                    aria-label="Open Menu"
                >
                    <LayoutGrid size={20} />
                </button>
            </nav>

            {/* Hero Section */}
            <section className={styles.hero}>
                {/* Background blur */}
                <div className={styles.heroBg}>
                    <Image
                        src={comic.image}
                        alt=""
                        fill
                        priority
                        className={styles.heroBgImage}
                    />
                    <div className={styles.heroBgOverlay} />
                </div>

                <div className={styles.heroContent}>
                    {/* Cover Image */}
                    <div className={styles.coverWrapper}>
                        <Image
                            src={comic.image}
                            alt={comic.title}
                            width={180}
                            height={270}
                            priority
                            className={styles.coverImage}
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder-comic.png";
                            }}
                        />
                    </div>

                    {/* Info */}
                    <div className={styles.heroInfo}>
                        <h1 className={styles.title}>{comic.title}</h1>

                        {/* Metadata Row */}
                        <div className={styles.metaRow}>
                            <span className={styles.metaChip}>
                                <BookMarked size={12} />
                                {detectType()}
                            </span>
                            <span className={styles.metaChip}>
                                <Layers size={12} />
                                {comicDetail?.chapters?.length || 0} Ch
                            </span>
                            {comicDetail?.status && (
                                <span className={`${styles.metaChip} ${styles.statusChip}`}>
                                    {comicDetail.status}
                                </span>
                            )}
                        </div>

                        {/* Genre chips (if available) */}
                        {comicDetail?.genres && comicDetail.genres.length > 0 && (
                            <div className={styles.genreRow}>
                                {comicDetail.genres.slice(0, 4).map((genre: { name: string; slug?: string; link?: string } | string, i: number) => (
                                    <span key={i} className={styles.genreChip}>
                                        {typeof genre === 'string' ? genre : genre.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Desktop CTA */}
                        <div className={styles.heroCta}>
                            {history ? (
                                <button onClick={handleContinueReading} className={styles.primaryBtn}>
                                    <Play size={18} fill="currentColor" />
                                    Continue Ch. {history.lastChapter}
                                </button>
                            ) : (
                                <button
                                    onClick={handleReadFromStart}
                                    className={styles.primaryBtn}
                                    disabled={!comicDetail?.chapters?.length}
                                >
                                    <Play size={18} fill="currentColor" />
                                    Start Reading
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className={styles.content}>
                {/* Synopsis Section */}
                {comicDetail?.synopsis && (
                    <section className={styles.synopsisSection}>
                        <h2 className={styles.sectionTitle}>Synopsis</h2>
                        <div className={`${styles.synopsisText} ${synopsisExpanded ? styles.expanded : ""}`}>
                            <p>{comicDetail.synopsis}</p>
                        </div>
                        {comicDetail.synopsis.length > 200 && (
                            <button
                                onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                                className={styles.expandBtn}
                            >
                                {synopsisExpanded ? (
                                    <>Show less <ChevronUp size={16} /></>
                                ) : (
                                    <>Show more <ChevronDown size={16} /></>
                                )}
                            </button>
                        )}
                    </section>
                )}

                {/* Chapter List */}
                {comicDetail?.chapters && comicDetail.chapters.length > 0 && (
                    <section className={styles.chapterSection}>
                        <div className={styles.chapterHeader}>
                            <h2 className={styles.sectionTitle}>
                                <Hash size={18} />
                                Chapters
                            </h2>
                            <span className={styles.chapterCount}>
                                {comicDetail.chapters.length} total
                            </span>
                        </div>

                        <div className={styles.chapterList}>
                            {visibleChapters.map((chapter, index) => {
                                const isActive = history?.lastChapter === chapter.chapter;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleReadChapter(chapter)}
                                        className={`${styles.chapterItem} ${isActive ? styles.chapterActive : ""}`}
                                    >
                                        <span className={styles.chapterNum}>{chapter.chapter}</span>
                                        {isActive && (
                                            <span className={styles.chapterBadge}>
                                                <Bookmark size={12} />
                                                Last Read
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {(comicDetail.chapters.length > 20) && (
                            <button
                                onClick={() => setShowAllChapters(!showAllChapters)}
                                className={styles.showMoreBtn}
                            >
                                {showAllChapters ? (
                                    <>Show less <ChevronUp size={16} /></>
                                ) : (
                                    <>Show all {comicDetail.chapters.length} chapters <ChevronDown size={16} /></>
                                )}
                            </button>
                        )}
                    </section>
                )}
            </div>

            {/* Sticky Mobile CTA */}
            <div className={styles.stickyBar}>
                {history ? (
                    <button onClick={handleContinueReading} className={styles.stickyBtn}>
                        <Play size={20} fill="currentColor" />
                        <span>Continue Chapter {history.lastChapter}</span>
                    </button>
                ) : (
                    <button
                        onClick={handleReadFromStart}
                        className={styles.stickyBtn}
                        disabled={!comicDetail?.chapters?.length}
                    >
                        <Play size={20} fill="currentColor" />
                        <span>Start Reading</span>
                    </button>
                )}
            </div>
        </main>
    );
}
