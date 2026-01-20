import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { JIYA_SYSTEM_PROMPT } from "@/app/lib/jiya-context";
import { executeOptimizedRequest, checkRateLimit } from "@/app/lib/api-utils";

/**
 * Chat API Route - Switched to Groq for speed and consistency
 */

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";

  try {
    // --- Abuse Protection ---
    if (!checkRateLimit(ip, 10, 60000)) {
      return NextResponse.json(
        { error: "Whoa there! You're moving a bit fast. Please wait a minute." },
        { status: 429 }
      );
    }

    let body: ChatRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const { message, history } = body;
    const cleanMessage = (message || "").trim();

    if (!cleanMessage || cleanMessage.length < 5) {
      return NextResponse.json(
        { error: "Message is too short or empty." },
        { status: 400 }
      );
    }

    const customKey = req.headers.get("x-custom-api-key");

    // --- Map History from Gemini format to Groq/OpenAI format ---
    // Gemini: { role: 'user' | 'model', parts: [{ text: '...' }] }
    // Groq:   { role: 'user' | 'assistant' | 'system', content: '...' }

    const messages: any[] = [
      { role: "system", content: JIYA_SYSTEM_PROMPT }
    ];

    if (Array.isArray(history)) {
      history.forEach(msg => {
        messages.push({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.parts[0]?.text || ""
        });
      });
    }

    // Add current user message
    messages.push({ role: "user", content: cleanMessage });

    // --- Execute Optimized Groq Request ---
    const responseText = await executeOptimizedRequest("GROQ", {
      customKey,
      onCall: async (apiKey) => {
        console.log(`[ChatLog] [${new Date().toISOString()}] IP: ${ip.substring(0, 8)}... using Groq Key: ...${apiKey.slice(-4)}`);

        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
          messages: messages,
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 1024,
        });

        const text = completion.choices[0]?.message?.content;

        if (!text) {
          throw new Error("Groq returned empty response");
        }

        return text;
      }
    });

    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    const status = error.status || 500;
    console.error(`[ChatLog] Error for IP ${ip}: ${error.message}`);

    let userMessage = "Kira is currently resting. Please try again soon!";
    if (status === 429) {
      userMessage = "I'm a bit busy at the moment. Please wait a minute!";
    }

    return NextResponse.json(
      { error: error.message || userMessage },
      { status: status }
    );
  }
}