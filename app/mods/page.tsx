/* app/mods/page.tsx */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    FileCode2,
    Package,
    ChevronRight,
    Download,
    Clock,
    Tag,
    AlertTriangle,
    CheckCircle2,
    FlaskConical,
    ArrowLeft,
    Search,
    Filter,
    Copy,
    Check,
    AlertCircle,
    History,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useMods } from "@/hooks/useMods";
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
                <div className="repo-error">
                    <AlertCircle size={32} />
                    <p>{message}</p>
                </div>
            </div>
        </main>
    );
}

// Empty state
function EmptyState() {
    return (
        <div className="repo-empty">
            <p>No mods available. Check back later.</p>
        </div>
    );
}

// Custom Filter Dropdown
const RepoFilter = ({ value, onChange }: { value: "all" | ModType; onChange: (v: "all" | ModType) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Config
    const options: { value: "all" | ModType; label: string }[] = [
        { value: "all", label: "All types" },
        { value: "script", label: "Scripts" },
        { value: "mod", label: "Mod APKs" },
    ];

    const selectedLabel = options.find(o => o.value === value)?.label;

    return (
        <div className="repo-custom-filter" style={{ position: "relative", minWidth: "180px" }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`repo-custom-filter-trigger ${isOpen ? "open" : ""}`}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Filter size={16} style={{ opacity: 0.5 }} />
                    <span style={{ fontWeight: 500 }}>{selectedLabel}</span>
                </div>
                <ChevronDown size={16} style={{ opacity: 0.5, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {isOpen && (
                <>
                    <div
                        style={{ position: "fixed", inset: 0, zIndex: 40 }}
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="repo-custom-filter-menu">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`repo-custom-filter-item ${value === opt.value ? "active" : ""}`}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .repo-custom-filter-trigger {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-4);
                    background: transparent;
                    border: 1px solid var(--outline);
                    border-radius: var(--radius-md);
                    color: var(--on-surface);
                    font-family: inherit;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    height: 100%;
                }
                .repo-custom-filter-trigger:hover, .repo-custom-filter-trigger.open {
                    border-color: var(--primary);
                    background: var(--surface-container);
                }
                .repo-custom-filter-menu {
                    position: absolute;
                    top: calc(100% + 4px);
                    right: 0;
                    width: 100%;
                    background: var(--surface);
                    border: 1px solid var(--outline-variant);
                    border-radius: var(--radius-md);
                    padding: 4px;
                    z-index: 50;
                    box-shadow: var(--elevation-3);
                    animation: slideDown 0.1s ease-out;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .repo-custom-filter-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 16px;
                    border: none;
                    background: transparent;
                    color: var(--on-surface-variant);
                    text-align: left;
                    font-size: 0.9375rem;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: all 0.1s;
                }
                .repo-custom-filter-item:hover {
                    background: var(--surface-container);
                    color: var(--on-surface);
                }
                .repo-custom-filter-item.active {
                    color: var(--primary);
                    background: var(--primary-container);
                    font-weight: 500;
                    color: var(--on-primary-container);
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default function ModsPage() {
    const { mods, loading, error } = useMods();
    const [selectedItem, setSelectedItem] = useState<ModPost | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"all" | ModType>("all");
    const [copied, setCopied] = useState(false);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    // Filter items
    const filteredItems = mods.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.game.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleCopyLink = () => {
        if (selectedItem) {
            navigator.clipboard.writeText(
                `${window.location.origin}/mods/${selectedItem.slug}`
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Detail view
    if (selectedItem) {
        const latestVersion = getLatestVersion(selectedItem);

        return (
            <main className="repo-page">
                <div className="repo-container">
                    {/* Breadcrumb */}
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="repo-back-btn"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to list</span>
                    </button>

                    {/* Detail Header */}
                    <div className="repo-detail-header">
                        <div className="repo-detail-title-row">
                            <TypeBadge type={selectedItem.type} />
                            <h1 className="repo-detail-title">{selectedItem.name}</h1>
                        </div>
                        <div className="repo-detail-meta">
                            <span className="repo-meta-item">
                                <Tag size={14} />
                                <span>{selectedItem.game}</span>
                            </span>
                            <span className="repo-meta-item">
                                <Clock size={14} />
                                <span>Updated {formatDate(selectedItem.updatedAt)}</span>
                            </span>
                            <StatusBadge status={selectedItem.status} />
                        </div>
                    </div>

                    <div className="repo-divider" />

                    {/* Description */}
                    <section className="repo-section">
                        <h2 className="repo-section-title">README</h2>
                        <p className="repo-description">{selectedItem.description}</p>
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
                    {selectedItem.features && selectedItem.features.length > 0 && (
                        <>
                            <section className="repo-section">
                                <h2 className="repo-section-title">Features</h2>
                                <FeatureList features={selectedItem.features} />
                            </section>
                            <div className="repo-divider" />
                        </>
                    )}

                    {/* Requirements */}
                    {selectedItem.requirements && selectedItem.requirements.length > 0 && (
                        <>
                            <section className="repo-section">
                                <h2 className="repo-section-title">Requirements</h2>
                                <ul className="repo-list">
                                    {selectedItem.requirements.map((req, idx) => (
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
                    {selectedItem.installationSteps && selectedItem.installationSteps.length > 0 && (
                        <>
                            <section className="repo-section">
                                <h2 className="repo-section-title">Installation</h2>
                                <ol className="repo-ordered-list">
                                    {selectedItem.installationSteps.map((step, idx) => (
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
                    {selectedItem.warnings && selectedItem.warnings.length > 0 && (
                        <>
                            <section className="repo-section">
                                <h2 className="repo-section-title repo-section-title--warning">
                                    <AlertTriangle size={16} />
                                    <span>Warnings</span>
                                </h2>
                                <div className="repo-warning-box">
                                    <ul className="repo-list">
                                        {selectedItem.warnings.map((warning, idx) => (
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
                                    <span>Download {selectedItem.type === "mod" ? "APK" : "Script"}</span>
                                    <span className="repo-download-size">{latestVersion.fileSize}</span>
                                </Link>
                                <button onClick={handleCopyLink} className="repo-copy-btn">
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    <span>{copied ? "Copied!" : "Copy link"}</span>
                                </button>
                            </div>

                            {/* Version history */}
                            <VersionHistory versions={selectedItem.versions} />
                        </section>
                    )}
                </div>
            </main>
        );
    }

    // List view
    return (
        <main className="repo-page">
            <div className="repo-container">
                {/* Header */}
                <header className="repo-header">
                    <div className="repo-header-top">
                        <Link href="/" className="repo-back-btn">
                            <ArrowLeft size={16} />
                            <span>Home</span>
                        </Link>
                    </div>
                    <h1 className="repo-title">Game Scripts & Mod APKs</h1>
                    <p className="repo-subtitle">
                        A collection of game modification scripts and modified APKs.
                        Use responsibly and at your own risk.
                    </p>
                </header>

                <div className="repo-divider" />

                {/* Search & Filter */}
                <div className="repo-toolbar">
                    <div className="repo-search">
                        <Search size={16} className="repo-search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or game..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="repo-search-input"
                        />
                    </div>
                    <div className="repo-filter">
                        <RepoFilter value={filterType} onChange={setFilterType} />
                    </div>
                </div>

                {/* Table Header */}
                <div className="repo-table-header">
                    <span className="repo-col repo-col--name">Name</span>
                    <span className="repo-col repo-col--type">Type</span>
                    <span className="repo-col repo-col--version">Version</span>
                    <span className="repo-col repo-col--updated">Last update</span>
                    <span className="repo-col repo-col--status">Status</span>
                </div>

                {/* Table Body */}
                <div className="repo-table-body">
                    {mods.length === 0 ? (
                        <EmptyState />
                    ) : filteredItems.length === 0 ? (
                        <div className="repo-empty">
                            <p>No items found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const latest = getLatestVersion(item);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className="repo-row"
                                >
                                    <span className="repo-col repo-col--name">
                                        {item.type === "script" ? (
                                            <FileCode2 size={16} className="repo-file-icon" />
                                        ) : (
                                            <Package size={16} className="repo-file-icon" />
                                        )}
                                        <span className="repo-file-name">{item.name}</span>
                                        <span className="repo-file-game">{item.game}</span>
                                    </span>
                                    <span className="repo-col repo-col--type">
                                        <TypeBadge type={item.type} />
                                    </span>
                                    <span className="repo-col repo-col--version">
                                        <code>v{latest?.version || "—"}</code>
                                    </span>
                                    <span className="repo-col repo-col--updated">
                                        {formatDate(item.updatedAt)}
                                    </span>
                                    <span className="repo-col repo-col--status">
                                        <StatusBadge status={item.status} />
                                    </span>
                                    <ChevronRight size={16} className="repo-row-chevron" />
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer note */}
                <div className="repo-footer-note">
                    <AlertTriangle size={14} />
                    <span>
                        These modifications are provided for educational purposes only.
                        Using them may violate game terms of service and result in account bans.
                    </span>
                </div>
            </div>
        </main>
    );
}
