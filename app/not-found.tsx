"use client";

import Link from "next/link";
import { MoveLeft, Compass } from "lucide-react";

export default function NotFound() {
    return (
        <main style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            padding: "2rem",
        }}>
            {/* Abstract Background Shapes */}
            <div style={{
                position: "absolute",
                top: "20%",
                left: "20%",
                width: "400px",
                height: "400px",
                background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
                opacity: 0.08,
                borderRadius: "50%",
                filter: "blur(60px)",
                transform: "translate(-50%, -50%)",
                zIndex: -1,
            }} />
            <div style={{
                position: "absolute",
                bottom: "20%",
                right: "20%",
                width: "350px",
                height: "350px",
                background: "radial-gradient(circle, var(--secondary) 0%, transparent 70%)",
                opacity: 0.06,
                borderRadius: "50%",
                filter: "blur(60px)",
                transform: "translate(50%, 50%)",
                zIndex: -1,
            }} />

            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
                maxWidth: "500px",
            }}>
                {/* Number with Gradient */}
                <h1 style={{
                    fontSize: "clamp(6rem, 20vw, 10rem)",
                    fontWeight: "800",
                    letterSpacing: "-0.05em",
                    lineHeight: 1,
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    margin: 0,
                    opacity: 0.9,
                    fontFamily: "'Geist Mono', monospace",
                }}>
                    404
                </h1>

                {/* Friendly Message */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <h2 style={{
                        fontSize: "1.5rem",
                        fontWeight: "600",
                        color: "var(--text-one)",
                        margin: 0,
                    }}>
                        Lost in cyberspace?
                    </h2>
                    <p style={{
                        fontSize: "1.05rem",
                        color: "var(--text-four)",
                        lineHeight: 1.6,
                        margin: 0,
                    }}>
                        The page you're looking for seems to have drifted away. Don't worry, even the best explorers get lost sometimes.
                    </p>
                </div>

                {/* Action Button */}
                <Link href="/" style={{
                    marginTop: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.875rem 1.75rem",
                    background: "var(--surface-three)",
                    color: "var(--text-one)",
                    border: "1px solid var(--border)",
                    borderRadius: "100px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "var(--drop-shadow-one)";
                        e.currentTarget.style.borderColor = "var(--primary)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "var(--border)";
                    }}
                >
                    <MoveLeft size={20} className="text-secondary" />
                    <span>Return Home</span>
                </Link>
            </div>

            {/* Decorative Compass Icon */}
            <div style={{
                position: "absolute",
                top: "2rem",
                right: "2rem",
                opacity: 0.5,
                animation: "float 6s ease-in-out infinite",
            }}>
                <Compass size={32} color="var(--text-four)" />
            </div>

            <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
        </main>
    );
}
