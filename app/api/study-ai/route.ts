import { NextRequest, NextResponse } from "next/server";

/* ======================================================
   CONFIG & KEY LOADING
====================================================== */

const GEMINI_MODEL = "gemini-2.5-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function loadGeminiKeys(): string[] {
  const keys: string[] = [];
  const env = process.env;
  const patterns = ["GEMINI_API_KEY", "NEXT_PUBLIC_GEMINI_API_KEY"];
  patterns.forEach(base => {
    if (env[base]) keys.push(env[base] as string);
    for (let i = 1; i <= 20; i++) {
      const indexed = `${base}_${i}`;
      if (env[indexed]) keys.push(env[indexed] as string);
    }
  });
  return Array.from(new Set(keys)).filter(Boolean);
}

function loadGroqKeys(): string[] {
  const keys: string[] = [];
  const env = process.env;
  const patterns = ["GROQ_API_KEY", "NEXT_PUBLIC_GROQ_API_KEY"];
  patterns.forEach(base => {
    if (env[base]) keys.push(env[base] as string);
    for (let i = 1; i <= 20; i++) {
      const indexed = `${base}_${i}`;
      if (env[indexed]) keys.push(env[indexed] as string);
    }
  });
  return Array.from(new Set(keys)).filter(Boolean);
}

const ALL_GEMINI_KEYS = loadGeminiKeys();
const ALL_GROQ_KEYS = loadGroqKeys();

console.log(`[StudyAI-Init] Gemini Keys: ${ALL_GEMINI_KEYS.length}, Groq Keys: ${ALL_GROQ_KEYS.length}`);

/* ======================================================
   GEMINI FILES API HELPERS
====================================================== */

