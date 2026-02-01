/* app/page.tsx */
"use client";

import { useState, useEffect } from "react";
import { Terminal, LayoutGrid, Compass, Music } from "lucide-react";
import { FloatingSidebar } from "@/components/floating-sidebar";
import { ChatBubble } from "@/components/chat-bubble";

// Spotify Now Playing hook
function useNowPlaying() {
  const [data, setData] = useState<{
    isPlaying: boolean;
    track?: string;
    artist?: string;
  }>({ isPlaying: false });

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch("/api/spotify/now-playing");
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch {
        // Silent fail - show fallback
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

// Ambient time-based message
function getAmbientMessage() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning light, somewhere";
  if (hour >= 12 && hour < 17) return "afternoon quiet";
  if (hour >= 17 && hour < 21) return "evening hours";
  return "the room is quiet tonight";
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nowPlaying = useNowPlaying();
  const ambientMessage = getAmbientMessage();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="personal-room">
      <FloatingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <ChatBubble />

      {/* MINIMAL NAVBAR */}
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

      {/* PERSONAL ROOM - SINGLE CONTENT CLUSTER */}
      <div className="room-container">
        <div className={`room-cluster ${mounted ? "mounted" : ""}`}>

          {/* Identity Line with Avatar */}
          <div className="room-identity">
            <img
              src="/avatar.png"
              alt="Jiya"
              className="room-identity-avatar"
            />
            <span className="room-identity-name">Jiya</span>
            <span className="room-identity-divider">·</span>
            <span className="room-identity-role">hobbyist developer</span>
          </div>

          {/* Status Card */}
          <div className="room-status">
            <span className="room-status-dot" />
            <span className="room-status-text">tinkering quietly</span>
            <span className="room-status-meta">· last touched today</span>
          </div>

          {/* Subtle Separator */}
          <div className="room-separator" />

          {/* Pinned Note */}
          <div className="room-note">
            <p>This is my sandbox.</p>
            <p>Some things work, some don't — both are intentional.</p>
          </div>

          {/* Subtle Separator */}
          <div className="room-separator" />

          {/* Now Playing - Ambient */}
          <div className="room-playing">
            <span className="room-playing-label">listening to</span>
            <div className="room-playing-content">
              <Music size={12} className="room-playing-icon" />
              {nowPlaying.isPlaying && nowPlaying.track ? (
                <span className="room-playing-text">
                  {nowPlaying.track} <span className="room-playing-artist">— {nowPlaying.artist}</span>
                </span>
              ) : (
                <span className="room-playing-text room-playing-idle">
                  nothing right now
                </span>
              )}
            </div>
          </div>

          {/* Explore Button - Ghost Style */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="room-explore-btn"
          >
            <Compass size={14} />
            <span>explore tools</span>
          </button>

          {/* Ambient Line */}
          <span className="room-ambient">{ambientMessage}</span>
        </div>
      </div>
    </main>
  );
}