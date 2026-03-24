"use client";

import { useState } from "react";

const faqItems = [
  {
    q: "場地可容納多少人？",
    a: "室內約 40-50 人，若加上戶外區域可容納 60-80 人。實際人數依活動形式而定，歡迎洽詢。",
  },
  {
    q: "可以自帶外食或酒水嗎？",
    a: "我們提供完整的餐飲服務。如有特殊需求（如指定酒款、特殊料理），請提前與我們討論，我們會盡力配合。",
  },
  {
    q: "需要提前多久預約？",
    a: "建議至少 2 週前預約。熱門檔期（週末、國定假日）建議提前 1 個月以上預約以確保檔期。",
  },
  {
    q: "有停車場嗎？",
    a: "場地附近有收費停車場，步行約 3-5 分鐘。建議搭乘捷運至鹽埕埔站步行約 8 分鐘。",
  },
  {
    q: "可以帶寵物嗎？",
    a: "歡迎攜帶寵物！我們是寵物友善場地。請確保寵物有牽繩，並自行清理。",
  },
  {
    q: "下雨天怎麼辦？",
    a: "我們有室內空間可完整進行活動。戶外區域可搭設帳篷作為備案。活動前我們會與您確認天氣備案方案。",
  },
  {
    q: "如何付款？",
    a: "我們接受銀行轉帳、LINE Pay。確認預約後需支付 50% 訂金，活動當天支付尾款。",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 border-t" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center" style={{ color: "var(--text-primary)" }}>
          常見問題
        </h2>

        <div className="space-y-0">
          {faqItems.map((item, i) => (
            <div key={i} className="faq-item" style={{ borderBottom: "1px solid var(--border-primary)" }}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="faq-question w-full flex items-center justify-between py-5 text-left"
                style={{ color: openIdx === i ? "var(--accent-blue)" : "var(--text-primary)" }}
              >
                <span className="font-bold text-base pr-4">{item.q}</span>
                <i
                  className={`fas fa-chevron-down text-sm transition-transform duration-300 ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                  style={{ color: "var(--accent-blue)" }}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-400"
                style={{
                  maxHeight: openIdx === i ? "300px" : "0",
                  paddingTop: openIdx === i ? "0" : "0",
                  paddingBottom: openIdx === i ? "1rem" : "0",
                }}
              >
                <p className="text-sm leading-relaxed pl-0" style={{ color: "var(--text-muted)" }}>
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
