import type { Metadata } from "next";
import Link from "next/link";
import { FAQ } from "@/components/FAQ";
import { faqItems } from "@/data/faq-items";
import siteConfig from "@/data/site-config.json";

export const metadata: Metadata = {
  title: "常見問題｜Ruins Bar 高雄鹽埕包場場地",
  description:
    "整理 Ruins Bar 包場常見問題，包含適合活動、人數、價格、包場內容、自帶酒水、外燴、停車與預約方式。",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <main className="pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            常見問題
          </h1>
          <p className="text-base" style={{ color: "var(--text-muted)" }}>
            先把你最在意的事講清楚，這樣比較快判斷 Ruins Bar 適不適合你的活動。
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <p className="text-xs mb-2" style={{ color: "var(--text-faint)" }}>主要 CTA</p>
            <p className="font-bold mb-3" style={{ color: "var(--text-primary)" }}>LINE 詢問檔期</p>
            <a
              href={siteConfig.contact.lineUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center font-bold px-4 py-2 rounded-full"
              style={{ backgroundColor: "var(--accent-pink)", color: "#fff" }}
            >
              直接聯絡
            </a>
          </div>

          <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <p className="text-xs mb-2" style={{ color: "var(--text-faint)" }}>還想確認</p>
            <p className="font-bold mb-3" style={{ color: "var(--text-primary)" }}>交通與停車</p>
            <Link
              href="/location"
              className="inline-flex items-center justify-center font-bold px-4 py-2 rounded-full border"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
            >
              看交通頁
            </Link>
          </div>
        </div>

        <FAQ />
      </section>
    </main>
  );
}
