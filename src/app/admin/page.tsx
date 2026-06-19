"use client";

import { useState, useEffect } from "react";
import { A } from "./ui";

interface Stats {
  scenarios: number;
  bundles: number;
  addons: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/scenarios").then((r) => r.json()),
      fetch("/api/admin/bundles").then((r) => r.json()),
      fetch("/api/admin/addons").then((r) => r.json()),
    ])
      .then(([scenarios, bundles, addons]) => {
        const addonCount =
          addons.categories?.reduce(
            (sum: number, category: { items: unknown[] }) =>
              sum + category.items.length,
            0
          ) || 0;

        setStats({
          scenarios: Array.isArray(scenarios) ? scenarios.length : 0,
          bundles: Array.isArray(bundles?.bundles) ? bundles.bundles.length : 0,
          addons: addonCount,
        });
      })
      .catch(() =>
        setStats({
          scenarios: 0,
          bundles: 0,
          addons: 0,
        })
      );
  }, []);

  const cards = [
    {
      label: "活動情境",
      value: stats?.scenarios ?? "—",
      icon: "fa-shapes",
      href: "/admin/scenarios",
      color: A.gold,
    },
    {
      label: "推薦組合",
      value: stats?.bundles ?? "—",
      icon: "fa-box-open",
      href: "/admin/bundles",
      color: "#ec4899",
    },
    {
      label: "加購品項",
      value: stats?.addons ?? "—",
      icon: "fa-cart-plus",
      href: "/admin/addons",
      color: "#00f3ff",
    },
    {
      label: "場地設定",
      value: "1",
      icon: "fa-sliders-h",
      href: "/admin/settings",
      color: A.blue,
    },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: A.textPrimary, fontFamily: "'Noto Serif TC', serif" }}>後台總覽</h1>
        <p className="text-sm" style={{ color: A.textMuted }}>管理場地基礎設定、活動情境、推薦組合與加購內容</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {cards.map((c) => (
          <a key={c.label} href={c.href} className="group block rounded-xl p-6 transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.color}15`, border: `1px solid ${c.color}30` }}>
                <i className={`fas ${c.icon}`} style={{ color: c.color }} />
              </div>
              <i className="fas fa-arrow-right text-sm opacity-0 group-hover:opacity-100 transition" style={{ color: c.color }} />
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: A.textPrimary }}>{c.value}</div>
            <div className="text-sm" style={{ color: A.textMuted }}>{c.label}</div>
          </a>
        ))}
      </div>

      {/* Quick tips */}
      <div className="rounded-xl p-6" style={{ backgroundColor: A.card, border: `1px solid ${A.border}` }}>
        <h3 className="font-bold text-sm mb-3" style={{ color: A.gold }}><i className="fas fa-lightbulb mr-2" />使用提示</h3>
        <ul className="space-y-2 text-sm" style={{ color: A.textMuted }}>
          <li><i className="fas fa-check mr-2" style={{ color: A.success }} />情境只影響導購與排序，不直接改動底層售價</li>
          <li><i className="fas fa-check mr-2" style={{ color: A.success }} />組合是推薦層設定，實際報價仍由場租與加購明細組成</li>
          <li><i className="fas fa-check mr-2" style={{ color: A.success }} />加購項目修改後，首頁、預約頁與組合內容都會一起受影響</li>
        </ul>
      </div>
    </div>
  );
}
