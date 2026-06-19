"use client";

import { useCallback, useEffect, useState } from "react";
import { A } from "../ui";
import type { ScenarioConfig } from "@/types/v2";

export default function AdminScenariosPage() {
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<ScenarioConfig | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/scenarios");
    const payload = response.ok ? await response.json() : [];
    setScenarios(Array.isArray(payload) ? payload : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const saveScenario = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.icon.trim()) {
      showToast("❌ 名稱與 icon 必填");
      return;
    }

    const nextScenarios = scenarios
      .map((scenario) =>
        scenario.id === editing.id
          ? {
              ...editing,
              sortOrder: Number(editing.sortOrder) || 0,
            }
          : scenario
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);

    setSaving(true);
    const response = await fetch("/api/admin/scenarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextScenarios),
    });

    if (response.ok) {
      setScenarios(nextScenarios);
      setEditing(null);
      showToast("✅ 儲存成功");
    } else {
      showToast("❌ 儲存失敗");
    }

    setSaving(false);
  };

  const inputCls: React.CSSProperties = {
    width: "100%",
    backgroundColor: A.bg,
    border: `1px solid ${A.border}`,
    borderRadius: "0.5rem",
    padding: "0.6rem 0.75rem",
    color: A.textPrimary,
    fontSize: "0.85rem",
    outline: "none",
  };

  const labelCls: React.CSSProperties = {
    display: "block",
    fontSize: "0.7rem",
    fontWeight: 600,
    color: A.textMuted,
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  return (
    <div className="p-6 md:p-10 relative">
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: A.card,
            border: `1px solid ${A.border}`,
            color: A.textPrimary,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: A.textPrimary, fontFamily: "'Noto Serif TC', serif" }}
        >
          情境管理
        </h1>
        <p className="text-sm mt-1" style={{ color: A.textMuted }}>
          情境只影響前台導購與排序，不直接決定底層售價。情境 ID 目前固定，不建議任意新增刪除。
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <i
            className="fas fa-spinner fa-spin text-2xl"
            style={{ color: A.gold }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setEditing({ ...scenario })}
              className="text-left rounded-xl p-6 transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: A.card,
                border: `1px solid ${A.border}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${A.gold}15`,
                    border: `1px solid ${A.gold}30`,
                  }}
                >
                  <i className={scenario.icon} style={{ color: A.gold }} />
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: A.bg, color: A.textMuted }}
                >
                  {scenario.id}
                </span>
              </div>
              <h2 className="font-bold text-lg mb-2" style={{ color: A.textPrimary }}>
                {scenario.name}
              </h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: A.textMuted }}>
                {scenario.description}
              </p>
              <div className="text-xs" style={{ color: A.textMuted }}>
                排序：{scenario.sortOrder}
              </div>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="w-full max-w-lg mx-4 rounded-2xl"
            style={{
              backgroundColor: A.card,
              border: `1px solid ${A.border}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${A.border}` }}
            >
              <h2 className="font-bold" style={{ color: A.gold }}>
                編輯情境：{editing.name}
              </h2>
              <button onClick={() => setEditing(null)} style={{ color: A.textMuted }}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label style={labelCls}>情境 ID</label>
                <input value={editing.id} disabled style={{ ...inputCls, opacity: 0.6 }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelCls}>名稱</label>
                  <input
                    value={editing.name}
                    onChange={(event) =>
                      setEditing((current) =>
                        current ? { ...current, name: event.target.value } : current
                      )
                    }
                    style={inputCls}
                  />
                </div>
                <div>
                  <label style={labelCls}>Font Awesome Icon</label>
                  <input
                    value={editing.icon}
                    onChange={(event) =>
                      setEditing((current) =>
                        current ? { ...current, icon: event.target.value } : current
                      )
                    }
                    style={inputCls}
                  />
                </div>
              </div>
              <div>
                <label style={labelCls}>描述</label>
                <textarea
                  value={editing.description}
                  onChange={(event) =>
                    setEditing((current) =>
                      current
                        ? { ...current, description: event.target.value }
                        : current
                    )
                  }
                  rows={4}
                  style={{ ...inputCls, resize: "vertical" }}
                />
              </div>
              <div>
                <label style={labelCls}>排序</label>
                <input
                  type="number"
                  value={editing.sortOrder}
                  onChange={(event) =>
                    setEditing((current) =>
                      current
                        ? {
                            ...current,
                            sortOrder: Number(event.target.value),
                          }
                        : current
                    )
                  }
                  style={inputCls}
                />
              </div>
            </div>

            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: `1px solid ${A.border}` }}
            >
              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2 rounded-lg text-sm"
                style={{ color: A.textMuted, border: `1px solid ${A.border}` }}
              >
                取消
              </button>
              <button
                onClick={saveScenario}
                disabled={saving}
                className="px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-40"
                style={{ backgroundColor: A.gold, color: "#0d0d0d" }}
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2" />
                    儲存中...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2" />
                    儲存
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
