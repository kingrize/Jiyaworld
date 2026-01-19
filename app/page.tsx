/* app/page.tsx */
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Compass, Terminal, Code2, Cpu, Globe, Zap, LayoutGrid, Heart } from "lucide-react";
import { FloatingSidebar } from "@/components/floating-sidebar";
import { ChatBubble } from "@/components/chat-bubble";

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
  const [scrollY, setScrollY] = useState(0);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate parallax offset (subtle movement)
  const parallaxOffset = scrollY * 0.15;

  return (
    <main>
      <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Pasang ChatBubble disini */}
      <ChatBubble />

      {/* STICKY NAVBAR */}
      <nav>
        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--text-one)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Terminal size={24} color="var(--primary)" />
          <span>Jiya<span style={{ color: "var(--primary)" }}>World</span></span>
        </div>

        {/* Tombol Sidebar Mobile */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="nav-sidebar-btn"
          aria-label="Open Menu"
        >
          <LayoutGrid size={24} />
        </button>
      </nav>

      <div className="wrapper">
        {/* Hero Header */}
        <header className="hero-header">

          {/* Avatar with Glow and Parallax */}
          <div
            ref={avatarRef}
            className="hero-avatar-wrapper animate-float"
            style={{
              position: "relative",
              transform: `translateY(${parallaxOffset}px)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            {/* Gradient Glow Background */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "280px",
              height: "280px",
              background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
              opacity: 0.15,
              borderRadius: "50%",
              filter: "blur(40px)",
              zIndex: -1,
              animation: "pulseGlow 4s ease-in-out infinite",
            }} />

            {/* Secondary Glow Layer */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "320px",
              height: "320px",
              background: "radial-gradient(circle, var(--secondary) 0%, transparent 60%)",
              opacity: 0.1,
              borderRadius: "50%",
              filter: "blur(60px)",
              zIndex: -2,
            }} />

            <img
              src="/avatar.png"
              alt="Jiya"
              className="hero-avatar"
              style={{
                position: "relative",
                zIndex: 1,
              }}
            />
          </div>

          <div className="hero-content">
            {/* Status */}
            <div className="animate-slide-up" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.5rem 1rem",
              backgroundColor: "var(--surface-three)",
              borderRadius: "100px",
              border: "1px solid var(--border)"
            }}>
              <span className="status-dot"></span>
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-one)" }}>Online & Ready</span>
            </div>

            {/* Title & Bio */}
            <h1 className="hero-title animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Hi, I'm <span style={{ color: "var(--primary)" }}>Jiya</span>
            </h1>

            <p className="hero-bio animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Welcome to my digital space. I am a creative developer passionate about building beautiful interfaces and solving complex problems.
            </p>

            {/* CTA Buttons */}
            <div className="animate-slide-up" style={{ marginTop: "1rem", display: "flex", gap: "1rem", animationDelay: "0.3s", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="btn-hero primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem" }}
              >
                <Compass size={20} />
                <span>Explore Tools</span>
              </button>
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
          {/* HEADER TERMINAL */}
          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.75rem 1rem",
            backgroundColor: "var(--surface-three)",
            borderBottom: "1px solid var(--border)"
          }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ff5f56", zIndex: 10 }}></div>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ffbd2e", zIndex: 10 }}></div>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#27c93f", zIndex: 10 }}></div>

            <div style={{
              position: "absolute",
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: "0.85rem",
              color: "var(--text-four)",
              fontFamily: "monospace",
              opacity: 0.7,
              pointerEvents: "none"
            }}>
              jiya@world:~
            </div>
          </div>

          <div style={{ padding: "1.5rem", fontFamily: "monospace", fontSize: "0.95rem", color: "var(--text-four)", minHeight: "100px" }}>
            <div>
              <span style={{ color: "var(--primary)", marginRight: "0.5rem" }}>jiya@world:~$</span>
              <Typewriter texts={["welcome to website", "kinda lazy but...", "stay tuned for more", "just a hobbyist"]} />
              <span className="cursor-blink">_</span>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="section-title">Powered By</div>
        <div className="tech-grid">
          <div className="tech-item"><Code2 size={16} /> Next.js</div>
          <div className="tech-item"><Cpu size={16} /> TypeScript</div>
          <div className="tech-item"><Globe size={16} /> React</div>
          <div className="tech-item"><Zap size={16} /> Vercel</div>
        </div>
      </div>

      <footer className="footer-minimal">
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="https://github.com">GitHub</Link>
        </div>
        <div className="footer-copy" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          flexWrap: "wrap"
        }}>
          <span>Made with</span>
          <Heart
            size={16}
            fill="var(--red-one)"
            color="var(--red-one)"
            style={{
              animation: "heartbeat 1.5s ease-in-out infinite",
            }}
          />
          <span>and</span>
          <span style={{
            fontWeight: 600,
            color: "var(--text-one)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem"
          }}>
            Next.js
          </span>
        </div>
        <div style={{
          fontSize: "0.8rem",
          color: "var(--text-four)",
          opacity: 0.5,
          marginTop: "0.5rem"
        }}>
          © {new Date().getFullYear()} Jiya World
        </div>
      </footer>

      {/* Custom Keyframes for Glow Animation */}
      <style jsx global>{`
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.15;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.25;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.15);
          }
          50% {
            transform: scale(1);
          }
          75% {
            transform: scale(1.15);
          }
        }
      `}</style>
    </main>
  );
}