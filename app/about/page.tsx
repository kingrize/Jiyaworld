"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  User, LayoutGrid, ArrowLeft, 
  Code2, Palette, Tv, Languages, 
  Facebook, Instagram 
} from "lucide-react";
import { FloatingSidebar } from "../../components/floating-sidebar";

// Data Skills
const skills = [
  { name: "JavaScript", level: 90 },
  { name: "TypeScript", level: 85 },
  { name: "React", level: 88 },
  { name: "Next.js", level: 85 },
  { name: "Node.js", level: 75 },
  { name: "Tailwind CSS", level: 95 },
];

export default function About() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main>
      <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* STICKY NAVBAR */}
      <nav>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-four)", padding: "0.5rem", borderRadius: "8px", transition: "all 0.2s" }} className="hover:bg-[var(--surface-three)] hover:text-[var(--text-one)]">
            <ArrowLeft size={20} />
            <span style={{ fontWeight: 600 }}>Back</span>
          </Link>
          <div style={{ height: "24px", width: "1px", background: "var(--border)" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", fontSize: "1.1rem", color: "var(--text-one)" }}>
            <User size={20} color="var(--primary)" />
            <span>About Me</span>
          </div>
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
        
        {/* HERO SECTION - Minimalist Center */}
        <header className="hero-header" style={{ marginBottom: "6rem" }}>
          <div className="hero-avatar-wrapper animate-float">
            <img 
              src="/avatar.png" 
              alt="Jiya" 
              className="hero-avatar"
            />
          </div>
          <div className="animate-slide-up" style={{ textAlign: "center", maxWidth: "600px" }}>
            <h1 className="hero-title" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
              About <span style={{ color: "var(--primary)" }}>Me</span>
            </h1>
            <p className="hero-bio" style={{ margin: "0 auto", fontSize: "1.1rem", opacity: 0.8 }}>
              Coding with creativity, fueled by curiosity (and lots of coffee).
            </p>
          </div>
        </header>

        {/* INTRODUCTION - Clean & Modern (No Heavy Cards) */}
        <section className="animate-slide-up" style={{ marginBottom: "6rem" }}>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "4rem" }}>
              
              {/* Who I Am */}
              <div>
                <h3 style={{ 
                  fontSize: "1.75rem", 
                  marginBottom: "1.5rem", 
                  color: "var(--text-one)", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  borderLeft: "3px solid var(--primary)",
                  paddingLeft: "1rem"
                }}>
                  Who I Am
                </h3>
                <p style={{ lineHeight: "1.8", color: "var(--text-four)", fontSize: "1.05rem" }}>
                  Hi, I'm Jiya. I don't just write code; I <span style={{ color: "var(--text-one)", fontWeight: "500" }}>solve problems</span> (mostly the ones I create). 
                  I believe technology should work hard so we don't have to. 
                  Basically, I'm a detail-oriented individual who loves efficiency—mostly because I'm lazy enough to automate everything.
                </p>
              </div>
              
              {/* What I Do */}
              <div>
                <h3 style={{ 
                  fontSize: "1.75rem", 
                  marginBottom: "1.5rem", 
                  color: "var(--text-one)", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.75rem",
                  borderLeft: "3px solid var(--secondary)",
                  paddingLeft: "1rem"
                }}>
                  What I Do
                </h3>
                <p style={{ lineHeight: "1.8", color: "var(--text-four)", fontSize: "1.05rem" }}>
                  My specialty? <span style={{ color: "var(--text-one)", fontWeight: "500" }}>Modern Web Development</span>. 
                  I build interfaces that are fast, responsive, and easy on the eyes. 
                  From design concepts to clean code implementation, I enjoy the process—especially when it works on the first try (it rarely does).
                </p>
              </div>

           </div>
        </section>

        {/* SKILLS SECTION - Minimalist Progress Bars */}
        <section className="animate-slide-up" style={{ marginBottom: "6rem" }}>
           <h3 style={{ fontSize: "1.5rem", marginBottom: "2rem", color: "var(--text-one)", textAlign: "center" }}>Technical Proficiency</h3>
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem 4rem" }}>
              {skills.map(skill => (
                <div key={skill.name} style={{ marginBottom: "0.5rem" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontWeight: "600", color: "var(--text-one)", fontSize: "0.95rem" }}>{skill.name}</span>
                      <span style={{ color: "var(--text-four)", fontSize: "0.85rem", fontFamily: "monospace" }}>{skill.level}%</span>
                   </div>
                   <div style={{ width: "100%", height: "6px", background: "var(--surface-two)", borderRadius: "100px", overflow: "hidden" }}>
                      <div style={{ 
                        width: `${skill.level}%`, 
                        height: "100%", 
                        background: "var(--primary)",
                        borderRadius: "100px",
                        transition: "width 1s ease-in-out"
                      }}></div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* BEYOND CODING - Minimalist Icons Grid */}
        <section className="animate-slide-up" style={{ marginBottom: "6rem" }}>
           <h3 style={{ fontSize: "1.5rem", marginBottom: "3rem", color: "var(--text-one)", textAlign: "center" }}>Beyond Coding</h3>
           
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", textAlign: "center" }}>
              
              {/* Design */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                 <div style={{ 
                   width: "60px", height: "60px", 
                   display: "flex", alignItems: "center", justifyContent: "center", 
                   color: "var(--primary)",
                   background: "var(--surface-two)",
                   borderRadius: "50%"
                 }}>
                    <Palette size={28} strokeWidth={1.5} />
                 </div>
                 <div>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "var(--text-one)" }}>Design</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-four)", lineHeight: "1.5" }}>Visual aesthetics & Minimalist UI/UX.</p>
                 </div>
              </div>

              {/* Anime */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                 <div style={{ 
                   width: "60px", height: "60px", 
                   display: "flex", alignItems: "center", justifyContent: "center", 
                   color: "var(--secondary)",
                   background: "var(--surface-two)",
                   borderRadius: "50%"
                 }}>
                    <Tv size={28} strokeWidth={1.5} />
                 </div>
                 <div>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "var(--text-one)" }}>Anime</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-four)", lineHeight: "1.5" }}>Because reality needs a break sometimes.</p>
                 </div>
              </div>

              {/* Learning */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                 <div style={{ 
                   width: "60px", height: "60px", 
                   display: "flex", alignItems: "center", justifyContent: "center", 
                   color: "#4ade80",
                   background: "var(--surface-two)",
                   borderRadius: "50%"
                 }}>
                    <Languages size={28} strokeWidth={1.5} />
                 </div>
                 <div>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "var(--text-one)" }}>Languages</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-four)", lineHeight: "1.5" }}>Currently pretending to learn new languages.</p>
                 </div>
              </div>

           </div>
        </section>

        {/* CONNECT / SOCIALS - Simple & Direct */}
        <section className="animate-slide-up" style={{ textAlign: "center", marginBottom: "4rem" }}>
           <h3 style={{ marginBottom: "1.5rem", color: "var(--text-one)", fontSize: "1.5rem" }}>Let's Connect</h3>
           
           <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <a 
                href="https://www.facebook.com/shallwelife" 
                target="_blank" 
                style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem", 
                  color: "var(--text-four)", fontSize: "0.95rem",
                  transition: "color 0.2s" 
                }}
                className="hover:text-[var(--text-one)]"
              >
                 <Facebook size={20} /> <span style={{ borderBottom: "1px solid transparent" }} className="hover:border-[var(--text-one)]">Facebook</span>
              </a>
              
              <a 
                href="https://www.instagram.com/jiya.py" 
                target="_blank" 
                style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem", 
                  color: "var(--text-four)", fontSize: "0.95rem",
                  transition: "color 0.2s" 
                }}
                className="hover:text-[var(--text-one)]"
              >
                 <Instagram size={20} /> <span style={{ borderBottom: "1px solid transparent" }} className="hover:border-[var(--text-one)]">Instagram</span>
              </a>
           </div>
        </section>

      </div>

      <footer className="footer-minimal">
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/about" style={{ color: "var(--primary)" }}>About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="https://github.com">GitHub</Link>
        </div>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Jiya World. Crafted with passion (and minimal effort).
        </div>
      </footer>
    </main>
  );
}