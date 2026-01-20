import { NextResponse } from "next/server";
import { JIYA_SYSTEM_PROMPT } from "@/app/lib/jiya-context";

// Types
interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

// Load all available API keys
const API_KEYS = [
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_1,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY,
].filter((key): key is string => Boolean(key));

// Track current key index for rotation
let currentKeyIndex = 0;

// Get the next API key (round-robin rotation)
function getNextApiKey(): string | null {
  if (API_KEYS.length === 0) return null;

  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

// Delay helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Call Gemini API with key rotation and retry
async function callGeminiAPI(
  contents: ChatMessage[],
  maxRetries: number = API_KEYS.length * 2 // Try each key twice
): Promise<{ success: boolean; data?: any; error?: string; status?: number }> {

  const startKeyIndex = currentKeyIndex;
  let attempts = 0;
  let lastError = "";
  let lastStatus = 500;

  while (attempts < maxRetries) {
    const apiKey = getNextApiKey();

    if (!apiKey) {
      return { success: false, error: "No API keys configured", status: 500 };
    }

    const keyNum = API_KEYS.indexOf(apiKey) + 1;
    console.log(`🔑 Attempt ${attempts + 1}/${maxRetries} using Key #${keyNum}`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [{
              text: JIYA_SYSTEM_PROMPT
            }]
          },
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        }),
      });

      const rawText = await response.text();
      let data: any;

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        console.error("❌ Non-JSON response:", rawText.substring(0, 100));
        lastError = "Invalid response from AI service";
        lastStatus = 502;
        attempts++;
        continue;
      }

      // Success!
      if (response.ok) {
        console.log(`✅ Success with Key #${keyNum}`);
        return { success: true, data };
      }

      // Rate limited - try next key
      if (response.status === 429) {
        console.log(`⏳ Key #${keyNum} rate limited, trying next key...`);
        lastError = "Rate limit exceeded";
        lastStatus = 429;

        // Small delay before trying next key
        if (attempts < maxRetries - 1) {
          await delay(300);
        }

        attempts++;
        continue;
      }

      // Other error
      lastError = data?.error?.message || `API error: ${response.status}`;
      lastStatus = response.status;
      console.error(`❌ Key #${keyNum} error:`, lastError);

      // For non-rate-limit errors, don't retry with other keys
      if (response.status === 401 || response.status === 403) {
        attempts++;
        continue; // Try next key - this one might be invalid
      }

      // For 400 errors (bad request), don't retry
      if (response.status === 400) {
        return { success: false, error: lastError, status: 400 };
      }

      attempts++;

    } catch (fetchError: any) {
      console.error(`❌ Fetch error with Key #${keyNum}:`, fetchError.message);
      lastError = "Network error";
      lastStatus = 503;
      attempts++;
    }
  }

  // All retries exhausted
  console.error(`❌ All ${maxRetries} attempts failed`);
  return { success: false, error: lastError, status: lastStatus };
}

export async function POST(req: Request) {
  try {
    // 1. Parse Request
    let body: ChatRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request" },
        { status: 400 }
      );
    }

    const { message, history } = body;

    // Validate
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if we have any API keys
    if (API_KEYS.length === 0) {
      console.error("❌ No API keys found in environment");
      return NextResponse.json(
        { error: "Server configuration error: No API keys" },
        { status: 500 }
      );
    }

    console.log(`📤 Chat request received. Available keys: ${API_KEYS.length}`);

    // 2. Build contents
    const userContent: ChatMessage = {
      role: "user",
      parts: [{ text: message.trim() }]
    };

    const safeHistory: ChatMessage[] = Array.isArray(history) ? history : [];
    const contents: ChatMessage[] = [...safeHistory, userContent];

    // 3. Call API with rotation
    const result = await callGeminiAPI(contents);

    if (!result.success) {
      // Provide user-friendly error messages
      let userMessage = result.error || "Failed to get response";

      if (result.status === 429) {
        userMessage = "Too many requests. Please wait a moment and try again.";
      } else if (result.status === 401 || result.status === 403) {
        userMessage = "API authentication issue. Please contact administrator.";
      }

      return NextResponse.json(
        { error: userMessage },
        { status: result.status || 500 }
      );
    }

    // 4. Extract response text
    const responseText = result.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      const finishReason = result.data?.candidates?.[0]?.finishReason;
      if (finishReason === "SAFETY") {
        return NextResponse.json({
          text: "I can't respond to that. Let's talk about something else! 😊"
        });
      }
      return NextResponse.json(
        { error: "No response generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("❌ Server error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}