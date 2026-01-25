/* app/admin/access-denied/page.tsx */
"use client";

import Link from "next/link";

export default function AccessDeniedPage() {
    return (
        <main className="admin-denied-page">
            <div className="admin-denied-container">
                <div className="admin-denied-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                </div>

                <h1 className="admin-denied-title">Access Denied</h1>

                <p className="admin-denied-text">
                    Your account is not authorized to access the admin area.
                    This login is restricted to approved administrators only.
                </p>

                <div className="admin-denied-actions">
                    <Link href="/" className="admin-denied-link">
                        Return to home
                    </Link>
                    <Link href="/admin/login" className="admin-denied-link admin-denied-link--secondary">
                        Try different account
                    </Link>
                </div>

                <p className="admin-denied-footer">
                    If you believe this is an error, contact the site administrator.
                </p>
            </div>
        </main>
    );
}
