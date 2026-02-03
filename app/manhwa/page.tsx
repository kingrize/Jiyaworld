"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { FloatingSidebar } from "@/components/floating-sidebar";
import {
    BookOpen,
    Search,
    LayoutGrid,
    Loader2,
    Clock,
    TrendingUp,
    X,
    Flame,
    History,
    Play,
    Library,
    Home,
    Trash2,
    ChevronRight,
    Sparkles,
    Star,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import styles from "./manhwa.module.css";
import {
    API_BASE,
    createSlug,
    getReadingHistory,
    clearHistory,
    removeFromHistory,
    type Comic,
    type ReadingHistoryEntry,
} from "@/lib/manhwa";

// ============================================================
// UTILITY FUNCTIONS - Dedupe & HD Images
// ============================================================

type HasSlug = { slug: string };

/**
 * Take unique items from source, tracking used slugs globally
 */
function takeUnique<T extends HasSlug>(
    source: T[],
    used: Set<string>,
    count: number
): T[] {
    const out: T[] = [];
    for (const item of source) {
        if (!item?.slug) continue;
        if (used.has(item.slug)) continue;
        used.add(item.slug);
        out.push(item);
        if (out.length >= count) break;
    }
    return out;
}

/**
 * Fill target list to desired size using fallback pools, respecting dedupe
 */
function fillUnique<T extends HasSlug>(
    current: T[],
    used: Set<string>,
    desiredCount: number,
    ...pools: T[][]
): T[] {
    const out = [...current];
    if (out.length >= desiredCount) return out;

    for (const pool of pools) {
        if (out.length >= desiredCount) break;
        const needed = desiredCount - out.length;
        const more = takeUnique(pool, used, needed);
        out.push(...more);
    }
    return out;
}

/**
 * Dedupe array by slug (keeps first occurrence)
 */
function uniqBySlug<T extends HasSlug>(list: T[]): T[] {
    const seen = new Set<string>();
    return list.filter(x => x?.slug && !seen.has(x.slug) && (seen.add(x.slug), true));
}

/**
 * Seeded random - xmur3 hash
 */
function xmur3(str: string) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

/**
 * Seeded random - mulberry32 PRNG
 */
function mulberry32(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Shuffle array with seed for deterministic results
 */
function seededShuffle<T>(arr: T[], seedStr: string): T[] {
    if (arr.length === 0) return [];
    const seed = xmur3(seedStr)();
    const rand = mulberry32(seed);
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/**
 * Upgrade cover URL to higher resolution when possible
 */
function getHighResCoverUrl(inputUrl: string): string {
    if (!inputUrl) return inputUrl;

    try {
        const isAbsolute = /^https?:\/\//i.test(inputUrl);
        const url = new URL(inputUrl, isAbsolute ? undefined : "https://example.com");

        // Upgrade common width/height params
        const upgradeParam = (key: string, minVal: number) => {
            if (!url.searchParams.has(key)) return;
            const raw = url.searchParams.get(key) ?? "";
            const n = Number(raw);
            if (Number.isFinite(n) && n > 0 && n < minVal) {
                url.searchParams.set(key, String(minVal));
            }
        };

        upgradeParam("w", 700);
        upgradeParam("width", 700);
        upgradeParam("h", 1000);
        upgradeParam("height", 1000);

        // Upgrade quality params
        const qKeys = ["q", "quality"];
        for (const k of qKeys) {
            if (!url.searchParams.has(k)) continue;
            const n = Number(url.searchParams.get(k));
            if (Number.isFinite(n) && n > 0 && n < 70) {
                url.searchParams.set(k, "85");
            }
        }

        // Remove blur params
        const blurKeys = ["blur", "blurry", "gaussian", "blurRadius"];
        for (const k of blurKeys) {
            if (url.searchParams.has(k)) url.searchParams.delete(k);
        }

        // Conservative path replacements
        const path = url.pathname;
        const safeReplacements: Array<[RegExp, string]> = [
            [/\/thumb(nails)?\//i, "/large/"],
            [/\/thumbnail\//i, "/large/"],
            [/\/small\//i, "/large/"],
            [/\/low\//i, "/large/"],
        ];
        let newPath = path;
        for (const [re, rep] of safeReplacements) {
            if (re.test(newPath)) {
                newPath = newPath.replace(re, rep);
                break;
            }
        }
        url.pathname = newPath;

        const out = isAbsolute ? url.toString() : url.toString().replace("https://example.com", "");
        return out;
    } catch {
        return inputUrl;
    }
}

// ============================================================
// FORMATTING UTILITIES
// ============================================================

function formatChapterDisplay(chapterSlug: string): string {
    if (!chapterSlug) return "Unknown";
    if (chapterSlug.toLowerCase().startsWith("chapter ")) return chapterSlug;
    const cleaned = chapterSlug.replace(/^chapter-/i, "").replace(/-/g, ".");
    return `Chapter ${cleaned}`;
}

function formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

function safeFilterComics<T extends { title?: string; chapter?: string }>(comics: T[]): T[] {
    if (!Array.isArray(comics)) return [];
    return comics.filter((item) => {
        if (!item || typeof item !== "object") return false;
        const title = item.title || "";
        const chapter = item.chapter || "";
        return (
            typeof title === "string" &&
            typeof chapter === "string" &&
            !title.toLowerCase().includes("apk") &&
            !chapter.toLowerCase().includes("download")
        );
    });
}

function processComicSafe(comic: any): Comic | null {
    try {
        if (!comic || !comic.title) return null;
        const title = String(comic.title || "Unknown");
        const slug = createSlug(title);
        const link = String(comic.link || "").replace("/manga/", "/").replace("/plus/", "/");
        const imageUrl = comic.image && !String(comic.image).includes("lazy.jpg")
            ? String(comic.image)
            : "/placeholder-comic.png";
        const chapter = comic.chapter ? String(comic.chapter) : "";

        return {
            title,
            image: imageUrl,
            chapter,
            slug,
            processedLink: link,
            source: comic.source || "",
            type: comic.type ? String(comic.type) : undefined,
            genre: comic.genre ? String(comic.genre) : undefined,
        };
    } catch {
        return null;
    }
}

function isKoreanOrigin(comic: Comic): boolean {
    if (!comic) return false;
    const type = (comic.type || "").toLowerCase();
    if (type === "manhwa" || type === "korean") return true;
    const genre = (comic.genre || "").toLowerCase();
    if (genre.includes("manhwa") || genre.includes("korean")) return true;
    return false;
}

// ============================================================
// CARD COMPONENTS
// ============================================================

function ManhwaCard({ comic, priority = false, showBadge }: {
    comic: Comic;
    priority?: boolean;
    showBadge?: "trending" | "new";
}) {
    const handleClick = () => {
        sessionStorage.setItem(
            `manhwa_${comic.slug}`,
            JSON.stringify({
                comic: { title: comic.title, image: comic.image, chapter: comic.chapter, source: comic.source },
                processedLink: comic.processedLink,
            })
        );
    };

    const isKorean = isKoreanOrigin(comic);
    const hdImage = getHighResCoverUrl(comic.image);

    return (
        <Link href={`/manhwa/${comic.slug}`} className={styles.manhwaCard} onClick={handleClick}>
            <div className={styles.cardPoster}>
                <Image
                    src={hdImage}
                    alt={comic.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1200px) 20vw, 180px"
                    quality={85}
                    className={styles.posterImage}
                    onError={(e) => { e.currentTarget.src = "/placeholder-comic.png"; }}
                />
                {isKorean && <span className={styles.koreaBadge} aria-label="Korean Manhwa">🇰🇷</span>}
                {showBadge === "trending" && <span className={styles.trendingBadge}><Flame size={10} /></span>}
                {comic.type && <span className={styles.cardTypeBadge}>{comic.type}</span>}
                {comic.chapter && (
                    <div className={styles.cardChapterBar}>
                        <Clock size={10} />
                        <span>{comic.chapter}</span>
                    </div>
                )}
            </div>
            <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{comic.title}</h3>
            </div>
        </Link>
    );
}

function HistoryCard({ entry, onRemove }: { entry: ReadingHistoryEntry; onRemove?: (slug: string) => void }) {
    const handleClick = () => {
        sessionStorage.setItem(`manhwa_${entry.slug}`, JSON.stringify({
            comic: { title: entry.title, image: entry.image, chapter: entry.lastChapter, processedLink: entry.processedLink },
            processedLink: entry.processedLink,
        }));
        sessionStorage.setItem(`manhwa_reader_${entry.slug}`, JSON.stringify({
            chapterLink: entry.lastChapterLink,
            comicTitle: entry.title,
            chapterNumber: entry.lastChapter,
            comic: { title: entry.title, image: entry.image, processedLink: entry.processedLink },
            processedLink: entry.processedLink,
        }));
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove?.(entry.slug);
    };

    const hdImage = getHighResCoverUrl(entry.image || "/placeholder-comic.png");

    return (
        <div className={styles.historyCardWrapper}>
            <Link href={`/manhwa/${entry.slug}/${entry.lastChapter}`} className={styles.historyCard} onClick={handleClick}>
                <div className={styles.historyPoster}>
                    <Image
                        src={hdImage}
                        alt={entry.title}
                        fill
                        sizes="100px"
                        quality={85}
                        className={styles.posterImage}
                        onError={(e) => { e.currentTarget.src = "/placeholder-comic.png"; }}
                    />
                    <div className={styles.historyPlayOverlay}><Play size={20} fill="currentColor" /></div>
                </div>
                <div className={styles.historyContent}>
                    <h3 className={styles.historyTitle}>{entry.title}</h3>
                    <span className={styles.historyChapter}>{formatChapterDisplay(entry.lastChapter)}</span>
                    <span className={styles.historyTime}>{formatTimeAgo(entry.timestamp)}</span>
                </div>
            </Link>
            {onRemove && (
                <button className={styles.historyRemoveBtn} onClick={handleRemove} aria-label={`Remove ${entry.title}`}>
                    <X size={14} />
                </button>
            )}
        </div>
    );
}

function FeaturedCard({ comic }: { comic: Comic }) {
    const handleClick = () => {
        sessionStorage.setItem(`manhwa_${comic.slug}`, JSON.stringify({
            comic: { title: comic.title, image: comic.image, chapter: comic.chapter, source: comic.source },
            processedLink: comic.processedLink,
        }));
    };

    const isKorean = isKoreanOrigin(comic);
    const hdImage = getHighResCoverUrl(comic.image);

    return (
        <Link href={`/manhwa/${comic.slug}`} className={styles.featuredCard} onClick={handleClick}>
            <div className={styles.featuredPoster}>
                <Image
                    src={hdImage}
                    alt={comic.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 600px"
                    quality={85}
                    className={styles.posterImage}
                />
                {isKorean && <span className={styles.koreaBadgeLarge} aria-label="Korean">🇰🇷</span>}
                <div className={styles.featuredOverlay}>
                    <span className={styles.featuredBadge}><Sparkles size={12} />Featured</span>
                    <h2 className={styles.featuredTitle}>{comic.title}</h2>
                    {comic.chapter && <span className={styles.featuredChapter}>{comic.chapter}</span>}
                </div>
            </div>
        </Link>
    );
}

function CarouselCard({ comic, showBadge }: { comic: Comic; showBadge?: boolean }) {
    const handleClick = () => {
        sessionStorage.setItem(`manhwa_${comic.slug}`, JSON.stringify({
            comic: { title: comic.title, image: comic.image, chapter: comic.chapter, source: comic.source },
            processedLink: comic.processedLink,
        }));
    };

    const isKorean = isKoreanOrigin(comic);
    const hdImage = getHighResCoverUrl(comic.image);

    return (
        <Link href={`/manhwa/${comic.slug}`} className={styles.carouselCard} onClick={handleClick}>
            <div className={styles.carouselPoster}>
                <Image
                    src={hdImage}
                    alt={comic.title}
                    fill
                    sizes="140px"
                    quality={85}
                    className={styles.posterImage}
                    onError={(e) => { e.currentTarget.src = "/placeholder-comic.png"; }}
                />
                {isKorean && <span className={styles.koreaBadge} aria-label="Korean">🇰🇷</span>}
                {showBadge && <span className={styles.trendingBadge}><Flame size={10} /></span>}
                {comic.chapter && <div className={styles.cardChapterBar}><span>{comic.chapter}</span></div>}
            </div>
            <h3 className={styles.carouselTitle}>{comic.title}</h3>
        </Link>
    );
}

// ============================================================
// SECTION COMPONENTS
// ============================================================

function SectionHeader({ title, icon: Icon, action, id }: {
    title: string;
    icon: React.ElementType;
    action?: React.ReactNode;
    id?: string;
}) {
    return (
        <div className={styles.sectionHeader} id={id}>
            <div className={styles.sectionTitleGroup}>
                <Icon size={18} className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>{title}</h2>
            </div>
            {action && <div className={styles.sectionAction}>{action}</div>}
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className={styles.skeletonCard}>
            <div className={styles.skeletonPoster} />
            <div className={styles.skeletonContent}><div className={styles.skeletonTitle} /></div>
        </div>
    );
}

function SkeletonCarousel({ count = 6 }: { count?: number }) {
    return (
        <div className={styles.carousel}>
            {[...Array(count)].map((_, i) => (
                <div key={i} className={styles.skeletonCarouselCard}>
                    <div className={styles.skeletonPoster} />
                    <div className={styles.skeletonTitle} />
                </div>
            ))}
        </div>
    );
}

function SkeletonGrid({ count = 12 }: { count?: number }) {
    return (
        <div className={styles.manhwaGrid}>
            {[...Array(count)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
    );
}

function FallbackSection({ message }: { message: string }) {
    return (
        <div className={styles.fallbackSection}>
            <Star size={24} />
            <span>{message}</span>
        </div>
    );
}

/**
 * Error state with retry button - used when loading completes but section has no data
 */
function RetryCard({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className={styles.retryCard}>
            <AlertCircle size={32} className={styles.retryIcon} />
            <p className={styles.retryMessage}>{message}</p>
            <button onClick={onRetry} className={styles.retryBtn}>
                <RefreshCw size={16} />
                <span>Try Again</span>
            </button>
        </div>
    );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function ManhwaPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Data states - homepage is PRIMARY source for Featured/Trending
    const [homepagePool, setHomepagePool] = useState<Comic[]>([]);  // /comic/homepage
    const [randomPool, setRandomPool] = useState<Comic[]>([]);      // /comic/random (fallback)
    const [latestPool, setLatestPool] = useState<Comic[]>([]);      // /comic/terbaru
    const [searchResults, setSearchResults] = useState<Comic[]>([]);
    const [readingHistory, setReadingHistory] = useState<ReadingHistoryEntry[]>([]);
    const [homepageFailed, setHomepageFailed] = useState(false);    // Track homepage failure

    // UI states
    const [loadingHomepage, setLoadingHomepage] = useState(true);
    const [loadingRandom, setLoadingRandom] = useState(true);
    const [loadingLatest, setLoadingLatest] = useState(true);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [visibleLatestCount, setVisibleLatestCount] = useState(24);
    const [activeSection, setActiveSection] = useState<string>("home");
    const [isDesktop, setIsDesktop] = useState(false);

    // Refs for scroll-to and intersection observer
    const topRef = useRef<HTMLDivElement>(null);
    const featuredRef = useRef<HTMLElement>(null);
    const trendingRef = useRef<HTMLElement>(null);
    const latestRef = useRef<HTMLElement>(null);

    // Session-stable seed
    const dateSeed = useMemo(() => {
        const today = new Date();
        return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-manhwa`;
    }, []);

    // Mount effect
    useEffect(() => {
        setMounted(true);
        setReadingHistory(getReadingHistory());
    }, []);

    // Desktop detection for responsive Popular Picks count
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(min-width: 769px)");
        const update = () => setIsDesktop(mq.matches);
        update();
        mq.addEventListener?.("change", update);
        return () => mq.removeEventListener?.("change", update);
    }, []);

    // IntersectionObserver for active section
    useEffect(() => {
        if (typeof window === "undefined" || !mounted) return;

        const options = { root: null, rootMargin: "-40% 0px -40% 0px", threshold: 0 };
        const callback: IntersectionObserverCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    if (id === "featured") setActiveSection("featured");
                    else if (id === "trending") setActiveSection("trending");
                    else if (id === "latest") setActiveSection("latest");
                }
            });
        };

        const observer = new IntersectionObserver(callback, options);
        [featuredRef, trendingRef, latestRef].forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        const handleScroll = () => {
            if (window.scrollY < 100) setActiveSection("home");
        };
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, [mounted]);

    // ============================================================
    // FETCH FUNCTIONS - Using official homepage and random endpoints
    // ============================================================

    // PRIMARY: Fetch homepage data (for Featured + Trending)
    // GET /comic/homepage - curated homepage content
    const fetchHomepage = useCallback(async () => {
        setLoadingHomepage(true);
        setHomepageFailed(false);
        try {
            const res = await fetch(`${API_BASE}/homepage`);
            if (!res.ok) throw new Error(`Homepage fetch failed: ${res.status}`);
            const data = await res.json();

            // Try all possible response keys for homepage data
            const popular = data.popular || data.populer || [];
            const trending = data.trending || [];
            const latest = data.latest || data.terbaru || [];
            const ranking = data.ranking || [];

            // Combine all homepage sources
            const allHomepage = [...popular, ...trending, ...latest, ...ranking];

            if (process.env.NODE_ENV === "development") {
                console.log(`[Manhwa] /homepage → keys: ${Object.keys(data).join(", ")}, total: ${allHomepage.length}`);
            }

            const processed = allHomepage.map((c: any) => processComicSafe({ ...c, source: "Homepage" })).filter(Boolean) as Comic[];
            const filtered = safeFilterComics(processed);

            if (filtered.length === 0) {
                setHomepageFailed(true);
            } else {
                setHomepagePool(uniqBySlug(filtered));
            }
        } catch (err) {
            console.error("Error fetching homepage:", err);
            setHomepageFailed(true);
        } finally {
            setLoadingHomepage(false);
        }
    }, []);

    // FALLBACK: Fetch random manhwa (for discovery when homepage fails)
    // GET /comic/random - official random endpoint
    const fetchRandom = useCallback(async () => {
        setLoadingRandom(true);
        try {
            const res = await fetch(`${API_BASE}/random`);
            if (!res.ok) throw new Error(`Random fetch failed: ${res.status}`);
            const data = await res.json();

            // Try possible response keys
            const comics = data.comics || data.data || data.random || data.results || [];

            if (process.env.NODE_ENV === "development") {
                console.log(`[Manhwa] /random → count: ${comics.length}`);
            }

            const processed = comics.map((c: any) => processComicSafe({ ...c, source: "Random" })).filter(Boolean) as Comic[];
            setRandomPool(safeFilterComics(processed));
        } catch (err) {
            console.error("Error fetching random:", err);
            setRandomPool([]);
        } finally {
            setLoadingRandom(false);
        }
    }, []);

    // LATEST: Fetch terbaru for Latest Updates section
    // GET /comic/terbaru - latest updates
    const fetchLatest = useCallback(async () => {
        setLoadingLatest(true);
        try {
            const res = await fetch(`${API_BASE}/terbaru`);
            if (!res.ok) throw new Error(`Latest fetch failed: ${res.status}`);
            const data = await res.json();

            const comics = data.comics || data.data || [];

            if (process.env.NODE_ENV === "development") {
                console.log(`[Manhwa] /terbaru → count: ${comics.length}`);
            }

            const processed = comics.map((c: any) => processComicSafe({ ...c, source: "Latest" })).filter(Boolean) as Comic[];
            setLatestPool(safeFilterComics(processed));
            setError(null);
        } catch (err) {
            console.error("Error fetching latest:", err);
            // Don't set error for latest - it's not critical
        } finally {
            setLoadingLatest(false);
        }
    }, []);

    // Initial fetch on mount - homepage + random + latest
    useEffect(() => {
        fetchHomepage();
        fetchRandom();
        fetchLatest();
    }, [fetchHomepage, fetchRandom, fetchLatest]);

    // Retry all function
    const retryAll = useCallback(() => {
        fetchHomepage();
        fetchRandom();
        fetchLatest();
    }, [fetchHomepage, fetchRandom, fetchLatest]);

    // Loading state flag
    const loadingAll = loadingHomepage || loadingRandom || loadingLatest;

    // Master pool: homepage > random > latest (for fallback)
    const masterPool = useMemo(() => {
        // Priority: homepage data first, then random, then latest
        return uniqBySlug([...homepagePool, ...randomPool, ...latestPool]);
    }, [homepagePool, randomPool, latestPool]);

    // Shuffled fallback pool for stable random selection
    const fallbackPool = useMemo(() => seededShuffle(masterPool, dateSeed), [masterPool, dateSeed]);



    // Build deduped sections - FEATURED and TRENDING allocated FIRST to guarantee content
    // Priority: homepage data > random fallback > latest
    const { heroComic, heroMore, popularPicks, latestFeed } = useMemo(() => {
        const used = new Set<string>();

        // Source priority: homepage > random > fallbackPool
        const primarySource = homepagePool.length > 0 ? homepagePool : randomPool;
        const source = primarySource.length > 0 ? primarySource : fallbackPool;

        // (1) FEATURED - allocate FIRST (priority)
        let hero = takeUnique(source, used, 1);
        let heroSmall = takeUnique(source, used, 6);
        // Fill hero secondary if needed from fallback
        heroSmall = fillUnique(heroSmall, used, 6, fallbackPool);

        // (2) POPULAR PICKS / TRENDING - allocate SECOND
        const popularTarget = isDesktop ? 36 : 16;
        let popular = takeUnique(source, used, popularTarget);
        // Fill from fallback if source didn't have enough
        popular = fillUnique(popular, used, popularTarget, fallbackPool, latestPool);

        // (3) LATEST - allocate LAST (can be empty if no data)
        let latest = takeUnique(latestPool, used, visibleLatestCount);
        // Fill from remaining fallback if needed
        latest = fillUnique(latest, used, visibleLatestCount, fallbackPool);

        return {
            heroComic: hero[0] || null,
            heroMore: heroSmall,
            popularPicks: popular,
            latestFeed: latest,
        };
    }, [homepagePool, randomPool, latestPool, fallbackPool, visibleLatestCount, isDesktop]);

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
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();
            const processed = (data.data || []).map((c: any) => ({
                title: c.title || "Unknown",
                image: c.thumbnail || "/placeholder-comic.png",
                chapter: c.description || "Latest Chapter",
                slug: createSlug(c.title || ""),
                processedLink: c.href || "",
                type: c.type,
                genre: c.genre,
            }));
            setSearchResults(processed);
        } catch (err) {
            console.error("Search error:", err);
            setSearchResults([]);
        } finally {
            setLoadingSearch(false);
        }
    }, [searchQuery]);

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setIsSearchMode(false);
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(handleSearch, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    const clearSearch = () => {
        setSearchQuery("");
        setIsSearchMode(false);
        setSearchResults([]);
    };

    const handleClearHistory = () => {
        clearHistory();
        setReadingHistory([]);
    };

    const handleRemoveFromHistory = (slug: string) => {
        removeFromHistory(slug);
        setReadingHistory(prev => prev.filter(e => e.slug !== slug));
    };

    const handleLoadMore = () => setVisibleLatestCount(prev => prev + 24);

    const scrollToSection = (ref: React.RefObject<HTMLElement | HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

            {/* Sticky Top App Bar */}
            <nav className={styles.appBar} ref={topRef} id="top">
                <div className={styles.appBarLeft}>
                    <BookOpen size={20} className={styles.appBarIcon} />
                    <div className={styles.appBarTitle}>
                        <span>Manhwa</span>
                        <span className={styles.appBarSubtitle}>reading corner</span>
                    </div>
                </div>

                <div className={styles.appBarSearch}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search manhwa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                    {searchQuery && (
                        <button onClick={clearSearch} className={styles.searchClear} aria-label="Clear search">
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className={styles.appBarActions}>
                    <Link href="/manhwa/all" className={styles.appBarBtn} aria-label="Library">
                        <Library size={20} />
                    </Link>
                    <button onClick={() => setIsSidebarOpen(true)} className={styles.appBarBtn} aria-label="Menu">
                        <LayoutGrid size={20} />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className={styles.pageContent}>
                {error && <div className={styles.errorBanner}><span>{error}</span></div>}

                {isSearchMode ? (
                    <section className={styles.section}>
                        <SectionHeader
                            title={`Results for "${searchQuery}"`}
                            icon={Search}
                            action={<button onClick={clearSearch} className={styles.clearBtn}><X size={14} />Clear</button>}
                        />
                        {loadingSearch ? (
                            <SkeletonGrid count={12} />
                        ) : searchResults.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Search size={40} />
                                <p>No results for "{searchQuery}"</p>
                                <span>Try a different search term</span>
                            </div>
                        ) : (
                            <div className={styles.manhwaGrid}>
                                {searchResults.map((c, i) => (
                                    <ManhwaCard key={`${c.slug}-${i}`} comic={c} priority={i < 4} />
                                ))}
                            </div>
                        )}
                    </section>
                ) : (
                    <>
                        {/* Continue Reading */}
                        {readingHistory.length > 0 && (
                            <section className={styles.section}>
                                <SectionHeader
                                    title="Continue Reading"
                                    icon={History}
                                    action={
                                        <button onClick={handleClearHistory} className={styles.clearBtn} aria-label="Clear history">
                                            <Trash2 size={14} />Clear
                                        </button>
                                    }
                                />
                                <div className={styles.historyCarousel}>
                                    {readingHistory.slice(0, 10).map(entry => (
                                        <HistoryCard key={entry.slug} entry={entry} onRemove={handleRemoveFromHistory} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Featured / Recommended - NEVER shows error state */}
                        <section className={styles.section} ref={featuredRef} id="featured">
                            <SectionHeader title={homepageFailed ? "Recommended" : "Featured"} icon={Sparkles} />
                            {loadingAll ? (
                                <div className={styles.featuredGrid}>
                                    <div className={styles.skeletonFeatured} />
                                    <div className={styles.featuredSmallGrid}>
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className={styles.skeletonCarouselCard}><div className={styles.skeletonPoster} /></div>
                                        ))}
                                    </div>
                                </div>
                            ) : heroComic ? (
                                <div className={styles.featuredGrid}>
                                    <FeaturedCard comic={heroComic} />
                                    <div className={styles.featuredSmallGrid}>
                                        {heroMore.map((c, i) => <CarouselCard key={`${c.slug}-${i}`} comic={c} />)}
                                    </div>
                                </div>
                            ) : (
                                /* Extreme fallback: show skeleton if no data at all (rare edge case) */
                                <div className={styles.featuredGrid}>
                                    <div className={styles.skeletonFeatured} />
                                    <div className={styles.featuredSmallGrid}>
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className={styles.skeletonCarouselCard}><div className={styles.skeletonPoster} /></div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Popular Picks / Trending - NEVER shows error state */}
                        <section className={styles.section} ref={trendingRef} id="trending">
                            <SectionHeader
                                title={homepageFailed ? "Popular Picks" : "Trending Now"}
                                icon={TrendingUp}
                                action={<Link href="/manhwa/all" className={styles.viewAllLink}>View All<ChevronRight size={16} /></Link>}
                            />
                            {loadingAll ? (
                                <SkeletonCarousel count={8} />
                            ) : popularPicks.length > 0 ? (
                                <>
                                    {/* Desktop: Grid layout */}
                                    <div className={styles.popularGrid}>
                                        {popularPicks.map((c, i) => (
                                            <ManhwaCard key={`pop-${c.slug}-${i}`} comic={c} showBadge={!homepageFailed ? "trending" : undefined} />
                                        ))}
                                    </div>
                                    {/* Mobile: Carousel layout */}
                                    <div className={styles.mobileOnly}>
                                        <div className={styles.carousel}>
                                            {popularPicks.slice(0, 16).map((c, i) => (
                                                <CarouselCard key={`popc-${c.slug}-${i}`} comic={c} showBadge={!homepageFailed} />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Extreme fallback: show skeleton if no data at all (rare edge case) */
                                <SkeletonCarousel count={8} />
                            )}
                        </section>

                        {/* Latest Updates - NEVER shows error if any data exists */}
                        <section className={styles.section} ref={latestRef} id="latest">
                            <SectionHeader
                                title="Latest Updates"
                                icon={Clock}
                                action={<Link href="/manhwa/all" className={styles.viewAllLink}>View All<ChevronRight size={16} /></Link>}
                            />
                            {loadingAll ? (
                                <SkeletonGrid count={24} />
                            ) : latestFeed.length > 0 ? (
                                <>
                                    <div className={styles.manhwaGrid}>
                                        {latestFeed.map((c, i) => (
                                            <ManhwaCard key={`${c.slug}-${i}`} comic={c} priority={i < 6} />
                                        ))}
                                    </div>
                                    {visibleLatestCount < latestPool.length && (
                                        <div className={styles.loadMoreContainer}>
                                            <button onClick={handleLoadMore} className={styles.loadMoreBtn}>
                                                Load More ({latestPool.length - visibleLatestCount} remaining)
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Extreme fallback: show skeleton grid if absolutely no data (rare edge case) */
                                <SkeletonGrid count={12} />
                            )}
                        </section>
                    </>
                )}
            </div>

            {/* Mobile Bottom Navigation - Use div to avoid global nav styling */}
            <div className={styles.bottomNav} role="navigation" aria-label="Manhwa navigation">
                <button
                    onClick={() => scrollToSection(topRef)}
                    className={`${styles.bottomNavBtn} ${activeSection === "home" ? styles.active : ""}`}
                    aria-label="Home"
                >
                    <Home size={22} />
                    <span>Home</span>
                </button>
                <button
                    onClick={() => scrollToSection(featuredRef)}
                    className={`${styles.bottomNavBtn} ${activeSection === "featured" ? styles.active : ""}`}
                    aria-label="Featured"
                >
                    <Sparkles size={22} />
                    <span>Featured</span>
                </button>
                <button
                    onClick={() => scrollToSection(trendingRef)}
                    className={`${styles.bottomNavBtn} ${activeSection === "trending" ? styles.active : ""}`}
                    aria-label="Trending"
                >
                    <TrendingUp size={22} />
                    <span>Trending</span>
                </button>
                <button
                    onClick={() => scrollToSection(latestRef)}
                    className={`${styles.bottomNavBtn} ${activeSection === "latest" ? styles.active : ""}`}
                    aria-label="Latest"
                >
                    <Clock size={22} />
                    <span>Latest</span>
                </button>
                <Link href="/manhwa/all" className={styles.bottomNavBtn}>
                    <Library size={22} />
                    <span>Library</span>
                </Link>
            </div>
        </main>
    );
}
