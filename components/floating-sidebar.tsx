/* components/floating-sidebar.tsx */
"use client";

import { useState, useEffect } from "react";
import { Book, Gamepad2, Settings, ChevronRight, ChevronDown, LayoutGrid, X, Moon, Sun, Monitor, Home, User, LogIn } from "lucide-react";

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
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (newTheme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme"); // System default (usually dark in your CSS)
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

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
        <LayoutGrid size={20} />
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

        {/* Sidebar Footer with Added Menu Links */}
        <div className="sidebar-footer">
          {/* New Menu Section */}
          <div style={{ marginBottom: "2rem" }}>
             <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)" }}>
                <span>Menu</span>
             </div>
             <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <a href="/" className="sidebar-link">
                  <Home size={16} /> Home
                </a>
                <a href="/about" className="sidebar-link">
                  <User size={16} /> About
                </a>
                <button className="sidebar-link" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                  <LogIn size={16} /> Login
                </button>
             </div>
          </div>

          <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)" }}>
            <Settings size={14} />
            <span>Appearance</span>
          </div>
          <div className="appearance-grid">
             <button className={`appearance-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => handleThemeChange('light')}>
                <Sun size={16} />
                <span>Light</span>
             </button>
             <button className={`appearance-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => handleThemeChange('dark')}>
                <Moon size={16} />
                <span>Dark</span>
             </button>
             <button className={`appearance-btn ${theme === 'system' ? 'active' : ''}`} onClick={() => handleThemeChange('system')}>
                <Monitor size={16} />
                <span>System</span>
             </button>
          </div>
        </div>
      </div>
    </>
  );
}