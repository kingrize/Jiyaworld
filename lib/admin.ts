/* lib/admin.ts */

/**
 * Admin Authorization Configuration
 * 
 * This module defines who has admin access to the application.
 * Only users whose UID is in the ADMIN_UIDS list can access admin features.
 */

// List of authorized admin UIDs
// Add UIDs here to grant admin access
export const ADMIN_UIDS: readonly string[] = [
    "1SBSUf8K2AUvJs4rAFTZsFNh1mU2", // Primary admin
] as const;

/**
 * Check if a user UID has admin privileges
 * @param uid - Firebase user UID to check
 * @returns true if the UID is in the admin list
 */
export function isAdminUID(uid: string | null | undefined): boolean {
    if (!uid) return false;
    return ADMIN_UIDS.includes(uid);
}

/**
 * Admin authorization result type
 */
export type AdminAuthStatus =
    | { status: "loading" }
    | { status: "authorized"; uid: string }
    | { status: "unauthorized"; reason: "not-authenticated" | "not-admin" }
    | { status: "error"; message: string };
