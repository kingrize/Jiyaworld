import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { executeOptimizedRequest, checkRateLimit } from "@/app/lib/api-utils";

/**
 * TranslateAI Route - Hardened & Optimized
 */

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";

    try {
        // Abuse Protection: Max 15 translations per minute per IP
        if (!checkRateLimit(ip, 15, 60000)) {
            return NextResponse.json({ error: "Too many translation requests. Relax a bit!" }, { status: 429 });
        }

        const body = await req.json();
        const { text, sourceLang, targetLang, tone, model } = body;
        const customKey = req.headers.get("x-custom-api-key");

        // Validation: Prevent empty or very short translations
        if (!text || text.trim().length < 2 || !targetLang) {
            return NextResponse.json({ error: "Input too short or missing fields" }, { status: 400 });
        }

        const toneInstructions = {
            "Native": "Translate this to sound completely natural and fluent, like a native speaker. Focus on capturing nuance and flow.",
            "Casual": "Translate this into a relaxed, everyday conversational tone. Chill and easy to read.",
            "Close Friend": "Translate this as if texting a very close friend. Informal, unpolished, and cool."
        };

        const selectedTone = toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions["Native"];
        const prompt = `Role: Expert Localizer. Task: Translate from ${sourceLang || "Auto-detect"} to ${targetLang}. Tone: ${selectedTone}. Return ONLY the translated text.\nOriginal: "${text.trim()}"`;

        const resultText = await executeOptimizedRequest(model === "groq" ? "GROQ" : "GEMINI", {
            customKey,
            onCall: async (apiKey) => {
                // Logging
                console.log(`[TranslateLog] [${new Date().toISOString()}] IP: ${ip.substring(0, 8)}... using Key: ...${apiKey.slice(-4)}`);

                if (model === "groq") {
                    const groq = new Groq({ apiKey });
                    const completion = await groq.chat.completions.create({
                        messages: [{ role: "user", content: prompt }],
                        model: "llama-3.3-70b-versatile",
                        temperature: 0.7,
                        max_tokens: 1000,
                    });
                    return completion.choices[0]?.message?.content || "";
                } else {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                    const response = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
                        }),
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        const error = new Error(data?.error?.message || "Service Error");
                        // @ts-ignore
                        error.status = response.status;
                        throw error;
                    }
                    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                }
            }
        });

        return NextResponse.json({ result: resultText });

    } catch (error: any) {
        console.error(`[TranslateLog] [${new Date().toISOString()}] Error for IP ${ip}: ${error.message}`);
        return NextResponse.json({ error: error.message || "Translation failed" }, { status: error.status || 500 });
    }
}
