/* app/admin/page.tsx */
"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Package, Settings, ExternalLink } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAdminGuard } from "@/hooks/useAdminGuard";

export default function AdminPage() {
    const router = useRouter();
    const { status, user } = useAdminGuard();

    const handleSignOut = async () => {
        await signOut(auth);
        router.replace("/admin/login");
    };

    // Loading state - show nothing to prevent content flash
    if (status.status === "loading") {
        return (
            <main className="admin-login-page">
                <div className="admin-login-loading">Verifying access...</div>
            </main>
        );
    }

    // Not authorized - hook will handle redirect, show nothing
    if (status.status !== "authorized") {
        return null;
    }

    // Authorized - show admin content
    return (
        <main className="admin-page">
            <div className="admin-container">
                <header className="admin-header">
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <p className="admin-subtitle">
                        Signed in as {user?.displayName || user?.email || "Admin"}
                    </p>
                </header>

                {/* Quick actions */}
                <div className="admin-dashboard-grid">
                    <Link href="/admin/mods" className="admin-dashboard-card">
                        <div className="admin-dashboard-card-icon">
                            <Package size={24} />
                        </div>
                        <div className="admin-dashboard-card-content">
                            <h2 className="admin-dashboard-card-title">Manage Mods</h2>
                            <p className="admin-dashboard-card-desc">
                                Create, edit, and manage mod posts
                            </p>
                        </div>
                    </Link>

                    <Link href="/mods" className="admin-dashboard-card" target="_blank">
                        <div className="admin-dashboard-card-icon">
                            <ExternalLink size={24} />
                        </div>
                        <div className="admin-dashboard-card-content">
                            <h2 className="admin-dashboard-card-title">View Public Page</h2>
                            <p className="admin-dashboard-card-desc">
                                Open the public mods repository
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Account info */}
                <div className="admin-content">
                    <h3 className="admin-section-label">Account</h3>
                    <div className="admin-info-grid">
                        <div className="admin-info-item">
                            <span className="admin-info-label">UID</span>
                            <code className="admin-info-value">{user?.uid}</code>
                        </div>
                        <div className="admin-info-item">
                            <span className="admin-info-label">Email</span>
                            <code className="admin-info-value">{user?.email || "—"}</code>
                        </div>
                        <div className="admin-info-item">
                            <span className="admin-info-label">Provider</span>
                            <code className="admin-info-value">
                                {user?.providerData[0]?.providerId || "—"}
                            </code>
                        </div>
                        <div className="admin-info-item">
                            <span className="admin-info-label">Status</span>
                            <code className="admin-info-value admin-info-value--success">
                                Authorized
                            </code>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="admin-signout-btn"
                    onClick={handleSignOut}
                >
                    Sign out
                </button>
            </div>
        </main>
    );
}
