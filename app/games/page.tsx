"use client";

import { useState } from "react";
import Link from "next/link";
import { Gamepad2, ArrowLeft, LayoutGrid, Play, Grid3X3, Sparkles } from "lucide-react";
import { FloatingSidebar } from "@/components/floating-sidebar";
import styles from "./games.module.css";

// ============================================
// GAMES DATA
// Easily scalable - add new games here
// ============================================

interface Game {
    slug: string;
    title: string;
    description: string;
    icon: React.ElementType;
    tags: string[];
    hint: string; // casual play hint
}

const GAMES: Game[] = [
    {
        slug: "2048",
        title: "2048",
        description: "slide tiles, get big numbers. nothing complicated.",
        icon: Grid3X3,
        tags: ["puzzle", "chill"],
        hint: "tap to play",
    },
    // Add more games here as needed
];

// ============================================
// FLOATING GAMEPAD DECORATION
// ============================================

function FloatingDecor() {
    return (
        <div className={styles.decorContainer}>
            <Gamepad2 className={`${styles.decorIcon} ${styles.decorOne}`} />
            <Sparkles className={`${styles.decorIcon} ${styles.decorTwo}`} />
            <div className={`${styles.decorDot} ${styles.dotOne}`} />
            <div className={`${styles.decorDot} ${styles.dotTwo}`} />
            <div className={`${styles.decorDot} ${styles.dotThree}`} />
        </div>
    );
}

// ============================================
// GAME CARD COMPONENT
// ============================================

function GameCard({ game, index }: { game: Game; index: number }) {
    const Icon = game.icon;

    return (
        <Link
            href={`/games/${game.slug}`}
            className={styles.gameCard}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className={styles.cardCover}>
                <div className={styles.cardIconWrapper}>
                    <Icon size={48} className={styles.cardIcon} />
                </div>
                <div className={styles.playIndicator}>
                    <Play size={14} />
                </div>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{game.title}</h3>
                    <span className={styles.cardHint}>{game.hint}</span>
                </div>
                <p className={styles.cardDescription}>{game.description}</p>
                <div className={styles.cardMeta}>
                    {game.tags.map((tag) => (
                        <span key={tag} className={styles.cardTag}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function GamesPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <main className={styles.gamesPage}>
            <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* NAVBAR */}
            <nav className={styles.navbar}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.backButton}>
                        <ArrowLeft size={18} />
                        <span>back</span>
                    </Link>
                    <div className={styles.navDivider} />
                    <div className={styles.navBrand}>
                        <Gamepad2 size={18} className={styles.navIcon} />
                        <span>games</span>
                    </div>
                </div>

                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={styles.menuButton}
                    aria-label="Open Menu"
                >
                    <LayoutGrid size={22} />
                </button>
            </nav>

            {/* CONTENT */}
            <div className={styles.container}>
                {/* Floating decorations */}
                <FloatingDecor />

                {/* Hero Section */}
                <header className={styles.hero}>
                    <div className={styles.heroEmoji}>🎮</div>
                    <h1 className={styles.heroTitle}>
                        play corner
                    </h1>
                    <p className={styles.heroSubtitle}>
                        just some games for when you're bored.<br />
                        nothing serious.
                    </p>
                </header>

                {/* Games Section */}
                <section className={styles.gamesSection}>
                    <div className={styles.sectionLabel}>
                        <span className={styles.labelDot} />
                        available now
                    </div>

                    {GAMES.length > 0 ? (
                        <div className={styles.gamesGrid}>
                            {GAMES.map((game, i) => (
                                <GameCard key={game.slug} game={game} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Gamepad2 size={48} className={styles.emptyIcon} />
                            <p>no games yet. check back later?</p>
                        </div>
                    )}
                </section>

                {/* Coming Soon Teaser */}
                <section className={styles.comingSoon}>
                    <div className={styles.comingSoonCard}>
                        <Sparkles size={20} className={styles.comingSoonIcon} />
                        <div className={styles.comingSoonText}>
                            <span className={styles.comingSoonTitle}>more coming</span>
                            <span className={styles.comingSoonHint}>when i feel like it</span>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className={styles.footer}>
                    <span>built for fun, not for profit</span>
                </footer>
            </div>
        </main>
    );
}
