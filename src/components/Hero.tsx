"use client";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import siteConfig from "@/data/site-config.json";

export function Hero() {
  const { theme } = useTheme();

  const heroImage = theme === "dark" ? "/images/cover-bg.jpg" : "/images/proposal-romantic-light.jpg";

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: theme === "dark" ? "#1b1b1b" : "#f4eee5" }}
    >
      <Image
        src={heroImage}
        alt="Ruins Bar 高雄鹽埕包場場地"
        fill
        priority
        className="object-cover object-center transition-all duration-700"
        style={{
          opacity: theme === "dark" ? 0.38 : 0.68,
          filter: theme === "dark" ? "grayscale(100%)" : "none",
        }}
        sizes="100vw"
      />

      <div
        className="absolute inset-0 z-10"
        style={{
          background: theme === "dark"
            ? "linear-gradient(to top, #111, rgba(17,17,17,0.25), #111)"
            : "linear-gradient(to top, #f7f1e8, rgba(247,241,232,0.25), rgba(244,238,229,0.7))",
        }}
      />

      <div className="relative z-20 px-4 max-w-6xl mx-auto py-24 md:py-32">
        <div className="max-w-3xl">
          <p
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase mb-6"
            style={{
              backgroundColor: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)",
              borderColor: "var(--border-primary)",
              color: "var(--text-muted)",
            }}
          >
            高雄鹽埕廢墟風包場場地
          </p>

          <h1
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
            style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
          >
            高雄鹽埕包場場地｜Ruins Bar
          </h1>

          <p className="text-lg md:text-2xl mb-4 font-light" style={{ color: "var(--text-muted)" }}>
            Ruins Bar
          </p>

          <p className="text-base md:text-lg mb-8 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            一間只接待一組客人的廢墟風私人活動空間，適合求婚、慶生派對、抓周、性別揭曉、企業活動、商業拍攝與輕婚禮。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              href={siteConfig.contact.lineUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center font-bold py-4 px-8 rounded-full transition duration-300"
              style={{
                backgroundColor: "var(--accent-pink)",
                color: "#fff",
                boxShadow: theme === "dark"
                  ? "0 0 20px rgba(255,0,85,0.4)"
                  : "0 4px 20px rgba(196,82,106,0.28)",
              }}
            >
              LINE 詢問檔期
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center font-bold py-4 px-8 rounded-full border transition duration-300"
              style={{
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
                backgroundColor: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)",
              }}
            >
              看場地照片
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/faq"
              className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-bold transition"
              style={{
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
                backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.45)",
              }}
            >
              常見問題
            </Link>
            <Link
              href="/location"
              className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-bold transition"
              style={{
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
                backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.45)",
              }}
            >
              交通停車
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 max-w-6xl">
          {[
            { label: "這是什麼", value: "高雄鹽埕廢墟風包場場地" },
            { label: "適合誰", value: "求婚 / 慶生 / 抓周 / 企業活動" },
            { label: "多少錢", value: "NT$15,000 起，依需求報價" },
            { label: "怎麼問", value: "LINE 傳日期、人數、活動類型" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border px-4 py-3 text-left backdrop-blur-sm"
              style={{
                backgroundColor: theme === "dark" ? "rgba(30,30,30,0.75)" : "rgba(255,255,255,0.7)",
                borderColor: "var(--border-primary)",
                boxShadow: "var(--card-shadow)",
              }}
              >
                <p className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: "var(--text-faint)" }}>
                  {item.label}
                </p>
                <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {item.value}
                </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
