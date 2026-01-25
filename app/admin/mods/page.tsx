/* app/admin/mods/page.tsx */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    ArrowLeft,
    Search,
    FileCode2,
    Package,
    ExternalLink,
    AlertCircle,
} from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { ModPost, ModListItem, getLatestVersion, formatDate } from "@/lib/mods/types";
import { getAllMods, togglePublished, deleteMod, toListItems } from "@/lib/mods/service";

// Type badge
function TypeBadge({ type }: { type: "script" | "mod" }) {
    return (
        <span className={`admin-badge admin-badge--${type}`}>
            {type === "script" ? "Script" : "Mod APK"}
        </span>
    );
}

// Status badge
function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`admin-badge admin-badge--${status}`}>
            {status}
        </span>
    );
}

// Published badge
function PublishedBadge({ published }: { published: boolean }) {
    return (
        <span className={`admin-badge ${published ? "admin-badge--published" : "admin-badge--draft"}`}>
            {published ? "Published" : "Draft"}
        </span>
    );
}

export default function AdminModsPage() {
    const { status, user } = useAdminGuard();
    const [mods, setMods] = useState<ModPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch mods
    useEffect(() => {
        if (status.status === "authorized") {
            fetchMods();
        }
    }, [status.status]);

    const fetchMods = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllMods();
            setMods(data);
        } catch (err) {
            console.error("Failed to fetch mods:", err);
            setError("Failed to load mods.");
        } finally {
            setLoading(false);
        }
    };

    // Toggle published status
    const handleTogglePublished = async (id: string, currentStatus: boolean) => {
        setActionLoading(id);
        try {
            await togglePublished(id, !currentStatus);
            await fetchMods();
        } catch (err) {
            console.error("Failed to toggle published:", err);
            alert("Failed to update mod status.");
        } finally {
            setActionLoading(null);
        }
    };

    // Delete mod
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        setActionLoading(id);
        try {
            await deleteMod(id);
            await fetchMods();
        } catch (err) {
            console.error("Failed to delete mod:", err);
            alert("Failed to delete mod.");
        } finally {
            setActionLoading(null);
        }
    };

    // Filter mods
    const filteredMods = mods.filter((mod) => {
        const q = searchQuery.toLowerCase();
        return (
            mod.name.toLowerCase().includes(q) ||
            mod.game.toLowerCase().includes(q)
        );
    });

    // Loading state
    if (status.status === "loading" || (status.status === "authorized" && loading)) {
        return (
            <main className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Loading...</div>
                </div>
            </main>
        );
    }

    // Not authorized
    if (status.status !== "authorized") {
        return null;
    }

    return (
        <main className="admin-page">
            <div className="admin-container">
                {/* Header */}
                <header className="admin-mods-header">
                    <div className="admin-mods-header-left">
                        <Link href="/admin" className="admin-back-link">
                            <ArrowLeft size={16} />
                            <span>Dashboard</span>
                        </Link>
                        <h1 className="admin-mods-title">Manage Mods</h1>
                        <p className="admin-mods-subtitle">
                            {mods.length} mod{mods.length !== 1 ? "s" : ""} total
                        </p>
                    </div>
                    <Link href="/admin/mods/new" className="admin-btn admin-btn--primary">
                        <Plus size={16} />
                        <span>New Mod</span>
                    </Link>
                </header>

                {/* Search */}
                <div className="admin-search">
                    <Search size={16} className="admin-search-icon" />
                    <input
                        type="text"
                        placeholder="Search mods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="admin-search-input"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="admin-error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Mods list */}
                <div className="admin-mods-list">
                    {filteredMods.length === 0 ? (
                        <div className="admin-empty">
                            <p>No mods found.</p>
                            <Link href="/admin/mods/new" className="admin-btn admin-btn--primary">
                                <Plus size={16} />
                                <span>Create your first mod</span>
                            </Link>
                        </div>
                    ) : (
                        filteredMods.map((mod) => {
                            const latest = getLatestVersion(mod);
                            const isLoading = actionLoading === mod.id;

                            return (
                                <div key={mod.id} className={`admin-mod-card ${isLoading ? "admin-mod-card--loading" : ""}`}>
                                    <div className="admin-mod-main">
                                        <div className="admin-mod-info">
                                            <div className="admin-mod-name-row">
                                                <span className="admin-mod-name">{mod.name}</span>
                                                <TypeBadge type={mod.type} />
                                                <PublishedBadge published={mod.published} />
                                            </div>
                                            <span className="admin-mod-game">{mod.game}</span>
                                        </div>
                                        <div className="admin-mod-meta">
                                            {latest && (
                                                <>
                                                    <code className="admin-mod-version">v{latest.version}</code>
                                                    <StatusBadge status={latest.status} />
                                                </>
                                            )}
                                            <span className="admin-mod-date">
                                                Updated {formatDate(mod.updatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="admin-mod-actions">
                                        <Link
                                            href={`/mods/${mod.slug}`}
                                            className="admin-action-btn"
                                            title="View public page"
                                            target="_blank"
                                        >
                                            <ExternalLink size={16} />
                                        </Link>
                                        <button
                                            type="button"
                                            className="admin-action-btn"
                                            title={mod.published ? "Unpublish" : "Publish"}
                                            onClick={() => handleTogglePublished(mod.id, mod.published)}
                                            disabled={isLoading}
                                        >
                                            {mod.published ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <Link
                                            href={`/admin/mods/${mod.id}/edit`}
                                            className="admin-action-btn"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            type="button"
                                            className="admin-action-btn admin-action-btn--danger"
                                            title="Delete"
                                            onClick={() => handleDelete(mod.id, mod.name)}
                                            disabled={isLoading}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </main>
    );
}
