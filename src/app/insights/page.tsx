import type { Metadata } from "next";
import Link from "next/link";
import { legacyPlanPages } from "@/lib/v2/legacy-pages";
import { getScenarioPresentation } from "@/lib/v2/presentation";

const guideCards = [
  {
    slug: "proposal",
    title: "高雄求婚包場怎麼選？",
    summary: "整理場地、佈置、流程與預算，讓你先判斷是不是適合求婚。",
    label: "求婚包場",
    scenarioId: "proposal",
  },
  {
    slug: "baby",
    title: "高雄抓周與性別揭曉怎麼辦？",
    summary: "從人數、動線到餐飲與拍照，先確認家庭活動是不是合適。",
    label: "抓周 / 性別揭曉",
    scenarioId: "family",
  },
  {
    slug: "party",
    title: "高雄生日派對包場怎麼安排？",
    summary: "從派對流程、酒水、音響到佈置，快速抓出活動重點。",
    label: "生日派對",
    scenarioId: "party",
  },
  {
    slug: "meeting",
    title: "高雄企業活動包場怎麼選？",
    summary: "看簡報、座位、餐點與交通，先確認商務活動是否合適。",
    label: "企業活動",
    scenarioId: "business",
  },
  {
    slug: "wedding",
    title: "高雄輕婚禮包場怎麼安排？",
    summary: "把儀式感、親友動線與拍照需求先整理好，再決定方案。",
    label: "輕婚禮",
    scenarioId: "wedding",
  },
  {
    slug: "rental",
    title: "高雄純場地租借怎麼判斷？",
    summary: "只租空間、不綁固定組合時，先看預算、設備與加購內容。",
    label: "純場地租借",
    scenarioId: "venue",
  },
] as const;

export const metadata: Metadata = {
  title: "高雄包場活動攻略｜求婚、慶生、抓周、企業活動與商攝",
  description:
    "整理 Ruins Bar 高雄包場活動攻略，先判斷求婚、慶生、抓周、企業活動、商業拍攝或輕婚禮適不適合，再看下一步預約方式。",
};

export default function InsightsPage() {
  return (
    <main className="pt-20">
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            高雄包場活動攻略
          </h1>
          <p className="text-base" style={{ color: "var(--text-muted)" }}>
            整理求婚、慶生、抓周、企業活動、商業拍攝與輕婚禮常見問題，先幫你判斷場地、預算、流程與注意事項。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {guideCards.map((card) => {
            const visual = getScenarioPresentation(card.scenarioId);
            const page = legacyPlanPages[card.slug];

            return (
              <Link
                key={card.slug}
                href={`/plans/${card.slug}`}
                className="group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-primary)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={page.coverImage ?? visual.image}
                    alt={card.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: `${visual.accentColor}22`,
                        border: `1px solid ${visual.accentColor}55`,
                        color: visual.accentColor,
                      }}
                    >
                      {card.label}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-xl font-bold text-white mb-1">{card.title}</h2>
                    <p className="text-sm text-white/80">{card.summary}</p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      適合先看：{page.shortName}
                    </p>
                    <span className="text-sm font-bold" style={{ color: visual.accentColor }}>
                      看攻略 <i className="fas fa-arrow-right ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div
          className="rounded-2xl p-6 border max-w-3xl mx-auto"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-primary)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            下一步怎麼做？
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            如果你已經知道日期、人數與用途，可以直接進包場預約頁；如果還在比場地，先看攻略再回來選方案。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/book"
              className="inline-flex items-center justify-center font-bold py-3 px-6 rounded-full"
              style={{ backgroundColor: "var(--accent-pink)", color: "#fff" }}
            >
              詢問檔期
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center font-bold py-3 px-6 rounded-full border"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
            >
              看場地照片
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
