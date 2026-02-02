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
    Clock,
    X,
    ChevronDown,
    Library,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import styles from "../manhwa.module.css";
import {
    API_BASE,
    createSlug,
    type Comic,
    type PustakaComic,
    processPustakaComic,
    filterValidPustakaComics,
} from "@/lib/manhwa";

// ============================================================
// MANHWA CARD COMPONENT
// ============================================================
function ManhwaCard({ comic, priority = false }: { comic: Comic; priority?: boolean }) {
    const handleClick = () => {
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
                        <span>Ch. {comic.chapter}</span>
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
// MAIN PAGE - ALL COMICS (PUSTAKA)
// Uses /pustaka/{page} endpoint for full library catalog
// ============================================================
export default function AllComicsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Data states
    const [comics, setComics] = useState<Comic[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    // UI states
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch pustaka comics for current page
    const fetchPage = useCallback(async (page: number, append: boolean = false) => {
        if (!append) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        setError(null);

        try {
            // Fetch page from /pustaka/{page} endpoint
            const res = await fetch(`${API_BASE}/pustaka/${page}`);

            if (!res.ok) {
                if (res.status === 404) {
                    // No more pages available
                    setHasNextPage(false);
                    if (!append) setComics([]);
                    return;
                }
                throw new Error(`Failed to fetch: ${res.status}`);
            }

            const data = await res.json();
            // /pustaka endpoint returns data.results, not data.comics
            const rawComics: PustakaComic[] = data.results || [];

            if (rawComics.length === 0) {
                setHasNextPage(false);
                if (!append) setComics([]);
                return;
            }

            // Filter out unwanted entries
            const filtered = filterValidPustakaComics(rawComics);

            // Process raw pustaka comics into normalized Comic type
            const processed = filtered.map(processPustakaComic);

            if (append) {
                setComics(prev => [...prev, ...processed]);
            } else {
                setComics(processed);
            }

            // Check if there might be more pages
            setHasNextPage(rawComics.length > 0);

        } catch (err) {
            console.error("Error fetching pustaka comics:", err);
            setError("Failed to load comics. Please try again.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchPage(1, false);
    }, [fetchPage]);

    // Load more comics (fetch next page)
    const handleLoadMore = useCallback(() => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchPage(nextPage, true);
    }, [currentPage, fetchPage]);

    // Filter comics by search query (client-side)
    const filteredComics = searchQuery
        ? comics.filter(comic =>
            comic.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : comics;

    const clearSearch = () => {
        setSearchQuery("");
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
                    <Link href="/manhwa" className={styles.backBtn}>
                        <ArrowLeft size={18} />
                    </Link>
                    <div className={styles.navBrand}>
                        <Library size={18} className={styles.navIcon} />
                        <span>Comic Library</span>
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
                {/* Search Bar */}
                <div className={styles.filterBar}>
                    <div className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Filter loaded comics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button onClick={clearSearch} className={styles.searchClear}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className={styles.pageIndicator}>
                        Page {currentPage}
                    </div>
                </div>

                {/* Comics Count */}
                <div className={styles.comicsCount}>
                    <span>
                        {filteredComics.length} comic{filteredComics.length !== 1 ? "s" : ""} loaded
                        {searchQuery && ` (filtered from ${comics.length})`}
                    </span>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className={styles.errorBanner}>
                        <span>{error}</span>
                    </div>
                )}

                {/* Comics Grid */}
                {loading ? (
                    <div className={styles.manhwaGrid}>
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonPoster} />
                                <div className={styles.skeletonContent}>
                                    <div className={styles.skeletonTitle} />
                                    <div className={styles.skeletonMeta} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredComics.length === 0 ? (
                    <div className={styles.emptyState}>
                        <BookOpen size={40} />
                        <p>{searchQuery ? "No matching comics found" : "No comics available"}</p>
                        {searchQuery && (
                            <button onClick={clearSearch} className={styles.clearFilterBtn}>
                                Clear filter
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className={styles.manhwaGrid}>
                            {filteredComics.map((comic, index) => (
                                <ManhwaCard
                                    key={`${comic.slug}-${index}`}
                                    comic={comic}
                                    priority={index < 8}
                                />
                            ))}
                        </div>

                        {/* Load More Button */}
                        {hasNextPage && !searchQuery && (
                            <div className={styles.loadMoreContainer}>
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className={styles.loadMoreBtn}
                                >
                                    {loadingMore ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <ChevronDown size={18} />
                                            <span>Load More Comics (Page {currentPage + 1})</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
