"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FloatingSidebar } from "@/components/floating-sidebar";
import {
    BookOpen,
    Search,
    ArrowLeft,
    LayoutGrid,
    Loader2,
    Star,
    Clock,
    TrendingUp,
    X,
    Flame,
    History,
    Play,
    Library,
} from "lucide-react";
import styles from "./manhwa.module.css";
import {
    API_BASE,
    createSlug,
    getReadingHistory,
    type Comic,
    type ReadingHistoryEntry,
    filterValidComics,
    processComic,
} from "@/lib/manhwa";

// ============================================================
// MANHWA CARD COMPONENT
// ============================================================
function ManhwaCard({ comic, priority = false }: { comic: Comic; priority?: boolean }) {
    const handleClick = () => {
        // Store comic data in sessionStorage for the detail page
        sessionStorage.setItem(
            `manhwa_${comic.slug}`,
            JSON.stringify({
                comic: {
                    title: comic.title,
                    image: comic.image,
                    chapter: comic.chapter,
                    source: comic.source,
                },
                processedLink: comic.processedLink,
            })
        );
    };

    return (
        <Link
            href={`/manhwa/${comic.slug}`}
            className={styles.manhwaCard}
            onClick={handleClick}
        >
            <div className={styles.cardPoster}>
                <Image
                    src={comic.image}
                    alt={comic.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
                    className={styles.posterImage}
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder-comic.png";
                    }}
                />
                {comic.type && (
                    <span className={styles.cardTypeBadge}>{comic.type}</span>
                )}
                {comic.chapter && (
                    <div className={styles.cardChapterBar}>
                        <Clock size={10} />
                        <span>{comic.chapter}</span>
                    </div>
                )}
            </div>
            <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{comic.title}</h3>
                {comic.genre && (
                    <span className={styles.genreText}>{comic.genre}</span>
                )}
            </div>
        </Link>
    );
}

// ============================================================
// HISTORY CARD COMPONENT - For continue reading section
// ============================================================
function HistoryCard({ entry }: { entry: ReadingHistoryEntry }) {
    const handleClick = () => {
        // Store comic data for both detail and reader pages
        sessionStorage.setItem(
            `manhwa_${entry.slug}`,
            JSON.stringify({
                comic: {
                    title: entry.title,
                    image: entry.image,
                    chapter: entry.lastChapter,
                    processedLink: entry.processedLink,
                },
                processedLink: entry.processedLink,
            })
        );

        // Store reader data for direct chapter access
        sessionStorage.setItem(
            `manhwa_reader_${entry.slug}`,
            JSON.stringify({
                chapterLink: entry.lastChapterLink,
                comicTitle: entry.title,
                chapterNumber: entry.lastChapter,
                comic: {
                    title: entry.title,
                    image: entry.image,
                    processedLink: entry.processedLink,
                },
                processedLink: entry.processedLink,
            })
        );
    };

    // Format timestamp
    const timeAgo = formatTimeAgo(entry.timestamp);

    return (
        <Link
            href={`/manhwa/${entry.slug}/${entry.lastChapter}`}
            className={styles.historyCard}
            onClick={handleClick}
        >
            <div className={styles.historyPoster}>
                <Image
                    src={entry.image || "/placeholder-comic.png"}
                    alt={entry.title}
                    fill
                    sizes="80px"
                    className={styles.posterImage}
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder-comic.png";
                    }}
                />
                <div className={styles.historyPlayOverlay}>
                    <Play size={20} fill="currentColor" />
                </div>
            </div>
            <div className={styles.historyContent}>
                <h3 className={styles.historyTitle}>{entry.title}</h3>
                <div className={styles.historyMeta}>
                    <span className={styles.historyChapter}>Chapter {entry.lastChapter}</span>
                    <span className={styles.historyTime}>{timeAgo}</span>
                </div>
            </div>
        </Link>
    );
}

// Format relative time
function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(timestamp).toLocaleDateString();
}

