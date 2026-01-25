/* hooks/useAdminGuard.ts */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminUID, AdminAuthStatus } from "@/lib/admin";

/**
 * Admin Guard Hook
 * 
 * Protects admin pages by verifying the user is both:
 * 1. Authenticated with Firebase
 * 2. Has a UID in the admin whitelist
 * 
 * Unauthorized users are signed out and redirected to the access denied page.
 * 
 * @param options - Configuration options
 * @returns Admin auth status and user object
 * 
 * @example
 * ```tsx
 * const { status, user } = useAdminGuard();
 * 
 * if (status.status === "loading") return <LoadingSpinner />;
 * if (status.status !== "authorized") return null; // Will redirect
 * 
 * return <AdminContent user={user} />;
 * ```
 */
export function useAdminGuard(options?: {
    /** Custom redirect path for unauthorized users (default: /admin/access-denied) */
    redirectTo?: string;
    /** Skip automatic redirect (useful for custom handling) */
    skipRedirect?: boolean;
}) {
    const router = useRouter();
    const [status, setStatus] = useState<AdminAuthStatus>({ status: "loading" });
    const [user, setUser] = useState<User | null>(null);

    const redirectPath = options?.redirectTo ?? "/admin/access-denied";
    const skipRedirect = options?.skipRedirect ?? false;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // Case 1: Not authenticated
            if (!currentUser) {
                setUser(null);
                setStatus({ status: "unauthorized", reason: "not-authenticated" });

                if (!skipRedirect) {
                    router.replace("/admin/login");
                }
                return;
            }

            // Case 2: Authenticated but not admin
            if (!isAdminUID(currentUser.uid)) {
                setUser(null);
                setStatus({ status: "unauthorized", reason: "not-admin" });

                // Sign out the unauthorized user immediately
                await signOut(auth);

                if (!skipRedirect) {
                    router.replace(redirectPath);
                }
                return;
            }

            // Case 3: Authenticated and is admin
            setUser(currentUser);
            setStatus({ status: "authorized", uid: currentUser.uid });
        });

        return () => unsubscribe();
    }, [router, redirectPath, skipRedirect]);

    return { status, user };
}

/**
 * Standalone function to check admin status
 * Useful for server-side or one-time checks
 * 
 * @param user - Firebase User object
 * @returns AdminAuthStatus
 */
export function checkAdminStatus(user: User | null): AdminAuthStatus {
    if (!user) {
        return { status: "unauthorized", reason: "not-authenticated" };
    }

    if (!isAdminUID(user.uid)) {
        return { status: "unauthorized", reason: "not-admin" };
    }

    return { status: "authorized", uid: user.uid };
}
