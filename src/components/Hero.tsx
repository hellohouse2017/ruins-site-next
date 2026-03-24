"use client";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";

export function Hero() {
  const { theme } = useTheme();

  const heroImage = theme === "dark" ? "/images/cover-bg.jpg" : "/images/proposal-romantic-light.jpg";

  return (
    <section
      className="relative h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: theme === "dark" ? "#1e1e1e" : "#f0ebe3" }}
    >
      {/* Background — Next/Image for proper responsive handling */}
      <Image
        src={heroImage}
        alt="Ruins Bar 廢墟酒吧場地"
        fill
        priority
        className="object-cover object-center transition-all duration-700"
        style={{
          opacity: theme === "dark" ? 0.4 : 0.7,
          filter: theme === "dark" ? "grayscale(100%)" : "none",
        }}
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: theme === "dark"
            ? "linear-gradient(to top, #121212, transparent, #121212)"
            : "linear-gradient(to top, #faf8f5, rgba(250,248,245,0.3), rgba(240,235,227,0.6))",
        }}
      />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-3xl mx-auto">
        <h1
          className="text-5xl md:text-7xl font-bold mb-4 tracking-widest"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
            textShadow: theme === "dark"
              ? "0 0 10px #ff0055, 0 0 40px #ff0055, 0 0 80px #ff0055"
              : "none",
          }}
        >
          {theme === "dark" ? (
            "INDUSTRIAL RUINS"
          ) : (
            <>RUINS <span style={{ color: "var(--accent-pink)" }}>BAR</span></>
          )}
        </h1>

        <p className="text-xl md:text-2xl mb-2 max-w-2xl mx-auto font-light" style={{ color: "var(--text-muted)" }}>
          高雄鹽埕 × 廢墟美學 × 極致派對體驗
        </p>

        <p className="text-sm mb-8" style={{ color: "var(--text-faint)" }}>
          Google 5.0 星 ⭐ ｜ 17 家媒體報導推薦
        </p>

        <Link
          href="/book"
          className="inline-block font-bold py-4 px-10 rounded-full transition duration-300"
          style={{
            backgroundColor: "var(--accent-pink)",
            color: "#fff",
            boxShadow: theme === "dark"
              ? "0 0 20px rgba(255,0,85,0.5)"
              : "0 4px 20px rgba(196,82,106,0.3)",
          }}
        >
          開始預約旅程
        </Link>
      </div>
    </section>
  );
}
