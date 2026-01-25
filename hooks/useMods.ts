/* hooks/useMods.ts */
"use client";

import { useState, useEffect } from "react";
import { ModPost, ModListItem } from "@/lib/mods/types";
import { getPublishedMods, getModBySlug, toListItems } from "@/lib/mods/service";

/**
 * Hook to fetch all published mods
 */
export function useMods() {
    const [mods, setMods] = useState<ModPost[]>([]);
    const [listItems, setListItems] = useState<ModListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMods() {
            try {
                setLoading(true);
                setError(null);
                const data = await getPublishedMods();
                setMods(data);
                setListItems(toListItems(data));
            } catch (err) {
                console.error("Failed to fetch mods:", err);
                setError("Failed to load mods. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        fetchMods();
    }, []);

    return {
        mods, listItems, loading, error, refetch: () => {
            setLoading(true);
            getPublishedMods()
                .then((data) => {
                    setMods(data);
                    setListItems(toListItems(data));
                })
                .catch((err) => {
                    console.error("Failed to fetch mods:", err);
                    setError("Failed to load mods.");
                })
                .finally(() => setLoading(false));
        }
    };
}

/**
 * Hook to fetch a single mod by slug
 */
export function useMod(slug: string) {
    const [mod, setMod] = useState<ModPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMod() {
            if (!slug) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await getModBySlug(slug);

                if (!data) {
                    setError("Mod not found");
                    setMod(null);
                } else {
                    setMod(data);
                }
            } catch (err) {
                console.error("Failed to fetch mod:", err);
                setError("Failed to load mod details.");
            } finally {
                setLoading(false);
            }
        }

        fetchMod();
    }, [slug]);

    return { mod, loading, error };
}
