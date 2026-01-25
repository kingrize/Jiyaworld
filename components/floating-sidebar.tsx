"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Book,
  Gamepad2,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  X,
  Moon,
  Sun,
  Monitor,
  Home,
  Info,
  LogIn,
  LogOut,
  Youtube,
  Languages,
  Shield,
  User,
} from "lucide-react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminUID } from "@/lib/admin";

type Category = {
  name: string;
  icon: React.ElementType;
  items: { name: string; href: string }[];
};

// Reordered: GAME first, then STUDY, MEDIA, TRANSLATE
const categories: Category[] = [
  {
    name: "GAME",
    icon: Gamepad2,
    items: [
      { name: "Check Nickname", href: "/tools/check-nickname" },
      { name: "Mods & Scripts", href: "/mods" },
    ],
  },
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
];

export function FloatingSidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string[]>(["GAME", "STUDY", "MEDIA", "TRANSLATE"]);
  const [theme, setTheme] = useState("system");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser ? isAdminUID(currentUser.uid) : false);
    });

    // Lock scroll when sidebar is open for mobile
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      unsubscribe();
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
    await signOut(auth);
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
                <Home size={16} />
                <span>Home</span>
              </a>
              <a href="/about" className="sidebar-nav-item">
                <Info size={16} />
                <span>About</span>
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
                    <User size={14} />
                    <span className="sidebar-user-email">
                      {user.displayName || user.email || "User"}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={handleAdminPanel}
                      className="sidebar-account-btn sidebar-account-btn--admin"
                    >
                      <Shield size={14} />
                      <span>Admin Panel</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="sidebar-account-btn sidebar-account-btn--logout"
                  >
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                /* Not logged in state */
                <button
                  onClick={handleLogin}
                  className="sidebar-account-btn sidebar-account-btn--login"
                >
                  <LogIn size={14} />
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
                <Monitor size={14} />
                <span>System</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
