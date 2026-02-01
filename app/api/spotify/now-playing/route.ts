/* app/api/spotify/now-playing/route.ts */
import { NextResponse } from "next/server";

const SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SPOTIFY_NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
    if (!client_id || !client_secret || !refresh_token) {
        throw new Error("Spotify credentials not configured");
    }

    const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

    const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to get access token");
    }

    return response.json();
}

async function getNowPlaying() {
    const { access_token } = await getAccessToken();

    const response = await fetch(SPOTIFY_NOW_PLAYING_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    if (response.status === 204) {
        return { isPlaying: false };
    }

    if (!response.ok) {
        throw new Error("Failed to fetch now playing");
    }

    const data = await response.json();

    if (!data.is_playing) {
        return { isPlaying: false };
    }

    return {
        isPlaying: true,
        track: data.item?.name || "Unknown Track",
        artist: data.item?.artists?.map((artist: any) => artist.name).join(", ") || "Unknown Artist",
    };
}

export async function GET() {
    try {
        const data = await getNowPlaying();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ isPlaying: false });
    }
}
