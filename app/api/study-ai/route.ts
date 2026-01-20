import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";
import { executeOptimizedRequest, checkRateLimit } from "@/app/lib/api-utils";

/**
 * StudyAI Route - Hardened & Optimized
 */

async function callGemini(prompt: string, fileBase64: string | null, mimeType: string | null, customKey?: string | null) {
  return executeOptimizedRequest("GEMINI", {
    customKey,
    onCall: async (apiKey) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const parts: any[] = [{ text: prompt }];

      if (fileBase64 && mimeType) {
        parts.push({
          inline_data: { mime_type: mimeType, data: fileBase64 }
        });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { response_mime_type: "application/json", temperature: 0.7, maxOutputTokens: 2048 }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.error?.message || "Gemini Error");
        // @ts-ignore
        error.status = response.status;
        throw error;
      }

      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
  });
}

async function callGroq(prompt: string, customKey?: string | null) {
  return executeOptimizedRequest("GROQ", {
    customKey,
    onCall: async (apiKey) => {
      const groq = new Groq({ apiKey });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });
      return completion.choices[0]?.message?.content || "";
    }
  });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";

  try {
    // Abuse Protection: Max 8 study requests per minute per IP (heavy processing)
    if (!checkRateLimit(ip, 8, 60000)) {
      return NextResponse.json({ error: "Please slow down and focus on your study material!" }, { status: 429 });
    }

    const formData = await req.formData();
    const prompt = (formData.get("prompt") as string || "").trim();
    const modelChoice = formData.get("model") as string;
    const file = formData.get("file") as File | null;
    const customKey = req.headers.get("x-custom-api-key");

    if (prompt.length < 5 && !file) {
      return NextResponse.json({ error: "Please provide a more detailed question or upload a document." }, { status: 400 });
    }

    let finalResult = "";
    let fileBase64: string | null = null;
    let mimeType: string | null = null;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fileBase64 = buffer.toString("base64");
      mimeType = file.type;
    }

    if (modelChoice === "groq") {
      if (fileBase64) {
        // RELAY MODE: Gemini -> Groq
        const extractionPrompt = `Extract all text and context. Return ONLY as JSON: { "text": "..." }`;
        const extractedRaw = await callGemini(extractionPrompt, fileBase64, mimeType, customKey);

        let extractedText = "";
        try {
          const json = JSON.parse(extractedRaw);
          extractedText = json.text || json.content || extractedRaw;
        } catch { extractedText = extractedRaw; }

        const groqPrompt = `CONTEXT: ${extractedText.substring(0, 80000)}\nREQUEST: ${prompt}`;
        finalResult = await callGroq(groqPrompt, customKey);
      } else {
        finalResult = await callGroq(prompt, customKey);
      }
    } else {
      finalResult = await callGemini(prompt, fileBase64, mimeType, customKey);
    }

    return NextResponse.json({ result: finalResult });

  } catch (error: any) {
    console.error(`[StudyLog] [${new Date().toISOString()}] Error for IP ${ip}: ${error.message}`);
    return NextResponse.json({ error: error.message || "Study request failed" }, { status: error.status || 500 });
  }
}