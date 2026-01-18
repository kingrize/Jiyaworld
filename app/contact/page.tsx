"use client";

import Link from "next/link";
import { useState } from "react";
import { Terminal, LayoutGrid, Mail, Send, Github, Instagram, Twitter, ArrowLeft, MessageSquare } from "lucide-react";
import { FloatingSidebar } from "../../components/floating-sidebar";

export default function Contact() {
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
            <Mail size={20} color="var(--primary)" />
            <span>Contact</span>
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
        <header className="hero-header" style={{ marginBottom: "3rem" }}>
          <div className="animate-slide-up">
            <h1 className="hero-title" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}>
              Let's <span style={{ color: "var(--primary)" }}>Connect</span>
            </h1>
            <p className="hero-bio" style={{ margin: "1rem auto 0" }}>
              Punya pertanyaan, ide proyek, atau sekadar ingin menyapa? Jangan ragu untuk menghubungi saya.
            </p>
          </div>
        </header>

        <div className="study-grid animate-slide-up" style={{ gap: "3rem" }}>
          
          {/* Left Column: Contact Info & Socials */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="card">
              <h3 style={{ marginBottom: "1.5rem", color: "var(--text-one)" }}>Get in Touch</h3>
              <p style={{ color: "var(--text-four)", lineHeight: "1.6", marginBottom: "2rem" }}>
                Saya selalu terbuka untuk mendiskusikan proyek baru, ide kreatif, atau peluang untuk menjadi bagian dari visi Anda.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <a href="mailto:jiya@example.com" style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--text-one)", textDecoration: "none" }} className="hover:text-[var(--primary)] transition-colors">
                  <div style={{ padding: "0.75rem", background: "var(--surface-four)", borderRadius: "12px", color: "var(--primary)" }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-four)" }}>Email Me</div>
                    <div style={{ fontWeight: "500" }}>jiya@example.com</div>
                  </div>
                </a>
                
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ padding: "0.75rem", background: "var(--surface-four)", borderRadius: "12px", color: "var(--primary)" }}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-four)" }}>Socials</div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                      <Link href="https://instagram.com" target="_blank" style={{ color: "var(--text-one)" }} className="hover:text-[var(--primary)]"><Instagram size={20} /></Link>
                      <Link href="https://twitter.com" target="_blank" style={{ color: "var(--text-one)" }} className="hover:text-[var(--primary)]"><Twitter size={20} /></Link>
                      <Link href="https://github.com" target="_blank" style={{ color: "var(--text-one)" }} className="hover:text-[var(--primary)]"><Github size={20} /></Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="card">
             <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-one)" }}>Name</label>
                  <input type="text" placeholder="Your Name" style={{ background: "var(--background-one)" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-one)" }}>Email</label>
                  <input type="email" placeholder="your@email.com" style={{ background: "var(--background-one)" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-one)" }}>Message</label>
                  <textarea rows={5} placeholder="Hello, I'd like to talk about..." style={{ background: "var(--background-one)", resize: "vertical" }}></textarea>
                </div>
                <button className="btn-hero primary" style={{ width: "100%", borderRadius: "12px" }}>
                  <Send size={18} /> Send Message
                </button>
             </form>
          </div>

        </div>
      </div>

      <footer className="footer-minimal">
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact" style={{ color: "var(--primary)" }}>Contact</Link>
          <Link href="https://github.com">GitHub</Link>
        </div>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Jiya World. Crafted with passion.
        </div>
      </footer>
    </main>
  );
}