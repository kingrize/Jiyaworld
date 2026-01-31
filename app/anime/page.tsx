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
    Shuffle,
    Filter,
    Clock,
    Flame,
    List,
    X,
    Heart,
    Calendar,
    Layers,
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

interface Genre {
    name: string;
    slug: string;
}

interface FeaturedAnime extends Anime {
    synopsis?: string;
    genres?: Genre[];
    duration?: string;
    totalEpisodes?: number;
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
// COMPACT ANIME CARD - Vertical poster with info below
// Aspect ratio: 3:4 for better grid density
// ============================================================
function AnimeCard({ anime, priority = false }: {
    anime: Anime;
    priority?: boolean;
}) {
    return (
        <Link href={`/anime/${anime.slug}`} className={styles.animeCard}>
            <div className={styles.cardPoster}>
                <Image
                    src={anime.poster}
                    alt={anime.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
                    className={styles.posterImage}
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder-anime.png";
                    }}
                />
                {/* Status indicator - top left */}
                {anime.type && (
                    <span className={styles.cardTypeBadge}>{anime.type}</span>
                )}
                {/* Episode badge - bottom of poster */}
                {anime.episode && (
                    <div className={styles.cardEpisodeBar}>
                        <Clock size={10} />
                        <span>{anime.episode.replace("Episode ", "Ep ")}</span>
                    </div>
                )}
            </div>
            {/* Info section - below poster */}
            <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{anime.title}</h3>
                {anime.score && (
                    <div className={styles.cardMeta}>
                        <Star size={11} className={styles.starIcon} />
                        <span>{anime.score}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}

// ============================================================
// HORIZONTAL LIST CARD - For trending/featured lists
// Shows more info in horizontal layout
// ============================================================
function HorizontalCard({ anime, rank }: {
    anime: Anime;
    rank?: number;
}) {
    return (
        <Link href={`/anime/${anime.slug}`} className={styles.horizontalCard}>
            {rank && (
                <div className={styles.horizontalRank}>
                    <span>{rank}</span>
                </div>
            )}
            <div className={styles.horizontalPoster}>
                <Image
                    src={anime.poster}
                    alt={anime.title}
                    width={56}
                    height={80}
                    className={styles.horizontalImage}
                />
            </div>
            <div className={styles.horizontalInfo}>
                <h4 className={styles.horizontalTitle}>{anime.title}</h4>
                <div className={styles.horizontalMeta}>
                    {anime.type && (
                        <span className={styles.horizontalType}>{anime.type}</span>
                    )}
                    {anime.episode && (
                        <span className={styles.horizontalEpisode}>
                            {anime.episode.replace("Episode ", "Ep ")}
                        </span>
                    )}
                </div>
            </div>
            <ChevronRight size={16} className={styles.horizontalArrow} />
        </Link>
    );
}

// ============================================================
// FEATURED CARD - Spotlight with synopsis and genres
// Primary visual focus with rich content
// ============================================================
function FeaturedCard({ anime, onShuffle }: {
    anime: FeaturedAnime | null;
    onShuffle: () => void;
}) {
    if (!anime) return null;

    return (
        <div className={styles.featuredCard}>
            {/* Poster Column - Labels above cover image */}
            <div className={styles.featuredPosterColumn}>
                {/* Labels positioned above */}
                <div className={styles.featuredLabels}>
                    <span className={styles.featuredLabel}>
                        <Flame size={12} />
                        Featured
                    </span>
                    {anime.status && (
                        <span className={styles.featuredStatus} data-status={anime.status.toLowerCase()}>
                            {anime.status}
                        </span>
                    )}
                </div>
                {/* Cover image */}
                <div className={styles.featuredPoster}>
                    <Image
                        src={anime.poster}
                        alt={anime.title}
                        width={200}
                        height={280}
                        className={styles.featuredImage}
                        priority
                    />
                </div>
            </div>
            <div className={styles.featuredContent}>
                {/* Title - grouped with synopsis */}
                <h2 className={styles.featuredTitle}>{anime.title}</h2>
                {/* Quick Meta Row */}
                <div className={styles.featuredMeta}>
                    {anime.type && (
                        <span className={styles.featuredType}>{anime.type}</span>
                    )}
                    {anime.totalEpisodes && anime.totalEpisodes > 0 && (
                        <span className={styles.featuredEpisodeCount}>
                            {anime.totalEpisodes} Eps
                        </span>
                    )}
                    {anime.episode && !anime.totalEpisodes && (
                        <span className={styles.featuredEpisode}>
                            <Clock size={12} />
                            {anime.episode}
                        </span>
                    )}
                    {anime.score && (
                        <span className={styles.featuredScore}>
                            <Star size={12} className={styles.starIcon} />
                            {anime.score}
                        </span>
                    )}
                </div>

                {/* Genre Chips */}
                {anime.genres && anime.genres.length > 0 && (
                    <div className={styles.featuredGenres}>
                        {anime.genres.slice(0, 4).map((genre) => (
                            <span key={genre.slug} className={styles.genreChipSmall}>
                                {genre.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Synopsis */}
                {anime.synopsis && (
                    <p className={styles.featuredSynopsis}>
                        {anime.synopsis}
                    </p>
                )}

                {/* Actions */}
                <div className={styles.featuredActions}>
                    <Link href={`/anime/${anime.slug}`} className={styles.featuredWatchBtn}>
                        <Play size={14} fill="currentColor" />
                        Watch Now
                    </Link>
                    <button onClick={onShuffle} className={styles.featuredShuffleBtn} title="Show another">
                        <Shuffle size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// COMMUNITY SUPPORT - Tako leaderboard iframe embed
// Direct client-side integration, display-only
// ============================================================
const TAKO_OVERLAY_URL = "https://tako.id/overlay/leaderboard?overlay_key=ncdd8m7i45nm8vmp7epfidbj";
const TAKO_DONATE_URL = "https://tako.id/argazyu";

function CommunitySupport() {
    const [loaded, setLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Fail silently if iframe doesn't load
    if (hasError) return null;

    return (
        <div className={styles.communitySupport}>
            <div className={styles.communitySupportHeader}>
                <Heart size={12} className={styles.communitySupportIcon} />
                <span>Top Supporters</span>
            </div>
            <div className={styles.leaderboardEmbed}>
                <iframe
                    src={TAKO_OVERLAY_URL}
                    title="Community Supporters"
                    className={`${styles.takoIframe} ${loaded ? styles.takoIframeLoaded : ''}`}
                    onLoad={() => setLoaded(true)}
                    onError={() => setHasError(true)}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin"
                />
                {!loaded && (
                    <div className={styles.leaderboardPlaceholder}>
                        <Loader2 size={16} className={styles.loadingSpinner} />
                    </div>
                )}
            </div>
            {/* Donate Button Footer */}
            <div className={styles.communitySupportFooter}>
                <a
                    href={TAKO_DONATE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.donateBtn}
                >
                    <Heart size={12} />
                    Support Here
                </a>
            </div>
        </div>
    );
}

// ============================================================
// SECTION CONTAINER - Groups content with surface elevation
// ============================================================
function Section({
    title,
    icon: Icon,
    action,
    children,
    variant = "default"
}: {
    title: string;
    icon: React.ElementType;
    action?: React.ReactNode;
    children: React.ReactNode;
    variant?: "default" | "surface";
}) {
    return (
        <section className={`${styles.section} ${variant === "surface" ? styles.sectionSurface : ""}`}>
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
// ANIME GRID - Responsive poster grid
// ============================================================
function AnimeGrid({
    animes,
    loading,
    emptyMessage,
    columns = "default"
}: {
    animes: Anime[];
    loading: boolean;
    emptyMessage?: string;
    columns?: "default" | "compact";
}) {
    if (loading) {
        return (
            <div className={`${styles.animeGrid} ${columns === "compact" ? styles.gridCompact : ""}`}>
                {[...Array(10)].map((_, i) => (
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

    if (animes.length === 0) {
        return (
            <div className={styles.emptyState}>
                <Film size={40} />
                <p>{emptyMessage || "No anime found"}</p>
            </div>
        );
    }

    return (
        <div className={`${styles.animeGrid} ${columns === "compact" ? styles.gridCompact : ""}`}>
            {animes.map((anime, index) => (
                <AnimeCard
                    key={`${anime.slug}-${index}`}
                    anime={anime}
                    priority={index < 4}
                />
            ))}
        </div>
    );
}

// ============================================================
// TRENDING LIST - Horizontal scrolling list cards
// ============================================================
function TrendingList({
    animes,
    loading
}: {
    animes: Anime[];
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className={styles.trendingList}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={styles.horizontalCardSkeleton}>
                        <div className={styles.skeletonRank} />
                        <div className={styles.skeletonThumb} />
                        <div className={styles.skeletonInfo}>
                            <div className={styles.skeletonTitle} />
                            <div className={styles.skeletonMeta} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={styles.trendingList}>
            {animes.slice(0, 5).map((anime, index) => (
                <HorizontalCard
                    key={anime.slug}
                    anime={anime}
                    rank={index + 1}
                />
            ))}
        </div>
    );
}

// ============================================================
// QUICK PICKS - Horizontal scroll of compact cards
// ============================================================
function QuickPicks({
    animes,
    loading
}: {
    animes: Anime[];
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className={styles.quickPicksTrack}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={styles.quickPickSkeleton}>
                        <div className={styles.skeletonPoster} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={styles.quickPicksTrack}>
            {animes.slice(0, 10).map((anime) => (
                <Link
                    key={anime.slug}
                    href={`/anime/${anime.slug}`}
                    className={styles.quickPickCard}
                >
                    <div className={styles.quickPickPoster}>
                        <Image
                            src={anime.poster}
                            alt={anime.title}
                            width={100}
                            height={140}
                            className={styles.quickPickImage}
                        />
                        {anime.episode && (
                            <span className={styles.quickPickEpisode}>
                                {anime.episode.replace("Episode ", "Ep ")}
                            </span>
                        )}
                    </div>
                    <span className={styles.quickPickTitle}>{anime.title}</span>
                </Link>
            ))}
        </div>
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

            <div className={styles.filterGroup}>
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
                            className={`${styles.filterChip} ${sortBy === id ? styles.filterChipActive : ''}`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.filterGroup}>
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
// MAIN PAGE COMPONENT
// ============================================================
export default function AnimePage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Data states
    const [ongoingAnime, setOngoingAnime] = useState<Anime[]>([]);
    const [completedAnime, setCompletedAnime] = useState<Anime[]>([]);
    const [searchResults, setSearchResults] = useState<Anime[]>([]);
    const [featuredAnime, setFeaturedAnime] = useState<FeaturedAnime | null>(null);

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

    // Fetch detailed info for featured anime
    const fetchFeaturedDetail = async (anime: Anime): Promise<FeaturedAnime> => {
        try {
            const res = await fetch(`${API_URL}/detail/${anime.slug}`);
            if (res.ok) {
                const data = await res.json();
                const detail = data.detail;
                return {
                    ...anime,
                    synopsis: detail?.synopsis,
                    genres: detail?.genres,
                    duration: detail?.duration,
                    totalEpisodes: detail?.episodes?.length,
                    score: detail?.score || anime.score,
                    status: detail?.status || anime.status,
                };
            }
        } catch (err) {
            console.error("Error fetching featured detail:", err);
        }
        return anime;
    };

    // Fetch ongoing anime
    useEffect(() => {
        async function fetchOngoing() {
            try {
                const res = await fetch(`${API_URL}/ongoing`);
                if (!res.ok) throw new Error("Failed to fetch ongoing anime");
                const data = await res.json();
                const animes = data.animes || [];
                setOngoingAnime(animes);

                // Set a random featured anime with detail data
                if (animes.length > 0) {
                    const randomAnime = animes[Math.floor(Math.random() * Math.min(animes.length, 5))];
                    const detailedFeatured = await fetchFeaturedDetail(randomAnime);
                    setFeaturedAnime(detailedFeatured);
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

    // Random anime picker with detail fetch
    const pickRandomFeatured = useCallback(async () => {
        const allAnime = [...ongoingAnime, ...completedAnime];
        if (allAnime.length > 0) {
            const randomAnime = allAnime[Math.floor(Math.random() * allAnime.length)];
            const detailedFeatured = await fetchFeaturedDetail(randomAnime);
            setFeaturedAnime(detailedFeatured);
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

    // Get recommended anime
    const getRecommendedAnime = useCallback(() => {
        const all = [...ongoingAnime, ...completedAnime];
        const shuffled = all.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 10);
    }, [ongoingAnime, completedAnime]);

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

            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.backBtn}>
                        <ArrowLeft size={18} />
                    </Link>
                    <div className={styles.navBrand}>
                        <Tv size={18} className={styles.navIcon} />
                        <span>Anime</span>
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
                {/* Search Section */}
                <div className={styles.searchSection}>
                    <div className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search anime..."
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
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`${styles.filterBtn} ${showFilters ? styles.filterBtnActive : ''}`}
                    >
                        <Filter size={16} />
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
                            <button onClick={clearSearch} className={styles.textBtn}>
                                Clear
                            </button>
                        }
                    >
                        <AnimeGrid
                            animes={searchResults}
                            loading={loadingSearch}
                            emptyMessage={`No results for "${searchQuery}"`}
                        />
                    </Section>
                ) : (
                    <>
                        {/* TOP ROW: Featured + Trending side by side on desktop */}
                        <div className={styles.topRow}>
                            {/* Featured Card + Community Support */}
                            <div className={styles.featuredWrapper}>
                                <FeaturedCard
                                    anime={featuredAnime}
                                    onShuffle={pickRandomFeatured}
                                />
                                <CommunitySupport />
                            </div>

                            {/* Trending List */}
                            <div className={styles.trendingWrapper}>
                                <Section
                                    title="Trending"
                                    icon={Flame}
                                    variant="surface"
                                    action={
                                        <Link href="/anime/list?type=ongoing" className={styles.linkBtn}>
                                            All <ChevronRight size={14} />
                                        </Link>
                                    }
                                >
                                    <TrendingList
                                        animes={ongoingAnime}
                                        loading={loadingOngoing}
                                    />
                                </Section>
                            </div>
                        </div>

                        {/* Quick Picks - Horizontal scroll */}
                        <Section
                            title="Quick Picks"
                            icon={Layers}
                            action={
                                <button onClick={pickRandomFeatured} className={styles.iconBtn}>
                                    <Shuffle size={14} />
                                </button>
                            }
                        >
                            <QuickPicks
                                animes={ongoingAnime}
                                loading={loadingOngoing}
                            />
                        </Section>

                        {/* Ongoing Series - Main Grid */}
                        <Section
                            title="Ongoing Series"
                            icon={Calendar}
                            action={
                                <Link href="/anime/list?type=ongoing" className={styles.linkBtn}>
                                    View All <ChevronRight size={14} />
                                </Link>
                            }
                        >
                            <AnimeGrid
                                animes={ongoingAnime.slice(0, 10)}
                                loading={loadingOngoing}
                                emptyMessage="No ongoing anime available"
                            />
                        </Section>

                        {/* Recommended For You */}
                        <Section
                            title="You Might Like"
                            icon={Heart}
                            action={
                                <button onClick={pickRandomFeatured} className={styles.textBtn}>
                                    <Shuffle size={12} />
                                    Refresh
                                </button>
                            }
                        >
                            <AnimeGrid
                                animes={getRecommendedAnime()}
                                loading={loadingOngoing && loadingCompleted}
                                emptyMessage="No recommendations available"
                            />
                        </Section>
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