async function uploadToGeminiFilesAPI(fileBuffer: Buffer, fileName: string, mimeType: string, apiKey: string) {
  const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Protocol": "raw",
      "X-Goog-Upload-File-Name": fileName,
      "Content-Type": mimeType,
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!response.ok) {
    const err = await response.json();
    throw { status: response.status, message: err.error?.message || "Upload Failed" };
  }

  const data = await response.json();
  const fileUri = data.file.uri;
  const resourceName = data.file.name;

  let state = data.file.state;
  let attempts = 0;
  while (state === "PROCESSING") {
    attempts++;
    if (attempts > 30) throw new Error("Gemini File Processing Timeout");
    await new Promise(r => setTimeout(r, 2000));
    const pollRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${resourceName}?key=${apiKey}`);
    const pollData = await pollRes.json();
    state = pollData.state;
    if (state === "FAILED") throw new Error("Gemini failed to process this file.");
  }
  return fileUri;
}

/* ======================================================
   AI PROVIDER CALLERS
====================================================== */

async function callGemini(prompt: string, fileBuffer: Buffer | null, mimeType: string | null, apiKey: string) {
  let fileUri = null;
  if (fileBuffer && mimeType === "application/pdf") {
    fileUri = await uploadToGeminiFilesAPI(fileBuffer, "study_doc.pdf", mimeType, apiKey);
  }

  const generationConfig = { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 2048 };
  const contentsPart: any[] = [{ text: prompt }];

  if (fileUri) {
    contentsPart.push({ fileData: { mimeType: "application/pdf", fileUri } });
  } else if (fileBuffer && mimeType !== "application/pdf") {
    contentsPart.push({ inlineData: { mimeType, data: fileBuffer.toString("base64") } });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: contentsPart }], generationConfig })
  });

  const data = await response.json();
  if (!response.ok) throw { status: response.status, message: data.error?.message || "Gemini Failed" };
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(prompt: string, apiKey: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });
  const data = await response.json();
  if (!response.ok) throw { status: response.status, message: data.error?.message || "Groq Failed" };
  return data.choices?.[0]?.message?.content || "";
}

/* ======================================================
   ROTATION WRAPPER
====================================================== */

async function executeWithRotation<T>(
  provider: "GEMINI" | "GROQ",
  customKey: string | null | undefined,
  onCall: (key: string) => Promise<T>
): Promise<T> {
  if (customKey && customKey.trim().length > 20) return await onCall(customKey);
  const keys = provider === "GEMINI" ? ALL_GEMINI_KEYS : ALL_GROQ_KEYS;
  if (keys.length === 0) throw new Error(`No ${provider} API keys found.`);

  let lastError: any = null;
  for (let i = 0; i < keys.length; i++) {
    try {
      return await onCall(keys[i]);
    } catch (err: any) {
      lastError = err;
      if (err.status === 429 || err.status === 403 || err.status === 400) continue;
      throw err;
    }
  }
  throw lastError;
}

/* ======================================================
   POST HANDLER
====================================================== */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // 1. EXTRACT ALL POSSIBLE FIELDS (Robustness)
    const rawModel = (formData.get("model") as string || "").toLowerCase();
    const rawProvider = (formData.get("provider") as string || "").toLowerCase();
    const rawMode = (formData.get("mode") as string || "").toLowerCase();
    const rawRelay = (formData.get("relay") as string || "").toLowerCase();
    const customKey = formData.get("apiKey") as string | null;
    const file = formData.get("file") as File | null;
    const prompt = (formData.get("prompt") as string || "").trim();

    // 2. LOG PARSED VALUES (Debugging)
    console.log("[StudyAI-Debug] Received Fields:", {
      model: rawModel,
      provider: rawProvider,
      mode: rawMode,
      relay: rawRelay,
      hasFile: !!file,
      promptLength: prompt.length
    });

    if (!prompt && !file) return NextResponse.json({ success: false, error: "Input required" }, { status: 400 });

    // 3. DETERMINISTIC ROUTING LOGIC (Ensure Relay takes priority)
    // Relay is active if ANY field mentions it, or if it's Groq + File
    const isRelayMode =
      rawModel.includes("relay") ||
      rawProvider.includes("relay") ||
      rawMode.includes("relay") ||
      rawRelay === "true" || rawRelay === "1" ||
      (rawModel.includes("groq") && !!file);

    const isGroqDirect = !isRelayMode && (rawModel.includes("groq") || rawProvider.includes("groq"));

    let result = "";
    if (isRelayMode) {
      console.log("[StudyAI-Flow] Path Chosen: RELAY (Gemini -> Groq)");
      const fileBuffer = file ? Buffer.from(await file.arrayBuffer()) : null;
      const mimeType = file?.type || null;

      if (fileBuffer) {
        const extractionPrompt = "Extract all text and context from this document accurately. Return only the raw text.";
        const extractedText = await executeWithRotation("GEMINI", customKey, k => callGemini(extractionPrompt, fileBuffer, mimeType, k));
        const groqPrompt = `MATERIAL:\n${extractedText}\n\nUSER QUESTION:\n${prompt}`;
        result = await executeWithRotation("GROQ", customKey, k => callGroq(groqPrompt, k));
      } else {
        // No file provided, but relay selected? Fallback to Groq direct
        result = await executeWithRotation("GROQ", customKey, k => callGroq(prompt, k));
      }
    } else if (isGroqDirect) {
      console.log("[StudyAI-Flow] Path Chosen: GROQ DIRECT");
      result = await executeWithRotation("GROQ", customKey, k => callGroq(prompt, k));
    } else {
      console.log("[StudyAI-Flow] Path Chosen: GEMINI DIRECT");
      const fileBuffer = file ? Buffer.from(await file.arrayBuffer()) : null;
      const mimeType = file?.type || null;
      result = await executeWithRotation("GEMINI", customKey, k => callGemini(prompt, fileBuffer, mimeType, k));
    }

    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    console.error("[StudyAI-Error]", error);
    return NextResponse.json({ success: false, error: error.message || "Server Error" }, { status: error.status || 500 });
  }
}
