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
    ArrowLeft
} from "lucide-react";

export default function TranslateAIPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
                    tone
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

    return (
        <main>
            <style dangerouslySetInnerHTML={{
                __html: `
        .sidebar-trigger { display: none !important; }
        textarea {
            field-sizing: content;
        }
      `}} />

            <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Nav */}
            <nav style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: "1px solid var(--border)", background: "var(--background-one)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-four)", padding: "0.5rem", borderRadius: "8px", transition: "all 0.2s" }} className="hover:bg-[var(--surface-three)] hover:text-[var(--text-one)]">
                        <ArrowLeft size={20} />
                        <span style={{ fontWeight: 600 }}>Back</span>
                    </Link>
                    <div style={{ height: "24px", width: "1px", background: "var(--border)" }}></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", fontSize: "1.1rem" }}>
                        <Languages size={20} color="var(--primary)" />
                        <span>TranslateAI</span>
                    </div>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} style={{ background: "transparent", border: "none", color: "var(--text-four)", cursor: "pointer" }}>
                    <Terminal size={20} />
                </button>
            </nav>

            <div className="wrapper" style={{ marginTop: "4rem", maxWidth: "1000px" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", lineHeight: 1.1 }}>
                        Natural <span style={{ color: "var(--primary)" }}>Translation</span>
                    </h1>
                    <p style={{ color: "var(--text-four)", maxWidth: "500px", margin: "0 auto" }}>
                        Translate text with human-like tones. Choose how you want to sound, from professional to bestie.
                    </p>
                </div>

                {/* Translation Container */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                    gap: "2rem",
                    alignItems: "stretch"
                }}>

                    {/* INPUT CARD */}
                    <div className="card" style={{ opacity: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <select
                                value={sourceLang}
                                onChange={(e) => setSourceLang(e.target.value)}
                                style={{ width: "auto", padding: "0.5rem 1rem", fontSize: "0.9rem", border: "none", background: "var(--surface-two)", color: "var(--text-one)", fontWeight: 600, cursor: "pointer" }}
                            >
                                <option value="">Auto-detect</option>
                                {languages.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>

                        <textarea
                            placeholder="Enter text to translate..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            style={{
                                flex: 1,
                                minHeight: "200px",
                                resize: "none",
                                border: "none",
                                background: "transparent",
                                fontSize: "1.1rem",
                                padding: "0",
                                color: "var(--text-one)",
                                outline: "none"
                            }}
                        />

                        <div style={{ height: "1px", background: "var(--border)", margin: "0.5rem 0" }}></div>

                        {/* Tone Selector */}
                        <div>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-four)", fontWeight: 600, marginBottom: "0.5rem", display: "block" }}>
                                TONE STYLE
                            </label>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                {[
                                    { id: "Native", icon: <Sparkles size={14} />, label: "Native" },
                                    { id: "Casual", icon: <MessageSquare size={14} />, label: "Casual" },
                                    { id: "Close Friend", icon: <Zap size={14} />, label: "Bestie" }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTone(t.id as any)}
                                        className="mode-btn"
                                        style={{
                                            flex: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "0.4rem",
                                            background: tone === t.id ? "var(--surface-four)" : "var(--surface-two)",
                                            color: tone === t.id ? "var(--text-one)" : "var(--text-four)",
                                            border: tone === t.id ? "1px solid var(--primary)" : "1px solid transparent",
                                            padding: "0.6rem",
                                            fontSize: "0.85rem"
                                        }}
                                    >
                                        {t.icon} {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* OUTPUT CARD */}
                    <div className="card" style={{ opacity: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", background: "var(--surface-two)", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <select
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                                style={{ width: "auto", padding: "0.5rem 1rem", fontSize: "0.9rem", border: "none", background: "var(--surface-three)", color: "var(--text-one)", fontWeight: 600, cursor: "pointer", borderRadius: "8px" }}
                            >
                                {languages.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>

                            <button
                                onClick={copyToClipboard}
                                disabled={!result}
                                style={{ background: "transparent", border: "none", color: copied ? "var(--primary)" : "var(--text-four)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>

                        <div style={{ flex: 1, minHeight: "200px", position: "relative" }}>
                            {isLoading ? (
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "var(--text-four)" }}>
                                    <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
                                    <span className="animate-pulse">Translating to {tone.toLowerCase()} tone...</span>
                                </div>
                            ) : result ? (
                                <p className="animate-slide-up" style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "var(--text-one)", whiteSpace: "pre-wrap" }}>
                                    {result}
                                </p>
                            ) : (
                                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-four)", opacity: 0.5, fontStyle: "italic" }}>
                                    Translation will appear here
                                </div>
                            )}
                        </div>

                        <div style={{ height: "1px", background: "var(--border)", margin: "0.5rem 0" }}></div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                                onClick={handleTranslate}
                                disabled={isLoading || !text}
                                className="btn-hero primary"
                                style={{ width: "100%", opacity: (!text || isLoading) ? 0.7 : 1, padding: "0.8rem" }}
                            >
                                {isLoading ? "Translating..." : "Translate"} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