// ============================================================
// SECTION COMPONENT
// ============================================================
function Section({
    title,
    icon: Icon,
    action,
    children,
}: {
    title: string;
    icon: React.ElementType;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <Icon size={18} className={styles.sectionIcon} />
                    <h2 className={styles.sectionTitle}>{title}</h2>
                </div>
                {action && <div className={styles.sectionAction}>{action}</div>}
            </div>
            {children}
        </section>
    );
}

// ============================================================
// MANHWA GRID
// ============================================================
function ManhwaGrid({
    comics,
    loading,
    emptyMessage,
}: {
    comics: Comic[];
    loading: boolean;
    emptyMessage?: string;
}) {
    if (loading) {
        return (
            <div className={styles.manhwaGrid}>
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={styles.skeletonCard}>
                        <div className={styles.skeletonPoster} />
                        <div className={styles.skeletonContent}>
                            <div className={styles.skeletonTitle} />
                            <div className={styles.skeletonMeta} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (comics.length === 0) {
        return (
            <div className={styles.emptyState}>
                <BookOpen size={40} />
                <p>{emptyMessage || "No manhwa found"}</p>
            </div>
        );
    }

    return (
        <div className={styles.manhwaGrid}>
            {comics.map((comic, index) => (
                <ManhwaCard
                    key={`${comic.slug}-${index}`}
                    comic={comic}
                    priority={index < 4}
                />
            ))}
        </div>
    );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function ManhwaPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Data states
    const [latestComics, setLatestComics] = useState<Comic[]>([]);
    const [trendingComics, setTrendingComics] = useState<Comic[]>([]);
    const [searchResults, setSearchResults] = useState<Comic[]>([]);
    const [readingHistory, setReadingHistory] = useState<ReadingHistoryEntry[]>([]);

    // UI states
    const [loadingLatest, setLoadingLatest] = useState(true);
    const [loadingTrending, setLoadingTrending] = useState(true);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mount effect and load history
    useEffect(() => {
        setMounted(true);
        // Load reading history from localStorage
        const history = getReadingHistory();
        setReadingHistory(history);
    }, []);

    // Fetch latest comics
    useEffect(() => {
        async function fetchLatest() {
            try {
                const res = await fetch(`${API_BASE}/terbaru`);
                if (!res.ok) throw new Error("Failed to fetch latest manhwa");
                const data = await res.json();
                const comics = data.comics || [];

                // Filter out unwanted entries
                const filtered = comics.filter(
                    (item: { title: string; chapter: string }) =>
                        !item.title.toLowerCase().includes("apk") &&
                        !item.chapter.toLowerCase().includes("download")
                );

                // Process comics
                const processed = filtered.map((comic: { title: string; image: string; link: string; chapter: string }) => {
                    const slug = createSlug(comic.title);
                    const link = comic.link.replace("/manga/", "/").replace("/plus/", "/");
                    const imageUrl = comic.image && !comic.image.includes("lazy.jpg")
                        ? comic.image
                        : "/placeholder-comic.png";

                    return {
                        ...comic,
                        image: imageUrl,
                        processedLink: link,
                        slug: slug,
                        source: "Latest",
                    };
                });

                setLatestComics(processed);
            } catch (err) {
                console.error("Error fetching latest:", err);
                setError("Failed to load manhwa data");
            } finally {
                setLoadingLatest(false);
            }
        }
        fetchLatest();
    }, []);

    // Fetch trending comics
    useEffect(() => {
        async function fetchTrending() {
            try {
                const res = await fetch(`${API_BASE}/trending`);
                if (!res.ok) throw new Error("Failed to fetch trending manhwa");
                const data = await res.json();
                const comics = data.comics || [];

                // Filter and process
                const filtered = comics.filter(
                    (item: { title: string; chapter: string }) =>
                        !item.title.toLowerCase().includes("apk") &&
                        !item.chapter.toLowerCase().includes("download")
                );

                const processed = filtered.map((comic: { title: string; image: string; link: string; chapter: string; popularity?: string }) => {
                    const slug = createSlug(comic.title);
                    const link = comic.link.replace("/manga/", "/").replace("/plus/", "/");
                    const imageUrl = comic.image && !comic.image.includes("lazy.jpg")
                        ? comic.image
                        : "/placeholder-comic.png";

                    return {
                        ...comic,
                        image: imageUrl,
                        processedLink: link,
                        slug: slug,
                        source: "Trending",
                    };
                });

                setTrendingComics(processed);
            } catch (err) {
                console.error("Error fetching trending:", err);
            } finally {
                setLoadingTrending(false);
            }
        }
        fetchTrending();
    }, []);

    // Search handler with debounce
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            setIsSearchMode(false);
            setSearchResults([]);
            return;
        }

        setIsSearchMode(true);
        setLoadingSearch(true);

        try {
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();

            const processed = (data.data || []).map((comic: { title: string; thumbnail: string; href: string; type?: string; genre?: string; description?: string }) => {
                const slug = createSlug(comic.title);
                return {
                    title: comic.title,
                    image: comic.thumbnail,
                    chapter: comic.description || "Latest Chapter",
                    slug: slug,
                    processedLink: comic.href,
                    type: comic.type,
                    genre: comic.genre,
                };
            });

            setSearchResults(processed);
        } catch (err) {
            console.error("Search error:", err);
            setSearchResults([]);
        } finally {
            setLoadingSearch(false);
        }
    }, [searchQuery]);

    // Debounced search effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            setIsSearchMode(false);
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    // Clear search
    const clearSearch = () => {
        setSearchQuery("");
        setIsSearchMode(false);
        setSearchResults([]);
    };

    // Handle key press
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    if (!mounted) {
        return (
            <div className={styles.loadingScreen}>
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

    return (
        <main className={styles.manhwaPage}>
            <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.backBtn}>
                        <ArrowLeft size={18} />
                    </Link>
                    <div className={styles.navBrand}>
                        <BookOpen size={18} className={styles.navIcon} />
                        <span>Manhwa</span>
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

            {/* Main Content */}
            <div className={styles.pageContent}>
                {/* Hero Section */}
                <div className={styles.hero}>
                    <div className={styles.heroEmoji}>📚</div>
                    <h1 className={styles.heroTitle}>reading corner</h1>
                    <p className={styles.heroSubtitle}>
                        a quiet place for manhwa.<br />
                        take your time.
                    </p>
                </div>

                {/* Search Section */}
                <div className={styles.searchSection}>
                    <div className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search manhwa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button onClick={clearSearch} className={styles.searchClear}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className={styles.errorBanner}>
                        <span>{error}</span>
                    </div>
                )}

                {/* Search Results Mode */}
                {isSearchMode ? (
                    <Section
                        title={`Results for "${searchQuery}"`}
                        icon={Search}
                        action={
                            <button onClick={clearSearch}>Clear</button>
                        }
                    >
                        <ManhwaGrid
                            comics={searchResults}
                            loading={loadingSearch}
                            emptyMessage={`No results for "${searchQuery}"`}
                        />
                    </Section>
                ) : (
                    <>
                        {/* Continue Reading Section - Only show if there's history */}
                        {readingHistory.length > 0 && (
                            <Section
                                title="Continue Reading"
                                icon={History}
                                action={
                                    <Link href="/manhwa/all" className={styles.sectionLink}>
                                        <Library size={14} />
                                        <span>All Comics</span>
                                    </Link>
                                }
                            >
                                <div className={styles.historyGrid}>
                                    {readingHistory.slice(0, 6).map((entry) => (
                                        <HistoryCard key={entry.slug} entry={entry} />
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Latest Section */}
                        <Section
                            title="Latest Updates"
                            icon={Clock}
                            action={
                                <Link href="/manhwa/all" className={styles.sectionLink}>
                                    <span>View All</span>
                                </Link>
                            }
                        >
                            <ManhwaGrid
                                comics={latestComics.slice(0, 18)}
                                loading={loadingLatest}
                                emptyMessage="No latest manhwa available"
                            />
                        </Section>

                        {/* Trending Section */}
                        <Section title="Trending Now" icon={TrendingUp}>
                            <ManhwaGrid
                                comics={trendingComics.slice(0, 12)}
                                loading={loadingTrending}
                                emptyMessage="No trending manhwa available"
                            />
                        </Section>
                    </>
                )}
            </div>
        </main>
    );
}
