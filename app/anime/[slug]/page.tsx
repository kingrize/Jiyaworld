import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    Play,
    Download,
    Calendar,
    Clock,
    Building2,
    Users,
    Star,
    Info,
    Tv,
    Tag,
    Bookmark,
    Share2,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import styles from "./detail.module.css";

// ============================================================
// API Configuration
// ============================================================
const API_URL = process.env.NEXT_PUBLIC_ANIME_API_URL || "https://www.sankavollerei.com/anime/animasu";

// ============================================================
// Data Fetching
// ============================================================
async function getAnimeDetail(slug: string) {
    try {
        const response = await fetch(`${API_URL}/detail/${slug}`, {
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            console.error(`Failed to fetch anime detail: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data.detail;
    } catch (error) {
        console.error("Error fetching anime detail:", error);
        return null;
    }
}

// ============================================================
// Metadata Generation
// ============================================================
export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params;
    const anime = await getAnimeDetail(slug);

    if (!anime) {
        return {
            title: "Anime Not Found | Jiyaworld",
        };
    }

    return {
        title: `${anime.title} | Anime - Jiyaworld`,
        description: anime.synopsis?.substring(0, 160) || `Watch ${anime.title} on Jiyaworld`,
        openGraph: {
            title: anime.title,
            description: anime.synopsis?.substring(0, 160),
            images: anime.poster ? [anime.poster] : undefined,
        },
    };
}

// ============================================================
// Info Item Component
// ============================================================
function InfoItem({
    icon: Icon,
    label,
    value
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
                <Icon size={16} />
            </div>
            <div className={styles.infoContent}>
                <span className={styles.infoLabel}>{label}</span>
                <span className={styles.infoValue}>{value}</span>
            </div>
        </div>
    );
}

// ============================================================
// Page Component
// ============================================================
export default async function AnimeDetailPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const anime = await getAnimeDetail(slug);

    if (!anime) {
        notFound();
    }

    // Extract info with fallbacks
    const duration = anime.duration || "Unknown";
    const producer = anime.author || "Unknown";
    const season = anime.season || "Unknown";
    const releaseDate = anime.aired || "Unknown";
    const studio = anime.studio || "Unknown";
    const japaneseTitle = anime.synonym || null;
    const status = anime.status || "Unknown";
    const score = anime.score || null;
    const totalEpisodes = anime.episodes?.length || 0;

    // Build query params for watch history
    const historyParams = new URLSearchParams({
        slug: slug,
        title: anime.title,
        image: anime.poster,
    }).toString();

    // First episode for "Watch Now" button
    const firstEpisode = anime.episodes?.[0];

    return (
        <main className={styles.detailPage}>
            {/* Background Effect */}
            <div className={styles.backgroundWrapper}>
                <div
                    className={styles.backgroundImage}
                    style={{ backgroundImage: `url(${anime.poster})` }}
                />
                <div className={styles.backgroundOverlay} />
            </div>

            {/* Navigation */}
            <nav className={styles.navbar}>
                <Link href="/anime" className={styles.backBtn}>
                    <ArrowLeft size={18} />
                    <span>Back to Anime</span>
                </Link>
            </nav>

            {/* Main Content */}
            <div className={styles.contentWrapper}>
                {/* Hero Section */}
                <section className={styles.heroSection}>
                    {/* Poster */}
                    <div className={styles.posterColumn}>
                        <div className={styles.posterWrapper}>
                            <Image
                                src={anime.poster}
                                alt={anime.title}
                                width={280}
                                height={420}
                                priority
                                className={styles.posterImage}
                            />
                            {score && (
                                <div className={styles.scoreBadge}>
                                    <Star size={14} />
                                    <span>{score}</span>
                                </div>
                            )}
                        </div>

                        {/* Mobile Actions */}
                        <div className={styles.mobileActions}>
                            {firstEpisode && (
                                <Link
                                    href={`/anime/watch/${firstEpisode.slug}?${historyParams}`}
                                    className={styles.watchBtnPrimary}
                                >
                                    <Play size={18} />
                                    Watch Now
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Info Column */}
                    <div className={styles.infoColumn}>
                        {/* Title Section */}
                        <div className={styles.titleSection}>
                            <div className={styles.statusChip} data-status={status.toLowerCase()}>
                                {status}
                            </div>
                            <h1 className={styles.title}>{anime.title}</h1>
                            {japaneseTitle && (
                                <p className={styles.altTitle}>{japaneseTitle}</p>
                            )}
                        </div>

                        {/* Quick Meta */}
                        <div className={styles.quickMeta}>
                            {anime.type && (
                                <span className={styles.metaChip}>
                                    <Tv size={14} />
                                    {anime.type}
                                </span>
                            )}
                            <span className={styles.metaChip}>
                                <Clock size={14} />
                                {duration}
                            </span>
                            <span className={styles.metaChip}>
                                <Play size={14} />
                                {totalEpisodes} Episodes
                            </span>
                        </div>

                        {/* Genres */}
                        {anime.genres && anime.genres.length > 0 && (
                            <div className={styles.genresSection}>
                                <div className={styles.genresList}>
                                    {anime.genres.map((genre: { name: string; slug: string }) => (
                                        <span key={genre.slug} className={styles.genreTag}>
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Desktop Actions */}
                        <div className={styles.desktopActions}>
                            {firstEpisode && (
                                <Link
                                    href={`/anime/watch/${firstEpisode.slug}?${historyParams}`}
                                    className={styles.watchBtnPrimary}
                                >
                                    <Play size={18} />
                                    Watch Now
                                </Link>
                            )}
                            {anime.batch?.slug && (
                                <Link
                                    href={`/anime/download/${anime.batch.slug}`}
                                    className={styles.actionBtnSecondary}
                                >
                                    <Download size={18} />
                                    Batch Download
                                </Link>
                            )}
                        </div>

                        {/* Synopsis */}
                        <div className={styles.synopsisSection}>
                            <h2 className={styles.sectionLabel}>
                                <Sparkles size={16} />
                                Synopsis
                            </h2>
                            <p className={styles.synopsisText}>
                                {anime.synopsis || "No synopsis available for this anime."}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Information Grid */}
                <section className={styles.infoSection}>
                    <h2 className={styles.sectionTitle}>
                        <Info size={18} />
                        Information
                    </h2>
                    <div className={styles.infoGrid}>
                        <InfoItem icon={Building2} label="Studio" value={studio} />
                        <InfoItem icon={Calendar} label="Aired" value={releaseDate} />
                        <InfoItem icon={Clock} label="Duration" value={duration} />
                        <InfoItem icon={Tag} label="Season" value={season} />
                        <InfoItem icon={Users} label="Producer" value={producer} />
                        <InfoItem icon={Tv} label="Status" value={status} />
                    </div>
                </section>

                {/* Episodes Section */}
                <section className={styles.episodesSection}>
                    <div className={styles.episodesHeader}>
                        <h2 className={styles.sectionTitle}>
                            <Play size={18} />
                            Episodes
                        </h2>
                        <span className={styles.episodeCount}>
                            {totalEpisodes} {totalEpisodes === 1 ? 'Episode' : 'Episodes'}
                        </span>
                    </div>

                    {anime.episodes && anime.episodes.length > 0 ? (
                        <div className={styles.episodeGrid}>
                            {anime.episodes.map((episode: { slug: string; name: string }, index: number) => {
                                const epNumber = episode.name.split(" ")[1] || (index + 1).toString();
                                return (
                                    <Link
                                        key={episode.slug}
                                        href={`/anime/watch/${episode.slug}?${historyParams}`}
                                        className={styles.episodeCard}
                                    >
                                        <div className={styles.episodeNumber}>
                                            <span>{epNumber}</span>
                                        </div>
                                        <div className={styles.episodeInfo}>
                                            <span className={styles.episodeName}>{episode.name}</span>
                                            <span className={styles.episodeDuration}>{duration}</span>
                                        </div>
                                        <ChevronRight size={16} className={styles.episodeArrow} />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.noEpisodes}>
                            <Tv size={32} />
                            <p>No episodes available yet. Check back later!</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
