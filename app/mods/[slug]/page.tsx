/* app/mods/[slug]/page.tsx */
"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
    FileCode2,
    Package,
    Download,
    Clock,
    Tag,
    AlertTriangle,
    CheckCircle2,
    FlaskConical,
    ArrowLeft,
    Copy,
    Check,
    AlertCircle,
    History,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useMod } from "@/hooks/useMods";
import {
    ModPost,
    ModVersion,
    ModFeature,
    ModType,
    ModStatus,
    getLatestVersion,
    formatDate
} from "@/lib/mods/types";

// Status badge component
const StatusBadge = ({ status }: { status: ModStatus }) => {
    const config = {
        stable: {
            icon: CheckCircle2,
            label: "Stable",
            className: "repo-badge--stable",
        },
        beta: { icon: FlaskConical, label: "Beta", className: "repo-badge--beta" },
        experimental: {
            icon: AlertTriangle,
            label: "Experimental",
            className: "repo-badge--experimental",
        },
    };

    const { icon: Icon, label, className } = config[status];

    return (
        <span className={`repo-badge ${className}`}>
            <Icon size={12} />
            <span>{label}</span>
        </span>
    );
};

// Type badge component
const TypeBadge = ({ type }: { type: ModType }) => {
    const config = {
        script: { icon: FileCode2, label: "Script" },
        mod: { icon: Package, label: "Mod APK" },
    };

    const { icon: Icon, label } = config[type];

    return (
        <span className="repo-type-badge">
            <Icon size={12} />
            <span>{label}</span>
        </span>
    );
};

