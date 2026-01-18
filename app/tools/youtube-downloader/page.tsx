"use client";

import { useState } from "react";
import Link from "next/link";
import { FloatingSidebar } from "@/components/floating-sidebar";
import { 
  LayoutGrid, ArrowLeft, Youtube, Download, 
  Loader2, Music, Video, Zap, ShieldCheck, Sparkles, Terminal 
} from "lucide-react";

export default function YoutubeDownloader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [mode, setMode] = useState<"video" | "audio">("video");

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/youtube-downloader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type: mode }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "request failed.");
      }

      setResult({ url: data.url, filename: data.filename });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", paddingBottom: "4rem" }}>
      <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* NAVBAR */}
      <nav style={{ 
        position: "sticky", top: 0, zIndex: 40, 
        borderBottom: "1px solid var(--border)", 
        background: "rgba(var(--background-one), 0.8)", 
        backdropFilter: "blur(12px)",
        display: "flex", justifyContent: "space-between", 
        padding: "1rem 2rem", alignItems: "center" 
      }}>
        {/* Left Side: Back Button & Logo (Updated Structure) */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-four)", padding: "0.5rem", borderRadius: "8px", transition: "all 0.2s" }} className="hover:bg-[var(--surface-three)] hover:text-[var(--text-one)]">
            <ArrowLeft size={20} />
            <span style={{ fontWeight: 600 }}>Back</span>
          </Link>
          <div style={{ height: "24px", width: "1px", background: "var(--border)" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", fontSize: "1.1rem" }}>
            <Youtube size={20} color="#FF0000" />
            <span>YT Grabber</span>
          </div>
        </div>

        {/* Right Side: Sidebar Trigger */}
        <button 
           onClick={() => setIsSidebarOpen(true)} 
           style={{ background: "transparent", border: "none", color: "var(--text-four)", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <LayoutGrid size={24} />
        </button>
      </nav>

      <div className="wrapper" style={{ maxWidth: "900px", marginTop: "4rem" }}>
        
        {/* HEADER HERO */}
        <header className="animate-slide-up" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ 
            fontSize: "clamp(2.5rem, 5vw, 3.5rem)", 
            fontWeight: 800, lineHeight: 1.1, marginBottom: "1rem", 
            color: "var(--text-one)", letterSpacing: "-0.03em"
          }}>
            yt <span style={{ color: "var(--primary)" }}>grabber</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-four)", maxWidth: "600px", margin: "0 auto" }}>
            simple cobalt wrapper. paste link, get file, go touch grass.
            <br/>no ads, no tracking, works on my machine.
          </p>
        </header>

        {/* MAIN PANEL */}
        <div className="animate-slide-up" style={{ 
          background: "var(--surface-two)", 
          borderRadius: "32px",
          padding: "2.5rem",
          border: "1px solid var(--border)",
          boxShadow: "var(--drop-shadow-one)",
          animationDelay: "0.1s"
        }}>
          
          {/* TOGGLE PILLS */}
          <div style={{ 
            display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2.5rem",
            background: "var(--surface-three)", padding: "0.5rem", borderRadius: "100px",
            width: "fit-content", margin: "0 auto 2.5rem"
          }}>
             <button 
               onClick={() => setMode("video")}
               style={{ 
                 display: "flex", alignItems: "center", gap: "0.5rem",
                 padding: "0.75rem 2rem", borderRadius: "100px",
                 background: mode === "video" ? "var(--primary)" : "transparent",
                 color: mode === "video" ? "var(--text-three)" : "var(--text-four)",
                 border: "none", cursor: "pointer", fontWeight: "600", 
                 transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                 boxShadow: mode === "video" ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
               }}
             >
               <Video size={18} /> .mp4
             </button>
             <button 
               onClick={() => setMode("audio")}
               style={{ 
                 display: "flex", alignItems: "center", gap: "0.5rem",
                 padding: "0.75rem 2rem", borderRadius: "100px",
                 background: mode === "audio" ? "var(--secondary)" : "transparent",
                 color: mode === "audio" ? "#fff" : "var(--text-four)",
                 border: "none", cursor: "pointer", fontWeight: "600", 
                 transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                 boxShadow: mode === "audio" ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
               }}
             >
               <Music size={18} /> .mp3
             </button>
          </div>

          <form onSubmit={handleDownload} style={{ position: "relative", marginBottom: "2rem" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
               
               {/* INPUT FIELD */}
               <div style={{ position: "relative" }}>
                 <div style={{ 
                   position: "absolute", left: "1.5rem", top: "50%", transform: "translateY(-50%)", 
                   color: "var(--text-four)", pointerEvents: "none" 
                 }}>
                   <Terminal size={20} />
                 </div>
                 <input 
                   type="text" 
                   placeholder="ctrl+v that link here..." 
                   value={url}
                   onChange={(e) => setUrl(e.target.value)}
                   style={{ 
                     width: "100%", padding: "1.5rem 1.5rem 1.5rem 4rem", 
                     borderRadius: "24px",
                     border: "2px solid transparent", 
                     background: "var(--surface-three)", 
                     color: "var(--text-one)", fontSize: "1.1rem",
                     transition: "all 0.3s"
                   }}
                   onFocus={(e) => {
                     e.target.style.borderColor = "var(--primary)";
                     e.target.style.background = "var(--background-one)";
                   }}
                   onBlur={(e) => {
                     e.target.style.borderColor = "transparent";
                     e.target.style.background = "var(--surface-three)";
                   }}
                 />
               </div>

               <button 
                 type="submit" 
                 disabled={loading || !url}
                 className="btn-hero primary"
                 style={{ 
                   width: "100%", borderRadius: "24px", padding: "1.25rem", 
                   fontSize: "1.1rem", display: "flex", justifyContent: "center", alignItems: "center"
                 }}
               >
                 {loading ? (
                   <>
                     <Loader2 size={24} className="animate-spin" /> executing...
                   </>
                 ) : (
                   <>
                     <Download size={24} /> fetch media
                   </>
                 )}
               </button>
             </div>
          </form>

          {error && (
            <div className="animate-slide-up" style={{ 
              marginTop: "1.5rem", padding: "1.5rem", borderRadius: "20px", 
              background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", 
              color: "#ef4444", display: "flex", alignItems: "center", gap: "1rem" 
            }}>
              <div style={{ background: "#ef4444", borderRadius: "50%", padding: "4px", color: "white" }}>
                 <Sparkles size={16} />
              </div>
              <p style={{ fontWeight: 500 }}>error 400: {error.toLowerCase()}</p>
            </div>
          )}

          {result && (
            <div className="animate-slide-up" style={{ 
              marginTop: "2rem", padding: "2rem", borderRadius: "24px", 
              background: "var(--surface-three)", border: "1px solid var(--primary)", 
              textAlign: "center", position: "relative", overflow: "hidden"
            }}>
               <div style={{ 
                 position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", 
                 width: "200px", height: "200px", background: "var(--primary)", 
                 filter: "blur(80px)", opacity: 0.15, borderRadius: "50%" 
               }}></div>

               <h3 style={{ fontSize: "1.5rem", color: "var(--text-one)", marginBottom: "0.5rem", position: "relative" }}>
                 return 200 ok
               </h3>
               <p style={{ color: "var(--text-four)", fontSize: "1rem", marginBottom: "2rem", position: "relative" }}>
                 payload received: <strong>{result.filename}</strong>
               </p>
               
               <a 
                 href={result.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="btn-hero"
                 style={{ 
                   background: "var(--text-one)", color: "var(--background-one)", 
                   width: "100%", display: "flex", justifyContent: "center", 
                   position: "relative", zIndex: 10
                 }}
               >
                 <Download size={20} /> save to disk
               </a>
            </div>
          )}
        </div>

        {/* FEATURES GRID */}
        <div style={{ marginTop: "4rem" }}>
          <h2 className="section-title" style={{ margin: "0 auto 2rem", maxWidth: "200px" }}>// specs</h2>
          
          <div style={{ 
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" 
          }}>
            {/* Feature 1 */}
            <div className="animate-slide-up" style={{ 
              background: "var(--surface-two)", padding: "1.5rem", borderRadius: "24px",
              border: "1px solid var(--border)", animationDelay: "0.2s"
            }}>
              <div style={{ 
                width: "50px", height: "50px", background: "var(--surface-three)", 
                borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1rem", color: "var(--primary)"
              }}>
                <Zap size={24} />
              </div>
              <h4 style={{ color: "var(--text-one)", fontSize: "1.1rem", marginBottom: "0.5rem" }}>blazingly fast</h4>
              <p style={{ color: "var(--text-four)", fontSize: "0.9rem" }}>
                almost O(1) complexity. no queues, no waiting room. just fetch() and go.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="animate-slide-up" style={{ 
              background: "var(--surface-two)", padding: "1.5rem", borderRadius: "24px",
              border: "1px solid var(--border)", animationDelay: "0.3s"
            }}>
              <div style={{ 
                width: "50px", height: "50px", background: "var(--surface-three)", 
                borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1rem", color: "#10b981"
              }}>
                <ShieldCheck size={24} />
              </div>
              <h4 style={{ color: "var(--text-one)", fontSize: "1.1rem", marginBottom: "0.5rem" }}>/dev/null logs</h4>
              <p style={{ color: "var(--text-four)", fontSize: "0.9rem" }}>
                we don't save your data. we don't care what you watch. stay anonymous.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="animate-slide-up" style={{ 
              background: "var(--surface-two)", padding: "1.5rem", borderRadius: "24px",
              border: "1px solid var(--border)", animationDelay: "0.4s"
            }}>
               <div style={{ 
                width: "50px", height: "50px", background: "var(--surface-three)", 
                borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1rem", color: "#f59e0b"
              }}>
                <Sparkles size={24} />
              </div>
              <h4 style={{ color: "var(--text-one)", fontSize: "1.1rem", marginBottom: "0.5rem" }}>high def</h4>
              <p style={{ color: "var(--text-four)", fontSize: "0.9rem" }}>
                max bitrate or nothing. 4k support if available. 144p hurts my eyes.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  );
}