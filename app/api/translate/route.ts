import { NextResponse } from "next/server";

// Load all available API keys
const API_KEYS = [
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_1,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY,
].filter((key): key is string => Boolean(key));

let currentKeyIndex = 0;

function getNextApiKey(): string | null {
    if (API_KEYS.length === 0) return null;
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGeminiAPI(
    prompt: string,
    maxRetries: number = API_KEYS.length * 2
): Promise<{ success: boolean; text?: string; error?: string; status?: number }> {

    let attempts = 0;
    let lastError = "";
    let lastStatus = 500;

    while (attempts < maxRetries) {
        const apiKey = getNextApiKey();
        if (!apiKey) return { success: false, error: "No API keys configured", status: 500 };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: 1000,
                        temperature: 0.7,
                    },
                }),
            });

            const rawText = await response.text();
            let data: any;
            try {
                data = rawText ? JSON.parse(rawText) : {};
            } catch {
                attempts++;
                continue;
            }

            if (response.ok) {
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                return { success: true, text };
            }

            if (response.status === 429) {
                if (attempts < maxRetries - 1) await delay(300);
                attempts++;
                continue;
            }

            lastError = data?.error?.message || `API error: ${response.status}`;
            lastStatus = response.status;
            attempts++;

        } catch (err: any) {
            lastError = "Network error";
            attempts++;
        }
    }

    return { success: false, error: lastError, status: lastStatus };
}

export async function POST(req: Request) {
    try {
        const { text, sourceLang, targetLang, tone } = await req.json();

        if (!text || !targetLang) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const toneInstructions = {
            "Native": "Translate this to sound completely natural and fluent, like a native speaker. Avoid stiff, robotic, or overly literal phrasing. Focus on capturing the nuance and flow.",
            "Casual": "Translate this into a relaxed, everyday conversational tone. Use common idioms or phrasings that ordinary people use in daily life. It should be easy to read and sound chill.",
            "Close Friend": "Translate this as if texting a very close friend. It should be very informal, unpolished, and can include slang, abbreviations, or mild profanity if it fits the emphasis (but don't force it). It should basically sound like 'Bestie' or 'Bro' talk."
        };

        const selectedTone = toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions["Native"];

        const prompt = `
      Role: Expert Translator/Localizer.
      Task: Translate the following text from ${sourceLang || "Auto-detect"} to ${targetLang}.
      
      Tone/Style Instruction: ${selectedTone}
      
      Important Rules:
      1. Do NOT explain the translation.
      2. Do NOT add notes like "Here is the translation:".
      3. Return ONLY the translated text.
      4. Maintain the original meaning but prioritize the requested TONE.
      
      Original Text:
      "${text}"
    `;

        const result = await callGeminiAPI(prompt);

        if (!result.success) {
            return NextResponse.json({ error: result.error || "Translation failed" }, { status: result.status || 500 });
        }

        return NextResponse.json({ result: result.text });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
