import { NextRequest, NextResponse } from "next/server";

/**
 * StudyAI API Route
 * 
 * Analyzes study materials (PDF or text) and generates summaries + practice questions.
 * 
 * Required Environment Variables:
 * - GEMINI_API_KEY: Google Gemini API key (primary for PDF analysis)
 * - GROQ_API_KEY: Groq API key (for text-only mode or relay reasoning)
 * 
 * Supports multiple keys with rotation:
 * - GEMINI_API_KEY, GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
 * - GROQ_API_KEY, GROQ_API_KEY_1, GROQ_API_KEY_2, etc.
 * 
 * Flow Modes:
 * 1. GEMINI DIRECT: PDF/Text → Gemini (default for PDF)
 * 2. GROQ DIRECT: Text → Groq (if model=groq and no file)
 * 3. RELAY MODE: PDF → Gemini (extract) → Groq (reason) (if model=groq with file)
 */

/* ======================================================
   CONFIG & KEY LOADING
====================================================== */

const GEMINI_MODEL = "gemini-2.5-flash";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Groq token limits (llama-3.3-70b-versatile has ~128k context)
// We limit extracted text to prevent exceeding input limits
const MAX_EXTRACTED_TEXT_CHARS = 60000; // ~15k tokens, safe margin

/**
 * Load all GEMINI_API_KEY variants from environment.
 * Supports: GEMINI_API_KEY, GEMINI_API_KEY_1 through GEMINI_API_KEY_20
 * 
 * SECURITY: Do NOT use NEXT_PUBLIC_ prefix for these keys!
 * They should remain server-side only.
 */
function loadGeminiKeys(): string[] {
  const keys: string[] = [];
  const env = process.env;
  const base = "GEMINI_API_KEY";

  if (env[base]) keys.push(env[base] as string);
  for (let i = 1; i <= 20; i++) {
    const indexed = `${base}_${i}`;
    if (env[indexed]) keys.push(env[indexed] as string);
  }

  return Array.from(new Set(keys)).filter(Boolean);
}

/**
 * Load all GROQ_API_KEY variants from environment.
 * Supports: GROQ_API_KEY, GROQ_API_KEY_1 through GROQ_API_KEY_20
 * 
 * SECURITY: Do NOT use NEXT_PUBLIC_ prefix for these keys!
 * They should remain server-side only.
 */
function loadGroqKeys(): string[] {
  const keys: string[] = [];
  const env = process.env;
  const base = "GROQ_API_KEY";

  if (env[base]) keys.push(env[base] as string);
  for (let i = 1; i <= 20; i++) {
    const indexed = `${base}_${i}`;
    if (env[indexed]) keys.push(env[indexed] as string);
  }

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

  // Build the parts array for the request
  const parts: any[] = [{ text: prompt }];

  if (fileUri) {
    // For PDF files uploaded via Files API, reference by URI
    parts.push({ fileData: { mimeType: "application/pdf", fileUri } });
  } else if (fileBuffer && mimeType && mimeType !== "application/pdf") {
    // For other file types (images, etc.), use inline base64
    parts.push({ inlineData: { mimeType, data: fileBuffer.toString("base64") } });
  }

  // Generation config - removed responseMimeType to avoid "invalid argument" errors
  // JSON formatting is enforced via the prompt instead
  const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 4096  // Increased for detailed study material analysis
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts }],  // Simplified structure matching /translate-ai
    generationConfig
  };

  console.log("[StudyAI-Gemini] Request structure:", {
    model: GEMINI_MODEL,
    partsCount: parts.length,
    hasFileData: !!fileUri,
    hasInlineData: !!(!fileUri && fileBuffer),
    promptLength: prompt.length
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[StudyAI-Gemini] API Error:", data.error);
    throw { status: response.status, message: data.error?.message || "Gemini Failed" };
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroq(prompt: string, apiKey: string) {
  console.log("[StudyAI-Groq] Sending request, prompt length:", prompt.length);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096  // Explicit limit for response
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[StudyAI-Groq] API Error:", data.error);
    throw { status: response.status, message: data.error?.message || "Groq Failed" };
  }

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
        // Step 1: Extract text from PDF using Gemini Vision
        const extractionPrompt = "Extract all text and context from this document accurately. Return only the raw text content, no formatting or markdown.";
        let extractedText = await executeWithRotation("GEMINI", customKey, k => callGemini(extractionPrompt, fileBuffer, mimeType, k));

        // Validate and sanitize Gemini output
        if (!extractedText || typeof extractedText !== 'string') {
          console.error("[StudyAI-Relay] Gemini returned empty or invalid response");
          throw new Error("Failed to extract text from document. Please try again.");
        }

        // Trim whitespace and normalize
        extractedText = extractedText.trim();

        if (extractedText.length === 0) {
          throw new Error("Document appears to be empty or unreadable.");
        }

        console.log("[StudyAI-Relay] Gemini extracted text length:", extractedText.length);

        // Truncate if exceeds Groq's safe input limit
        if (extractedText.length > MAX_EXTRACTED_TEXT_CHARS) {
          console.warn(`[StudyAI-Relay] Truncating extracted text from ${extractedText.length} to ${MAX_EXTRACTED_TEXT_CHARS} chars`);
          extractedText = extractedText.substring(0, MAX_EXTRACTED_TEXT_CHARS) + "\n\n[Content truncated due to length...]";
        }

        // Step 2: Pass cleaned text to Groq for reasoning
        const groqPrompt = `STUDY MATERIAL:\n${extractedText}\n\n---\n\nUSER REQUEST:\n${prompt}`;
        console.log("[StudyAI-Relay] Sending to Groq, total prompt length:", groqPrompt.length);

        result = await executeWithRotation("GROQ", customKey, k => callGroq(groqPrompt, k));
      } else {
        // No file provided, but relay selected? Fallback to Groq direct
        console.log("[StudyAI-Relay] No file, falling back to direct Groq");
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
