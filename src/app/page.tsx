import { Hero } from "@/components/Hero";
import { PlanCard } from "@/components/PlanCard";
import { Gallery } from "@/components/Gallery";
import { Reviews } from "@/components/Reviews";
import { MediaLogos } from "@/components/MediaLogos";
import { BrandStory } from "@/components/BrandStory";
import { FAQ } from "@/components/FAQ";
import Link from "next/link";
import plans from "@/data/plans.json";

// Deduplicate by slug
const uniquePlans = plans.reduce((acc, plan) => {
  if (!acc.find((p: typeof plan) => p.slug === plan.slug)) acc.push(plan);
  return acc;
}, [] as typeof plans);

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* ── Plans Section ── */}
      <section id="plans" className="py-20 px-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-3 text-center" style={{ color: "var(--text-primary)" }}>
            <i className="fas fa-list-ul mr-3" style={{ color: "var(--accent-blue)" }} />
            選擇您的活動方案
          </h2>
          <p className="text-center mb-10 text-sm" style={{ color: "var(--text-muted)" }}>
            從浪漫求婚到會議包場，為每一個重要時刻量身打造
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {uniquePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Media Logos ── */}
      <MediaLogos />

      {/* ── Brand Story ── */}
      <BrandStory />

      {/* ── Gallery ── */}
      <Gallery />

      {/* ── Reviews ── */}
      <Reviews />

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>準備好了嗎？</h2>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>廢墟等你來創造屬於你的故事</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book"
              className="inline-block font-bold py-3 px-8 rounded-full transition shadow-[0_0_15px_rgba(255,0,85,0.4)]"
              style={{ backgroundColor: "var(--accent-pink)", color: "#fff" }}
            >
              <i className="fas fa-calendar-check mr-2" />預約場地
            </Link>
            <a
              href="https://line.me/R/ti/p/@529ldsir"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center px-6 py-3 rounded-full border transition hover:opacity-80"
              style={{ color: "var(--accent-pink)", borderColor: "var(--accent-pink)" }}
            >
              <i className="fab fa-line text-xl mr-2" />LINE 諮詢
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
