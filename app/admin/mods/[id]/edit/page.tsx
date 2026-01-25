/* app/admin/mods/[id]/edit/page.tsx */
"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { ModForm } from "@/components/admin/ModForm";
import { ModPost } from "@/lib/mods/types";
import { getModById } from "@/lib/mods/service";

export default function EditModPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { status } = useAdminGuard();
    const [mod, setMod] = useState<ModPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status.status === "authorized" && id) {
            fetchMod();
        }
    }, [status.status, id]);

    const fetchMod = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getModById(id);
            if (!data) {
                setError("Mod not found");
            } else {
                setMod(data);
            }
        } catch (err) {
            console.error("Failed to fetch mod:", err);
            setError("Failed to load mod details.");
        } finally {
            setLoading(false);
        }
    };

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

    // Error state
    if (error || !mod) {
        return (
            <main className="admin-page">
                <div className="admin-container">
                    <div className="admin-error-page">
                        <AlertCircle size={48} />
                        <h1>Error</h1>
                        <p>{error || "Mod not found"}</p>
                        <Link href="/admin/mods" className="admin-btn admin-btn--primary">
                            <ArrowLeft size={16} />
                            <span>Back to mods</span>
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="admin-page">
            <div className="admin-container admin-container--form">
                <header className="admin-form-header">
                    <Link href="/admin/mods" className="admin-back-link">
                        <ArrowLeft size={16} />
                        <span>Back to mods</span>
                    </Link>
                    <h1 className="admin-form-title">Edit Mod</h1>
                    <p className="admin-form-subtitle">
                        Editing: {mod.name}
                    </p>
                </header>

                <ModForm mod={mod} isEdit />
            </div>
        </main>
    );
}
