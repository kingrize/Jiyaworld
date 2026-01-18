"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, Brain, Send, AlertCircle, CheckCircle2, Mic, BookOpen } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

type Mode = 'strict' | 'smart';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

export default function StudyAI() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<Mode>('strict');
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [largeFileWarning, setLargeFileWarning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Cek tipe file (hanya PDF)
    if (selectedFile.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    setFile(selectedFile);
    
    // Logika: Jika file > 10MB (10 * 1024 * 1024 bytes)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setLargeFileWarning(true);
      // Di sini nanti akan ada logika converter PDF to Text
      console.log("File > 10MB, switching to text conversion mode...");
    } else {
      setLargeFileWarning(false);
    }
  };

  const startExam = () => {
    if (!file) return;
    setIsProcessing(true);

    // Simulasi proses analisa AI
    setTimeout(() => {
      setIsProcessing(false);
      setChatStarted(true);
      setMessages([
        { 
          role: 'ai', 
          content: `Hello! I've analyzed "${file.name}" in ${mode} mode. Let's start your oral exam. Are you ready for the first question?` 
        }
      ]);
    }, 2000);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input } as Message];
    setMessages(newMessages);
    setInput('');

    // Simulasi respon AI
    setTimeout(() => {
      setMessages([...newMessages, { 
        role: 'ai', 
        content: "That's an interesting point. Based on the material, can you elaborate more on..." 
      }]);
    }, 1000);
  };

  return (
    <main className="min-h-screen flex flex-col md:pl-20">
      <Navbar />

      <div className="wrapper flex-grow flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-3xl">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[var(--text-one)] mb-2 flex items-center justify-center gap-3">
              <BookOpen className="text-[var(--primary)]" size={40} />
              StudyAI
            </h1>
            <p className="text-[var(--text-four)]">Your personal AI Oral Exam Assistant.</p>
          </div>

          {!chatStarted ? (
            /* Upload & Setup Section */
            <div className="bg-[var(--surface-two)] border border-[var(--border)] rounded-2xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* File Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${file ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:border-[var(--text-four)]'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={48} className="text-[var(--primary)]" />
                    <span className="font-bold text-[var(--text-one)]">{file.name}</span>
                    <span className="text-sm text-[var(--text-four)]">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {largeFileWarning && (
                      <div className="flex items-center gap-2 text-[var(--yellow-one)] text-sm mt-2 bg-[var(--surface-one)] px-3 py-1 rounded-full">
                        <AlertCircle size={16} />
                        <span>Large file detected. Auto-converting to text...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[var(--text-four)]">
                    <Upload size={48} />
                    <span className="font-medium">Click to upload your material (.pdf)</span>
                    <span className="text-xs">Max size 10MB (Auto-convert if larger)</span>
                  </div>
                )}
              </div>

              {/* Mode Selection */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setMode('strict')}
                  className={`p-4 rounded-xl border text-left transition-all ${mode === 'strict' ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]' : 'border-[var(--border)] hover:bg-[var(--surface-three)]'}`}
                >
                  <div className="font-bold text-[var(--text-one)] flex items-center gap-2"><CheckCircle2 size={18}/> Strict Mode</div>
                  <div className="text-xs text-[var(--text-four)] mt-1">Strictly based on the uploaded PDF material only.</div>
                </button>
                <button 
                  onClick={() => setMode('smart')}
                  className={`p-4 rounded-xl border text-left transition-all ${mode === 'smart' ? 'border-[var(--secondary)] bg-[var(--secondary)]/10 ring-1 ring-[var(--secondary)]' : 'border-[var(--border)] hover:bg-[var(--surface-three)]'}`}
                >
                  <div className="font-bold text-[var(--text-one)] flex items-center gap-2"><Brain size={18}/> Smart Mode</div>
                  <div className="text-xs text-[var(--text-four)] mt-1">Uses material + relevant external knowledge.</div>
                </button>
              </div>

              {/* Start Button */}
              <button 
                disabled={!file || isProcessing}
                onClick={startExam}
                className="w-full mt-8 btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Analyzing Material...' : 'Start Oral Exam'}
              </button>
            </div>
          ) : (
            /* Chat Interface */
            <div className="bg-[var(--surface-two)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-300">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-[var(--primary)] text-[var(--background-one)] rounded-tr-none' : 'bg-[var(--surface-three)] text-[var(--text-one)] rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-one)] flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your answer..."
                  className="flex-1 bg-[var(--surface-two)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-one)] focus:outline-none focus:border-[var(--primary)]"
                />
                <button onClick={sendMessage} className="p-3 bg-[var(--primary)] text-[var(--background-one)] rounded-xl hover:opacity-90 transition-opacity">
                  <Send size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
