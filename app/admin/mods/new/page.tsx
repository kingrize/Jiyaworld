/* app/admin/mods/new/page.tsx */
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { ModForm } from "@/components/admin/ModForm";

export default function NewModPage() {
    const { status } = useAdminGuard();

    // Loading state
    if (status.status === "loading") {
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
            <div className="admin-container admin-container--form">
                <header className="admin-form-header">
                    <Link href="/admin/mods" className="admin-back-link">
                        <ArrowLeft size={16} />
                        <span>Back to mods</span>
                    </Link>
                    <h1 className="admin-form-title">Create New Mod</h1>
                    <p className="admin-form-subtitle">
                        Add a new script or mod APK to the repository
                    </p>
                </header>

                <ModForm />
            </div>
        </main>
    );
}
