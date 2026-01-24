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
} from "lucide-react";

// Import types and data from separate file
import { modsData, type ModItem, type Status, type ItemType } from "./data";


// Status badge component
const StatusBadge = ({ status }: { status: Status }) => {
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
const TypeBadge = ({ type }: { type: ItemType }) => {
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

export default function ModsPage() {
    const [selectedItem, setSelectedItem] = useState<ModItem | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"all" | ItemType>("all");
    const [copied, setCopied] = useState(false);

    // Filter items
    const filteredItems = modsData.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.game.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleCopyLink = () => {
        if (selectedItem) {
            navigator.clipboard.writeText(
                `${window.location.origin}/mods#${selectedItem.id}`
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Detail view
    if (selectedItem) {
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
                                <span>Updated {selectedItem.lastUpdate}</span>
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
                    <section className="repo-section">
                        <div className="repo-info-grid">
                            <div className="repo-info-item">
                                <span className="repo-info-label">Version</span>
                                <code className="repo-info-value">{selectedItem.version}</code>
                            </div>
                            {selectedItem.engine && (
                                <div className="repo-info-item">
                                    <span className="repo-info-label">Engine</span>
                                    <code className="repo-info-value">{selectedItem.engine}</code>
                                </div>
                            )}
                            {selectedItem.compatibility && (
                                <div className="repo-info-item">
                                    <span className="repo-info-label">Compatibility</span>
                                    <code className="repo-info-value">
                                        {selectedItem.compatibility}
                                    </code>
                                </div>
                            )}
                            <div className="repo-info-item">
                                <span className="repo-info-label">Size</span>
                                <code className="repo-info-value">{selectedItem.size}</code>
                            </div>
                        </div>
                    </section>

                    <div className="repo-divider" />

                    {/* Features */}
                    <section className="repo-section">
                        <h2 className="repo-section-title">Features</h2>
                        <ul className="repo-list">
                            {selectedItem.features.map((feature, idx) => (
                                <li key={idx} className="repo-list-item">
                                    <span className="repo-list-bullet">•</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <div className="repo-divider" />

                    {/* Requirements */}
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

                    {/* Installation */}
                    <section className="repo-section">
                        <h2 className="repo-section-title">Installation</h2>
                        <ol className="repo-ordered-list">
                            {selectedItem.installation.map((step, idx) => (
                                <li key={idx} className="repo-ordered-item">
                                    <span className="repo-step-number">{idx + 1}.</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* Warnings */}
                    {selectedItem.warnings && selectedItem.warnings.length > 0 && (
                        <>
                            <div className="repo-divider" />
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
                        </>
                    )}

                    <div className="repo-divider" />

                    {/* Download Actions */}
                    <section className="repo-section">
                        <div className="repo-actions">
                            <Link href={`/d/${selectedItem.downloadSlug}`} className="repo-download-btn">
                                <Download size={16} />
                                <span>Download {selectedItem.type === "mod" ? "APK" : "Script"}</span>
                                <span className="repo-download-size">{selectedItem.size}</span>
                            </Link>
                            <button onClick={handleCopyLink} className="repo-copy-btn">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                <span>{copied ? "Copied!" : "Copy link"}</span>
                            </button>
                        </div>
                    </section>
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
                        <Filter size={14} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as "all" | ItemType)}
                            className="repo-filter-select"
                        >
                            <option value="all">All types</option>
                            <option value="script">Scripts</option>
                            <option value="mod">Mod APKs</option>
                        </select>
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
                    {filteredItems.length === 0 ? (
                        <div className="repo-empty">
                            <p>No items found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredItems.map((item) => (
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
                                    <code>{item.version}</code>
                                </span>
                                <span className="repo-col repo-col--updated">{item.lastUpdate}</span>
                                <span className="repo-col repo-col--status">
                                    <StatusBadge status={item.status} />
                                </span>
                                <ChevronRight size={16} className="repo-row-chevron" />
                            </button>
                        ))
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
