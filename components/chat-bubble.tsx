"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, MessageCircle, Bot, User, Sparkles, Settings } from "lucide-react";
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
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load custom API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("kira_custom_api_key");
    if (savedKey) setCustomApiKey(savedKey);
  }, []);

  const saveCustomKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem("kira_custom_api_key", key);
  };

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
    if (isOpen && inputRef.current && !showSettings) {
      inputRef.current.focus();
    }
  }, [isOpen, showSettings]);

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();

    // Use override if provided, otherwise clean input state
    const textToSend = (textOverride || input).trim();

    // --- 1. PREVENT EMPTY OR LOW-QUALITY REQUESTS ---
    // Rule: Must be at least 5 characters and not just whitespace
    if (!textToSend || textToSend.length < 5 || loading) return;

    // Throttle: Prevent rapid-fire submissions
    const now = Date.now();
    const timeSinceLastSend = now - lastSendTime;

    if (timeSinceLastSend < MIN_REQUEST_DELAY && lastSendTime > 0) {
      setMessages((prev) => [...prev, {
        role: "model",
        text: `⏳ Take a breather! Please wait a second before sending another message.`
      }]);
      return;
    }

    setInput("");
    setLastSendTime(now);

    // Add user message to UI
    const newMessage: Message = { role: "user", text: textToSend };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Prepare History for Backend
      const historyMessages = updatedMessages.slice(1, -1).slice(-10);
      const historyForBackend = historyMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      // Inject initial context if needed
      if (historyForBackend.length === 0) {
        historyForBackend.push({
          role: "user",
          // @ts-ignore
          parts: [{ text: "Context: The user is visiting Jiyaworld, a portfolio website by Jiya featuring AI tools like TranslateAI and StudyAI. You are Kira, the assistant helped to guide them." }]
        });
        historyForBackend.push({
          role: "model",
          // @ts-ignore
          parts: [{ text: "Understood. I am Kira, ready to help the user navigate Jiyaworld." }]
        });
      }

      // --- 5. CUSTOM API KEY OPTION ---
      // We send it in headers
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-custom-api-key": customApiKey || ""
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyForBackend
        }),
      });

      let data: any;
      try {
        const rawText = await res.text();
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) {
        // Handle specific abuse or exhaustion messages quietly
        const errorMsg = data?.error || `Request failed`;
        throw new Error(errorMsg);
      }

      if (data.text) {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      } else {
        throw new Error("No response text from AI");
      }

    } catch (error: any) {
      console.error("Chat Error:", error);
      let errorMessage = "Oops! Something went wrong. Please try again. 🔄";

      // Protect from showing raw technische errors
      if (error.message.includes("busy") || error.message.includes("quota") || error.message.includes("requests")) {
        errorMessage = "⏱️ I'm a bit overwhelmed right now. Please try again in a moment!";
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
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 12px 32px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--outline-variant)",
          display: isOpen ? "flex" : "none",
          flexDirection: "column",
          overflow: "hidden",
          transformOrigin: "bottom right",
          animation: isOpen ? "chatSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
        }}>

          {/* Header */}
          <div style={{
            padding: "1rem 1.25rem",
            background: "rgba(var(--hue), 10%, 11%, 0.95)", // slightly translucent surface
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--outline-variant)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-container-high)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                }}>
                  <Bot size={20} color="var(--primary)" strokeWidth={2} />
                </div>
                <div style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: "10px",
                  height: "10px",
                  background: "#22c55e",
                  borderRadius: "50%",
                  border: "2px solid var(--surface)",
                }}></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                <h3 style={{
                  fontSize: "0.9375rem",
                  fontWeight: "600",
                  color: "var(--on-surface)",
                  margin: 0,
                  lineHeight: 1.2,
                  letterSpacing: "0.01em",
                }}>Kira</h3>
                <span style={{
                  fontSize: "0.75rem",
                  color: "var(--on-surface-muted)",
                  fontWeight: "400",
                }}>
                  Assistant
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.25rem" }}>
              {/* --- 5. SETTINGS ICON --- */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: showSettings ? "var(--surface-container-highest)" : "transparent",
                  color: "var(--on-surface-variant)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-container-high)";
                  e.currentTarget.style.color = "var(--on-surface)";
                }}
                onMouseLeave={(e) => {
                  if (!showSettings) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--on-surface-variant)";
                  }
                }}
              >
                <Settings size={18} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "transparent",
                  color: "var(--on-surface-variant)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-container-high)";
                  e.currentTarget.style.color = "var(--on-surface)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--on-surface-variant)";
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="chat-bubble-scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem", // More breathing room
              background: "var(--surface)",
              position: "relative",
            }}
          >
            {/* --- 5. CUSTOM API KEY UI --- */}
            {showSettings && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                padding: "1rem",
                background: "var(--surface-container)",
                borderBottom: "1px solid var(--outline-variant)",
                zIndex: 20,
                animation: "chatSlideIn 0.2s ease-out",
              }}>
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "var(--on-surface)", fontWeight: 500 }}>Custom API Key</h4>
                <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.75rem", color: "var(--on-surface-variant)" }}>
                  Use your own Google Gemini API key for higher limits.
                </p>
                <input
                  type="password"
                  placeholder="AIza..."
                  value={customApiKey}
                  onChange={(e) => saveCustomKey(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--outline-variant)",
                    background: "var(--surface)",
                    color: "var(--on-surface)",
                    fontSize: "0.85rem",
                    outline: "none",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  onClick={() => setShowSettings(false)}
                  style={{
                    marginTop: "0.75rem",
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--primary)",
                    color: "var(--on-primary)",
                    border: "none",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: 0.9,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "0.9"}
                >
                  Save & Close
                </button>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: isUser ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: "0.75rem",
                    animation: "chatMessageAppear 0.3s cubic-bezier(0.2, 0, 0.2, 1) forwards",
                  }}
                >
                  {!isUser && (
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginBottom: "6px",
                      opacity: 0.8,
                    }}>
                      <Bot size={16} color="var(--primary)" />
                    </div>
                  )}

                  <div style={{
                    maxWidth: "88%",
                    padding: "0.75rem 1rem",
                    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isUser
                      ? "var(--surface-container-high)"
                      : "transparent",
                    color: "var(--on-surface)",
                    // border: isUser ? "1px solid var(--outline-variant)" : "none",
                  }}>
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => (
                          <p style={{
                            margin: 0,
                            fontSize: "0.9375rem", // 15px
                            lineHeight: "1.6",
                            fontWeight: 400,
                            color: "var(--on-surface)",
                          }} {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <span style={{
                            fontWeight: 600,
                            color: "var(--primary)"
                          }} {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            style={{
                              color: "var(--primary)",
                              textDecoration: "underline",
                              textUnderlineOffset: "3px",
                              fontWeight: 500,
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        ),
                        code: ({ node, ...props }) => (
                          <code
                            style={{
                              background: "rgba(125,125,125,0.1)",
                              padding: "0.2rem 0.4rem",
                              borderRadius: "4px",
                              fontFamily: "monospace",
                              fontSize: "0.85em",
                              color: "var(--on-surface-variant)",
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
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginBottom: "6px",
                  opacity: 0.8,
                }}>
                  <Bot size={16} color="var(--primary)" />
                </div>
                <div style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "18px 18px 18px 4px",
                  background: "transparent",
                  // border: "1px solid var(--outline-variant)",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center"
                }}>
                  <div className="typing-dot" style={{ width: "5px", height: "5px", background: "var(--on-surface-muted)", borderRadius: "50%", animation: "typing 1.4s infinite ease-in-out both", animationDelay: "0s" }}></div>
                  <div className="typing-dot" style={{ width: "5px", height: "5px", background: "var(--on-surface-muted)", borderRadius: "50%", animation: "typing 1.4s infinite ease-in-out both", animationDelay: "0.2s" }}></div>
                  <div className="typing-dot" style={{ width: "5px", height: "5px", background: "var(--on-surface-muted)", borderRadius: "50%", animation: "typing 1.4s infinite ease-in-out both", animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}

            {/* Suggested Prompts */}
            {!loading && messages.length === 1 && !showSettings && (
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--on-surface-muted)", marginLeft: "0.25rem", marginBottom: "0" }}>
                  Suggested
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(undefined, suggestion)}
                      className="suggestion-btn"
                      style={{
                        padding: "0.5rem 0.8rem",
                        borderRadius: "var(--radius-md)",
                        background: "var(--surface-container)",
                        border: "1px solid transparent",
                        color: "var(--on-surface)",
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem"
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
            background: "var(--surface-container)", // Distinct from message area
            // borderTop: "1px solid var(--outline-variant)", 
          }}>
            <form
              onSubmit={(e) => handleSend(e)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--surface)",
                border: "1px solid transparent",
                borderRadius: "var(--radius-full)", // Pill shape input
                padding: "0.3rem 0.3rem 0.3rem 1.25rem",
                transition: "all 0.2s ease",
                boxShadow: "0 0 0 1px var(--outline-variant)",
              }}
              onFocusCapture={(e) => {
                const target = e.currentTarget as HTMLFormElement;
                target.style.boxShadow = "0 0 0 1px var(--primary)";
              }}
              onBlurCapture={(e) => {
                const target = e.currentTarget as HTMLFormElement;
                target.style.boxShadow = "0 0 0 1px var(--outline-variant)";
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder={input.trim().length > 0 && input.trim().length < 5 ? "Too short..." : "Ask helpful Kira..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--on-surface)",
                  fontSize: "0.9375rem",
                  padding: "0.6rem 0",
                  width: "100%",
                }}
              />
              <button
                type="submit"
                disabled={input.trim().length < 5 || loading}
                title={input.trim().length < 5 ? "Minimum 5 characters" : "Send message"}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "none",
                  background: input.trim().length >= 5 && !loading
                    ? "var(--primary)"
                    : "var(--surface-container-highest)",
                  color: input.trim().length >= 5 && !loading ? "var(--on-primary)" : "var(--on-surface-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim().length >= 5 && !loading ? "pointer" : "default",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                  opacity: input.trim().length >= 5 && !loading ? 1 : 0.5,
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
            <div style={{ textAlign: "center", marginTop: "0.6rem" }}>
              <span style={{ fontSize: "0.6875rem", color: "var(--on-surface-muted)", opacity: 0.7 }}>
                AI can make mistakes.
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
            borderRadius: "30px", // Fully rounded
            background: isOpen
              ? "var(--surface-container-high)"
              : "var(--surface-container-highest)",
            color: "var(--on-surface)",
            border: "1px solid var(--outline-variant)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            boxShadow: isOpen
              ? "none"
              : "0 4px 20px rgba(0,0,0,0.2)",
            transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            overflow: "hidden",
            padding: "0 1rem",
            zIndex: 10000,
          }}
        >
          {isOpen ? (
            <X size={24} strokeWidth={2} />
          ) : (
            <>
              <div style={{ position: 'relative', display: 'flex' }}>
                <MessageCircle size={24} strokeWidth={2} style={{ flexShrink: 0 }} />
                <div style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: "8px",
                  height: "8px",
                  background: "var(--primary)",
                  borderRadius: "50%",
                }}></div>
              </div>

              <span style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                opacity: isHovered ? 1 : 0,
                width: isHovered ? "auto" : 0,
                overflow: "hidden",
                transition: "opacity 0.2s ease, width 0.35s ease",
                color: "var(--on-surface)",
              }}>
                Chat with Kira
              </span>
            </>
          )}
        </button>

        <style jsx>{`
          @keyframes chatSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes chatMessageAppear {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes typing {
            0% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
            100% { transform: translateY(0); }
          }
          .chat-bubble-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .chat-bubble-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .chat-bubble-scrollbar::-webkit-scrollbar-thumb {
            background-color: var(--outline-variant);
            border-radius: 20px;
          }
          .suggestion-btn:hover {
            border-color: var(--primary) !important;
            background: var(--surface-container-high) !important;
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    </>
  );
}
