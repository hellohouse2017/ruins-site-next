"use client";

import { useState, useEffect } from "react";
import { A } from "./layout";

interface Stats { plans: number; addons: number; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/plans").then((r) => r.json()),
      fetch("/api/admin/addons").then((r) => r.json()),
    ]).then(([plans, addons]) => {
      const addonCount = addons.categories?.reduce((s: number, c: { items: unknown[] }) => s + c.items.length, 0) || 0;
      setStats({ plans: Array.isArray(plans) ? plans.length : 0, addons: addonCount });
    }).catch(() => setStats({ plans: 0, addons: 0 }));
  }, []);

  const cards = [
    { label: "活動方案", value: stats?.plans ?? "—", icon: "fa-clipboard-list", href: "/admin/plans", color: A.gold },
    { label: "加購品項", value: stats?.addons ?? "—", icon: "fa-cart-plus", href: "/admin/addons", color: "#00f3ff" },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: A.textPrimary, fontFamily: "'Noto Serif TC', serif" }}>後台總覽</h1>
        <p className="text-sm" style={{ color: A.textMuted }}>管理方案、加購、網站內容</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
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
          <li><i className="fas fa-check mr-2" style={{ color: A.success }} />修改方案後即時反映在前台</li>
          <li><i className="fas fa-check mr-2" style={{ color: A.success }} />加購項目可設定 toggle（開關）或 counter（計數）模式</li>
          <li><i className="fas fa-check mr-2" style={{ color: A.success }} />方案的 allowedAddons 控制哪些加購可配搭使用</li>
        </ul>
      </div>
    </div>
  );
}
