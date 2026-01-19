"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, MessageCircle, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "Hey there! 👋 I'm **J.ai**, your friendly assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to the UI immediately
    const newMessages = [...messages, { role: "user" as const, text: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build history for the API (exclude the initial greeting, keep last 10 messages)
      // Filter only actual conversation messages (skip first greeting if it's the only model message)
      const conversationHistory = newMessages
        .slice(1) // Skip initial greeting
        .slice(-10) // Keep last 10 messages
        .map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        }));

      // Remove the last message (current user message) since it's sent separately
      const historyForBackend = conversationHistory.slice(0, -1);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: historyForBackend
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API Error:", data.error);
        throw new Error(data.error || "Failed to get response");
      }

      // Add AI response to messages
      setMessages((prev) => [...prev, { role: "model", text: data.text }]);
    } catch (error: any) {
      console.error("Chat Error:", error);

      // Provide more helpful error messages
      let errorMessage = "Oops! Something went wrong. Please try again. 🔄";

      if (error.message?.includes("API Key")) {
        errorMessage = "⚠️ API configuration issue. Please contact the administrator.";
      } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorMessage = "📡 Network error. Please check your connection and try again.";
      } else if (error.message?.includes("rate") || error.message?.includes("limit")) {
        errorMessage = "⏱️ Too many requests. Please wait a moment and try again.";
      }

      setMessages((prev) => [...prev, { role: "model", text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes chatSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.15);
            opacity: 0;
          }
          100% {
            transform: scale(1.15);
            opacity: 0;
          }
        }
        
        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
        
        .chat-bubble-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-bubble-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .chat-bubble-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        
        .chat-bubble-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--text-four);
        }
      `}</style>

      <div style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "1rem"
      }}>

        {/* CHAT WINDOW */}
        <div style={{
          width: "min(400px, calc(100vw - 2rem))",
          height: "min(600px, calc(100vh - 8rem))",
          background: "var(--background-one)",
          borderRadius: "28px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border)",
          display: isOpen ? "flex" : "none",
          flexDirection: "column",
          overflow: "hidden",
          transformOrigin: "bottom right",
          animation: "chatSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>

          {/* Header */}
          <div style={{
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, var(--surface-three) 0%, var(--surface-four) 100%)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}>
                  <Bot size={26} color="var(--background-one)" strokeWidth={2.5} />
                </div>
                {/* Online indicator */}
                <div style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "14px",
                  height: "14px",
                  background: "#22c55e",
                  borderRadius: "50%",
                  border: "3px solid var(--surface-three)",
                  boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.4)",
                  animation: "pulseRing 2s infinite",
                }}></div>
              </div>
              <div>
                <h3 style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "var(--text-one)",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}>J.ai</h3>
                <span style={{
                  fontSize: "0.8rem",
                  color: "#22c55e",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}>
                  <span style={{
                    width: "6px",
                    height: "6px",
                    background: "#22c55e",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}></span>
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                border: "none",
                background: "var(--surface-five)",
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
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface-five)";
                e.currentTarget.style.color = "var(--text-four)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <X size={20} strokeWidth={2.5} />
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
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    animation: "chatSlideIn 0.3s ease-out",
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "12px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isUser
                      ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"
                      : "var(--surface-four)",
                    border: isUser ? "none" : "1px solid var(--border)",
                    boxShadow: isUser
                      ? "0 3px 10px rgba(0,0,0,0.2)"
                      : "0 2px 6px rgba(0,0,0,0.1)",
                  }}>
                    {isUser ? (
                      <User size={18} color="var(--background-one)" strokeWidth={2.5} />
                    ) : (
                      <Bot size={18} color="var(--primary)" strokeWidth={2.5} />
                    )}
                  </div>

                  {/* Message Content */}
                  <div style={{
                    maxWidth: "75%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}>
                    {/* Sender Label */}
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: isUser ? "var(--primary)" : "var(--text-four)",
                      textAlign: isUser ? "right" : "left",
                      paddingLeft: isUser ? "0" : "0.25rem",
                      paddingRight: isUser ? "0.25rem" : "0",
                    }}>
                      {isUser ? "You" : "J.ai"}
                    </span>

                    {/* Message Bubble */}
                    <div style={{
                      padding: "0.9rem 1rem",
                      borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                      background: isUser
                        ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"
                        : "var(--surface-three)",
                      boxShadow: isUser
                        ? "0 4px 16px rgba(0,0,0,0.25)"
                        : "inset 0 0 0 1px var(--border)",
                      borderLeft: isUser ? "none" : "3px solid var(--primary)",
                    }}>
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p style={{
                              margin: 0,
                              fontSize: "0.9rem",
                              lineHeight: "1.65",
                              fontWeight: isUser ? 600 : 450,
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
                                textUnderlineOffset: "2px",
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
                                background: isUser ? "rgba(0,0,0,0.15)" : "var(--surface-four)",
                                padding: "0.15rem 0.5rem",
                                borderRadius: "6px",
                                fontFamily: "monospace",
                                fontSize: "0.82em",
                                fontWeight: 600,
                                color: isUser ? "#1a1a2e" : "var(--text-one)",
                                border: isUser ? "none" : "1px solid var(--border)",
                              }}
                              {...props}
                            />
                          )
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "0.75rem",
                animation: "chatSlideIn 0.3s ease-out",
              }}>
                {/* AI Avatar */}
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--surface-four)",
                  border: "1px solid var(--border)",
                }}>
                  <Bot size={18} color="var(--primary)" strokeWidth={2.5} />
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}>
                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-four)",
                    paddingLeft: "0.25rem",
                  }}>
                    J.ai
                  </span>
                  <div style={{
                    padding: "0.9rem 1.25rem",
                    borderRadius: "4px 18px 18px 18px",
                    background: "var(--surface-three)",
                    boxShadow: "inset 0 0 0 1px var(--border)",
                    borderLeft: "3px solid var(--primary)",
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "var(--primary)",
                          opacity: 0.8,
                          animation: `typingBounce 1.4s infinite`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: "1rem 1.25rem 1.25rem",
            background: "var(--surface-three)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}>
            <div style={{
              flex: 1,
              position: "relative",
            }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.9rem 1.25rem",
                  border: "2px solid var(--border)",
                  borderRadius: "16px",
                  background: "var(--background-one)",
                  color: "var(--text-one)",
                  outline: "none",
                  fontSize: "0.925rem",
                  fontWeight: 500,
                  transition: "all 0.25s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 4px var(--tertiary)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                border: "none",
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"
                  : "var(--surface-four)",
                color: input.trim() && !loading ? "var(--background-one)" : "var(--text-four)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                transition: "all 0.25s ease",
                boxShadow: input.trim() && !loading ? "0 4px 15px rgba(0,0,0,0.2)" : "none",
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !loading) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = input.trim() && !loading ? "0 4px 15px rgba(0,0,0,0.2)" : "none";
              }}
            >
              {loading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Send size={22} style={{ marginLeft: "2px" }} />
              )}
            </button>
          </form>
        </div>

        {/* FLOATING ACTION BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: isOpen ? "56px" : (isHovered ? "140px" : "56px"),
            height: "56px",
            borderRadius: isOpen ? "50%" : "28px",
            background: isOpen
              ? "var(--surface-four)"
              : "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            color: isOpen ? "var(--text-one)" : "var(--background-one)",
            border: isOpen ? "1px solid var(--border)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: isOpen
              ? "0 4px 15px rgba(0,0,0,0.15)"
              : "0 8px 30px rgba(0,0,0,0.3)",
            transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            overflow: "hidden",
            padding: "0 1rem",
          }}
        >
          {isOpen ? (
            <X size={24} strokeWidth={2.5} />
          ) : (
            <>
              <MessageCircle size={24} strokeWidth={2.5} style={{ flexShrink: 0 }} />
              <span style={{
                fontSize: "0.9rem",
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

      </div>
    </>
  );
}