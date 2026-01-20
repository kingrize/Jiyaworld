/**
 * Advanced API Key Management & Optimization System
 */

// Types for Key Monitoring
type KeyStatus = 'healthy' | 'rate-limited' | 'exhausted' | 'invalid';

interface KeyMetadata {
    key: string;
    status: KeyStatus;
    lastUsed: number;
    retryAfter: number; // Timestamp when we can try again
    failCount: number;
}

// In-memory registry for key health
// In a serverless environment (like Vercel), this may reset, 
// which is acceptable for "lightweight" monitoring.
const keyRegistry: Record<string, KeyMetadata> = {};

/**
 * Dynamically retrieves all available API keys for a given provider.
 */
const getProjectKeys = (provider: string): string[] => {
    const keys: string[] = [];
    const env = process.env;
    const baseNames = [
        `${provider}_API_KEY`,
        `NEXT_PUBLIC_${provider}_API_KEY`
    ];

    baseNames.forEach(base => {
        if (env[base]) keys.push(env[base] as string);
        for (let i = 1; i <= 20; i++) {
            const keyWithSuffix = `${base}_${i}`;
            if (env[keyWithSuffix]) keys.push(env[keyWithSuffix] as string);
        }
    });

    return Array.from(new Set(keys)).filter(Boolean);
};

/**
 * Initialize registry for keys if not already present
 */
const syncRegistry = (provider: string, keys: string[]) => {
    keys.forEach(k => {
        if (!keyRegistry[k]) {
            keyRegistry[k] = {
                key: k,
                status: 'healthy',
                lastUsed: 0,
                retryAfter: 0,
                failCount: 0
            };
        }
    });
};

/**
 * Smart Key Selection Logic:
 * 1. Priority to customKey if provided.
 * 2. Uses a "sticky" primary key until it fails.
 * 3. Skips keys in cooldown.
 */
export async function executeOptimizedRequest<T>(
    provider: string,
    options: {
        customKey?: string | null;
        onCall: (apiKey: string) => Promise<T>;
    }
): Promise<T> {
    const { customKey, onCall } = options;

    // 1. Try Custom Key First (Highest Priority)
    if (customKey) {
        try {
            console.log(`[${provider}] 🛠️ Using Custom API Key...`);
            return await onCall(customKey);
        } catch (error: any) {
            console.warn(`[${provider}] Custom Key failed. Falling back to project keys.`);
            // If custom key fails, we proceed to project keys
        }
    }

    // 2. Manage Project Keys
    const projectKeys = getProjectKeys(provider);
    syncRegistry(provider, projectKeys);

    const now = Date.now();

    // Filter for available keys (Healthy or Cooldown expired)
    const availableKeys = projectKeys
        .map(k => keyRegistry[k])
        .filter(meta => meta.status === 'healthy' || (meta.retryAfter > 0 && now > meta.retryAfter))
        .sort((a, b) => a.lastUsed - b.lastUsed); // Least recently used for basic load balancing among healthy ones

    if (availableKeys.length === 0) {
        const error = new Error("All API engines are currently cooling down. Please wait a moment.");
        // @ts-ignore
        error.status = 429;
        throw error;
    }

    let lastError: any;

    // Try available keys
    for (const meta of availableKeys) {
        try {
            meta.lastUsed = now;
            const result = await onCall(meta.key);

            // Success! Restore health if it was previously shaky
            meta.status = 'healthy';
            meta.retryAfter = 0;
            meta.failCount = 0;

            console.log(`[${provider}] ✅ Request successful using Key ...${meta.key.slice(-4)}`);
            return result;

        } catch (error: any) {
            const status = error.status || error.response?.status;
            const message = error.message?.toLowerCase() || "";

            // Log failure
            console.error(`[${provider}] ❌ Key ...${meta.key.slice(-4)} failed with status ${status}. Reason: ${message.substring(0, 100)}`);

            // Determine if error is a "rotate-able" error
            const isRateLimit = status === 429 || message.includes("429") || message.includes("too many requests");
            const isQuotaExceeded = message.includes("quota") || message.includes("limit exceeded");
            const isAuthError = status === 401 || status === 403 || message.includes("invalid") || message.includes("key");

            if (isRateLimit || isQuotaExceeded || isAuthError) {
                meta.failCount++;
                meta.status = isAuthError ? 'invalid' : (isQuotaExceeded ? 'exhausted' : 'rate-limited');

                // Dynamic Cooldown: 1 min per failure, max 1 hour
                const cooldownMinutes = isAuthError ? 1440 : (isQuotaExceeded ? 60 : Math.min(Math.pow(2, meta.failCount), 60));
                meta.retryAfter = now + (cooldownMinutes * 60 * 1000);

                lastError = error;
                continue; // Try next key
            } else {
                // Critical error (e.g. 400 Bad Request), don't retry
                throw error;
            }
        }
    }

    const finalError = new Error(`All project keys exhausted or rate-limited. Last error: ${lastError?.message}`);
    // @ts-ignore
    finalError.status = 429;
    throw finalError;
}

/**
 * Simple In-Memory Rate Limiter for Abuse Protection
 */
const ipRequests: Record<string, { count: number; lastReset: number }> = {};

export function checkRateLimit(id: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    if (!ipRequests[id] || (now - ipRequests[id].lastReset) > windowMs) {
        ipRequests[id] = { count: 1, lastReset: now };
        return true;
    }

    if (ipRequests[id].count >= limit) return false;

    ipRequests[id].count++;
    return true;
}
