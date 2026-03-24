"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Priority: saved preference > system preference
    const saved = localStorage.getItem("ruins-theme") as Theme | null;
    if (saved) {
      setTheme(saved);
    } else {
      // Auto-detect system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    // Listen for system changes (only if no manual preference saved)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("ruins-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ruins-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ─── Theme Toggle — Labeled pill button ─── */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [showHint, setShowHint] = useState(false);

  // Show hint on first visit
  useEffect(() => {
    const seen = localStorage.getItem("ruins-theme-hint-seen");
    if (!seen) {
      setTimeout(() => setShowHint(true), 3000); // Show after 3s
      setTimeout(() => {
        setShowHint(false);
        localStorage.setItem("ruins-theme-hint-seen", "1");
      }, 8000); // Auto-hide after 8s
    }
  }, []);

  return (
    <>
      {/* Hint tooltip */}
      {showHint && (
        <div
          className="fixed z-50 animate-fade-in"
          style={{
            bottom: "100px",
            right: "20px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "12px",
            padding: "10px 14px",
            boxShadow: "var(--card-shadow)",
            maxWidth: "180px",
          }}
        >
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            👆 點擊切換<br />
            <strong style={{ color: "var(--text-primary)" }}>暗色廢墟風 / 日系明亮風</strong>
          </p>
          <div
            style={{
              position: "absolute",
              bottom: "-6px",
              right: "24px",
              width: "12px",
              height: "12px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderTop: "none",
              borderLeft: "none",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      )}

      {/* Toggle button — pill with label */}
      <button
        onClick={() => {
          toggleTheme();
          setShowHint(false);
          localStorage.setItem("ruins-theme-hint-seen", "1");
        }}
        className="fixed z-50 flex items-center gap-2 transition-all duration-500 rounded-full"
        style={{
          bottom: "100px",
          right: "20px",
          padding: "8px 14px",
          backgroundColor: theme === "dark" ? "rgba(30,30,30,0.9)" : "rgba(255,255,255,0.9)",
          border: theme === "dark" ? "1px solid #444" : "1px solid #d4c5a9",
          backdropFilter: "blur(10px)",
          boxShadow: theme === "dark"
            ? "0 4px 20px rgba(0,0,0,0.5)"
            : "0 4px 20px rgba(0,0,0,0.1)",
        }}
        aria-label={theme === "dark" ? "切換至明亮模式" : "切換至暗色模式"}
      >
        <span className="text-base transition-transform duration-500">
          {theme === "dark" ? "☀️" : "🌙"}
        </span>
        <span
          className="text-xs font-medium hidden sm:inline"
          style={{ color: theme === "dark" ? "#aaa" : "#8a7a5b" }}
        >
          {theme === "dark" ? "日系明亮" : "廢墟暗色"}
        </span>
      </button>
    </>
  );
}
