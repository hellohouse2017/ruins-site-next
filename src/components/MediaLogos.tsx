"use client";

const mediaList = [
  { name: "VOGUE", url: "https://reurl.cc/VXk1ZY", desc: "高雄鹽埕區7間人氣老宅店家盤點" },
  { name: "天下雜誌", url: "https://www.cw.com.tw/", desc: "到廢墟喝一杯 — 鹽埕新地標" },
  { name: "蘋果新聞網", url: "https://reurl.cc/14ymWW", desc: "年輕人落腳，鹽埕再展風華" },
  { name: "聯合新聞網", url: "https://reurl.cc/Z7pbol", desc: "廢墟樹屋小酌時光" },
  { name: "中國時報", url: "https://reurl.cc/9X2paj", desc: "廢墟樹屋小酌時光" },
  { name: "高雄畫刊", url: "https://reurl.cc/R1xXo6", desc: "廢墟樹屋小酌時光" },
  { name: "CTWANT", url: "https://reurl.cc/MdqNmv", desc: "" },
  { name: "鳳信電視", url: "https://reurl.cc/pyOMRa", desc: "" },
  { name: "MOOK景點家", url: "https://reurl.cc/4mZpMK", desc: "" },
  { name: "玩咖Playing", url: "https://reurl.cc/KjNQ5n", desc: "" },
  { name: "南方聲活", url: "https://reurl.cc/e81Ogj", desc: "" },
];

export function MediaLogos() {
  return (
    <section className="py-16 border-t border-b" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          各大媒體推薦
        </h2>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
          超過 <span className="font-bold" style={{ color: "var(--accent-pink)" }}>17 家</span> 媒體報導，高雄最具話題性的活動場地
        </p>

        {/* Featured media with descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mediaList.filter(m => m.desc).slice(0, 6).map((media, i) => (
            <a
              key={i}
              href={media.url}
              target="_blank"
              rel="noopener"
              className="group block p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-primary)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div className="text-lg font-bold mb-1 transition-colors" style={{ color: "var(--text-primary)" }}>
                {media.name}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {media.desc}
              </p>
            </a>
          ))}
        </div>

        {/* Secondary media - compact row */}
        <div className="flex flex-wrap justify-center gap-4">
          {mediaList.filter(m => !m.desc || mediaList.indexOf(m) >= 6).map((media, i) => (
            <a
              key={i}
              href={media.url}
              target="_blank"
              rel="noopener"
              className="media-logo px-4 py-2 rounded-lg border text-sm font-medium transition-all"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}
            >
              {media.name}
            </a>
          ))}
        </div>

        <p className="mt-8 text-xs leading-relaxed max-w-3xl mx-auto" style={{ color: "var(--text-faint)" }}>
          Ruins Bar 廢墟酒吧自 2020 年開幕以來，已獲得 VOGUE、天下雜誌、蘋果新聞網、聯合新聞網、中國時報、高雄畫刊等超過 17 家媒體報導與推薦，是高雄鹽埕區最受矚目的新興文化地標與活動場地。
        </p>
      </div>
    </section>
  );
}
