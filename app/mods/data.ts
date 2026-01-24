/* app/mods/data.ts */

// ============================================
// Types
// ============================================

export type Status = "stable" | "beta" | "experimental";
export type ItemType = "script" | "mod";

export interface ModItem {
    /** Unique identifier (used for URLs) */
    id: string;
    /** Display name */
    name: string;
    /** Script or Mod APK */
    type: ItemType;
    /** Version number (e.g., "2.4.1") */
    version: string;
    /** Last update date (YYYY-MM-DD format) */
    lastUpdate: string;
    /** Release status */
    status: Status;
    /** Target game name */
    game: string;
    /** Game engine (optional) */
    engine?: string;
    /** Compatible game versions (optional) */
    compatibility?: string;
    /** Full description */
    description: string;
    /** List of features */
    features: string[];
    /** List of requirements */
    requirements: string[];
    /** Installation steps */
    installation: string[];
    /** Warning messages (optional) */
    warnings?: string[];
    /** Download slug for /d/[slug] redirect */
    downloadSlug: string;
    /** File size */
    size: string;
}

// ============================================
// Data
// ============================================

export const modsData: ModItem[] = [
    {
        id: "ml-radar-hack",
        name: "ML Radar Hack",
        type: "script",
        version: "2.4.1",
        lastUpdate: "2026-01-20",
        status: "stable",
        game: "Mobile Legends",
        engine: "Unity",
        compatibility: "v1.8.x - v1.9.x",
        description:
            "Advanced radar script that reveals enemy positions on the minimap in real-time. Works with the latest game patches and includes anti-detection measures.",
        features: [
            "Real-time enemy position tracking",
            "Minimap overlay integration",
            "Low resource usage",
            "Anti-detection bypass",
            "Configurable update interval",
        ],
        requirements: [
            "Rooted Android device or emulator",
            "Game Guardian or similar",
            "Minimum 4GB RAM",
            "Android 10+",
        ],
        installation: [
            "Download and extract the script file",
            "Open Game Guardian and select the game process",
            "Load the .lua script from the extracted folder",
            "Configure settings in the popup menu",
            "Start the game and activate the script",
        ],
        warnings: [
            "Use at your own risk - may result in account ban",
            "Disable before ranked matches for safety",
            "Not compatible with other radar scripts",
        ],
        downloadSlug: "ml-radar",
        size: "45 KB",
    },
    {
        id: "ff-aim-assist",
        name: "FF Aim Assist",
        type: "mod",
        version: "3.1.0",
        lastUpdate: "2026-01-18",
        status: "beta",
        game: "Free Fire",
        engine: "Unity",
        compatibility: "v1.100.x",
        description:
            "Modified APK with aim assistance features. Includes headshot optimization and recoil reduction for improved gameplay.",
        features: [
            "Auto aim correction",
            "Headshot priority targeting",
            "Recoil pattern compensation",
            "Sensitivity optimizer",
            "Custom crosshair options",
        ],
        requirements: [
            "Uninstall original game first",
            "Enable unknown sources",
            "Minimum 3GB RAM",
            "Android 8+",
        ],
        installation: [
            "Uninstall the official Free Fire app",
            "Download the mod APK file",
            "Enable 'Install from unknown sources' in settings",
            "Install the APK file",
            "Open the game and configure mod settings",
        ],
        warnings: [
            "This is a modified APK - use burner account recommended",
            "May not work on all devices",
            "Updates may take time after official patches",
        ],
        downloadSlug: "ff-aim",
        size: "1.2 GB",
    },
    {
        id: "pubg-esp",
        name: "PUBG ESP Vision",
        type: "script",
        version: "1.0.3",
        lastUpdate: "2026-01-15",
        status: "experimental",
        game: "PUBG Mobile",
        engine: "Unreal Engine",
        compatibility: "v2.9.x",
        description:
            "Experimental ESP script for PUBG Mobile. Shows enemy outlines, loot locations, and vehicle positions through walls and terrain.",
        features: [
            "Enemy ESP with distance display",
            "Loot ESP (weapons, armor, meds)",
            "Vehicle location markers",
            "Airdrop tracking",
            "Zone prediction overlay",
        ],
        requirements: [
            "Virtual environment (recommended)",
            "Game Guardian Pro",
            "8GB RAM minimum",
            "Android 11+",
        ],
        installation: [
            "Set up virtual environment if using main device",
            "Install Game Guardian Pro from official source",
            "Download and extract ESP script package",
            "Run the loader script first, then main script",
            "Calibrate settings for your device resolution",
        ],
        warnings: [
            "HIGH RISK - Experimental build, may crash",
            "Virtual device strongly recommended",
            "Known issues with some device models",
            "Report bugs in the community channel",
        ],
        downloadSlug: "pubg-esp",
        size: "128 KB",
    },
    {
        id: "coc-resources",
        name: "CoC Resource Generator",
        type: "script",
        version: "4.2.0",
        lastUpdate: "2026-01-22",
        status: "stable",
        game: "Clash of Clans",
        engine: "Supercell Engine",
        compatibility: "v15.x",
        description:
            "Automated resource generation script for Clash of Clans. Works through memory modification to increase in-game currency values.",
        features: [
            "Gold generation",
            "Elixir generation",
            "Dark elixir generation",
            "Gem injection (limited)",
            "Builder boost",
        ],
        requirements: [
            "Rooted device required",
            "Game Guardian",
            "Stable internet connection",
            "Fresh account recommended",
        ],
        installation: [
            "Root your device using Magisk or similar",
            "Install Game Guardian with root access",
            "Open CoC and load into your village",
            "Run the script and select resource type",
            "Wait for synchronization to complete",
        ],
        warnings: [
            "Use on secondary account only",
            "Large amounts may trigger server detection",
            "Space out usage over multiple days",
        ],
        downloadSlug: "coc-gen",
        size: "32 KB",
    },
];
