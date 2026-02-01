"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Play,
  ChevronRight,
  ChevronDown,
  X,
  Moon,
  Sun,
  Laptop,
  House,
  CircleUser,
  ArrowRightFromLine,
  ArrowLeftToLine,
  CirclePlay,
  Globe,
  ShieldCheck,
  UserCircle,
  ExternalLink,
  AtSign,
  Palette,
  Gamepad2,
} from "lucide-react";

import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminUID } from "@/lib/admin";

type Category = {
  name: string;
  icon: React.ElementType;
  items: { name: string; href: string }[];
};

// Reorganized categories: AI Tools + Media Tools + Games
const categories: Category[] = [
  {
    name: "AI TOOLS",
    icon: Sparkles,
    items: [
      { name: "Study AI", href: "/tools/study-ai" },
      { name: "Translate AI", href: "/tools/translate-ai" },
    ],
  },
  {
    name: "MEDIA TOOLS",
    icon: CirclePlay,
    items: [
      { name: "YouTube Downloader", href: "/tools/youtube-downloader" },
    ],
  },
  {
    name: "GAMES",
    icon: Gamepad2,
    items: [
      { name: "2048", href: "/games/2048" },
    ],
  },
];

export function FloatingSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string[]>(["AI TOOLS", "MEDIA TOOLS", "GAMES"]);
  const [theme, setTheme] = useState("system");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Auth state listener - only subscribe if auth is available
    let unsubscribe: (() => void) | undefined;
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsAdmin(currentUser ? isAdminUID(currentUser.uid) : false);
      });
    }

    // Lock scroll when sidebar is open for mobile
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      unsubscribe?.();
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

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setIsOpen(false);
  };

  const handleLogin = () => {
    setIsOpen(false);
    router.push("/admin/login");
  };

  const handleAdminPanel = () => {
    setIsOpen(false);
    router.push("/admin");
  };

  return (
    <>
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
            <div className="sidebar-logo">
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
          {/* Section: Navigation */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Navigation</div>
            <div className="sidebar-nav-list">
              <a href="/" className="sidebar-nav-item">
                <House size={16} />
                <span>Home</span>
              </a>
              <a href="/about" className="sidebar-nav-item">
                <CircleUser size={16} />
                <span>About</span>
              </a>
              <a href="/contact" className="sidebar-nav-item">
                <AtSign size={16} />
                <span>Contact</span>
              </a>
              <a href="/links" className="sidebar-nav-item">
                <ExternalLink size={16} />
                <span>Links</span>
              </a>
              <a href="/tools" className="sidebar-nav-item">
                <Palette size={16} />
                <span>Tools</span>
              </a>
              <a href="/anime" className="sidebar-nav-item">
                <Play size={16} />
                <span>Anime</span>
              </a>
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Section: Tools */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Tools</div>
            <div className="sidebar-categories">
              {categories.map((cat) => (
                <div key={cat.name} className="sidebar-category">
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="sidebar-category-header"
                  >
                    <div className="category-label">
                      <cat.icon size={14} />
                      <span>{cat.name}</span>
                    </div>
                    {expanded.includes(cat.name) ? (
                      <ChevronDown size={12} className="chevron" />
                    ) : (
                      <ChevronRight size={12} className="chevron" />
                    )}
                  </button>

                  <div className={`sidebar-category-items ${expanded.includes(cat.name) ? "expanded" : ""}`}>
                    {cat.items.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="sidebar-item-link"
                      >
                        <span>{item.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Section: Account */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Account</div>
            <div className="sidebar-account">
              {user ? (
                <>
                  {/* Logged in state */}
                  <div className="sidebar-user-info">
                    <UserCircle size={14} />
                    <span className="sidebar-user-email">
                      {user.displayName || user.email || "User"}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={handleAdminPanel}
                      className="sidebar-account-btn sidebar-account-btn--admin"
                    >
                      <ShieldCheck size={14} />
                      <span>Admin Panel</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="sidebar-account-btn sidebar-account-btn--logout"
                  >
                    <ArrowRightFromLine size={14} />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                /* Not logged in state */
                <button
                  onClick={handleLogin}
                  className="sidebar-account-btn sidebar-account-btn--login"
                >
                  <ArrowLeftToLine size={14} />
                  <span>Login to Account</span>
                </button>
              )}
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Section: Appearance */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Appearance</div>
            <div className="sidebar-appearance">
              <button
                className={`sidebar-theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <Sun size={14} />
                <span>Light</span>
              </button>
              <button
                className={`sidebar-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <Moon size={14} />
                <span>Dark</span>
              </button>
              <button
                className={`sidebar-theme-btn ${theme === 'system' ? 'active' : ''}`}
                onClick={() => handleThemeChange('system')}
              >
                <Laptop size={14} />
                <span>System</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