// Feature list with risk indicators
const FeatureList = ({ features }: { features: ModFeature[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const riskyFeatures = features.filter(f => f.risk && f.risk !== "none");
    const safeFeatures = features.filter(f => !f.risk || f.risk === "none");

    const SAFE_PREVIEW_COUNT = 3;
    const previewSafeFeatures = safeFeatures.slice(0, SAFE_PREVIEW_COUNT);
    const hiddenSafeCount = safeFeatures.length - SAFE_PREVIEW_COUNT;
    const totalCount = features.length;

    const shouldCollapse = hiddenSafeCount > 0;
    const visibleFeatures = isExpanded || !shouldCollapse
        ? features
        : [...riskyFeatures, ...previewSafeFeatures];

    const sortedVisibleFeatures = visibleFeatures.sort((a, b) => {
        return features.indexOf(a) - features.indexOf(b);
    });

    return (
        <div className="features-container">
            <ul className="repo-list">
                {sortedVisibleFeatures.map((feature, idx) => {
                    const isRisky = feature.risk && feature.risk !== "none";

                    return (
                        <li key={idx} className={`repo-list-item ${isRisky ? "repo-list-item--risky" : ""}`}>
                            <span className="repo-list-bullet">{isRisky ? "⚠" : "•"}</span>
                            <span>{feature.text}</span>
                            {isRisky && feature.riskNote && (
                                <span className="repo-risk-note"> — {feature.riskNote}</span>
                            )}
                        </li>
                    );
                })}
            </ul>

            {shouldCollapse && (
                <button
                    className="repo-expand-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                    type="button"
                >
                    {isExpanded
                        ? "Show fewer features"
                        : `Show all features (${totalCount})`
                    }
                </button>
            )}
        </div>
    );
};

// Version history component
const VersionHistory = ({ versions }: { versions: ModVersion[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (versions.length <= 1) return null;

    const olderVersions = versions.filter(v => !v.isLatest);

    return (
        <div className="repo-version-history">
            <button
                type="button"
                className="repo-version-toggle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <History size={14} />
                <span>View {olderVersions.length} previous release{olderVersions.length > 1 ? "s" : ""}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isExpanded && (
                <div className="repo-version-list">
                    {olderVersions.map((version, idx) => (
                        <div key={idx} className="repo-version-item">
                            <div className="repo-version-info">
                                <code className="repo-version-number">v{version.version}</code>
                                <StatusBadge status={version.status} />
                                <span className="repo-version-date">{formatDate(version.createdAt)}</span>
                                <span className="repo-version-size">{version.fileSize}</span>
                            </div>
                            {version.changelog && version.changelog.length > 0 && (
                                <ul className="repo-version-changelog">
                                    {version.changelog.map((entry, i) => (
                                        <li key={i}>— {entry}</li>
                                    ))}
                                </ul>
                            )}
                            <Link href={`/d/${version.downloadSlug}`} className="repo-version-download">
                                <Download size={12} />
                                <span>Download v{version.version}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Detail view component
function ModDetailView({ mod }: { mod: ModPost }) {
    const [copied, setCopied] = useState(false);
    const latestVersion = getLatestVersion(mod);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {/* Breadcrumb */}
            <Link href="/mods" className="repo-back-btn">
                <ArrowLeft size={16} />
                <span>Back to list</span>
            </Link>

            {/* Detail Header */}
            <div className="repo-detail-header">
                <div className="repo-detail-title-row">
                    <TypeBadge type={mod.type} />
                    <h1 className="repo-detail-title">{mod.name}</h1>
                </div>
                <div className="repo-detail-meta">
                    <span className="repo-meta-item">
                        <Tag size={14} />
                        <span>{mod.game}</span>
                    </span>
                    <span className="repo-meta-item">
                        <Clock size={14} />
                        <span>Updated {formatDate(mod.updatedAt)}</span>
                    </span>
                    <StatusBadge status={mod.status} />
                </div>
            </div>

            <div className="repo-divider" />

            {/* Description */}
            <section className="repo-section">
                <h2 className="repo-section-title">README</h2>
                <p className="repo-description">{mod.description}</p>
            </section>

            {/* Version & Compatibility */}
            {latestVersion && (
                <section className="repo-section">
                    <div className="repo-info-grid">
                        <div className="repo-info-item">
                            <span className="repo-info-label">Version</span>
                            <code className="repo-info-value">v{latestVersion.version}</code>
                        </div>
                        <div className="repo-info-item">
                            <span className="repo-info-label">Size</span>
                            <code className="repo-info-value">{latestVersion.fileSize}</code>
                        </div>
                        <div className="repo-info-item">
                            <span className="repo-info-label">Status</span>
                            <code className="repo-info-value">{latestVersion.status}</code>
                        </div>
                    </div>
                </section>
            )}

            <div className="repo-divider" />

            {/* Features */}
            {mod.features && mod.features.length > 0 && (
                <>
                    <section className="repo-section">
                        <h2 className="repo-section-title">Features</h2>
                        <FeatureList features={mod.features} />
                    </section>
                    <div className="repo-divider" />
                </>
            )}

            {/* Requirements */}
            {mod.requirements && mod.requirements.length > 0 && (
                <>
                    <section className="repo-section">
                        <h2 className="repo-section-title">Requirements</h2>
                        <ul className="repo-list">
                            {mod.requirements.map((req, idx) => (
                                <li key={idx} className="repo-list-item">
                                    <span className="repo-list-bullet">-</span>
                                    <span>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                    <div className="repo-divider" />
                </>
            )}

            {/* Installation */}
            {mod.installationSteps && mod.installationSteps.length > 0 && (
                <>
                    <section className="repo-section">
                        <h2 className="repo-section-title">Installation</h2>
                        <ol className="repo-ordered-list">
                            {mod.installationSteps.map((step, idx) => (
                                <li key={idx} className="repo-ordered-item">
                                    <span className="repo-step-number">{idx + 1}.</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </section>
                    <div className="repo-divider" />
                </>
            )}

            {/* Warnings */}
            {mod.warnings && mod.warnings.length > 0 && (
                <>
                    <section className="repo-section">
                        <h2 className="repo-section-title repo-section-title--warning">
                            <AlertTriangle size={16} />
                            <span>Warnings</span>
                        </h2>
                        <div className="repo-warning-box">
                            <ul className="repo-list">
                                {mod.warnings.map((warning, idx) => (
                                    <li key={idx} className="repo-list-item repo-list-item--warning">
                                        <span className="repo-list-bullet">⚠</span>
                                        <span>{warning}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                    <div className="repo-divider" />
                </>
            )}

            {/* Download Actions */}
            {latestVersion && (
                <section className="repo-section">
                    <div className="repo-actions">
                        <Link href={`/d/${latestVersion.downloadSlug}`} className="repo-download-btn">
                            <Download size={16} />
                            <span>Download {mod.type === "mod" ? "APK" : "Script"}</span>
                            <span className="repo-download-size">{latestVersion.fileSize}</span>
                        </Link>
                        <button onClick={handleCopyLink} className="repo-copy-btn">
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            <span>{copied ? "Copied!" : "Copy link"}</span>
                        </button>
                    </div>

                    {/* Version history */}
                    <VersionHistory versions={mod.versions} />
                </section>
            )}
        </>
    );
}

// Loading state
function LoadingState() {
    return (
        <main className="repo-page">
            <div className="repo-container">
                <div className="repo-loading">
                    <div className="loading-spinner" />
                    <span>Loading...</span>
                </div>
            </div>
        </main>
    );
}

// Error state
function ErrorState({ message }: { message: string }) {
    return (
        <main className="repo-page">
            <div className="repo-container">
                <Link href="/mods" className="repo-back-btn">
                    <ArrowLeft size={16} />
                    <span>Back to list</span>
                </Link>
                <div className="repo-error">
                    <AlertCircle size={32} />
                    <h2>Mod Not Found</h2>
                    <p>{message}</p>
                </div>
            </div>
        </main>
    );
}

// Page component
export default function ModDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { mod, loading, error } = useMod(slug);

    if (loading) {
        return <LoadingState />;
    }

    if (error || !mod) {
        return <ErrorState message={error || "The requested mod could not be found."} />;
    }

    return (
        <main className="repo-page">
            <div className="repo-container">
                <ModDetailView mod={mod} />
            </div>
        </main>
    );
}
