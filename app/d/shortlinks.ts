/* app/d/shortlinks.ts */

/**
 * Short link mappings for download redirects.
 * 
 * Usage:
 *   Add entries with a unique slug and target URL.
 *   Users visiting /d/[slug] will be redirected after countdown.
 */

export type Status = "stable" | "beta" | "experimental";
export type ItemType = "script" | "mod";

export interface ShortLink {
    /** The target URL to redirect to */
    url: string;
    /** Display name */
    name: string;
    /** File size */
    size: string;
    /** Target game */
    game: string;
    /** Version number */
    version: string;
    /** Release status */
    status: Status;
    /** Script or Mod APK */
    type: ItemType;
    /** File extension or type label */
    fileType?: string;
}

export const shortlinks: Record<string, ShortLink> = {
    "ml-radar": {
        url: "https://example.com/files/ml-radar-v2.4.1.zip",
        name: "ML Radar Hack",
        size: "45 KB",
        game: "Mobile Legends",
        version: "2.4.1",
        status: "stable",
        type: "script",
        fileType: ".lua",
    },
    "ff-aim": {
        url: "https://example.com/files/ff-aim-assist-v3.1.0.apk",
        name: "FF Aim Assist",
        size: "1.2 GB",
        game: "Free Fire",
        version: "3.1.0",
        status: "beta",
        type: "mod",
        fileType: ".apk",
    },
    "pubg-esp": {
        url: "https://example.com/files/pubg-esp-v1.0.3.zip",
        name: "PUBG ESP Vision",
        size: "128 KB",
        game: "PUBG Mobile",
        version: "1.0.3",
        status: "experimental",
        type: "script",
        fileType: ".lua",
    },
    "coc-gen": {
        url: "https://example.com/files/coc-resource-gen-v4.2.0.lua",
        name: "CoC Resource Generator",
        size: "32 KB",
        game: "Clash of Clans",
        version: "4.2.0",
        status: "stable",
        type: "script",
        fileType: ".lua",
    },
};

/**
 * Get a short link by slug
 */
export function getShortLink(slug: string): ShortLink | null {
    return shortlinks[slug] || null;
}
