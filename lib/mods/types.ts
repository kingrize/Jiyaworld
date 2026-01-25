/* lib/mods/types.ts */

/**
 * Mod Post Types
 * 
 * Data model for game scripts and mod APKs stored in Firestore.
 * Each mod is a "post" with versioning support.
 */

// Type of mod
export type ModType = "script" | "mod";

// Status of a mod version
export type ModStatus = "stable" | "beta" | "experimental";

// Risk level for features
export type RiskLevel = "none" | "low" | "medium" | "high";

// Individual feature
export interface ModFeature {
    text: string;
    risk: RiskLevel;
    riskNote?: string;
}

// Version information
export interface ModVersion {
    version: string;         // e.g., "1.0.0"
    status: ModStatus;
    fileSize: string;        // e.g., "2.5 MB"
    downloadSlug: string;    // Slug for /d/[slug] redirect
    downloadUrl: string;     // Target URL for redirect
    changelog: string[];     // List of changes
    createdAt: Date | string;
    isLatest: boolean;
}

// Full mod post document
export interface ModPost {
    // Firestore document ID
    id: string;

    // Basic info
    name: string;
    slug: string;            // URL-friendly identifier
    game: string;            // Game name
    type: ModType;
    status: ModStatus;       // Current status (from latest version)

    // Publishing
    published: boolean;      // Draft vs published
    createdAt: Date | string;
    updatedAt: Date | string;

    // Content
    description: string;
    features: ModFeature[];
    requirements: string[];
    installationSteps: string[];
    warnings: string[];

    // Versions
    versions: ModVersion[];
}

// Form data for creating/editing a mod
export interface ModFormData {
    name: string;
    slug: string;
    game: string;
    type: ModType;
    published: boolean;
    description: string;
    features: ModFeature[];
    requirements: string[];
    installationSteps: string[];
    warnings: string[];
}

// Form data for adding a version
export interface VersionFormData {
    version: string;
    status: ModStatus;
    fileSize: string;
    downloadSlug: string;
    downloadUrl: string;
    changelog: string[];
}

// List item (subset for list view)
export interface ModListItem {
    id: string;
    name: string;
    slug: string;
    game: string;
    type: ModType;
    status: ModStatus;
    published: boolean;
    latestVersion: string;
    updatedAt: Date | string;
}

// Utility: Get latest version from a mod
export function getLatestVersion(mod: ModPost): ModVersion | null {
    const latest = mod.versions.find(v => v.isLatest);
    if (latest) return latest;
    return mod.versions.length > 0 ? mod.versions[0] : null;
}

// Utility: Format date for display
export function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
