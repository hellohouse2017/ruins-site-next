"use client";

import { useCallback, useEffect, useState } from "react";
import { A } from "../ui";
import type { BookingRulesConfig, VenueConfig } from "@/types/v2";

interface SettingsState {
  venue: VenueConfig;
  bookingRules: BookingRulesConfig;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/settings");
    const payload = response.ok ? await response.json() : null;
    setSettings(payload);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const updateVenueField = <K extends keyof VenueConfig>(
    key: K,
    value: VenueConfig[K]
  ) => {
    setSettings((current) =>
      current
        ? {
            ...current,
            venue: {
              ...current.venue,
              [key]: value,
            },
          }
        : current
    );
  };

  const updateRulesField = <K extends keyof BookingRulesConfig>(
    key: K,
    value: BookingRulesConfig[K]
  ) => {
    setSettings((current) =>
      current
        ? {
            ...current,
            bookingRules: {
              ...current.bookingRules,
              [key]: value,
            },
          }
        : current
    );
  };

  const updateBaseInclude = (index: number, value: string) => {
    setSettings((current) => {
      if (!current) return current;
      const baseIncludes = [...current.venue.baseIncludes];
      baseIncludes[index] = value;

      return {
        ...current,
        venue: {
          ...current.venue,
          baseIncludes,
        },
      };
    });
  };

  const addBaseInclude = () => {
    setSettings((current) =>
      current
        ? {
            ...current,
            venue: {
              ...current.venue,
              baseIncludes: [...current.venue.baseIncludes, ""],
            },
          }
        : current
    );
  };

