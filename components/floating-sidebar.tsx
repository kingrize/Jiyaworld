"use client";

import { useState, useEffect } from "react";
import {
  Book,
  Gamepad2,
  Settings,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  X,
  Moon,
  Sun,
  Monitor,
  Home,
  User,
  LogIn,
  Youtube,
  Languages,
  ArrowRight
} from "lucide-react";

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
    name: "MEDIA",
    icon: Youtube,
    items: [{ name: "YT Saver", href: "/tools/youtube-downloader" }],
  },
  {
    name: "TRANSLATE",
    icon: Languages,
    items: [{ name: "TranslateAI", href: "/tools/translate-ai" }],
  },
  {
    name: "GAME",
    icon: Gamepad2,
    items: [
      { name: "Check Nickname", href: "/tools/check-nickname" },
      { name: "Mods & Scripts", href: "/mods" },
    ],
  },
];

export function FloatingSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const [expanded, setExpanded] = useState<string[]>(["STUDY", "MEDIA", "TRANSLATE", "GAME"]);
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Lock scroll when sidebar is open for mobile
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (newTheme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
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
      {/* Trigger Button (Desktop Only) */}
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
      <div className={`sidebar-panel ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo" style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}>
              <span>J</span>
            </div>
            <div className="sidebar-brand-text">
              <span className="brand-name">JiyaWorld</span>
              <span className="brand-tag">Tools & Utility</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="sidebar-close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="sidebar-scroll-area">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Navigation</div>
            <div className="sidebar-nav-grid">
              <a href="/" className="sidebar-nav-item">
                <Home size={18} />
                <span>Home</span>
              </a>
              <a href="/about" className="sidebar-nav-item">
                <User size={18} />
                <span>About</span>
              </a>
            </div>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <div className="sidebar-section-title">AI Tools</div>
            <div className="sidebar-categories">
              {categories.map((cat) => (
                <div key={cat.name} className="sidebar-category">
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="sidebar-category-header"
                  >
                    <div className="category-label">
                      <cat.icon size={16} />
                      <span>{cat.name}</span>
                    </div>
                    {expanded.includes(cat.name) ? (
                      <ChevronDown size={14} className="chevron" />
                    ) : (
                      <ChevronRight size={14} className="chevron" />
                    )}
                  </button>

                  <div className={`sidebar-category-items ${expanded.includes(cat.name) ? "expanded" : ""}`}>
                    {cat.items.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="sidebar-item-link"
                      >
                        <ArrowRight size={12} className="bullet" />
                        <span>{item.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-section-title" style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Settings size={14} />
            <span>Appearance</span>
          </div>
          <div className="appearance-grid">
            <button
              className={`appearance-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <Sun size={16} />
              <span>Light</span>
            </button>
            <button
              className={`appearance-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <Moon size={16} />
              <span>Dark</span>
            </button>
            <button
              className={`appearance-btn ${theme === 'system' ? 'active' : ''}`}
              onClick={() => handleThemeChange('system')}
            >
              <Monitor size={16} />
              <span>System</span>
            </button>
          </div>

          <div className="sidebar-auth">
            <button className="btn-login">
              <LogIn size={18} />
              <span>Login to Account</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
