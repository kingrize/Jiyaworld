"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FloatingSidebar } from "@/components/floating-sidebar";
import {
    Tv,
    Search,
    ArrowLeft,
    LayoutGrid,
    Loader2,
    Play,
    Star,
    Film,
    ChevronRight,
    TrendingUp,
    CheckCircle2,
    Shuffle,
    Filter,
    Sparkles,
    Clock,
    Flame,
    Grid3X3,
    List,
    X,
} from "lucide-react";
import styles from "./anime.module.css";

// ============================================================
// TYPES
// ============================================================
interface Anime {
    slug: string;
    title: string;
    poster: string;
    episode?: string;
    type?: string;
    score?: string;
    status?: string;
}

// ============================================================
// ANIME API URL
// ============================================================
const API_URL = process.env.NEXT_PUBLIC_ANIME_API_URL || "https://www.sankavollerei.com/anime/animasu";

// ============================================================
// GENRE LIST
// ============================================================
const GENRES = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy",
    "Horror", "Isekai", "Mecha", "Mystery", "Romance",
    "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"
];

// ============================================================
// ANIME CARD COMPONENT
// ============================================================
function AnimeCard({ anime, priority = false, compact = false }: {
    anime: Anime;
    priority?: boolean;
    compact?: boolean;
}) {
    return (
        <Link href={`/anime/${anime.slug}`} className={`${styles.animeCard} ${compact ? styles.animeCardCompact : ''}`}>
            <div className={styles.cardPoster}>
                <Image
                    src={anime.poster}
                    alt={anime.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className={styles.posterImage}
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder-anime.png";
                    }}
                />
                {anime.type && (
                    <span className={styles.typeBadge}>{anime.type}</span>
                )}
                {anime.episode && (
                    <span className={styles.episodeBadge}>
                        {anime.episode.replace("Episode ", "Ep ")}
                    </span>
                )}
                <div className={styles.cardOverlay}>
                    <Play size={28} className={styles.playIcon} />
                </div>
            </div>
            <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{anime.title}</h3>
                {anime.score && (
                    <div className={styles.cardMeta}>
                        <Star size={12} />
                        <span>{anime.score}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}

// ============================================================
// SECTION HEADER
// ============================================================
function SectionHeader({
    title,
    icon: Icon,
    count,
    action
}: {
    title: string;
    icon: React.ElementType;
    count?: number;
    action?: React.ReactNode;
}) {
    return (
        <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
                <div className={styles.sectionIconWrapper}>
                    <Icon size={18} />
                </div>
                <h2>{title}</h2>
                {count !== undefined && (
                    <span className={styles.sectionCount}>{count}</span>
                )}
            </div>
            {action && <div className={styles.sectionAction}>{action}</div>}
        </div>
    );
}

// ============================================================
// ANIME GRID
// ============================================================
function AnimeGrid({
    animes,
    loading,
    emptyMessage,
    compact = false
}: {
    animes: Anime[];
    loading: boolean;
    emptyMessage?: string;
    compact?: boolean;
}) {
    if (loading) {
        return (
            <div className={`${styles.animeGrid} ${compact ? styles.animeGridCompact : ''}`}>
                {[...Array(10)].map((_, i) => (
                    <div key={i} className={styles.skeletonCard}>
                        <div className={styles.skeletonPoster} />
                        <div className={styles.skeletonTitle} />
                    </div>
                ))}
            </div>
        );
    }

    if (animes.length === 0) {
        return (
            <div className={styles.emptyState}>
                <Film size={48} />
                <p>{emptyMessage || "No anime found"}</p>
            </div>
        );
    }

    return (
        <div className={`${styles.animeGrid} ${compact ? styles.animeGridCompact : ''}`}>
            {animes.map((anime, index) => (
                <AnimeCard
                    key={`${anime.slug}-${index}`}
                    anime={anime}
                    priority={index < 5}
                    compact={compact}
                />
            ))}
        </div>
    );
}

// ============================================================
// FEATURED ANIME HERO (Desktop) + CAROUSEL (Mobile)
// ============================================================
function FeaturedAnime({
    anime,
    allFeatured,
    onRandom
}: {
    anime: Anime | null;
    allFeatured: Anime[];
    onRandom: () => void;
}) {
    if (!anime) return null;

    return (
        <>
            {/* Desktop: Single Featured Hero */}
            <div className={styles.featuredSection}>
                <div
                    className={styles.featuredBackground}
                    style={{ backgroundImage: `url(${anime.poster})` }}
                />
                <div className={styles.featuredContent}>
                    <div className={styles.featuredPoster}>
                        <Image
                            src={anime.poster}
                            alt={anime.title}
                            width={180}
                            height={270}
                            className={styles.featuredImage}
                            priority
                        />
                    </div>
                    <div className={styles.featuredInfo}>
                        <span className={styles.featuredLabel}>
                            <Sparkles size={14} />
                            Featured Pick
                        </span>
                        <h2 className={styles.featuredTitle}>{anime.title}</h2>
                        <div className={styles.featuredMeta}>
                            {anime.type && <span className={styles.featuredType}>{anime.type}</span>}
                            {anime.episode && <span>{anime.episode}</span>}
                        </div>
                        <div className={styles.featuredActions}>
                            <Link href={`/anime/${anime.slug}`} className={styles.featuredWatchBtn}>
                                <Play size={18} />
                                Watch Now
                            </Link>
                            <button onClick={onRandom} className={styles.featuredRandomBtn}>
                                <Shuffle size={16} />
                                Random
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Horizontal Scroll Carousel */}
            <div className={styles.featuredCarousel}>
                <div className={styles.carouselHeader}>
                    <span className={styles.carouselLabel}>
                        <Sparkles size={14} />
                        Featured
                    </span>
                    <button onClick={onRandom} className={styles.carouselShuffle}>
                        <Shuffle size={14} />
                    </button>
                </div>
                <div className={styles.carouselTrack}>
                    {allFeatured.slice(0, 8).map((item, index) => (
                        <Link
                            key={item.slug}
                            href={`/anime/${item.slug}`}
                            className={`${styles.carouselCard} ${index === 0 ? styles.carouselCardFirst : ''}`}
                        >
                            <div className={styles.carouselPoster}>
                                <Image
                                    src={item.poster}
                                    alt={item.title}
                                    width={140}
                                    height={200}
                                    className={styles.carouselImage}
                                />
                                {item.episode && (
                                    <span className={styles.carouselEpisode}>
                                        {item.episode.replace("Episode ", "Ep ")}
                                    </span>
                                )}
                                <div className={styles.carouselGradient}>
                                    <Play size={20} className={styles.carouselPlayIcon} />
                                </div>
                            </div>
                            <div className={styles.carouselInfo}>
                                <h3 className={styles.carouselTitle}>{item.title}</h3>
                                {item.type && (
                                    <span className={styles.carouselType}>{item.type}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

// ============================================================
// FILTER PANEL
// ============================================================
function FilterPanel({
    isOpen,
    onClose,
    selectedGenre,
    onGenreSelect,
    sortBy,
    onSortChange
}: {
    isOpen: boolean;
    onClose: () => void;
    selectedGenre: string | null;
    onGenreSelect: (genre: string | null) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
}) {
    if (!isOpen) return null;

    return (
        <div className={styles.filterPanel}>
            <div className={styles.filterHeader}>
                <h3>
                    <Filter size={16} />
                    Filters
                </h3>
                <button onClick={onClose} className={styles.filterClose}>
                    <X size={18} />
                </button>
            </div>

            <div className={styles.filterSection}>
                <label className={styles.filterLabel}>Sort By</label>
                <div className={styles.filterOptions}>
                    {[
                        { id: "latest", label: "Latest", icon: Clock },
                        { id: "popular", label: "Popular", icon: Flame },
                        { id: "az", label: "A-Z", icon: List },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => onSortChange(id)}
                            className={`${styles.filterOption} ${sortBy === id ? styles.filterOptionActive : ''}`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.filterSection}>
                <label className={styles.filterLabel}>Genre</label>
                <div className={styles.genreGrid}>
                    <button
                        onClick={() => onGenreSelect(null)}
                        className={`${styles.genreChip} ${!selectedGenre ? styles.genreChipActive : ''}`}
                    >
                        All
                    </button>
                    {GENRES.map((genre) => (
                        <button
                            key={genre}
                            onClick={() => onGenreSelect(genre)}
                            className={`${styles.genreChip} ${selectedGenre === genre ? styles.genreChipActive : ''}`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// QUICK STATS
// ============================================================
function QuickStats({ ongoing, completed }: { ongoing: number; completed: number }) {
    return (
        <div className={styles.quickStats}>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <TrendingUp size={20} />
                </div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{ongoing}</span>
                    <span className={styles.statLabel}>Ongoing</span>
                </div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <CheckCircle2 size={20} />
                </div>
                <div className={styles.statInfo}>
                    <span className={styles.statValue}>{completed}</span>
                    <span className={styles.statLabel}>Completed</span>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function AnimePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Data states
    const [ongoingAnime, setOngoingAnime] = useState<Anime[]>([]);
    const [completedAnime, setCompletedAnime] = useState<Anime[]>([]);
    const [searchResults, setSearchResults] = useState<Anime[]>([]);
    const [featuredAnime, setFeaturedAnime] = useState<Anime | null>(null);

    // UI states
    const [loadingOngoing, setLoadingOngoing] = useState(true);
    const [loadingCompleted, setLoadingCompleted] = useState(true);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState("latest");
    const [error, setError] = useState<string | null>(null);

    // Mount effect
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch ongoing anime
    useEffect(() => {
        async function fetchOngoing() {
            try {
                const res = await fetch(`${API_URL}/ongoing`);
                if (!res.ok) throw new Error("Failed to fetch ongoing anime");
                const data = await res.json();
                const animes = data.animes || [];
                setOngoingAnime(animes);
                // Set a random featured anime
                if (animes.length > 0) {
                    setFeaturedAnime(animes[Math.floor(Math.random() * Math.min(animes.length, 5))]);
                }
            } catch (err) {
                console.error("Error fetching ongoing:", err);
                setError("Failed to load anime data");
            } finally {
                setLoadingOngoing(false);
            }
        }
        fetchOngoing();
    }, []);

    // Fetch completed anime
    useEffect(() => {
        async function fetchCompleted() {
            try {
                const res = await fetch(`${API_URL}/completed`);
                if (!res.ok) throw new Error("Failed to fetch completed anime");
                const data = await res.json();
                setCompletedAnime(data.animes || []);
            } catch (err) {
                console.error("Error fetching completed:", err);
            } finally {
                setLoadingCompleted(false);
            }
        }
        fetchCompleted();
    }, []);

    // Search handler
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            setIsSearchMode(false);
            setSearchResults([]);
            return;
        }

        setIsSearchMode(true);
        setLoadingSearch(true);

        try {
            const res = await fetch(`${API_URL}/search/${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();
            setSearchResults(data.animes || []);
        } catch (err) {
            console.error("Search error:", err);
            setSearchResults([]);
        } finally {
            setLoadingSearch(false);
        }
    }, [searchQuery]);

    // Random anime picker
    const pickRandomFeatured = useCallback(() => {
        const allAnime = [...ongoingAnime, ...completedAnime];
        if (allAnime.length > 0) {
            setFeaturedAnime(allAnime[Math.floor(Math.random() * allAnime.length)]);
        }
    }, [ongoingAnime, completedAnime]);

    // Clear search
    const clearSearch = () => {
        setSearchQuery("");
        setIsSearchMode(false);
        setSearchResults([]);
    };

    // Handle key press for search
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
        <main className={styles.animePage}>
            <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Navbar - Consistent with other pages */}
            <nav className={styles.navbar}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.backButton}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </Link>
                    <div className={styles.navDivider} />
                    <div className={styles.navBrand}>
                        <Tv size={20} className={styles.navBrandIcon} />
                        <span>Anime</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={styles.menuButton}
                    aria-label="Open Menu"
                >
                    <LayoutGrid size={20} />
                </button>
            </nav>

            {/* Main Content */}
            <div className={styles.container}>
                {/* Search Bar */}
                <div className={styles.searchWrapper}>
                    <div className={styles.searchContainer}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search anime titles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button onClick={clearSearch} className={styles.searchClear}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button onClick={handleSearch} className={styles.searchBtn} disabled={!searchQuery.trim()}>
                        Search
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`${styles.filterBtn} ${showFilters ? styles.filterBtnActive : ''}`}
                    >
                        <Filter size={18} />
                    </button>
                </div>

                {/* Filter Panel */}
                <FilterPanel
                    isOpen={showFilters}
                    onClose={() => setShowFilters(false)}
                    selectedGenre={selectedGenre}
                    onGenreSelect={setSelectedGenre}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                />

                {/* Search Results Mode */}
                {isSearchMode ? (
                    <section className={styles.section}>
                        <SectionHeader
                            title={`Search Results`}
                            icon={Search}
                            count={searchResults.length}
                            action={
                                <button onClick={clearSearch} className={styles.clearBtn}>
                                    Clear Search
                                </button>
                            }
                        />
                        <AnimeGrid
                            animes={searchResults}
                            loading={loadingSearch}
                            emptyMessage={`No results for "${searchQuery}"`}
                        />
                    </section>
                ) : (
                    <>
                        {/* Error Banner */}
                        {error && (
                            <div className={styles.errorBanner}>
                                <Sparkles size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Featured Anime */}
                        <FeaturedAnime
                            anime={featuredAnime}
                            allFeatured={ongoingAnime.slice(0, 8)}
                            onRandom={pickRandomFeatured}
                        />

                        {/* Quick Stats */}
                        <QuickStats
                            ongoing={ongoingAnime.length}
                            completed={completedAnime.length}
                        />

                        {/* Ongoing Anime Section */}
                        <section className={styles.section}>
                            <SectionHeader
                                title="Ongoing Series"
                                icon={TrendingUp}
                                count={ongoingAnime.length}
                                action={
                                    <Link href="/anime/list?type=ongoing" className={styles.seeAllBtn}>
                                        View All <ChevronRight size={16} />
                                    </Link>
                                }
                            />
                            <AnimeGrid
                                animes={ongoingAnime.slice(0, 10)}
                                loading={loadingOngoing}
                                emptyMessage="No ongoing anime available"
                            />
                        </section>

                        {/* Completed Anime Section */}
                        <section className={styles.section}>
                            <SectionHeader
                                title="Completed Series"
                                icon={CheckCircle2}
                                count={completedAnime.length}
                                action={
                                    <Link href="/anime/list?type=completed" className={styles.seeAllBtn}>
                                        View All <ChevronRight size={16} />
                                    </Link>
                                }
                            />
                            <AnimeGrid
                                animes={completedAnime.slice(0, 10)}
                                loading={loadingCompleted}
                                emptyMessage="No completed anime available"
                            />
                        </section>
                    </>
                )}
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>Stream anime content • Data provided by external API</p>
            </footer>
        </main>
    );
}
