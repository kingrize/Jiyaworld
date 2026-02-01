"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutGrid, ArrowLeft, CircleUser } from "lucide-react";
import { FloatingSidebar } from "../../components/floating-sidebar";

export default function About() {
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
            <CircleUser size={18} style={{ opacity: 0.6 }} />
            <span>about</span>
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
        <div className="room-cluster mounted" style={{ maxWidth: "520px", gap: "var(--space-6)" }}>

          {/* Avatar + Name */}
          <div className="room-identity">
            <img
              src="/avatar.png"
              alt="Jiya"
              className="room-identity-avatar"
            />
            <span className="room-identity-name">Jiya</span>
          </div>

          {/* Self-description - honest, casual */}
          <div className="room-note" style={{ background: "transparent", border: "none", padding: 0 }}>
            <p style={{ marginBottom: "var(--space-4)", lineHeight: 1.7 }}>
              I'm a hobbyist developer. Not a professional, not looking for clients.
            </p>
            <p style={{ marginBottom: "var(--space-4)", lineHeight: 1.7 }}>
              I build things when I feel like it. Most projects here are half-finished
              or experiments that I wanted to try. Some work, some don't.
            </p>
            <p style={{ marginBottom: "var(--space-4)", lineHeight: 1.7 }}>
              I like clean interfaces, quiet tools, and code that doesn't annoy me later.
            </p>
            <p style={{ lineHeight: 1.7 }}>
              This site is just a personal space — somewhere to put things I've made
              and maybe share with a few people.
            </p>
          </div>

          {/* Separator */}
          <div className="room-separator" />

          {/* Interests - casual, not a showcase */}
          <div style={{ color: "var(--on-surface-muted)", fontSize: "0.875rem" }}>
            <p style={{ marginBottom: "var(--space-3)" }}>
              <span style={{ opacity: 0.6 }}>usually working with:</span>{" "}
              <span style={{ color: "var(--on-surface-variant)" }}>
                typescript, react, next.js
              </span>
            </p>
            <p>
              <span style={{ opacity: 0.6 }}>also into:</span>{" "}
              <span style={{ color: "var(--on-surface-variant)" }}>
                anime, minimal design, quiet evenings
              </span>
            </p>
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
            that's about it.
          </p>

        </div>
      </div>
    </main>
  );
}