  const removeBaseInclude = (index: number) => {
    setSettings((current) =>
      current
        ? {
            ...current,
            venue: {
              ...current.venue,
              baseIncludes: current.venue.baseIncludes.filter(
                (_, itemIndex) => itemIndex !== index
              ),
            },
          }
        : current
    );
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (response.ok) {
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

      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: A.textPrimary, fontFamily: "'Noto Serif TC', serif" }}
          >
            場地設定
          </h1>
          <p className="text-sm mt-1" style={{ color: A.textMuted }}>
            管理基礎場租、時段條件、預收規則與匯款資訊。
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving || !settings}
          className="px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40"
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
              儲存設定
            </>
          )}
        </button>
      </div>

      {loading || !settings ? (
        <div className="text-center py-20">
          <i
            className="fas fa-spinner fa-spin text-2xl"
            style={{ color: A.gold }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <section
            className="rounded-xl p-6"
            style={{ backgroundColor: A.card, border: `1px solid ${A.border}` }}
          >
            <h2 className="font-bold mb-4" style={{ color: A.gold }}>
              場地基本資料
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={labelCls}>場地名稱</label>
                <input
                  value={settings.venue.name}
                  onChange={(event) =>
                    updateVenueField("name", event.target.value)
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>基本時數</label>
                <input
                  type="number"
                  value={settings.venue.baseDurationHours}
                  onChange={(event) =>
                    updateVenueField(
                      "baseDurationHours",
                      Number(event.target.value)
                    )
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>平日場租</label>
                <input
                  type="number"
                  value={settings.venue.weekdayPrice}
                  onChange={(event) =>
                    updateVenueField("weekdayPrice", Number(event.target.value))
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>假日場租</label>
                <input
                  type="number"
                  value={settings.venue.weekendPrice}
                  onChange={(event) =>
                    updateVenueField("weekendPrice", Number(event.target.value))
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>平日加時單價</label>
                <input
                  type="number"
                  value={settings.venue.weekdayExtraHourPrice}
                  onChange={(event) =>
                    updateVenueField(
                      "weekdayExtraHourPrice",
                      Number(event.target.value)
                    )
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>假日加時單價</label>
                <input
                  type="number"
                  value={settings.venue.weekendExtraHourPrice}
                  onChange={(event) =>
                    updateVenueField(
                      "weekendExtraHourPrice",
                      Number(event.target.value)
                    )
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>最多可加時數</label>
                <input
                  type="number"
                  value={settings.venue.maxExtraHours}
                  onChange={(event) =>
                    updateVenueField("maxExtraHours", Number(event.target.value))
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>最晚提前預約天數</label>
                <input
                  type="number"
                  value={settings.venue.leadDays}
                  onChange={(event) =>
                    updateVenueField("leadDays", Number(event.target.value))
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>最少建議人數</label>
                <input
                  type="number"
                  value={settings.venue.capacity.min}
                  onChange={(event) =>
                    updateVenueField("capacity", {
                      ...settings.venue.capacity,
                      min: Number(event.target.value),
                    })
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>最多建議人數</label>
                <input
                  type="number"
                  value={settings.venue.capacity.max}
                  onChange={(event) =>
                    updateVenueField("capacity", {
                      ...settings.venue.capacity,
                      max: Number(event.target.value),
                    })
                  }
                  style={inputCls}
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold" style={{ color: A.gold }}>
                  基本已含內容
                </h3>
                <button
                  type="button"
                  onClick={addBaseInclude}
                  className="text-xs flex items-center gap-1"
                  style={{ color: A.gold }}
                >
                  <i className="fas fa-plus" /> 新增
                </button>
              </div>
              <div className="space-y-3">
                {settings.venue.baseIncludes.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="grid grid-cols-[1fr,48px] gap-3"
                  >
                    <input
                      value={item}
                      onChange={(event) =>
                        updateBaseInclude(index, event.target.value)
                      }
                      style={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => removeBaseInclude(index)}
                      className="w-12 h-11 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: A.bg, color: A.danger }}
                    >
                      <i className="fas fa-trash text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className="rounded-xl p-6"
            style={{ backgroundColor: A.card, border: `1px solid ${A.border}` }}
          >
            <h2 className="font-bold mb-4" style={{ color: A.gold }}>
              預收與付款規則
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={labelCls}>純場租固定預收金額</label>
                <input
                  type="number"
                  value={settings.bookingRules.deposit.venueOnlyFixed}
                  onChange={(event) =>
                    updateRulesField("deposit", {
                      ...settings.bookingRules.deposit,
                      venueOnlyFixed: Number(event.target.value),
                    })
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>含加購預收比例</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={settings.bookingRules.deposit.withAddonsRate}
                  onChange={(event) =>
                    updateRulesField("deposit", {
                      ...settings.bookingRules.deposit,
                      withAddonsRate: Number(event.target.value),
                    })
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>銀行代碼</label>
                <input
                  value={settings.bookingRules.payment.bankCode}
                  onChange={(event) =>
                    updateRulesField("payment", {
                      ...settings.bookingRules.payment,
                      bankCode: event.target.value,
                    })
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>銀行名稱</label>
                <input
                  value={settings.bookingRules.payment.bankName}
                  onChange={(event) =>
                    updateRulesField("payment", {
                      ...settings.bookingRules.payment,
                      bankName: event.target.value,
                    })
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>戶名</label>
                <input
                  value={settings.bookingRules.payment.accountName}
                  onChange={(event) =>
                    updateRulesField("payment", {
                      ...settings.bookingRules.payment,
                      accountName: event.target.value,
                    })
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>帳號</label>
                <input
                  value={settings.bookingRules.payment.accountNumber}
                  onChange={(event) =>
                    updateRulesField("payment", {
                      ...settings.bookingRules.payment,
                      accountNumber: event.target.value,
                    })
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>訂單前綴</label>
                <input
                  value={settings.bookingRules.order.prefix}
                  onChange={(event) =>
                    updateRulesField("order", {
                      ...settings.bookingRules.order,
                      prefix: event.target.value,
                    })
                  }
                  style={inputCls}
                />
              </div>
              <div>
                <label style={labelCls}>成功頁路徑</label>
                <input
                  value={settings.bookingRules.order.successPagePath}
                  onChange={(event) =>
                    updateRulesField("order", {
                      ...settings.bookingRules.order,
                      successPagePath: event.target.value,
                    })
                  }
                  style={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
              <label
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{
                  backgroundColor: A.bg,
                  border: `1px solid ${A.border}`,
                  color: A.textPrimary,
                }}
              >
                <span className="text-sm">要求匯款末五碼</span>
                <input
                  type="checkbox"
                  checked={settings.bookingRules.payment.requireLast5}
                  onChange={(event) =>
                    updateRulesField("payment", {
                      ...settings.bookingRules.payment,
                      requireLast5: event.target.checked,
                    })
                  }
                />
              </label>
              <label
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{
                  backgroundColor: A.bg,
                  border: `1px solid ${A.border}`,
                  color: A.textPrimary,
                }}
              >
                <span className="text-sm">Email 通知</span>
                <input
                  type="checkbox"
                  checked={settings.bookingRules.notifications.email}
                  onChange={(event) =>
                    updateRulesField("notifications", {
                      ...settings.bookingRules.notifications,
                      email: event.target.checked,
                    })
                  }
                />
              </label>
              <label
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{
                  backgroundColor: A.bg,
                  border: `1px solid ${A.border}`,
                  color: A.textPrimary,
                }}
              >
                <span className="text-sm">LINE 通知</span>
                <input
                  type="checkbox"
                  checked={settings.bookingRules.notifications.line}
                  onChange={(event) =>
                    updateRulesField("notifications", {
                      ...settings.bookingRules.notifications,
                      line: event.target.checked,
                    })
                  }
                />
              </label>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
