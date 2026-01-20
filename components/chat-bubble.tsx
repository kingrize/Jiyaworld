"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, MessageCircle, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Interface for consistent message data
interface Message {
  role: "user" | "model";
  text: string;
}

// Minimum delay between requests (1.5 seconds)
const MIN_REQUEST_DELAY = 1500;

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hey there! 👋 I'm **Kira**, your friendly assistant. How can I help you navigate Jiyaworld today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [lastSendTime, setLastSendTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    "What is Jiyaworld?",
    "Show me the tools",
    "Who is Jiya?",
    "Tell me a joke"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();

    // Use override if provided (for suggestions), otherwise use input state
    const textToSend = textOverride || input.trim();

    if (!textToSend || loading) return;

    // Throttle: Check if enough time has passed since last request
    const now = Date.now();
    const timeSinceLastSend = now - lastSendTime;

    if (timeSinceLastSend < MIN_REQUEST_DELAY && lastSendTime > 0) {
      const waitTime = Math.ceil((MIN_REQUEST_DELAY - timeSinceLastSend) / 1000);
      setMessages((prev) => [...prev, {
        role: "model",
        text: `⏳ Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before sending another message.`
      }]);
      return;
    }

    setInput("");
    setLastSendTime(now);

    // 1. Add user message to UI immediately
    const newMessage: Message = { role: "user", text: textToSend };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // 2. Prepare History for Backend
      // Skip the initial greeting and the current message (sent separately)
      // We take the last 10 messages for context
      const historyMessages = updatedMessages.slice(1, -1).slice(-10);

      const historyForBackend = historyMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      // Inject context if this is the start of a conversation to ensure AI knows the site purpose
      if (historyForBackend.length === 0) {
        historyForBackend.push({
          role: "user",
          // @ts-ignore - The API expects parts but we construct it carefully. Actually 'parts' is correct.
          parts: [{ text: "Context: The user is visiting Jiyaworld, a portfolio website by Jiya featuring AI tools like TranslateAI and StudyAI. You are Kira, the assistant helped to guide them." }]
        });
        historyForBackend.push({
          role: "model",
          // @ts-ignore
          parts: [{ text: "Understood. I am ready to help the user navigate Jiyaworld." }]
        });
      }

      // 3. Send to API Route
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyForBackend
        }),
      });

      // 4. Safely parse response
      let data: any;
      try {
        const rawText = await res.text();
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }

      // 5. Check for errors
      if (!res.ok) {
        console.error("API Error:", res.status, data);
        const errorMsg = data?.error || `Request failed with status ${res.status}`;
        throw new Error(errorMsg);
      }

      // 6. Add AI response to UI
      if (data.text) {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      } else {
        throw new Error("No response text from AI");
      }

    } catch (error: any) {
      console.error("Chat Error:", error);

      // Determine user-friendly error message
      let errorMessage = "Oops! Something went wrong. Please try again. 🔄";
      const errMsg = error.message?.toLowerCase() || "";

      if (errMsg.includes("api key") || errMsg.includes("authentication") || errMsg.includes("config")) {
        errorMessage = "⚠️ System configuration issue. Please try again later.";
      } else if (errMsg.includes("rate") || errMsg.includes("too many") || errMsg.includes("wait")) {
        errorMessage = "⏱️ Too many requests. Please wait a moment and try again.";
      } else if (errMsg.includes("network") || errMsg.includes("fetch") || errMsg.includes("failed to fetch")) {
        errorMessage = "📡 Connection issue. Please check your internet and try again.";
      } else if (error.message && error.message !== "Failed to get response") {
        errorMessage = `❌ ${error.message}`;
      }

      setMessages((prev) => [...prev, { role: "model", text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "1rem",
        fontFamily: "var(--main-font), sans-serif",
      }}>

        {/* CHAT WINDOW */}
        <div style={{
          width: "min(380px, calc(100vw - 3rem))",
          height: "min(600px, calc(100vh - 100px))",
          background: "var(--background-one)",
          borderRadius: "24px",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border)",
          display: isOpen ? "flex" : "none",
          flexDirection: "column",
          overflow: "hidden",
          transformOrigin: "bottom right",
          animation: isOpen ? "chatSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
          border: "1px solid var(--border)",
        }}>

          {/* Header */}
          <div style={{
            padding: "1rem 1.25rem",
            background: "rgba(var(--surface-three), 0.8)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}>
                  <Bot size={22} color="var(--background-one)" strokeWidth={2.5} />
                </div>
                <div style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: "12px",
                  height: "12px",
                  background: "#22c55e",
                  borderRadius: "50%",
                  border: "2px solid var(--surface-three)",
                }}></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "var(--text-one)",
                  margin: 0,
                  lineHeight: 1.2,
                }}>Kira</h3>
                <span style={{
                  fontSize: "0.75rem",
                  color: "var(--text-four)",
                  fontWeight: "500",
                }}>
                  Always here to help
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                border: "none",
                background: "var(--surface-four)",
                color: "var(--text-four)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--red-one)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface-four)";
                e.currentTarget.style.color = "var(--text-four)";
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            className="chat-bubble-scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              background: "var(--background-one)",
            }}
          >
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: isUser ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: "0.5rem",
                    animation: "chatMessageAppear 0.3s cubic-bezier(0.2, 0, 0.2, 1) forwards",
                  }}
                >
                  {!isUser && (
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "10px",
                      background: "var(--surface-four)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginBottom: "4px",
                    }}>
                      <Bot size={14} color="var(--primary)" />
                    </div>
                  )}

                  <div style={{
                    maxWidth: "85%",
                    padding: "0.85rem 1rem",
                    borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    background: isUser
                      ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"
                      : "var(--surface-three)",
                    boxShadow: isUser
                      ? "0 2px 8px rgba(0,0,0,0.15)"
                      : "none",
                    border: isUser ? "none" : "1px solid var(--border)",
                  }}>
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => (
                          <p style={{
                            margin: 0,
                            fontSize: "0.95rem",
                            lineHeight: "1.6",
                            fontWeight: isUser ? 500 : 450,
                            color: isUser ? "#1a1a2e" : "var(--text-one)",
                          }} {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <span style={{
                            fontWeight: 700,
                            color: isUser ? "#0d0d1a" : "var(--primary)"
                          }} {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            style={{
                              color: isUser ? "#0d0d1a" : "var(--primary)",
                              textDecoration: "underline",
                              textUnderlineOffset: "3px",
                              fontWeight: 600,
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        ),
                        code: ({ node, ...props }) => (
                          <code
                            style={{
                              background: isUser ? "rgba(255,255,255,0.2)" : "var(--surface-four)",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "6px",
                              fontFamily: "monospace",
                              fontSize: "0.85em",
                              fontWeight: 600,
                              color: isUser ? "#1a1a2e" : "var(--text-one)",
                              border: isUser ? "none" : "1px solid var(--border)",
                            }}
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => <ul style={{ margin: "0.5rem 0 0 1.2rem", padding: 0 }} {...props} />,
                        ol: ({ node, ...props }) => <ol style={{ margin: "0.5rem 0 0 1.2rem", padding: 0 }} {...props} />,
                        li: ({ node, ...props }) => <li style={{ marginBottom: "0.25rem" }} {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "10px",
                  background: "var(--surface-four)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "4px"
                }}>
                  <Bot size={14} color="var(--primary)" />
                </div>
                <div style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "20px 20px 20px 4px",
                  background: "var(--surface-three)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center"
                }}>
                  <div className="typing-dot" style={{ width: "6px", height: "6px", background: "var(--text-four)", borderRadius: "50%", animation: "typing 1.4s infinite ease-in-out both", animationDelay: "0s" }}></div>
                  <div className="typing-dot" style={{ width: "6px", height: "6px", background: "var(--text-four)", borderRadius: "50%", animation: "typing 1.4s infinite ease-in-out both", animationDelay: "0.2s" }}></div>
                  <div className="typing-dot" style={{ width: "6px", height: "6px", background: "var(--text-four)", borderRadius: "50%", animation: "typing 1.4s infinite ease-in-out both", animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}

            {/* Suggested Prompts (Only show if history is just the greeting) */}
            {!loading && messages.length === 1 && (
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-four)", marginLeft: "0.5rem", marginBottom: "0.25rem" }}>
                  Suggested questions
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(undefined, suggestion)}
                      style={{
                        padding: "0.5rem 0.8rem",
                        borderRadius: "12px",
                        background: "var(--surface-two)",
                        border: "1px solid var(--border)",
                        color: "var(--text-one)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--primary)";
                        e.currentTarget.style.background = "var(--surface-three)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = "var(--surface-two)";
                      }}
                    >
                      <Sparkles size={12} color="var(--primary)" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: "1rem",
            background: "var(--surface-two)",
            borderTop: "1px solid var(--border)",
          }}>
            <form
              onSubmit={(e) => handleSend(e)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--background-one)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "0.3rem 0.3rem 0.3rem 1rem",
                transition: "border-color 0.2s ease",
              }}
              onFocusCapture={(e) => {
                const target = e.currentTarget as HTMLFormElement;
                target.style.borderColor = "var(--primary)";
              }}
              onBlurCapture={(e) => {
                const target = e.currentTarget as HTMLFormElement;
                target.style.borderColor = "var(--border)";
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-one)",
                  fontSize: "0.95rem",
                  padding: "0.6rem 0",
                  width: "100%",
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  border: "none",
                  background: input.trim() && !loading
                    ? "var(--primary)"
                    : "var(--surface-four)",
                  color: input.trim() && !loading ? "var(--text-three)" : "var(--text-four)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
            <div style={{ textAlign: "center", marginTop: "0.6rem" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-four)", opacity: 0.6 }}>
                AI can make mistakes. Check important info.
              </span>
            </div>
          </div>
        </div>

        {/* FLOATING ACTION BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: isOpen ? "56px" : (isHovered ? "140px" : "60px"),
            height: "60px",
            borderRadius: "30px",
            background: isOpen
              ? "var(--surface-four)"
              : "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            color: isOpen ? "var(--text-one)" : "var(--background-one)",
            border: isOpen ? "1px solid var(--border)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            boxShadow: isOpen
              ? "0 4px 15px rgba(0,0,0,0.15)"
              : "0 8px 30px rgba(0,0,0,0.3)",
            transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            overflow: "hidden",
            padding: "0 1rem",
            zIndex: 10000,
          }}
        >
          {isOpen ? (
            <X size={26} strokeWidth={2.5} />
          ) : (
            <>
              <MessageCircle size={26} strokeWidth={2.5} style={{ flexShrink: 0 }} />
              <span style={{
                fontSize: "1rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
                opacity: isHovered ? 1 : 0,
                width: isHovered ? "auto" : 0,
                overflow: "hidden",
                transition: "opacity 0.2s ease, width 0.35s ease",
              }}>
                Chat
              </span>
            </>
          )}
        </button>

        <style jsx>{`
          @keyframes chatSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes chatMessageAppear {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes typing {
            0% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
            100% { transform: translateY(0); }
          }
          .chat-bubble-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .chat-bubble-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .chat-bubble-scrollbar::-webkit-scrollbar-thumb {
            background-color: var(--surface-four);
            border-radius: 20px;
          }
        `}</style>
      </div>
    </>
  );
}