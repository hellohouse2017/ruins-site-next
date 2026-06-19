import type { Metadata } from "next";
import Link from "next/link";
import siteConfig from "@/data/site-config.json";

export const metadata: Metadata = {
  title: "交通停車｜Ruins Bar 高雄鹽埕包場場地",
  description:
    "Ruins Bar 地址、交通、停車與到場建議。先看怎麼進場、附近怎麼停，再安排你的包場活動流程。",
};

const tips = [
  {
    title: "地址",
    text: siteConfig.location.address,
  },
  {
    title: "建議到場",
    text: "活動前先讓主辦或接駁車下客，巷弄空間較適合步行入場。",
  },
  {
    title: "停車",
    text: "門口不建議直接停車，請以周邊路邊停車與收費停車場為主。",
  },
  {
    title: "導航",
    text: "可直接用 Google Maps 導航到 Ruins Bar，若是團體到場，建議先統一集合點。",
  },
];

export default function LocationPage() {
  return (
    <main className="pt-20">
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-16" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            交通與停車
          </h1>
          <p className="text-base" style={{ color: "var(--text-muted)" }}>
            先確認怎麼到、怎麼下車、車怎麼停，活動當天會順很多。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-6">
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", boxShadow: "var(--card-shadow)" }}>
            <p className="text-sm mb-2" style={{ color: "var(--text-faint)" }}>場地地址</p>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              {siteConfig.location.address}
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Ruins Bar 位在高雄鹽埕區，適合包場、活動拍攝與需要進場動線的活動。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tips.map((tip) => (
                <div key={tip.title} className="rounded-xl p-4 border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                  <p className="text-xs mb-2 uppercase tracking-[0.18em]" style={{ color: "var(--text-faint)" }}>
                    {tip.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl p-6 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
              <p className="text-sm mb-2" style={{ color: "var(--text-faint)" }}>快速聯絡</p>
              <p className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                直接問檔期比較快
              </p>
              <a
                href={siteConfig.contact.lineUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center font-bold px-4 py-3 rounded-full mb-3 w-full"
                style={{ backgroundColor: "var(--accent-pink)", color: "#fff" }}
              >
                LINE 詢問檔期
              </a>
              <Link
                href="/book"
                className="inline-flex items-center justify-center font-bold px-4 py-3 rounded-full border w-full"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
              >
                看詢問頁
              </Link>
            </div>

            <div className="rounded-2xl p-6 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
              <p className="text-sm mb-3" style={{ color: "var(--text-faint)" }}>提醒</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                如果你是求婚、婚禮、抓周或商業拍攝，請先把到場時間、人數與是否需要佈置一起講清楚，這樣我們可以直接幫你判斷動線與報價。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
