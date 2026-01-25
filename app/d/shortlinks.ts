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
    // Swordash versions
    "swordash": {
        url: "https://github.com/kingrize/aWcgQGppeWEucHkgLSBhbnRpIHVzZXIgYWJ1c2UgLSBhbnRpIGxpbmsgZGlyZWN0/raw/refs/heads/main/scripts/swordash_menu_1.1-argarrize.lua",
        name: "Swordash God Mode",
        size: "45 KB",
        game: "Swordash",
        version: "1.1",
        status: "stable",
        type: "script",
        fileType: ".lua",
    },
    "swordash-102": {
        url: "https://example.com/files/swordash_menu_1.0.2.lua",
        name: "Swordash God Mode",
        size: "42 KB",
        game: "Swordash",
        version: "1.0.2",
        status: "stable",
        type: "script",
        fileType: ".lua",
    },
    "swordash-101": {
        url: "https://example.com/files/swordash_menu_1.0.1.lua",
        name: "Swordash God Mode",
        size: "40 KB",
        game: "Swordash",
        version: "1.0.1",
        status: "beta",
        type: "script",
        fileType: ".lua",
    },

    // Free Fire versions
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
    "ff-aim-300": {
        url: "https://example.com/files/ff-aim-assist-v3.0.0.apk",
        name: "FF Aim Assist",
        size: "1.1 GB",
        game: "Free Fire",
        version: "3.0.0",
        status: "stable",
        type: "mod",
        fileType: ".apk",
    },

    // PUBG ESP
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

    // CoC versions
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
    "coc-gen-410": {
        url: "https://example.com/files/coc-resource-gen-v4.1.0.lua",
        name: "CoC Resource Generator",
        size: "30 KB",
        game: "Clash of Clans",
        version: "4.1.0",
        status: "stable",
        type: "script",
        fileType: ".lua",
    },
    "coc-gen-400": {
        url: "https://example.com/files/coc-resource-gen-v4.0.0.lua",
        name: "CoC Resource Generator",
        size: "28 KB",
        game: "Clash of Clans",
        version: "4.0.0",
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
