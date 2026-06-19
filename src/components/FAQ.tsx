"use client";

import { useState } from "react";
import { faqItems } from "@/data/faq-items";

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
                  maxHeight: openIdx === i ? "420px" : "0",
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
