"use client";

import { useState } from "react";
import Link from "next/link";
import { FloatingSidebar } from "@/components/floating-sidebar";
import {
    Languages,
    Sparkles,
    Zap,
    Copy,
    Check,
    Loader2,
    MessageSquare,
    ArrowLeft,
    ArrowLeftRight,
    ChevronDown,
    X
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
        { id: "Native", icon: Sparkles, label: "Native" },
        { id: "Casual", icon: MessageSquare, label: "Casual" },
        { id: "Close Friend", icon: Zap, label: "Bestie" }
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
            if (!response.ok) throw new Error(data.error || "Translation failed");
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
        if (targetLang) {
            const tempLang = sourceLang || "Indonesian";
            setSourceLang(targetLang);
            setTargetLang(tempLang);
            if (result) {
                const tempText = text;
                setText(result);
                setResult(tempText);
            }
        }
    };

    const clearText = () => {
        setText("");
        setResult("");
    };

    return (
        <main className="translate-page">
            <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Navbar */}
            <nav className="app-nav">
                <div className="nav-content">
                    <div className="nav-left">
                        <Link href="/" className="nav-back">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="nav-divider" />
                        <div className="nav-brand">
                            <Languages size={20} className="brand-icon" />
                            <span>TranslateAI</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="content-wrapper">

                {/* Language Bar */}
                <div className="language-bar">
                    <div className="select-wrapper">
                        <select
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                        >
                            <option value="">Auto-Detect</option>
                            {languages.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <ChevronDown size={14} className="chevron" />
                    </div>

                    <button onClick={swapLanguages} className="icon-btn swap-btn" aria-label="Swap languages">
                        <ArrowLeftRight size={18} />
                    </button>

                    <div className="select-wrapper">
                        <select
                            value={targetLang}
                            onChange={(e) => setTargetLang(e.target.value)}
                        >
                            {languages.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <ChevronDown size={14} className="chevron" />
                    </div>
                </div>

                {/* Translation Area */}
                <div className="translation-grid">
                    {/* Input */}
                    <div className={`panel input-panel ${text ? 'active' : ''}`}>
                        <div className="panel-header">
                            <span className="panel-label">Source Text</span>
                            {text && (
                                <button onClick={clearText} className="icon-btn clear-btn">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type or paste text here..."
                            spellCheck={false}
                        />
                        <div className="panel-footer">
                            <span className="char-count">{text.length} chars</span>
                        </div>
                    </div>

                    {/* Output */}
                    <div className={`panel output-panel ${result ? 'has-result' : ''}`}>
                        <div className="panel-header">
                            <span className="panel-label">Translation</span>
                            <button
                                onClick={copyToClipboard}
                                className="icon-btn copy-btn"
                                disabled={!result}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <div className="output-content">
                            {isLoading ? (
                                <div className="loading-indicator">
                                    <Loader2 size={24} className="animate-spin" />
                                    <span>Translating...</span>
                                </div>
                            ) : result ? (
                                <div className="result-text">{result}</div>
                            ) : (
                                <div className="empty-placeholder">
                                    Translation will appear here
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="controls-bar">
                    <div className="options-group">
                        <div className="option-section">
                            <span className="option-label">Tone</span>
                            <div className="tone-selector">
                                {tones.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTone(t.id as any)}
                                        className={`tone-btn ${tone === t.id ? 'selected' : ''}`}
                                    >
                                        <t.icon size={14} />
                                        <span>{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="divider-vertical" />

                        <div className="option-section">
                            <span className="option-label">Model</span>
                            <div className="model-selector">
                                <button
                                    onClick={() => setModel('gemini')}
                                    className={`model-btn ${model === 'gemini' ? 'selected' : ''}`}
                                >
                                    Gemini
                                </button>
                                <button
                                    onClick={() => setModel('groq')}
                                    className={`model-btn ${model === 'groq' ? 'selected' : ''}`}
                                >
                                    Groq
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleTranslate}
                        disabled={isLoading || !text.trim()}
                        className="translate-btn"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                        <span>Translate</span>
                    </button>
                </div>

            </div>

            <style jsx>{`
                .translate-page {
                    min-height: 100vh;
                    background-color: var(--background-one);
                    display: flex;
                    flex-direction: column;
                    font-family: var(--main-font), sans-serif;
                }

                /* Navbar */
                .app-nav {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    background: var(--background-one);
                    border-bottom: 1px solid var(--border);
                    height: 64px;
                    display: flex;
                    align-items: center;
                }
                
                .nav-content {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                    display: flex;
                    align-items: center;
                }

                .nav-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .nav-back {
                    color: var(--text-four);
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .nav-back:hover {
                    background: var(--surface-three);
                    color: var(--text-one);
                }

                .nav-divider {
                    width: 1px;
                    height: 24px;
                    background: var(--border);
                }

                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    color: var(--text-one);
                    font-size: 1.1rem;
                }

                .brand-icon {
                    color: var(--primary);
                }

                /* Content Wrapper */
                .content-wrapper {
                    flex: 1;
                    width: 100%;
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 2rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                /* Language Bar */
                .language-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: var(--surface-two);
                    padding: 0.5rem;
                    border-radius: 16px;
                    border: 1px solid var(--border);
                    gap: 0.5rem;
                }

                .select-wrapper {
                    position: relative;
                    flex: 1;
                    display: flex;
                    align-items: center;
                }

                .select-wrapper select {
                    width: 100%;
                    appearance: none;
                    background: transparent;
                    border: none;
                    color: var(--text-one);
                    font-weight: 600;
                    font-size: 0.95rem;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.2s;
                    outline: none;
                }

                .select-wrapper select:hover {
                    background: var(--surface-three);
                }

                .select-wrapper .chevron {
                    position: absolute;
                    right: 1rem;
                    pointer-events: none;
                    color: var(--text-four);
                }

                .icon-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-four);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .icon-btn:hover:not(:disabled) {
                    background: var(--surface-three);
                    color: var(--text-one);
                }

                .icon-btn:disabled {
                    opacity: 0.5;
                    cursor: default;
                }

                .swap-btn:hover {
                    color: var(--primary);
                }

                /* Translation Grid */
                .translation-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    flex: 1;
                    min-height: 400px;
                }

                .panel {
                    background: var(--surface-two);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: border-color 0.2s;
                }

                .input-panel:focus-within {
                    border-color: var(--primary);
                }

                .panel-header {
                    padding: 1rem 1.25rem 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .panel-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-four);
                    font-weight: 700;
                }

                .panel textarea {
                    flex: 1;
                    width: 100%;
                    background: transparent;
                    border: none;
                    resize: none;
                    outline: none;
                    padding: 0.5rem 1.25rem 1.25rem;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: var(--text-one);
                    font-family: inherit;
                }

                .panel textarea::placeholder {
                    color: var(--text-four);
                    opacity: 0.5;
                }

                .panel-footer {
                    padding: 0.5rem 1.25rem 1rem;
                    display: flex;
                    justify-content: flex-end;
                }

                .char-count {
                    font-size: 0.75rem;
                    color: var(--text-four);
                }

                .output-content {
                    flex: 1;
                    padding: 0.5rem 1.25rem 1.25rem;
                    display: flex;
                    flex-direction: column;
                }

                .result-text {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: var(--text-one);
                    white-space: pre-wrap;
                }

                .empty-placeholder {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-four);
                    opacity: 0.4;
                    font-size: 0.95rem;
                }

                .loading-indicator {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: var(--primary);
                }

                /* Controls Bar */
                .controls-bar {
                    background: var(--surface-two);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                }

                .options-group {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    flex: 1;
                }

                .option-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .option-label {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-four);
                    font-weight: 700;
                }

                .tone-selector, .model-selector {
                    display: flex;
                    gap: 0.25rem;
                }

                .tone-btn, .model-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: var(--text-four);
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tone-btn:hover, .model-btn:hover {
                    background: var(--surface-three);
                    color: var(--text-one);
                }

                .tone-btn.selected, .model-btn.selected {
                    background: var(--surface-four);
                    color: var(--text-one);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }

                .divider-vertical {
                    width: 1px;
                    height: 32px;
                    background: var(--border);
                    opacity: 0.5;
                }

                .translate-btn {
                    background: var(--primary);
                    color: var(--text-three);
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .translate-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                }

                .translate-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .translation-grid {
                        grid-template-columns: 1fr;
                        min-height: auto;
                    }

                    .panel {
                        min-height: 200px;
                    }

                    .controls-bar {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1.5rem;
                    }

                    .options-group {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1.25rem;
                    }

                    .divider-vertical {
                        display: none;
                    }

                    .tone-selector {
                        overflow-x: auto;
                        padding-bottom: 4px;
                    }

                    .translate-btn {
                        width: 100%;
                        justify-content: center;
                        padding: 1rem;
                    }
                }
            `}</style>
        </main>
    );
}
