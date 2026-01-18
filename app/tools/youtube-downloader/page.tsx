"use client";

import { useState } from "react";
import Link from "next/link";
import { FloatingSidebar } from "@/components/floating-sidebar";
import { 
  LayoutGrid, ArrowLeft, Youtube, Download, 
  Loader2, Music, Video, AlertCircle, CheckCircle 
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
        throw new Error(data.error || "Gagal mengambil data video.");
      }

      setResult({ url: data.url, filename: data.filename });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* NAVBAR */}
      <nav style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: "1px solid var(--border)", background: "var(--background-one)", display: "flex", justifyContent: "space-between", padding: "1rem 2rem", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-four)", padding: "0.5rem", borderRadius: "8px", transition: "all 0.2s" }} className="hover:bg-[var(--surface-three)] hover:text-[var(--text-one)]">
            <ArrowLeft size={20} />
            <span style={{ fontWeight: 600 }}>Back</span>
          </Link>
          <div style={{ height: "24px", width: "1px", background: "var(--border)" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", fontSize: "1.1rem" }}>
            <Youtube size={24} color="#FF0000" />
            <span>YT Saver</span>
          </div>
        </div>
        <button 
           onClick={() => setIsSidebarOpen(true)} 
           style={{ background: "transparent", border: "none", color: "var(--text-four)", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <LayoutGrid size={24} />
        </button>
      </nav>

      <div className="wrapper" style={{ maxWidth: "800px", marginTop: "4rem" }}>
        
        <header className="hero-header" style={{ marginBottom: "3rem" }}>
          <div className="animate-slide-up">
            <h1 className="hero-title" style={{ fontSize: "2.5rem" }}>
              YouTube <span style={{ color: "#FF0000" }}>Downloader</span>
            </h1>
            <p className="hero-bio" style={{ margin: "1rem auto 0" }}>
              Download video atau musik dari YouTube dengan kualitas terbaik. Tanpa iklan, tanpa ribet.
            </p>
          </div>
        </header>

        <div className="card animate-slide-up" style={{ padding: "2rem" }}>
          
          {/* Format Selector */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
             <button 
               onClick={() => setMode("video")}
               style={{ 
                 display: "flex", alignItems: "center", gap: "0.5rem",
                 padding: "0.75rem 1.5rem", borderRadius: "100px",
                 background: mode === "video" ? "var(--text-one)" : "var(--surface-three)",
                 color: mode === "video" ? "var(--background-one)" : "var(--text-four)",
                 border: "none", cursor: "pointer", fontWeight: "600", transition: "all 0.2s"
               }}
             >
               <Video size={18} /> Video (MP4)
             </button>
             <button 
               onClick={() => setMode("audio")}
               style={{ 
                 display: "flex", alignItems: "center", gap: "0.5rem",
                 padding: "0.75rem 1.5rem", borderRadius: "100px",
                 background: mode === "audio" ? "var(--text-one)" : "var(--surface-three)",
                 color: mode === "audio" ? "var(--background-one)" : "var(--text-four)",
                 border: "none", cursor: "pointer", fontWeight: "600", transition: "all 0.2s"
               }}
             >
               <Music size={18} /> Audio (MP3)
             </button>
          </div>

          <form onSubmit={handleDownload} style={{ position: "relative" }}>
             <div style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}>
               <input 
                 type="text" 
                 placeholder="Paste YouTube Link here..." 
                 value={url}
                 onChange={(e) => setUrl(e.target.value)}
                 style={{ 
                   width: "100%", padding: "1.25rem", borderRadius: "16px",
                   border: "2px solid var(--border)", background: "var(--surface-two)",
                   color: "var(--text-one)", fontSize: "1rem"
                 }}
               />
               <button 
                 type="submit" 
                 disabled={loading || !url}
                 className="btn-hero primary"
                 style={{ width: "100%", borderRadius: "16px", padding: "1.25rem" }}
               >
                 {loading ? (
                   <>
                     <Loader2 size={20} className="animate-spin" /> Processing...
                   </>
                 ) : (
                   <>
                     <Download size={20} /> Convert & Download
                   </>
                 )}
               </button>
             </div>
          </form>

          {error && (
            <div className="animate-slide-up" style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "12px", background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.2)", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <AlertCircle size={20} />
              <p style={{ fontSize: "0.9rem", margin: 0 }}>{error}</p>
            </div>
          )}

          {result && (
            <div className="animate-slide-up" style={{ marginTop: "2rem", padding: "1.5rem", borderRadius: "16px", background: "var(--surface-three)", border: "1px solid var(--primary)", textAlign: "center" }}>
               <div style={{ width: "60px", height: "60px", background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", color: "var(--background-one)" }}>
                 <CheckCircle size={32} />
               </div>
               <h3 style={{ fontSize: "1.2rem", color: "var(--text-one)", marginBottom: "0.5rem" }}>Ready to Download!</h3>
               <p style={{ color: "var(--text-four)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                 File siap disimpan. Klik tombol di bawah.
               </p>
               
               <a 
                 href={result.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="btn-hero"
                 style={{ background: "var(--text-one)", color: "var(--background-one)", width: "100%", display: "flex", justifyContent: "center" }}
               >
                 <Download size={20} /> Download {mode === 'video' ? 'Video' : 'Audio'}
               </a>
            </div>
          )}

        </div>

        {/* Info */}
        <div style={{ marginTop: "2rem", textAlign: "center", color: "var(--text-four)", fontSize: "0.85rem", opacity: 0.6 }}>
           <p>Powered by Cobalt API • No Data Stored</p>
        </div>
        
      </div>
    </main>
  );
}