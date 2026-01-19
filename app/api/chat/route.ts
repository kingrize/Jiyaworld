import { NextResponse } from "next/server";

// Types for better type safety
interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json();
    const { message, history } = body;

    // Validate input
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Get API Key (check multiple fallback keys)
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY_1 ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY_2 ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY_3;

    if (!apiKey) {
      console.error("No Gemini API key found in environment variables");
      return NextResponse.json(
        { error: "API Key not configured. Please set GEMINI_API_KEY in .env" },
        { status: 500 }
      );
    }

    // Gemini API endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Build the conversation contents
    const userContent: ChatMessage = {
      role: "user",
      parts: [{ text: message.trim() }]
    };

    // Combine history with new message
    const contents: ChatMessage[] = Array.isArray(history)
      ? [...history, userContent]
      : [userContent];

    // Make request to Gemini API
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{
            text: `You are J.ai, a helpful, friendly, and chill AI assistant for Jiyaworld - a personal portfolio and creative space. 
            
Key traits:
- Be concise but helpful (aim for 1-3 sentences unless more detail is needed)
- Be friendly and approachable, use casual language
- Use emojis sparingly to add personality 🎨
- If asked about Jiya/the site owner, you can say you're their AI assistant
- For technical questions, be accurate and helpful
- Keep responses focused and avoid unnecessary filler`
          }]
        },
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
          topP: 0.9,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ]
      }),
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      // Provide specific error messages
      if (response.status === 400) {
        return NextResponse.json(
          { error: "Invalid request to AI service" },
          { status: 400 }
        );
      } else if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "API Key is invalid or expired" },
          { status: 500 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: errorData.error?.message || "Failed to get AI response" },
          { status: response.status }
        );
      }
    }

    const data = await response.json();

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text in Gemini response:", data);

      // Check if response was blocked by safety filters
      if (data.candidates?.[0]?.finishReason === "SAFETY") {
        return NextResponse.json({
          text: "I can't respond to that. Let's talk about something else! 😊"
        });
      }

      return NextResponse.json(
        { error: "No response generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Server Error:", error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}