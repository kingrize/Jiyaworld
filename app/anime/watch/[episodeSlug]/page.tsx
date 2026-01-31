"use client";

import React, { useState, useEffect, useMemo, useCallback, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Play,
    ChevronLeft,
    ChevronRight,
    Tv,
    AlertCircle,
    Loader2,
    Server,
    Home,
    ExternalLink,
    RefreshCw,
    SkipForward,
} from "lucide-react";
import styles from "./watch.module.css";

// ============================================================
// TYPES
// ============================================================
interface StreamServer {
    name: string;
    url: string;
}

interface AnimeInfo {
    slug: string;
    title: string;
    image: string;
}

// ============================================================
// API Configuration
// ============================================================
const API_URL = process.env.NEXT_PUBLIC_ANIME_API_URL || "https://www.sankavollerei.com/anime/animasu";

// ============================================================
// WATCH HISTORY (Local Storage)
// ============================================================
const HISTORY_CACHE_KEY = "jiyaworld-anime-history";

function saveToHistory(animeInfo: AnimeInfo, episodeSlug: string) {
    if (!animeInfo || !episodeSlug) return;

    try {
        const item = {
            id: episodeSlug,
            animeId: animeInfo.slug,
            episodeId: episodeSlug,
            title: animeInfo.title,
            image: animeInfo.image,
            watchedAt: new Date().toISOString(),
        };

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem(HISTORY_CACHE_KEY) || "[]");
            if (!Array.isArray(history)) history = [];
        } catch {
            history = [];
        }

        history = history.filter((h: any) => h.episodeId !== episodeSlug);
        history = [item, ...history].slice(0, 50);

        localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save watch history:", error);
    }
}

// ============================================================
// SKELETON LOADER
// ============================================================
function WatchSkeleton() {
    return (
        <div className={styles.watchPage}>
            <div className={styles.container}>
                <div className={styles.skeletonNav} />
                <div className={styles.skeletonPlayer} />
                <div className={styles.skeletonServers} />
                <div className={styles.skeletonInfo} />
            </div>
        </div>
    );
}

// ============================================================
// ERROR DISPLAY
// ============================================================
function ErrorDisplay({ message }: { message: string }) {
    return (
        <div className={styles.errorPage}>
            <div className={styles.errorContent}>
                <AlertCircle size={48} className={styles.errorIcon} />
                <h1>Error Loading Episode</h1>
                <p>{message}</p>
                <Link href="/anime" className={styles.errorBtn}>
                    <Home size={18} />
                    Back to Anime
                </Link>
            </div>
        </div>
    );
}

