"use client";

import { useState } from "react";
import Link from "next/link";
import { FloatingSidebar } from "@/components/floating-sidebar";
import {
    Languages,
    ArrowRight,
    Sparkles,
    Zap,
    Copy,
    Check,
    Loader2,
    MessageSquare,
    Terminal,
    ArrowLeft,
    RefreshCw,
    MoveRight,
    ChevronDown,
    ArrowLeftRight,
    Bot
} from "lucide-react";

export default function TranslateAIPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [model, setModel] = useState<"gemini" | "groq">("gemini");
    const [text, setText] = useState("");
    const [sourceLang, setSourceLang] = useState("");
    const [targetLang, setTargetLang] = useState("English");
    const [tone, setTone] = useState<"Native" | "Casual" | "Close Friend">("Native");
    const [result, setResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const languages = [
        "Indonesian", "English", "Japanese", "Korean", "German",
        "French", "Spanish", "Chinese (Simplified)", "Arabic", "Russian"
    ];

    const tones = [
        { id: "Native", icon: Sparkles, label: "Native", desc: "Fluent" },
        { id: "Casual", icon: MessageSquare, label: "Casual", desc: "Chill" },
        { id: "Close Friend", icon: Zap, label: "Bestie", desc: "Fun" }
    ];

    const handleTranslate = async () => {
        if (!text.trim()) return;

        setIsLoading(true);
        setResult("");

        try {
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    sourceLang: sourceLang || "Auto-detect",
                    targetLang,
                    tone,
                    model
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Translation failed");
            }

            setResult(data.result);
        } catch (error) {
            console.error(error);
            alert("Error: " + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const swapLanguages = () => {
        if (sourceLang && targetLang) {
            setSourceLang(targetLang);
            setTargetLang(sourceLang);
            setText(result);
            setResult(text);
        }
    };

    return (
        <main>
            <style dangerouslySetInnerHTML={{
                __html: `
        .sidebar-trigger { display: none !important; }
        textarea {
            field-sizing: content;
        }
        /* Dropdown Styling */
        select.custom-select {
            appearance: none;
            background-color: transparent;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-one);
            padding: 0.5rem 2rem 0.5rem 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
        }
        select.custom-select:hover {
            background-color: var(--surface-three);
        }
        select.custom-select:focus {
            outline: none;
            border-color: var(--primary);
            background-color: var(--surface-three);
        }
        select.custom-select option {
            background-color: var(--surface-two);
            color: var(--text-one);
            padding: 10px;
        }

        /* Tone Tabs */
        .tone-tab {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 100px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-four);
        }
        .tone-tab:hover {
            background: var(--surface-three);
            color: var(--text-one);
        }
        .tone-tab.active {
            background: var(--surface-four);
            border-color: var(--primary);
            color: var(--text-one);
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
        }

        /* Scrollbars */
        textarea::-webkit-scrollbar { width: 6px; }
        textarea::-webkit-scrollbar-track { background: transparent; }
        textarea::-webkit-scrollbar-thumb { background-color: var(--surface-four); border-radius: 10px; }
        
        /* Animations */
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        /* Responsive Layout */
        .translation-grid {
            display: grid;
            grid-template-columns: 1fr 1px 1fr;
            min-height: 350px;
        }
        .translation-divider {
            background: var(--border);
            width: 1px;
            height: auto;
        }
        
        /* Footer Controls Responsive */
        .footer-container {
            padding: 1.25rem 2rem;
            border-top: 1px solid var(--border);
            background: var(--surface-two);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .footer-controls-left {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }
        .control-divider {
            width: 1px;
            height: 24px;
            background: var(--border);
            display: block;
        }
        .selector-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .selector-group {
            display: flex;
            gap: 0.25rem;
            background: var(--surface-three);
            padding: 3px;
            border-radius: 8px;
            flex-wrap: wrap;
        }

        @media (max-width: 768px) {
            .translation-grid {
                display: flex;
                flex-direction: column;
                min-height: auto;
            }
            .translation-divider {
                width: 100%;
                height: 1px;
            }
            
            /* Footer Mobile Adjustments */
            .footer-container {
                flex-direction: column;
                align-items: stretch;
                padding: 1.5rem;
            }
            .footer-controls-left {
                flex-direction: column;
                align-items: flex-start;
                gap: 1.25rem;
                width: 100%;
            }
            .control-divider {
                display: none;
            }
            .selector-wrapper {
                width: 100%;
                justify-content: space-between;
            }
            .btn-hero {
                width: 100%;
                justify-content: center;
            }
        }
      `}} />

            <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Navbar */}
            <nav style={{
                position: "sticky",
                top: 0,
                zIndex: 40,
                borderBottom: "1px solid var(--border)",
                background: "rgba(var(--background-one), 0.8)",
                backdropFilter: "blur(12px)"
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", height: "70px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <Link href="/" className="nav-btn" style={{ padding: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <ArrowLeft size={18} />
                        </Link>
                        <div style={{ height: "20px", width: "1px", background: "var(--border)" }}></div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", fontSize: "1rem" }}>
                            <Languages size={18} color="var(--primary)" />
                            <span>TranslateAI</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="wrapper" style={{ marginTop: "2rem", maxWidth: "1000px", paddingBottom: "4rem" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                        Natural <span style={{ color: "var(--primary)" }}>Translation</span>
                    </h1>
                    <p style={{ color: "var(--text-four)", fontSize: "1rem", maxWidth: "400px", margin: "0 auto" }}>
                        Context-aware AI translation with customizable tones.
                    </p>
                </div>

                {/* Main Card */}
                <div style={{
                    background: "var(--surface-two)",
                    border: "1px solid var(--border)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "var(--drop-shadow-one)"
                }}>

                    {/* Top Controls: Languages */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1rem 1.5rem",
                        borderBottom: "1px solid var(--border)",
                        background: "var(--surface-three)"
                    }}>
                        {/* Source Lang */}
                        <div style={{ position: "relative" }}>
                            <select
                                value={sourceLang}
                                onChange={(e) => setSourceLang(e.target.value)}
                                className="custom-select"
                            >
                                <option value="">Detect Language</option>
                                {languages.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <ChevronDown size={14} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-four)" }} />
                        </div>

                        {/* Swap Button */}
                        <button
                            onClick={swapLanguages}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--text-four)",
                                cursor: "pointer",
                                padding: "0.5rem",
                                borderRadius: "50%",
                                transition: "all 0.2s"
                            }}
                            className="hover:bg-[var(--surface-four)] hover:text-[var(--text-one)]"
                        >
                            <ArrowLeftRight size={18} />
                        </button>

                        {/* Target Lang */}
                        <div style={{ position: "relative" }}>
                            <select
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                                className="custom-select"
                            >
                                {languages.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <ChevronDown size={14} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-four)" }} />
                        </div>
                    </div>

                    {/* Content Area: Split View */}
                    <div className="translation-grid">

                        {/* INPUT AREA */}
                        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
                            <textarea
                                placeholder="Enter text..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                spellCheck={false}
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    padding: "2rem",
                                    background: "transparent",
                                    border: "none",
                                    resize: "none",
                                    fontSize: "1.25rem",
                                    lineHeight: "1.6",
                                    color: "var(--text-one)",
                                    outline: "none",
                                    fontFamily: "inherit"
                                }}
                            />
                            {/* Char Count */}
                            <div style={{
                                padding: "1rem 2rem",
                                fontSize: "0.75rem",
                                color: "var(--text-four)",
                                textAlign: "right",
                                borderTop: "1px solid transparent" // Spacer
                            }}>
                                {text.length} chars
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="translation-divider"></div>

                        {/* OUTPUT AREA */}
                        <div style={{ display: "flex", flexDirection: "column", background: "transparent", position: "relative" }}>
                            {isLoading ? (
                                <div style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "1rem",
                                    color: "var(--text-four)",
                                    opacity: 0.7
                                }}>
                                    <Loader2 size={32} className="animate-spin" />
                                    <span>Translating...</span>
                                </div>
                            ) : result ? (
                                <div className="fade-in" style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                                    <p style={{ fontSize: "1.25rem", lineHeight: "1.6", color: "var(--text-one)", whiteSpace: "pre-wrap" }}>
                                        {result}
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "1rem",
                                    color: "var(--text-four)",
                                    opacity: 0.5
                                }}>
                                    <Sparkles size={48} style={{ opacity: 0.2 }} />
                                    <p style={{ fontStyle: "italic" }}>Translation will appear here</p>
                                </div>
                            )}

                            {/* Copy Button (Floating) */}
                            {result && (
                                <button
                                    onClick={copyToClipboard}
                                    style={{
                                        position: "absolute",
                                        top: "1rem",
                                        right: "1rem",
                                        background: "var(--surface-three)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                        padding: "0.4rem 0.8rem",
                                        fontSize: "0.8rem",
                                        color: copied ? "var(--primary)" : "var(--text-four)",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        transition: "all 0.2s"
                                    }}
                                    className="hover:bg-[var(--surface-four)] hover:text-[var(--text-one)]"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Footer: Controls & Action */}
                    <div className="footer-container">

                        {/* Left: Configuration (Tone & Model) */}
                        <div className="footer-controls-left">

                            {/* Tone Selector */}
                            <div className="selector-wrapper">
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-four)", textTransform: "uppercase", tracking: "0.05em" }}>Tone</span>
                                <div className="selector-group">
                                    {tones.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTone(t.id as any)}
                                            className={`tone-tab ${tone === t.id ? "active" : ""}`}
                                            title={t.desc}
                                            style={{
                                                padding: "0.25rem 0.75rem",
                                                borderRadius: "6px",
                                                fontSize: "0.85rem",
                                                fontWeight: 500,
                                                background: tone === t.id ? "var(--surface-four)" : "transparent",
                                                color: tone === t.id ? "var(--text-one)" : "var(--text-four)",
                                                border: "none",
                                                boxShadow: tone === t.id ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                                                transition: "all 0.15s ease",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.4rem"
                                            }}
                                        >
                                            {t.id === "Native" && <Sparkles size={12} />}
                                            {t.id === "Casual" && <MessageSquare size={12} />}
                                            {t.id === "Close Friend" && <Zap size={12} />}
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="control-divider"></div>

                            {/* Model Selector */}
                            <div className="selector-wrapper">
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-four)", textTransform: "uppercase", tracking: "0.05em" }}>Model</span>
                                <div className="selector-group">
                                    <button
                                        onClick={() => setModel("gemini")}
                                        style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "6px",
                                            background: model === "gemini" ? "var(--surface-four)" : "transparent",
                                            color: model === "gemini" ? "var(--text-one)" : "var(--text-four)",
                                            border: "none",
                                            boxShadow: model === "gemini" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                            fontWeight: 500,
                                            transition: "all 0.15s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.4rem"
                                        }}
                                    >
                                        <Sparkles size={12} /> Gemini
                                    </button>
                                    <button
                                        onClick={() => setModel("groq")}
                                        style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "6px",
                                            background: model === "groq" ? "var(--surface-four)" : "transparent",
                                            color: model === "groq" ? "var(--text-one)" : "var(--text-four)",
                                            border: "none",
                                            boxShadow: model === "groq" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                            fontWeight: 500,
                                            transition: "all 0.15s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.4rem"
                                        }}
                                    >
                                        <Bot size={12} /> Groq
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Right: Translate Action */}
                        <button
                            onClick={handleTranslate}
                            disabled={isLoading || !text}
                            className="btn-hero primary"
                            style={{
                                padding: "0.75rem 2.5rem",
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: 600,
                                letterSpacing: "0.02em",
                                opacity: (!text || isLoading) ? 0.6 : 1,
                                cursor: (!text || isLoading) ? "not-allowed" : "pointer",
                                boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.2)"
                            }}
                        >
                            {isLoading ? "Translating..." : "Translate"}
                        </button>
                    </div>

                </div>
            </div>
        </main>
    );
}