/* app/links/page.tsx */
"use client";

import { useState, useEffect } from "react";
import { Facebook, Youtube, Heart, Wrench, Tv, Mail, ExternalLink } from "lucide-react";
import styles from "./links.module.css";

// ============================================
// LINK DATA CONFIGURATION
// ============================================
interface LinkItem {
    title: string;
    url: string;
    icon: React.ElementType;
    external: boolean;
    highlight?: boolean;
}

interface LinkCategory {
    category: string;
    items: LinkItem[];
}

const LINKS_DATA = {
    profile: {
        name: "Jiya World",
        tagline: "I build stuff, break things, and fix them with code. Sometimes useful, sometimes just fun.",
        avatar: "/avatar.png",
    },
    links: [
        {
            category: "Social",
            items: [
                {
                    title: "Facebook",
                    url: "https://www.facebook.com/shallwelife",
                    icon: Facebook,
                    external: true,
                },
                {
                    title: "YouTube",
                    url: "https://www.youtube.com/@ArRize",
                    icon: Youtube,
                    external: true,
                },
                {
                    title: "Contact",
                    url: "/contact",
                    icon: Mail,
                    external: false,
                },
            ],
        },
        {
            category: "Support",
            items: [
                {
                    title: "Support My Work",
                    url: "https://www.tako.id/argazyu",
                    icon: Heart,
                    external: true,
                    highlight: true,
                },
            ],
        },
        {
            category: "Tools",
            items: [
                {
                    title: "Study AI",
                    url: "/tools/study-ai",
                    icon: Wrench,
                    external: false,
                },
                {
                    title: "Translate AI",
                    url: "/tools/translate-ai",
                    icon: Wrench,
                    external: false,
                },
            ],
        },
        {
            category: "Projects",
            items: [
                {
                    title: "Anime Streaming",
                    url: "/anime",
                    icon: Tv,
                    external: false,
                },
            ],
        },
    ],
};

export default function LinksPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <main className={styles.container}>
            <div className={styles.wrapper}>
                {/* Profile Section */}
                <div className={styles.profile}>
                    <div className={styles.avatarWrapper}>
                        <img
                            src={LINKS_DATA.profile.avatar}
                            alt={LINKS_DATA.profile.name}
                            className={styles.avatar}
                        />
                    </div>
                    <h1 className={styles.name}>{LINKS_DATA.profile.name}</h1>
                    <p className={styles.tagline}>{LINKS_DATA.profile.tagline}</p>
                </div>

                {/* Links Section */}
                <div className={styles.linksContainer}>
                    {LINKS_DATA.links.map((section, sectionIdx) => (
                        <div key={sectionIdx} className={styles.linkSection}>
                            <h2 className={styles.categoryTitle}>{section.category}</h2>
                            <div className={styles.linkList}>
                                {section.items.map((link, linkIdx) => {
                                    const Icon = link.icon;
                                    const isHighlight = 'highlight' in link && link.highlight;
                                    return (
                                        <a
                                            key={linkIdx}
                                            href={link.url}
                                            target={link.external ? "_blank" : "_self"}
                                            rel={link.external ? "noopener noreferrer" : undefined}
                                            className={`${styles.linkCard} ${isHighlight ? styles.linkCardHighlight : ""
                                                } ${mounted ? styles.linkCardMounted : ""}`}
                                            style={{
                                                animationDelay: `${(sectionIdx * section.items.length + linkIdx) * 50}ms`,
                                            }}
                                        >
                                            <div className={styles.linkContent}>
                                                <div className={styles.linkIcon}>
                                                    <Icon size={20} />
                                                </div>
                                                <span className={styles.linkTitle}>{link.title}</span>
                                            </div>
                                            {link.external && (
                                                <ExternalLink size={16} className={styles.externalIcon} />
                                            )}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <footer className={styles.footer}>
                    <p className={styles.footerText}>
                        © {new Date().getFullYear()} Jiya World
                    </p>
                </footer>
            </div>
        </main>
    );
}
