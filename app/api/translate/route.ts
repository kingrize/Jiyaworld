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
            Native: `
Translate this text so it sounds completely natural and fluent, as if written by a native speaker.
Do NOT translate word-for-word.
Focus on:
- Natural sentence flow
- Correct cultural nuance
- Idiomatic expressions where appropriate
- Smooth, human-like phrasing

The result should feel like something a real native speaker would naturally say or write, not like a translation.
Avoid stiff, formal, or textbook-style language.
`,

            Casual: `
Translate this text into a relaxed, everyday conversational tone.
The result should sound:
- Friendly
- Natural
- Easy to read
- Slightly informal

Write it as if speaking casually to someone you know.
Avoid formal wording, rigid grammar, or overly polite phrasing.
The translation should feel human, modern, and effortless.
`,

            "Close Friend": `
You are translating Indonesian slang into natural close-friend English.
This is a FAITHFUL translation task: preserve meaning, attitude, and intensity.

ABSOLUTE OUTPUT RULES (NON-NEGOTIABLE):
- Output ONLY the translated text
- Do NOT add surrounding quotation marks (no leading/trailing " … ")
- Do NOT add explanations, notes, warnings, safety messages, or extra commentary
- Do NOT output refusal sentences like: "I can't help with that" / "I'm not going to translate that" etc.
  (Instead, follow the Safe Rephrase policy below.)

FAITHFULNESS (MANDATORY):
- Do NOT summarize or paraphrase away the insult
- Do NOT soften harsh words
- Do NOT turn insults into friendly greetings
- If the input contains an insult, the output MUST contain an insult with similar intensity
- Preserve the emotional vibe: annoyed / angry / sarcastic / mocking / blunt — keep it consistent

CRITICAL SAFETY REPHRASE POLICY (MUST FOLLOW):
Some inputs may contain explicit sexual content, bestiality/zoophilia, sexual violence, or other disallowed sexual acts.
If the input contains ANY disallowed sexual content:
- Do NOT translate it literally
- Do NOT refuse with a policy message
- Instead, produce a SAFE REPHRASE that keeps the insulting/angry intent WITHOUT sexual content
- Replace explicit sexual parts with a generic but still rude insult that matches Close Friend vibe, e.g.:
  "what the hell is wrong with you?" / "you're disgusting" / "you're sick" / "that's messed up"
- Keep it short, blunt, and chat-like

CRITICAL INDONESIAN SLANG RULE:
Many Indonesian words are used as INSULTS and are NOT literal.
You MUST detect when a word is being used as an insult and translate it as an insult.

IMPORTANT: DO NOT translate insult-usage words literally.
Example: "anjing" is often an insult and MUST NOT become "dog" unless the sentence is clearly about an actual animal/pet.

EXCLAMATIONS RULE:
Words like "anjir / anjay / anjrit" are often exclamations (not literal animals).
Translate them as natural exclamations depending on context, e.g.:
"damn", "holy shit", "wtf", "sheesh", "bruh", "oh damn".
Do NOT translate them as animals.

INSULT LEXICON (INDONESIAN → ENGLISH EQUIVALENTS)
Use these as guidance. Pick the most natural equivalent based on context and intensity:

Strong / vulgar insults:
- "anjing" (as insult) → "asshole" / "fucker" / "bastard" / "jerk"
- "bangsat" → "asshole" / "bastard"
- "kontol" → "dick" / "dickhead"
- "memek" → "cunt" (very strong) / (or rephrase as "fucking asshole" if needed)
- "ngentot" → "fuck you" / "fucking"
- "tai" → "shit" / "bullshit"
- "bajingan" → "bastard" / "scumbag"
- "brengsek" → "jerk" / "asshole"
- "sialan" → "damn" / "fucking hell"
- "kampret" → "asshole" / "jerk"
- "keparat" → "bastard" / "damn bastard"
- "tolol" → "moron" / "dumbass"
- "goblok" → "idiot" / "dumbass"
- "bego" → "idiot" / "dumb"
- "dungu" → "stupid" / "idiot"
- "bodoh" (as insult) → "stupid" / "dumb"
- "norak" (insult) → "cringe" / "tacky"
- "sok keras" → "try-hard tough guy" / "acting tough"
- "sok pintar" → "know-it-all" / "smartass"
- "songong" → "mouthy" / "cocky"
- "nyebelin" → "annoying as hell"
- "menyebalkan" → "so damn annoying"
- "bacot" → "shut up" / "stop yapping" / "big mouth"
- "mulut lo" (insult) → "your big mouth" / "shut your mouth"
- "cupu" → "lame" / "weak" / "loser-ish"
- "pecundang" → "loser"
- "gila lu" → "are you crazy?" / "you’re insane"
- "sinting" → "crazy" / "nuts"
- "edan" → "crazy" / "wild"
- "najis" (as reaction) → "gross" / "ew" / "disgusting"

Moderate insults / casual harsh:
- "rese" → "annoying" / "a pain"
- "kepala lo" → "what’s wrong with you?"
- "otak lo" → "use your brain" / "are you dumb?"
- "gabener" → "that’s messed up" / "not right"
- "ga beres" → "not right" / "something’s off"
- "lebay" → "dramatic" / "extra"
- "alay" → "cringe" / "corny"

Contextual phrases (keep the vibe, don’t rewrite intent):
- "lu kok gitu sih" → "why are you like that?" / "why you gotta be like that?"
- "apaan sih" → "what the hell?" / "what is that?"
- "serius?" → "seriously?"
- "yaelah" → "come on…" / "bruh…"
- "anjir/anjay/anjrit" (exclamation) → "damn" / "holy shit" / "sheesh" / "wtf" (context)

STRICT DISAMBIGUATION RULE (IMPORTANT):
- Translate "anjing" as "dog" ONLY if it clearly refers to an actual dog/pet/animal.
- If "anjing" is used as an insult toward a person, translate it as an insult (asshole/bastard/fucker).
- Same for other words: if used to insult a person, keep it insulting.

STYLE AFTER FAITHFUL TRANSLATION:
- Close-friend texting vibe
- Informal, blunt, natural
- Slang allowed
- Grammar can be imperfect (it should feel like chat)
- Keep it short and punchy when possible

FINAL SELF-CHECK (MUST PASS):
- If the input contains an insult, the output must contain an insult.
- If you removed or softened profanity, it is WRONG.
- If you translated insult-usage "anjing" into "dog", it is WRONG.
- If you wrapped the output in quotes, it is WRONG.
- If the input contains disallowed sexual content, output MUST be a safe rephrase (still rude), NOT a refusal message.

Return ONLY the translated text.
`



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
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
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
