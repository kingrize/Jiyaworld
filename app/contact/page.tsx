"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutGrid, ArrowLeft, AtSign, Github, Instagram } from "lucide-react";
import { FloatingSidebar } from "../../components/floating-sidebar";

export default function Contact() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="personal-room">
      <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* NAVBAR */}
      <nav>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--on-surface-muted)",
              padding: "0.5rem",
              borderRadius: "8px",
              transition: "all 0.2s",
              textDecoration: "none"
            }}
          >
            <ArrowLeft size={18} />
            <span style={{ fontWeight: 400, fontSize: "0.875rem" }}>back</span>
          </Link>
          <div style={{ height: "20px", width: "1px", background: "var(--outline-variant)", opacity: 0.5 }}></div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: "var(--on-surface-variant)"
          }}>
            <AtSign size={18} style={{ opacity: 0.6 }} />
            <span>contact</span>
          </div>
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="nav-sidebar-btn"
          aria-label="Open Menu"
        >
          <LayoutGrid size={22} />
        </button>
      </nav>

      {/* CONTENT */}
      <div className="room-container" style={{ alignItems: "flex-start", paddingTop: "var(--space-8)" }}>
        <div className="room-cluster mounted" style={{ maxWidth: "420px", gap: "var(--space-6)" }}>

          {/* Simple note */}
          <div className="room-note" style={{ background: "transparent", border: "none", padding: 0 }}>
            <p style={{ marginBottom: "var(--space-4)", lineHeight: 1.7 }}>
              If you want to reach me, here's how.
            </p>
            <p style={{ lineHeight: 1.7, color: "var(--on-surface-muted)" }}>
              I don't check messages often, but I'll reply eventually.
            </p>
          </div>

          {/* Separator */}
          <div className="room-separator" />

          {/* Contact methods - simple list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

            {/* Email */}
            <a
              href="mailto:jiya@example.com"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                color: "var(--on-surface-variant)",
                textDecoration: "none",
                fontSize: "0.9375rem",
                transition: "color 0.2s"
              }}
            >
              <AtSign size={16} style={{ opacity: 0.5, flexShrink: 0 }} />
              <span>jiya@example.com</span>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                color: "var(--on-surface-variant)",
                textDecoration: "none",
                fontSize: "0.9375rem",
                transition: "color 0.2s"
              }}
            >
              <Github size={16} style={{ opacity: 0.5, flexShrink: 0 }} />
              <span>github</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/jiya.py"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                color: "var(--on-surface-variant)",
                textDecoration: "none",
                fontSize: "0.9375rem",
                transition: "color 0.2s"
              }}
            >
              <Instagram size={16} style={{ opacity: 0.5, flexShrink: 0 }} />
              <span>instagram</span>
            </a>

          </div>

          {/* Separator */}
          <div className="room-separator" />

          {/* Note */}
          <p style={{
            fontSize: "0.8125rem",
            color: "var(--on-surface-muted)",
            fontStyle: "italic",
            opacity: 0.6
          }}>
            no contact form, just links.
          </p>

        </div>
      </div>
    </main>
  );
}