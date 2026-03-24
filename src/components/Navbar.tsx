"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import siteConfig from "@/data/site-config.json";

export function Navbar() {
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/#plans", label: "方案預約", icon: "fas fa-calendar-check", highlight: true },
    { href: "/#gallery", label: "實錄", icon: "", highlight: false },
    { href: "/#reviews", label: "好評", icon: "", highlight: false },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-md shadow-lg py-0"
          : "bg-transparent py-0"
      }`}
      style={{
        backgroundColor: scrolled ? "var(--nav-bg)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border-primary)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span
              className="text-2xl font-bold tracking-wider"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              RUINS{" "}
              <span style={{ color: "var(--accent-pink)" }}>BAR</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-baseline space-x-6">
            {navLinks.map((l) =>
              l.highlight ? (
                <Link
                  key={l.href}
                  href={l.href}
                  className="transition px-3 py-2 rounded-md text-sm font-bold border"
                  style={{ color: "var(--accent-blue)", borderColor: "var(--accent-blue)" }}
                >
                  {l.icon && <i className={`${l.icon} mr-1`} />}
                  {l.label}
                </Link>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                >
                  {l.label}
                </Link>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-xl"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="開啟選單"
            style={{ color: "var(--text-primary)" }}
          >
            <i className={`fas fa-${mobileOpen ? "times" : "bars"}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden backdrop-blur-md"
          style={{
            backgroundColor: "var(--nav-bg)",
            borderTop: "1px solid var(--border-primary)",
          }}
        >
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-base py-2"
                style={{
                  color: l.highlight ? "var(--accent-blue)" : "var(--text-secondary)",
                  fontWeight: l.highlight ? "bold" : "normal",
                }}
              >
                {l.icon && <i className={`${l.icon} mr-2`} />}
                {l.label}
              </Link>
            ))}
            <a
              href={siteConfig.contact.lineUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 text-base text-green-500 py-2"
            >
              <i className="fab fa-line" /> LINE 聯繫
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
