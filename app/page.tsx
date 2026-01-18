"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Instagram, SquareTerminal, Home as HomeIcon, User, LogIn, Github, Twitter, Sparkles, Terminal, Code2, Cpu, Globe, Zap } from "lucide-react";
import { FloatingSidebar } from "../components/floating-sidebar";

const Typewriter = ({ texts }: { texts: string[] }) => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    const i = loopNum % texts.length;
    const fullText = texts[i];

    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && text === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
    } else {
      timer = setTimeout(() => {
        setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));
      }, isDeleting ? 50 : 150);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, texts]);

  return <span>{text}</span>;
};

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main>
      <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      {/* Navigation */}
      <nav>
        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--text-one)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Terminal size={24} color="var(--primary)" />
          <span>Jiya<span style={{ color: "var(--primary)" }}>World</span></span>
        </div>
        <div className="nav-buttons">
          <Link href="/" className="nav-btn" style={{ gap: "0.5rem" }}><HomeIcon size={18} /> Home</Link>
          <Link href="/about" className="nav-btn" style={{ gap: "0.5rem" }}><User size={18} /> About</Link>
          <button className="nav-btn" style={{ backgroundColor: "var(--primary)", color: "var(--text-three)", gap: "0.5rem" }}>
            <LogIn size={18} /> Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="wrapper">
        <header style={{ marginBottom: "4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", textAlign: "center" }}>
          {/* Avatar */}
          <div style={{ flex: "0 0 auto" }} className="animate-float">
            <img 
              src="/avatar.png" 
              alt="Jiya" 
              style={{ 
                width: "200px", 
                height: "200px", 
                borderRadius: "50%", 
                objectFit: "cover", 
                border: "4px solid var(--surface-three)",
                boxShadow: "var(--drop-shadow-one)"
              }} 
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", maxWidth: "700px" }}>
            {/* Status Indicator */}
            <div className="animate-slide-up" style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "0.75rem", 
              padding: "0.5rem 1rem", 
              backgroundColor: "var(--surface-three)", 
              borderRadius: "100px",
              width: "fit-content",
              border: "1px solid var(--border)"
            }}>
              <span className="status-dot"></span>
              <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-one)" }}>Online & Ready to Code</span>
            </div>

            {/* Name & Title */}
            <h1 className="animate-slide-up" style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)", lineHeight: "1.1", animationDelay: "0.1s" }}>
              Hi, I'm <span style={{ color: "var(--primary)" }}>Jiya</span>
            </h1>
            
            {/* Bio */}
            <p className="animate-slide-up" style={{ fontSize: "1.2rem", color: "var(--text-four)", maxWidth: "650px", lineHeight: "1.7", animationDelay: "0.2s" }}>
              Welcome to my digital space. I am a creative developer passionate about building beautiful interfaces and solving complex problems. 
              Exploring the boundaries of web technology.
            </p>
            
            {/* CTA Buttons */}
            <div className="animate-slide-up" style={{ marginTop: "2rem", display: "flex", gap: "1rem", animationDelay: "0.3s", flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={() => setIsSidebarOpen(true)} className="btn-hero primary">
                <SquareTerminal size={20} />
                <span>Explore Tools</span>
              </button>
              <Link href="https://www.instagram.com/jiya.py" target="_blank" className="btn-hero outline">
                <Instagram size={20} />
                <span>Follow Me</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Terminal Window Decoration */}
        <div style={{
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto 4rem auto",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          backgroundColor: "var(--surface-two)",
          boxShadow: "var(--drop-shadow-one)",
          overflow: "hidden"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.75rem 1rem",
            backgroundColor: "var(--surface-three)",
            borderBottom: "1px solid var(--border)"
          }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f56" }}></div>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffbd2e" }}></div>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27c93f" }}></div>
            <div style={{ marginLeft: "auto", marginRight: "auto", fontSize: "0.85rem", color: "var(--text-four)", fontFamily: "monospace", opacity: 0.7 }}>jiya@world:~</div>
          </div>
          <div style={{ padding: "1.5rem", fontFamily: "monospace", fontSize: "0.95rem", color: "var(--text-four)", minHeight: "100px" }}>
             <div>
                <span style={{ color: "var(--primary)", marginRight: "0.5rem" }}>jiya@world:~$</span>
                <Typewriter texts={["welcome to website", "kinda lazy but...", "stay tuned for more", "just a hobbyist"]} />
                <span className="cursor-blink">_</span>
             </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="section-title">Powered By</div>
        <div className="tech-grid">
          <div className="tech-item"><Code2 size={16} /> Next.js</div>
          <div className="tech-item"><Cpu size={16} /> TypeScript</div>
          <div className="tech-item"><Globe size={16} /> React</div>
          <div className="tech-item"><Zap size={16} /> Vercel</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer-minimal">
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="https://github.com">GitHub</Link>
        </div>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Jiya World. Crafted with passion.
        </div>
      </footer>
    </main>
  );
}
