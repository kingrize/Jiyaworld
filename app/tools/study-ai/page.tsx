"use client";

import { useState } from "react";
import Link from "next/link";
import { FloatingSidebar } from "@/components/floating-sidebar";
import { 
  Upload, FileText, Brain, Zap, Check, AlertCircle, 
  ChevronRight, Loader2, Terminal, ArrowLeft, FileType, 
  Sparkles, Shield, Search, Eye, EyeOff, HelpCircle
} from "lucide-react";

type AnalysisResult = {
  title: string;
  quickSummary: string;
  detailedSummary: string[];
  questions: { level: string; text: string; answer: string }[];
  keywords: string[];
  unclear: string;
};

// API Key Rotation Logic
const getGeminiKey = () => {
  const keys = [
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_1,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_3,
  ].filter(Boolean);
  return keys[Math.floor(Math.random() * keys.length)];
};

const getGroqKey = () => {
  const keys = [
    process.env.NEXT_PUBLIC_GROQ_API_KEY_1,
    process.env.NEXT_PUBLIC_GROQ_API_KEY_2,
  ].filter(Boolean);
  return keys[Math.floor(Math.random() * keys.length)];
};

export default function StudyAIPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"STRICT" | "SMART">("STRICT");
  const [inputType, setInputType] = useState<"PDF" | "TEXT">("PDF");
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [model, setModel] = useState("Gemini");
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
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
      setProgressStep("Preparing data...");
      
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
        Ensure the output is valid JSON. Language: Indonesian.
      `;

      let jsonResponse;

      if (model === "Gemini") {
        setProgressStep("Sending to Gemini 2.5 Flash...");
        const apiKey = getGeminiKey();
        
        let contentPart;
        if (inputType === "PDF" && file) {
          const base64Data = await fileToBase64(file);
          contentPart = { inline_data: { mime_type: "application/pdf", data: base64Data } };
        } else {
          contentPart = { text: textInput };
        }

        // Menggunakan model gemini-2.5-flash sesuai permintaan
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: systemPrompt },
                contentPart
              ]
            }],
            generationConfig: { response_mime_type: "application/json" }
          })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        const textResponse = data.candidates[0].content.parts[0].text;
        jsonResponse = JSON.parse(textResponse);

      } else if (model === "Groq") {
        setProgressStep("Sending to Groq (Llama 3.3)...");
        const apiKey = getGroqKey();

        // Groq doesn't support PDF directly, fallback to text input or warn
        let contentToSend = textInput;
        if (inputType === "PDF") {
           throw new Error("Groq model currently only supports Text Input. Please switch to Gemini for PDF analysis or copy-paste the text.");
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: contentToSend }
            ],
            // Menggunakan model llama-3.3-70b-versatile sesuai permintaan
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
          })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        jsonResponse = JSON.parse(data.choices[0].message.content);
      }

      setResult(jsonResponse);

    } catch (error) {
      console.error(error);
      alert("Analysis failed: " + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main>
      <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Simple Nav for Tool Page */}
      <nav style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: "1px solid var(--border)", background: "var(--background-one)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-four)", padding: "0.5rem", borderRadius: "8px", transition: "all 0.2s" }} className="hover:bg-[var(--surface-three)] hover:text-[var(--text-one)]">
            <ArrowLeft size={20} />
            <span style={{ fontWeight: 600 }}>Back</span>
          </Link>
          <div style={{ height: "24px", width: "1px", background: "var(--border)" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", fontSize: "1.1rem" }}>
            <Brain size={20} color="var(--primary)" />
            <span>StudyAI</span>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} style={{ background: "transparent", border: "none", color: "var(--text-four)", cursor: "pointer" }}>
          <Terminal size={20} />
        </button>
      </nav>

      <div className="wrapper study-container">
        <div className="study-grid">
          {/* LEFT COLUMN: Controls & Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>StudyAI</h1>
              <p style={{ color: "var(--text-four)" }}>Upload materi, dapatkan ringkasan & soal latihan.</p>
            </div>

            {/* Mode Selector */}
            <div className="result-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--text-one)" }}>Analysis Mode</h3>
              <div className="mode-selector" style={{ width: "100%", display: "flex", marginBottom: "1rem" }}>
                <button 
                  className={`mode-btn ${mode === "STRICT" ? "active" : ""}`}
                  onClick={() => setMode("STRICT")}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  <Shield size={16} /> STRICT
                </button>
                <button 
                  className={`mode-btn ${mode === "SMART" ? "active" : ""}`}
                  onClick={() => setMode("SMART")}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  <Sparkles size={16} /> SMART
                </button>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-four)", display: "flex", gap: "0.5rem", lineHeight: "1.4" }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                {mode === "STRICT" 
                  ? "Hanya menggunakan fakta dari materi. Tidak ada halusinasi." 
                  : "Menambahkan konteks eksternal yang relevan untuk memperjelas."}
              </div>
            </div>

            {/* Input Section */}
            <div className="result-card" style={{ padding: "0", overflow: "hidden" }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
                <button 
                  onClick={() => setInputType("PDF")}
                  style={{ flex: 1, padding: "1rem", background: inputType === "PDF" ? "var(--surface-three)" : "transparent", border: "none", color: inputType === "PDF" ? "var(--text-one)" : "var(--text-four)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  <FileType size={18} /> PDF
                </button>
                <button 
                  onClick={() => setInputType("TEXT")}
                  style={{ flex: 1, padding: "1rem", background: inputType === "TEXT" ? "var(--surface-three)" : "transparent", border: "none", color: inputType === "TEXT" ? "var(--text-one)" : "var(--text-four)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  <FileText size={18} /> Text
                </button>
              </div>

              <div style={{ padding: "1.5rem" }}>
                {inputType === "PDF" ? (
                  <div className="upload-area" style={{ padding: "2rem 1rem" }} onClick={() => document.getElementById("file-upload")?.click()}>
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange} 
                      style={{ display: "none" }} 
                    />
                    <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "var(--surface-four)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                      <Upload size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>
                        {file ? file.name : "Upload PDF"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-four)" }}>
                        Max 10MB.
                      </div>
                    </div>
                  </div>
                ) : (
                  <textarea 
                    placeholder="Paste text here..." 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    style={{ minHeight: "150px", resize: "vertical", fontFamily: "var(--mono-font)", fontSize: "0.85rem" }}
                  />
                )}

                <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.85rem", color: "var(--text-four)", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Model</label>
                      <select 
                        value={model} 
                        onChange={(e) => setModel(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface-two)", color: "var(--text-one)", cursor: "pointer", fontSize: "0.9rem" }}
                      >
                        <option value="Gemini">Gemini 2.5 Flash</option>
                        <option value="Groq">Groq (Llama 3.3)</option>
                      </select>
                    </div>
                    <div style={{ width: "80px" }}>
                      <label style={{ fontSize: "0.85rem", color: "var(--text-four)", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Soal</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={20} 
                        value={questionCount} 
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface-two)", color: "var(--text-one)", fontSize: "0.9rem" }} 
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (inputType === "PDF" && !file) || (inputType === "TEXT" && !textInput)}
                    className="btn-hero primary"
                    style={{ width: "100%", padding: "0.75rem", opacity: (isAnalyzing || (inputType === "PDF" && !file) || (inputType === "TEXT" && !textInput)) ? 0.5 : 1 }}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        Start Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Output */}
          <div>
            {/* Progress Indicator */}
            {isAnalyzing && (
              <div className="animate-slide-up" style={{ textAlign: "center", margin: "4rem 0", color: "var(--text-four)", fontFamily: "monospace" }}>
                <div style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>&gt;_ {progressStep}</div>
                <div style={{ width: "100%", height: "4px", background: "var(--surface-three)", borderRadius: "2px", overflow: "hidden", maxWidth: "300px", margin: "0 auto" }}>
                  <div style={{ width: "60%", height: "100%", background: "var(--primary)", borderRadius: "2px", animation: "pulse 1s infinite" }}></div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && !isAnalyzing && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-four)", opacity: 0.5, minHeight: "400px", border: "2px dashed var(--border)", borderRadius: "16px" }}>
                <Brain size={48} style={{ marginBottom: "1rem" }} />
                <p>Hasil analisis akan muncul di sini</p>
              </div>
            )}

            {/* Result Section */}
            {result && !isAnalyzing && (
              <div className="result-section animate-slide-up">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--surface-three)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                    <Check size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.5rem", margin: 0, lineHeight: 1.2 }}>Hasil Analisis</h2>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-four)" }}>{result.title} • {mode} Mode</div>
                  </div>
                </div>

                {/* A. Ringkasan Cepat */}
                <div className="result-card">
                  <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Zap size={20} /> Ringkasan Cepat
                  </h3>
                  <p>{result.quickSummary}</p>
                </div>

                {/* B. Ringkasan Detail */}
                <div className="result-card">
                  <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FileText size={20} /> Poin Utama
                  </h3>
                  <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {result.detailedSummary.map((point, idx) => (
                      <li key={idx} style={{ color: "var(--text-four)" }}>
                        {point.includes("[Eksternal]") ? (
                          <span>
                            {point.replace("[Eksternal]", "")} 
                            <span style={{ fontSize: "0.75rem", background: "var(--surface-four)", padding: "2px 6px", borderRadius: "4px", marginLeft: "6px", color: "var(--primary)" }}>Eksternal</span>
                          </span>
                        ) : point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* C. Pertanyaan */}
                <div className="result-card">
                  <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Brain size={20} /> Pertanyaan Latihan
                  </h3>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {result.questions.map((q, idx) => (
                      <div key={idx} style={{ padding: "1.5rem", background: "var(--surface-three)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                          <span style={{ fontWeight: 600, color: "var(--text-one)" }}>Soal {idx + 1}</span>
                          <span style={{ 
                            fontSize: "0.75rem", 
                            padding: "2px 8px", 
                            borderRadius: "100px", 
                            background: q.level === "Dasar" ? "var(--surface-four)" : q.level === "Menengah" ? "var(--tertiary)" : "var(--red-three)",
                            color: q.level === "Sulit" ? "#601410" : "var(--text-one)"
                          }}>
                            {q.level}
                          </span>
                        </div>
                        <p style={{ margin: "0 0 1rem 0", color: "var(--text-one)" }}>{q.text}</p>
                        
                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                          <button 
                            onClick={() => toggleAnswer(idx)}
                            style={{ 
                              background: "transparent", 
                              border: "none", 
                              color: "var(--primary)", 
                              fontSize: "0.85rem", 
                              fontWeight: 600, 
                              cursor: "pointer", 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "0.5rem" 
                            }}
                          >
                            {visibleAnswers.includes(idx) ? <EyeOff size={16} /> : <Eye size={16} />}
                            {visibleAnswers.includes(idx) ? "Sembunyikan Jawaban" : "Lihat Jawaban"}
                          </button>
                          
                          {visibleAnswers.includes(idx) && (
                            <div className="animate-slide-up" style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "var(--text-four)", background: "var(--surface-two)", padding: "0.75rem", borderRadius: "8px" }}>
                              {q.answer}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* D. Keywords & Unclear */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                  <div className="result-card">
                    <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Search size={20} /> Kata Kunci
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {result.keywords.map((k, idx) => (
                        <span key={idx} style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", background: "var(--surface-three)", borderRadius: "8px", color: "var(--text-one)" }}>
                          #{k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="result-card" style={{ borderColor: "var(--red-three)" }}>
                    <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--red-two)" }}>
                      <AlertCircle size={20} /> Bagian Kurang Jelas
                    </h3>
                    <p style={{ color: "var(--text-four)" }}>{result.unclear}</p>
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