/**
 * Tako Leaderboard API Route
 * 
 * Securely fetches leaderboard data server-side to protect the overlay key.
 * Returns only display-safe donor names - no amounts, no sensitive data.
 */

import { NextResponse } from 'next/server';

// Read overlay key from environment (server-side only, never exposed to client)
const TAKO_OVERLAY_KEY = process.env.TAKO_OVERLAY_KEY;

export async function GET() {
    // If no overlay key configured, return empty gracefully
    if (!TAKO_OVERLAY_KEY) {
        return NextResponse.json({ donors: [] });
    }

    try {
        const response = await fetch(
            `https://tako.id/overlay/leaderboard?overlay_key=${TAKO_OVERLAY_KEY}`,
            {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'User-Agent': 'Jiyaworld/1.0',
                },
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            // Fail silently - return empty
            return NextResponse.json({ donors: [] });
        }

        const html = await response.text();

        // Parse donor names from the overlay HTML
        // The overlay typically contains donor display names in a list format
        // We extract only names - no amounts, no rankings
        const donors = extractDonorNames(html);

        return NextResponse.json({ donors: donors.slice(0, 5) }); // Limit to top 5
    } catch {
        // Fail silently on any error
        return NextResponse.json({ donors: [] });
    }
}

/**
 * Extract donor names from Tako overlay HTML
 * Returns only display names, no amounts or rankings
 */
function extractDonorNames(html: string): string[] {
    const names: string[] = [];

    // Look for common patterns in leaderboard overlays
    // Pattern 1: data-name attributes
    const nameAttrMatches = html.matchAll(/data-name="([^"]+)"/g);
    for (const match of nameAttrMatches) {
        if (match[1]) names.push(match[1]);
    }

    // Pattern 2: username/donor class elements
    const usernameMatches = html.matchAll(/class="[^"]*(?:username|donor|name)[^"]*"[^>]*>([^<]+)</gi);
    for (const match of usernameMatches) {
        if (match[1] && match[1].trim()) names.push(match[1].trim());
    }

    // Pattern 3: Look for display_name in JSON data
    const jsonMatches = html.matchAll(/"display_name"\s*:\s*"([^"]+)"/g);
    for (const match of jsonMatches) {
        if (match[1]) names.push(match[1]);
    }

    // Deduplicate and return
    return [...new Set(names)];
}
