/* app/d/[slug]/page.tsx */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    FileCode2,
    Package,
    CheckCircle2,
    FlaskConical,
    AlertTriangle,
    Download,
    Shield,
} from "lucide-react";
import { getShortLink, type ShortLink, type Status } from "../shortlinks";

const COUNTDOWN_SECONDS = 5;

// Status config
const statusConfig: Record<Status, { icon: typeof CheckCircle2; label: string; className: string }> = {
    stable: { icon: CheckCircle2, label: "Stable", className: "redirect-status--stable" },
    beta: { icon: FlaskConical, label: "Beta", className: "redirect-status--beta" },
    experimental: { icon: AlertTriangle, label: "Experimental", className: "redirect-status--experimental" },
};

export default function DownloadRedirectPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [link, setLink] = useState<ShortLink | null | undefined>(undefined); // undefined = loading
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [redirected, setRedirected] = useState(false);

    // Load link data (Firestore -> Static Fallback)
    useEffect(() => {
        async function fetchLink() {
            try {
                // 1. Try Firestore
                const docRef = doc(db, "shortlinks", slug);
                const snapshot = await getDoc(docRef);

                if (snapshot.exists()) {
                    setLink(snapshot.data() as ShortLink);
                    return;
                }

                // 2. Fallback to static legacy data
                const staticData = getShortLink(slug);
                setLink(staticData); // might be null
            } catch (err) {
                console.error("Error fetching link:", err);
                const staticData = getShortLink(slug);
                setLink(staticData);
            }
        }

        fetchLink();
    }, [slug]);

    // Countdown timer
    useEffect(() => {
        if (link === null || link === undefined) return;

        if (countdown <= 0 && !redirected) {
            setRedirected(true);
            window.location.href = link.url;
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [link, countdown, redirected]);

    // Progress percentage
    const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;

    // Loading state
    if (link === undefined) {
        return (
            <main className="redirect-page">
                <div className="redirect-container">
                    <p className="redirect-loading">Loading...</p>
                </div>
            </main>
        );
    }

    // Invalid slug
    if (link === null) {
        return (
            <main className="redirect-page">
                <div className="redirect-container">
                    <div className="redirect-error">
                        <AlertTriangle size={24} className="redirect-error-icon" />
                        <h1 className="redirect-error-title">Link not found</h1>
                        <p className="redirect-error-text">
                            The requested download link does not exist or has been removed.
                        </p>
                    </div>
                    <div className="redirect-divider" />
                    <div className="redirect-nav">
                        <Link href="/mods" className="redirect-link">
                            ← Browse all downloads
                        </Link>
                        <Link href="/" className="redirect-link redirect-link--muted">
                            Go to homepage
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // Get status config
    const status = statusConfig[link.status];
    const StatusIcon = status.icon;
    const TypeIcon = link.type === "script" ? FileCode2 : Package;

    // Valid link - show countdown
    return (
        <main className="redirect-page">
            <div className="redirect-container">
                {/* Header */}
                <header className="redirect-header">
                    <div className="redirect-type-badge">
                        <TypeIcon size={14} />
                        <span>{link.type === "script" ? "Script" : "Mod APK"}</span>
                    </div>
                    <h1 className="redirect-title">{link.name}</h1>
                    <p className="redirect-game">{link.game}</p>
                </header>

                <div className="redirect-divider" />

                {/* Metadata */}
                <section className="redirect-meta">
                    <div className="redirect-meta-item">
                        <span className="redirect-meta-label">Version</span>
                        <code className="redirect-meta-value">{link.version}</code>
                    </div>
                    <div className="redirect-meta-item">
                        <span className="redirect-meta-label">Size</span>
                        <code className="redirect-meta-value">{link.size}</code>
                    </div>
                    <div className="redirect-meta-item">
                        <span className="redirect-meta-label">Format</span>
                        <code className="redirect-meta-value">{link.fileType || (link.type === "mod" ? ".apk" : ".zip")}</code>
                    </div>
                    <div className="redirect-meta-item">
                        <span className="redirect-meta-label">Status</span>
                        <span className={`redirect-status ${status.className}`}>
                            <StatusIcon size={12} />
                            <span>{status.label}</span>
                        </span>
                    </div>
                </section>

                <div className="redirect-divider" />

                {/* Progress Section */}
                <section className="redirect-progress-section">
                    <div className="redirect-progress-header">
                        <Download size={16} className="redirect-progress-icon" />
                        <span className="redirect-progress-title">
                            {countdown > 0 ? "Preparing download..." : "Redirecting..."}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="redirect-progress-bar">
                        <div
                            className="redirect-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Step indicator */}
                    <div className="redirect-steps">
                        <div className={`redirect-step ${progress >= 0 ? "active" : ""}`}>
                            <span className="redirect-step-dot" />
                            <span>Verify</span>
                        </div>
                        <div className={`redirect-step ${progress >= 50 ? "active" : ""}`}>
                            <span className="redirect-step-dot" />
                            <span>Prepare</span>
                        </div>
                        <div className={`redirect-step ${progress >= 100 ? "active" : ""}`}>
                            <span className="redirect-step-dot" />
                            <span>Download</span>
                        </div>
                    </div>

                    {/* Countdown text */}
                    <p className="redirect-countdown-text">
                        {countdown > 0 ? (
                            <>
                                Starting in <span className="redirect-countdown">{countdown}</span>{" "}
                                {countdown === 1 ? "second" : "seconds"}
                            </>
                        ) : (
                            "Download starting now..."
                        )}
                    </p>
                </section>

                <div className="redirect-divider" />

                {/* Manual fallback */}
                <section className="redirect-fallback">
                    <p className="redirect-fallback-text">
                        Download not starting?{" "}
                        <a href={link.url} className="redirect-link">
                            Click here to download manually
                        </a>
                    </p>
                </section>

                {/* Disclaimer */}
                <section className="redirect-disclaimer">
                    <Shield size={14} className="redirect-disclaimer-icon" />
                    <p className="redirect-disclaimer-text">
                        This file is provided as-is for educational purposes.
                        Use at your own risk and ensure compliance with applicable terms of service.
                    </p>
                </section>

                <div className="redirect-divider" />

                {/* Navigation */}
                <nav className="redirect-nav">
                    <Link href="/mods" className="redirect-link">
                        ← Back to downloads
                    </Link>
                </nav>
            </div>
        </main>
    );
}
