import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

// --- 1. SMART KEY ROTATION LOGIC ---

const getKeys = (provider: string) => {
  const keys: string[] = [];
  const env = process.env;
  
  // Script ini akan mencari semua variasi nama variabel di .env kamu
  // Baik yang pakai NEXT_PUBLIC_ maupun tidak.
  const baseNames = [
    `${provider}_API_KEY`,                // cth: GEMINI_API_KEY
    `NEXT_PUBLIC_${provider}_API_KEY`     // cth: NEXT_PUBLIC_GEMINI_API_KEY (Format Kamu)
  ];

  baseNames.forEach(base => {
    // 1. Cek key tanpa angka (cth: NEXT_PUBLIC_GEMINI_API_KEY)
    if (env[base]) keys.push(env[base] as string);

    // 2. Cek key dengan angka 1 s/d 10 (cth: NEXT_PUBLIC_GEMINI_API_KEY_1)
    for (let i = 1; i <= 10; i++) {
      const keyWithSuffix = `${base}_${i}`;
      if (env[keyWithSuffix]) keys.push(env[keyWithSuffix] as string);
    }
  });

  // Hapus duplikat dan nilai kosong
  const uniqueKeys = Array.from(new Set(keys)).filter(Boolean);
  
  if (uniqueKeys.length === 0) {
    console.error(`[${provider}] No API keys found! Check your .env file.`);
  }

  return uniqueKeys;
};

// Fungsi eksekutor dengan Auto-Switch Key
async function executeWithRotation<T>(
  provider: "GEMINI" | "GROQ",
  callback: (apiKey: string) => Promise<T>
): Promise<T> {
  // Ambil key yang tersedia (Script ini sekarang bisa baca format key kamu)
  const keys = getKeys(provider);
  
  if (keys.length === 0) {
    throw new Error(`Tidak ada API Key ${provider} yang terbaca. Pastikan nama variabel di .env benar.`);
  }

  let lastError: any;

  // Coba satu per satu key yang ada
  for (const key of keys) {
    try {
      return await callback(key);
    } catch (error: any) {
      console.warn(`[${provider}] Key ...${key.slice(-4)} failed. Error: ${error.message}`);
      
      // Deteksi jika error karena kuota habis (429)
      const isQuotaError = 
        error.message?.includes("429") || 
        error.message?.includes("Quota exceeded") || 
        error.message?.includes("Resource has been exhausted") ||
        error.status === 429;

      if (isQuotaError) {
        lastError = error;
        continue; // Lanjut ke key berikutnya (Auto-Switch)
      } else {
        // Jika error lain (misal model tidak ditemukan), langsung stop
        throw error;
      }
    }
  }
  
  throw new Error(`Semua ${provider} API Key habis kuota (Limit). Last error: ${lastError?.message}`);
}

// --- 2. AI CLIENT WRAPPERS ---

async function callGemini(prompt: string, fileBase64: string | null, mimeType: string | null) {
  return executeWithRotation("GEMINI", async (apiKey) => {
    // URL Endpoint Gemini 2.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: prompt }];

    if (fileBase64 && mimeType) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: fileBase64
        }
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: {
            response_mime_type: "application/json" // Wajib JSON agar frontend tidak error
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || response.statusText;
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  });
}

async function callGroq(prompt: string) {
  return executeWithRotation("GROQ", async (apiKey) => {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    return completion.choices[0]?.message?.content || "";
  });
}

// --- 3. MAIN ROUTE HANDLER ---

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt") as string;
    const modelChoice = formData.get("model") as string; 
    const file = formData.get("file") as File | null;

    let finalResult = "";
    let fileBase64: string | null = null;
    let mimeType: string | null = null;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fileBase64 = buffer.toString("base64");
      mimeType = file.type;
    }

    // --- LOGIC ALUR (Relay vs Direct) ---
    if (modelChoice === "groq") {
      if (fileBase64) {
        // RELAY MODE: Gemini -> Groq
        // 1. Ekstrak teks dari PDF pakai Gemini (Gratis & Vision)
        const extractionPrompt = `
          Extract all text and context from this document accurately. 
          Return ONLY the raw text content. No markdown, no intro.
        `;
        
        // Pakai callGemini tapi kita handle jika dia return JSON
        const extractedRaw = await callGemini(extractionPrompt + " Output as JSON: { \"text\": \"...\" }", fileBase64, mimeType);
        
        let extractedText = "";
        try {
            const json = JSON.parse(extractedRaw);
            extractedText = json.text || json.content || extractedRaw;
        } catch (e) {
            extractedText = extractedRaw;
        }

        // 2. Analisa pakai Groq
        const groqPrompt = `
          CONTEXT FROM DOCUMENT: 
          ${extractedText.substring(0, 100000)} // Limit context agar tidak overflow

          USER REQUEST: 
          ${prompt}
        `;
        finalResult = await callGroq(groqPrompt);

      } else {
        // DIRECT GROQ (Text Only)
        finalResult = await callGroq(prompt);
      }
    } else {
      // DIRECT GEMINI
      finalResult = await callGemini(prompt, fileBase64, mimeType);
    }

    return NextResponse.json({ result: finalResult });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong in backend" },
      { status: 500 }
    );
  }
}