// ============================================================
// MAIN WATCH CONTENT
// ============================================================
function WatchContent({ episodeSlug }: { episodeSlug: string }) {
    const searchParams = useSearchParams();

    const [episodeTitle, setEpisodeTitle] = useState<string | null>(null);
    const [servers, setServers] = useState<StreamServer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(null);
    const [activeServer, setActiveServer] = useState<string | null>(null);
    const [isSwitching, setIsSwitching] = useState(false);
    const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null);
    const [isValidPrev, setIsValidPrev] = useState(false);
    const [isValidNext, setIsValidNext] = useState(false);

    const { prevSlug, nextSlug } = useMemo(() => {
        if (!episodeSlug) return { prevSlug: null, nextSlug: null };

        const match = episodeSlug.match(/-episode-(\d+)$/);
        if (!match) return { prevSlug: null, nextSlug: null };

        const baseSlug = episodeSlug.substring(0, match.index);
        const currentEp = parseInt(match[1], 10);

        return {
            prevSlug: currentEp > 1 ? `${baseSlug}-episode-${currentEp - 1}` : null,
            nextSlug: `${baseSlug}-episode-${currentEp + 1}`,
        };
    }, [episodeSlug]);

    useEffect(() => {
        if (!episodeSlug) {
            setError("Invalid episode");
            setIsLoading(false);
            return;
        }

        async function fetchEpisode() {
            setIsLoading(true);
            setError(null);
            setCurrentStreamUrl(null);
            setServers([]);

            try {
                const res = await fetch(`${API_URL}/episode/${episodeSlug}`);
                if (!res.ok) throw new Error(`Failed to load episode (${res.status})`);

                const data = await res.json();

                setEpisodeTitle(data.title);
                setServers(data.streams || []);

                const defaultStream = data.streams?.[0];
                if (defaultStream) {
                    setCurrentStreamUrl(defaultStream.url);
                    setActiveServer(defaultStream.url);
                }

                const slug = searchParams.get("slug");
                const title = searchParams.get("title");
                const image = searchParams.get("image");

                if (slug && title && image) {
                    const info = { slug, title, image };
                    setAnimeInfo(info);
                    sessionStorage.setItem("lastWatchedAnime", JSON.stringify(info));
                } else {
                    const cached = sessionStorage.getItem("lastWatchedAnime");
                    if (cached) {
                        setAnimeInfo(JSON.parse(cached));
                    }
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEpisode();
    }, [episodeSlug, searchParams]);

    useEffect(() => {
        if (animeInfo && episodeSlug) {
            saveToHistory(animeInfo, episodeSlug);
        }
    }, [animeInfo, episodeSlug]);

    useEffect(() => {
        async function checkNavigation() {
            if (prevSlug) {
                try {
                    const res = await fetch(`${API_URL}/episode/${prevSlug}`, { method: "HEAD" });
                    setIsValidPrev(res.ok);
                } catch {
                    setIsValidPrev(false);
                }
            } else {
                setIsValidPrev(false);
            }

            if (nextSlug) {
                try {
                    const res = await fetch(`${API_URL}/episode/${nextSlug}`, { method: "HEAD" });
                    setIsValidNext(res.ok);
                } catch {
                    setIsValidNext(false);
                }
            } else {
                setIsValidNext(false);
            }
        }

        if (prevSlug || nextSlug) {
            checkNavigation();
        }
    }, [prevSlug, nextSlug]);

    const handleServerClick = useCallback((server: StreamServer) => {
        setIsSwitching(true);
        setActiveServer(server.url);
        setCurrentStreamUrl(server.url);
        setTimeout(() => setIsSwitching(false), 300);
    }, []);

    const buildNavUrl = (slug: string) => {
        if (!animeInfo) return `/anime/watch/${slug}`;
        const params = new URLSearchParams({
            slug: animeInfo.slug,
            title: animeInfo.title,
            image: animeInfo.image,
        });
        return `/anime/watch/${slug}?${params.toString()}`;
    };

    if (isLoading) return <WatchSkeleton />;
    if (error) return <ErrorDisplay message={error} />;
    if (servers.length === 0) return <ErrorDisplay message="No streaming servers available" />;

    return (
        <div className={styles.watchPage}>
            <div className={styles.container}>
                {/* Navigation */}
                <nav className={styles.navbar}>
                    <Link
                        href={animeInfo ? `/anime/${animeInfo.slug}` : "/anime"}
                        className={styles.backBtn}
                    >
                        <ArrowLeft size={18} />
                        <span className={styles.backText}>{animeInfo?.title || "Back"}</span>
                    </Link>
                    {animeInfo && (
                        <Link href={`/anime/${animeInfo.slug}`} className={styles.detailLink}>
                            <ExternalLink size={16} />
                        </Link>
                    )}
                </nav>

                {/* Video Player */}
                <div className={styles.playerSection}>
                    <div className={styles.playerWrapper}>
                        {isSwitching ? (
                            <div className={styles.playerLoading}>
                                <RefreshCw size={32} className={styles.spinIcon} />
                                <span>Switching server...</span>
                            </div>
                        ) : currentStreamUrl ? (
                            <iframe
                                src={currentStreamUrl}
                                allowFullScreen
                                className={styles.playerIframe}
                                key={currentStreamUrl}
                            />
                        ) : (
                            <div className={styles.playerError}>
                                <Play size={48} />
                                <span>Select a server to start watching</span>
                            </div>
                        )}
                    </div>

                    {/* Prominent Next Episode Button - appears below player */}
                    {isValidNext && nextSlug && (
                        <div className={styles.nextEpisodePrompt}>
                            <Link href={buildNavUrl(nextSlug)} className={styles.nextEpisodeBtn}>
                                <div className={styles.nextEpisodeContent}>
                                    <span className={styles.nextEpisodeLabel}>Next Episode</span>
                                    <span className={styles.nextEpisodeTitle}>
                                        Continue watching →
                                    </span>
                                </div>
                                <div className={styles.nextEpisodeIcon}>
                                    <SkipForward size={24} />
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Episode Info & Navigation */}
                <div className={styles.episodeHeader}>
                    <div className={styles.episodeTitleWrapper}>
                        <Tv size={20} className={styles.episodeIcon} />
                        <h1 className={styles.episodeTitle}>
                            {episodeTitle || "Loading..."}
                        </h1>
                    </div>
                    <div className={styles.episodeNav}>
                        {isValidPrev && prevSlug && (
                            <Link href={buildNavUrl(prevSlug)} className={styles.navBtn}>
                                <ChevronLeft size={18} />
                                <span>Previous</span>
                            </Link>
                        )}
                        {isValidNext && nextSlug && (
                            <Link href={buildNavUrl(nextSlug)} className={styles.navBtnPrimary}>
                                <span>Next</span>
                                <ChevronRight size={18} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Server Selection */}
                <div className={styles.serverSection}>
                    <div className={styles.serverHeader}>
                        <Server size={18} className={styles.serverIcon} />
                        <h2>Select Server</h2>
                    </div>
                    <p className={styles.serverHint}>
                        If the current server doesn&apos;t work, try switching to another one.
                    </p>
                    <div className={styles.serverGrid}>
                        {servers.map((server, index) => (
                            <button
                                key={server.url}
                                onClick={() => handleServerClick(server)}
                                disabled={isSwitching}
                                className={`${styles.serverBtn} ${activeServer === server.url ? styles.serverActive : ""
                                    }`}
                            >
                                <span className={styles.serverNumber}>{index + 1}</span>
                                <span className={styles.serverName}>{server.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// PAGE COMPONENT
// ============================================================
export default function WatchPage({
    params
}: {
    params: Promise<{ episodeSlug: string }>
}) {
    const resolvedParams = use(params);
    const episodeSlug = resolvedParams.episodeSlug;

    return (
        <React.Suspense fallback={<WatchSkeleton />}>
            <WatchContent episodeSlug={episodeSlug} />
        </React.Suspense>
    );
}
