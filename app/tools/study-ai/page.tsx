"use client";

import { useState } from "react";
import Link from "next/link";
import { FloatingSidebar } from "@/components/floating-sidebar";
import {
  Upload, FileText, Brain, Zap, Check, AlertCircle,
  Loader2, ArrowLeft, FileType, Sparkles, Shield,
  Search, Eye, EyeOff, LayoutGrid
} from "lucide-react";
import styles from "./study-ai.module.css";

type AnalysisResult = {
  title: string;
  quickSummary: string;
  detailedSummary: string[];
  questions: { level: string; text: string; answer: string }[];
  keywords: string[];
  unclear: string;
};

export default function StudyAIPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"STRICT" | "SMART">("STRICT");
  const [inputType, setInputType] = useState<"PDF" | "TEXT">("PDF");
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [model, setModel] = useState("gemini"); // Lowercase match backend
  const [questionCount, setQuestionCount] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileSizeWarning, setFileSizeWarning] = useState(false);
  const [visibleAnswers, setVisibleAnswers] = useState<number[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileSizeWarning(true);
      } else {
        setFileSizeWarning(false);
      }
    }
  };

  const toggleAnswer = (index: number) => {
    setVisibleAnswers(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleAnalyze = async () => {
    if (inputType === "PDF" && !file) return;
    if (inputType === "TEXT" && !textInput.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setVisibleAnswers([]);

    try {
      setProgressStep("Preparing AI model...");

      const systemPrompt = `
        You are StudyAI, an intelligent study assistant.
        Mode: ${mode}
        ${mode === "STRICT" ? "Strictly use ONLY the provided context. Do not add outside facts. If information is missing, state 'Tidak disebutkan di materi'." : "You may add relevant external context to clarify concepts, but mark them with [Eksternal]."}
        
        Analyze the provided content and output a JSON object with this exact structure:
        {
          "title": "Document Title or Topic",
          "quickSummary": "3-5 sentences summary",
          "detailedSummary": ["Bullet point 1", "Bullet point 2", ...],
          "questions": [
            {"level": "Dasar", "text": "Question...", "answer": "Short answer based on material..."},
            {"level": "Menengah", "text": "Question...", "answer": "Short answer based on material..."},
            {"level": "Sulit", "text": "Question...", "answer": "Short answer based on material..."}
          ],
          "keywords": ["Keyword1", "Keyword2", ...],
          "unclear": "Any unclear parts or 'None'"
        }
        
        Generate exactly ${questionCount} questions.
        Ensure the output is valid JSON (do not use markdown code blocks). Language: Indonesian.
      `;

      const formData = new FormData();

      // Susun Prompt
      let finalPrompt = systemPrompt;
      if (inputType === "TEXT") {
        finalPrompt += `\n\nCONTEXT MATERIAL:\n${textInput}`;
      }

      formData.append("prompt", finalPrompt);
      formData.append("model", model); // 'gemini' atau 'groq'

      if (inputType === "PDF" && file) {
        formData.append("file", file);
      }

      setProgressStep(model === 'groq' && inputType === 'PDF'
        ? "Relaying: Gemini (Vision) -> Groq (Reasoning)..."
        : `Sending to ${model === 'gemini' ? 'Gemini 2.5' : 'Groq Llama 3'}...`
      );

      // Call Backend API
      const response = await fetch("/api/study-ai", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setProgressStep("Processing result...");

      // Clean up result if AI wrapped it in markdown code blocks
      let rawJson = data.result;
      rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();

      const jsonResponse = JSON.parse(rawJson);
      setResult(jsonResponse);

    } catch (error) {
      console.error(error);
      alert("Analysis failed: " + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getLevelClass = (level: string) => {
    switch (level) {
      case "Dasar": return styles.levelBasic;
      case "Menengah": return styles.levelMedium;
      case "Sulit": return styles.levelHard;
      default: return styles.levelBasic;
    }
  };

  return (
    <main className={styles.studyPage}>
      <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
          <div className={styles.navDivider} />
          <div className={styles.navBrand}>
            <Brain size={20} className={styles.navBrandIcon} />
            <span>StudyAI</span>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={styles.menuButton}
          aria-label="Open Menu"
        >
          <LayoutGrid size={20} />
        </button>
      </nav>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Page Header */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>StudyAI</h1>
          <p className={styles.pageSubtitle}>
            Upload materi, dapatkan ringkasan & soal latihan dengan AI.
          </p>
        </header>

        {/* Main Grid */}
        <div className={styles.mainGrid}>
          {/* Left Column: Controls */}
          <div className={styles.controlsColumn}>
            {/* Mode Card */}
            <div className={styles.cardPadded}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Shield size={18} />
                </div>
                <span className={styles.cardTitle}>Analysis Mode</span>
              </div>

              <div className={styles.modeSelector}>
                <button
                  className={mode === "STRICT" ? styles.modeButtonActive : styles.modeButton}
                  onClick={() => setMode("STRICT")}
                >
                  <Shield size={14} />
                  STRICT
                </button>
                <button
                  className={mode === "SMART" ? styles.modeButtonActive : styles.modeButton}
                  onClick={() => setMode("SMART")}
                >
                  <Sparkles size={14} />
                  SMART
                </button>
              </div>

              <div className={styles.modeHint}>
                <AlertCircle size={14} className={styles.modeHintIcon} />
                <span>
                  {mode === "STRICT"
                    ? "Hanya menggunakan fakta dari materi. Tidak ada halusinasi."
                    : "Menambahkan konteks eksternal yang relevan untuk memperjelas."}
                </span>
              </div>
            </div>

            {/* Input Card */}
            <div className={styles.card}>
              <div className={styles.inputTabs}>
                <button
                  className={inputType === "PDF" ? styles.inputTabActive : styles.inputTab}
                  onClick={() => setInputType("PDF")}
                >
                  <FileType size={16} />
                  PDF
                </button>
                <button
                  className={inputType === "TEXT" ? styles.inputTabActive : styles.inputTab}
                  onClick={() => setInputType("TEXT")}
                >
                  <FileText size={16} />
                  Text
                </button>
              </div>

              <div className={styles.inputContent}>
                {inputType === "PDF" ? (
                  <div
                    className={styles.uploadArea}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <div className={styles.uploadIcon}>
                      <Upload size={22} />
                    </div>
                    <div className={styles.uploadLabel}>
                      {file ? file.name : "Upload PDF"}
                    </div>
                    <div className={styles.uploadHint}>
                      Max 10MB
                      {fileSizeWarning && (
                        <span className={styles.uploadWarning}> — File terlalu besar!</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <textarea
                    className={styles.textInput}
                    placeholder="Paste or type your study material here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                )}

                {/* Settings */}
                <div className={styles.settingsRow}>
                  <div className={styles.settingField}>
                    <label className={styles.settingLabel}>Model</label>
                    <select
                      className={styles.settingSelect}
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    >
                      <option value="gemini">Gemini 2.5 Flash</option>
                      <option value="groq">Groq (Llama 3.3)</option>
                    </select>
                  </div>
                  <div className={styles.settingFieldSmall}>
                    <label className={styles.settingLabel}>Soal</label>
                    <input
                      type="number"
                      className={styles.settingInput}
                      min={1}
                      max={20}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Analyze Button */}
                <button
                  className={styles.analyzeButton}
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (inputType === "PDF" && !file) || (inputType === "TEXT" && !textInput)}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Start Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className={styles.resultsColumn}>
            {/* Loading State */}
            {isAnalyzing && (
              <div className={styles.loadingState}>
                <div className={styles.loadingText}>
                  &gt;_ {progressStep}
                </div>
                <div className={styles.loadingBar}>
                  <div className={styles.loadingProgress} />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && !isAnalyzing && (
              <div className={styles.emptyState}>
                <Brain size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>Hasil analisis akan muncul di sini</p>
              </div>
            )}

            {/* Results */}
            {result && !isAnalyzing && (
              <div className={styles.resultsSection}>
                {/* Header */}
                <div className={styles.resultsHeader}>
                  <div className={styles.resultsHeaderIcon}>
                    <Check size={22} />
                  </div>
                  <div className={styles.resultsHeaderText}>
                    <h2>Hasil Analisis</h2>
                    <div className={styles.resultsHeaderMeta}>
                      {result.title}
                      <span className={styles.resultsHeaderBadge}>
                        {mode === "STRICT" ? <Shield size={10} /> : <Sparkles size={10} />}
                        {mode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Summary */}
                <div className={styles.resultCard}>
                  <div className={styles.resultCardHeader}>
                    <Zap size={18} className={styles.resultCardIcon} />
                    <h3 className={styles.resultCardTitle}>Ringkasan Cepat</h3>
                  </div>
                  <p className={styles.resultCardContent}>{result.quickSummary}</p>
                </div>

                {/* Detailed Summary */}
                <div className={styles.resultCard}>
                  <div className={styles.resultCardHeader}>
                    <FileText size={18} className={styles.resultCardIcon} />
                    <h3 className={styles.resultCardTitle}>Poin Utama</h3>
                  </div>
                  <ul className={styles.summaryList}>
                    {result.detailedSummary.map((point, idx) => (
                      <li key={idx} className={styles.summaryItem}>
                        <span className={styles.summaryBullet} />
                        <span>
                          {point.includes("[Eksternal]") ? (
                            <>
                              {point.replace("[Eksternal]", "")}
                              <span className={styles.externalBadge}>Eksternal</span>
                            </>
                          ) : point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Questions */}
                <div className={styles.resultCard}>
                  <div className={styles.resultCardHeader}>
                    <Brain size={18} className={styles.resultCardIcon} />
                    <h3 className={styles.resultCardTitle}>Pertanyaan Latihan</h3>
                  </div>
                  <div>
                    {result.questions.map((q, idx) => (
                      <div key={idx} className={styles.questionCard}>
                        <div className={styles.questionHeader}>
                          <span className={styles.questionNumber}>Soal {idx + 1}</span>
                          <span className={`${styles.questionLevel} ${getLevelClass(q.level)}`}>
                            {q.level}
                          </span>
                        </div>
                        <p className={styles.questionText}>{q.text}</p>

                        <div className={styles.answerSection}>
                          <button
                            className={styles.answerToggle}
                            onClick={() => toggleAnswer(idx)}
                          >
                            {visibleAnswers.includes(idx) ? <EyeOff size={14} /> : <Eye size={14} />}
                            {visibleAnswers.includes(idx) ? "Sembunyikan Jawaban" : "Lihat Jawaban"}
                          </button>

                          {visibleAnswers.includes(idx) && (
                            <div className={styles.answerContent}>
                              {q.answer}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keywords & Unclear */}
                <div className={styles.infoGrid}>
                  <div className={styles.resultCard}>
                    <div className={styles.resultCardHeader}>
                      <Search size={18} className={styles.resultCardIcon} />
                      <h3 className={styles.resultCardTitle}>Kata Kunci</h3>
                    </div>
                    <div className={styles.keywordsList}>
                      {result.keywords.map((k, idx) => (
                        <span key={idx} className={styles.keyword}>#{k}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.unclearCard}>
                    <div className={styles.unclearHeader}>
                      <AlertCircle size={18} />
                      <h3 className={styles.resultCardTitle}>Bagian Kurang Jelas</h3>
                    </div>
                    <p className={styles.resultCardContent}>{result.unclear}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}