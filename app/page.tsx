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
  const parallaxOffset = scrollY * 0.12;

  return (
    <main>
      <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <ChatBubble />

      {/* STICKY NAVBAR */}
      <nav>
        <div className="nav-brand">
          <Terminal size={22} className="nav-brand-icon" />
          <span>Jiya<span className="nav-brand-accent">World</span></span>
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="nav-sidebar-btn"
          aria-label="Open Menu"
        >
          <LayoutGrid size={22} />
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
              transform: `translateY(${parallaxOffset}px)`,
            }}
          >
            {/* Gradient Glow Background */}
            <div className="hero-glow hero-glow-primary" />
            <div className="hero-glow hero-glow-secondary" />

            <img
              src="/avatar.png"
              alt="Jiya"
              className="hero-avatar"
            />
          </div>

          <div className="hero-content">
            {/* Status Badge */}
            <div className="status-badge animate-slide-up">
              <span className="status-dot" />
              <span className="status-text">Online & Ready</span>
            </div>

            {/* Title & Bio */}
            <h1 className="hero-title animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Hi, I'm <span className="text-primary">Jiya</span>
            </h1>

            <p className="hero-bio animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Welcome to my digital space. I am a creative developer passionate about building beautiful interfaces and solving complex problems.
            </p>

            {/* CTA Buttons */}
            <div className="hero-actions animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="btn-hero primary"
              >
                <Compass size={20} />
                <span>Explore Tools</span>
              </button>
            </div>
          </div>
        </header>

        {/* Terminal Window */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
            </div>
            <span className="terminal-title">jiya@world:~</span>
          </div>

          <div className="terminal-body">
            <div className="terminal-line">
              <span className="terminal-prompt">jiya@world:~$</span>
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
        <div className="footer-made-with">
          <span>Made with</span>
          <Heart size={16} className="footer-heart" />
          <span>and</span>
          <span className="footer-tech">Next.js</span>
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} Jiya World
        </div>
      </footer>
    </main>
  );
}