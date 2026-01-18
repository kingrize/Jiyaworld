// c:\Users\ArzyuEXT\Documents\jiyaworld\components\floating-sidebar.tsx

"use client";

import { useState } from "react";
import { Book, Gamepad2, Settings, ChevronRight, ChevronDown, Menu, X, Moon, Sun, Monitor } from "lucide-react";

type Category = {
  name: string;
  icon: React.ElementType;
  items: { name: string; href: string }[];
};

const categories: Category[] = [
  {
    name: "STUDY",
    icon: Book,
    items: [{ name: "StudyAI", href: "/tools/study-ai" }],
  },
  {
    name: "GAME",
    icon: Gamepad2,
    items: [{ name: "Check Nickname", href: "/tools/check-nickname" }],
  },
];

export function FloatingSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const [expanded, setExpanded] = useState<string[]>(["STUDY", "GAME"]);

  const toggleCategory = (name: string) => {
    setExpanded((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`sidebar-trigger ${isOpen ? "hidden" : ""}`}
        aria-label="Open Menu"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <div
        className={`sidebar-panel ${isOpen ? "open" : ""}`}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
               <span>J</span>
            </div>
            <span style={{ fontWeight: "bold", fontSize: "1.125rem", letterSpacing: "0.025em" }}>Tools</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="sidebar-close"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {categories.map((cat) => (
            <div key={cat.name}>
              <button
                onClick={() => toggleCategory(cat.name)}
                className="sidebar-category-btn group"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <cat.icon size={14} style={{ transition: "color 0.2s" }} />
                  <span>{cat.name}</span>
                </div>
                {expanded.includes(cat.name) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              
              <div className={`sidebar-category-content ${expanded.includes(cat.name) ? "expanded" : ""}`}>
                {cat.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="sidebar-link"
                  >
                    <div style={{ height: "6px", width: "6px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)" }} />
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)" }}>
            <Settings size={14} />
            <span>Appearance</span>
          </div>
          <div className="appearance-grid">
             <button className="appearance-btn">
                <Sun size={16} />
                <span>Light</span>
             </button>
             <button className="appearance-btn" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}>
                <Moon size={16} />
                <span>Dark</span>
             </button>
             <button className="appearance-btn">
                <Monitor size={16} />
                <span>System</span>
             </button>
          </div>
        </div>
      </div>
    </>
  );
}
