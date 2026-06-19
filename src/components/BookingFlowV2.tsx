"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import siteConfig from "@/data/site-config.json";
import { CalendarPicker } from "@/components/CalendarPicker";
import type {
  AddonCategoryConfig,
  AddonItemConfig,
  BookingQuote,
  ScenarioConfig,
  ScenarioId,
  VenueConfig,
} from "@/types/v2";

type TimePresetId = "lunch" | "dinner" | "custom";

export interface BookingScenarioView extends ScenarioConfig {
  image: string;
  accentColor: string;
  suitableFor: string;
  eyebrow: string;
}

export interface BookingBundleView {
  id: string;
  scenarioId: ScenarioId;
  name: string;
  badge: string;
  summary: string;
  listPrice: number;
  bundlePrice: number;
  savings: number;
  itemNames: string[];
  itemIds: string[];
}

export interface BookingFlowV2Props {
  venue: VenueConfig;
  scenarios: BookingScenarioView[];
  bundlesByScenario: Record<ScenarioId, BookingBundleView[]>;
  addonCategoriesByScenario: Record<ScenarioId, AddonCategoryConfig[]>;
}

interface BookingState {
  date: string;
  scenarioId: ScenarioId | "";
  bundleId: string;
  timePreset: TimePresetId;
  customStart: string;
  extraHours: number;
  addons: Record<string, number>;
  guestName: string;
  guestPhone: string;
  guestCount: string;
  guestLine: string;
  guestNote: string;
}

const TIME_PRESETS: Array<{
  id: TimePresetId;
  label: string;
  time: string;
  desc: string;
}> = [
  { id: "lunch", label: "午場", time: "11:00", desc: "適合家庭聚會與白天活動" },
  { id: "dinner", label: "晚場", time: "17:00", desc: "適合求婚、婚禮與派對" },
  { id: "custom", label: "自訂", time: "自訂進場", desc: "依你的流程調整開始時間" },
];

const STEPS = [
  { id: 1, label: "日期時段", icon: "fa-calendar-alt" },
  { id: 2, label: "活動用途", icon: "fa-layer-group" },
  { id: 3, label: "加購服務", icon: "fa-cart-plus" },
  { id: 4, label: "送出 LINE", icon: "fa-paper-plane" },
];

const initialState: BookingState = {
  date: "",
  scenarioId: "",
  bundleId: "",
  timePreset: "dinner",
  customStart: "18:00",
  extraHours: 0,
  addons: {},
  guestName: "",
  guestPhone: "",
  guestCount: "",
  guestLine: "",
  guestNote: "",
};

const S = {
  heading: { color: "var(--text-primary)" } as CSSProperties,
  sub: { color: "var(--text-muted)" } as CSSProperties,
  card: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-primary)",
    boxShadow: "var(--card-shadow)",
    borderRadius: "1rem",
  } as CSSProperties,
  input: {
    width: "100%",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-primary)",
    borderRadius: "0.75rem",
    padding: "0.85rem 1rem",
    color: "var(--text-primary)",
    outline: "none",
  } as CSSProperties,
  btnPrimary: {
    backgroundColor: "var(--accent-pink)",
    color: "#fff",
    fontWeight: "bold",
    padding: "0.8rem 1.5rem",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s",
  } as CSSProperties,
  btnSecondary: {
    backgroundColor: "transparent",
    color: "var(--text-muted)",
    fontWeight: "500",
    padding: "0.8rem 1.5rem",
    borderRadius: "999px",
    border: "1px solid var(--border-primary)",
    cursor: "pointer",
    transition: "all 0.3s",
  } as CSSProperties,
} satisfies Record<string, CSSProperties>;

function formatCurrency(value: number): string {
  return `NT$${value.toLocaleString()}`;
}

function getStartTime(booking: BookingState): string {
  if (booking.timePreset === "lunch") return "11:00";
  if (booking.timePreset === "dinner") return "17:00";
  return booking.customStart || "18:00";
}

function getEndTime(startTime: string, durationHours: number): string {
  const [hourText, minuteText] = startTime.split(":");
  const startMinutes = Number(hourText) * 60 + Number(minuteText);
  const endMinutes = (startMinutes + durationHours * 60) % (24 * 60);
  const hours = String(Math.floor(endMinutes / 60)).padStart(2, "0");
  const minutes = String(endMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function SummaryCard({
  venue,
  booking,
  scenarios,
  selectedBundle,
  quote,
  quoteLoading,
  quoteError,
}: {
  venue: VenueConfig;
  booking: BookingState;
  scenarios: BookingScenarioView[];
  selectedBundle?: BookingBundleView;
  quote: BookingQuote | null;
  quoteLoading: boolean;
  quoteError: string | null;
}) {
  const selectedScenario = scenarios.find(
    (scenario) => scenario.id === booking.scenarioId
  );
  const durationHours = venue.baseDurationHours + booking.extraHours;
  const startTime = getStartTime(booking);
  const endTime = getEndTime(startTime, durationHours);

  return (
    <div
      className="lg:sticky lg:top-24 rounded-2xl p-5"
      style={{
        ...S.card,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)",
      }}
    >
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-faint)" }}>
          目前報價
        </p>
        <h3 className="text-xl font-bold mt-2" style={S.heading}>
          {quote ? formatCurrency(quote.totalAmount) : "請先選日期"}
        </h3>
        <p className="text-sm mt-1" style={S.sub}>
          {quote
            ? `${quote.dayType === "weekend" ? "假日" : "平日"}價格已套用`
            : `場地平日 ${formatCurrency(venue.weekdayPrice)} / 假日 ${formatCurrency(
                venue.weekendPrice
              )}`}
        </p>
      </div>

      <div
        className="rounded-xl p-4 mb-4"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {venue.name}
            </p>
            <p className="text-sm" style={S.sub}>
              {booking.date || "尚未選擇日期"}
            </p>
          </div>
          {selectedScenario && (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: `${selectedScenario.accentColor}22`,
                color: selectedScenario.accentColor,
              }}
            >
              {selectedScenario.name}
            </span>
          )}
        </div>
        <p className="text-sm" style={S.sub}>
          {startTime} - {endTime} / 共 {durationHours} 小時
        </p>
        {selectedBundle && (
          <p className="text-sm mt-2" style={{ color: "var(--accent-blue)" }}>
            已選組合：{selectedBundle.name}
          </p>
        )}
      </div>

      {quoteLoading && (
        <div className="text-sm mb-3" style={{ color: "var(--accent-blue)" }}>
          <i className="fas fa-spinner fa-spin mr-2" />
          正在更新報價
        </div>
      )}

      {quoteError && (
        <div
          className="rounded-xl px-4 py-3 text-sm mb-4"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            color: "#fca5a5",
          }}
        >
          {quoteError}
        </div>
      )}

      {quote && (
        <>
          <div className="space-y-3 mb-4">
            <div
              className="flex items-center justify-between text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>場地基本租金</span>
              <span>{formatCurrency(quote.baseAmount)}</span>
            </div>

            {quote.lines.map((line) => (
              <div
                key={`${line.source}-${line.addonId}`}
                className="flex items-start justify-between gap-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <div>
                  <p>{line.name}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
                    {line.qty} x {formatCurrency(line.unitPrice)}
                    {line.source === "bundle" ? " / 組合內含" : ""}
                  </p>
                </div>
                <span>{formatCurrency(line.subtotal)}</span>
              </div>
            ))}

            {quote.bundleDiscountAmount > 0 && (
              <div
                className="flex items-center justify-between text-sm"
                style={{ color: "var(--accent-pink)" }}
              >
                <span>組合折扣</span>
                <span>-{formatCurrency(quote.bundleDiscountAmount)}</span>
              </div>
            )}
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span style={{ color: "var(--text-muted)" }}>總金額</span>
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                {formatCurrency(quote.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-muted)" }}>預收金額</span>
              <span className="font-bold" style={{ color: "var(--accent-blue)" }}>
                {formatCurrency(quote.depositAmount)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function BookingFlowV2({
  venue,
  scenarios,
  bundlesByScenario,
  addonCategoriesByScenario,
}: BookingFlowV2Props) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingState>(initialState);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const selectedScenario = scenarios.find(
    (scenario) => scenario.id === booking.scenarioId
  );
  const selectedCategories = booking.scenarioId
    ? addonCategoriesByScenario[booking.scenarioId]
    : [];
  const selectedBundles = booking.scenarioId
    ? bundlesByScenario[booking.scenarioId]
    : [];
  const selectedBundle = selectedBundles.find(
    (bundle) => bundle.id === booking.bundleId
  );
  const bundleItemIdSet = useMemo(
    () => new Set(selectedBundle?.itemIds ?? []),
    [selectedBundle]
  );
  const visibleAddonIds = useMemo(
    () => selectedCategories.flatMap((category) => category.items.map((item) => item.id)),
    [selectedCategories]
  );

  useEffect(() => {
    const scenarioParam = searchParams.get("scenario");
    const bundleParam = searchParams.get("bundle");

    setBooking((current) => {
      let nextScenarioId = current.scenarioId;
      let nextBundleId = current.bundleId;

      if (scenarioParam && scenarios.some((scenario) => scenario.id === scenarioParam)) {
        nextScenarioId = scenarioParam as ScenarioId;
      }

      if (bundleParam) {
        const bundle = Object.values(bundlesByScenario)
          .flat()
          .find((item) => item.id === bundleParam);
        if (bundle) {
          nextScenarioId = bundle.scenarioId;
          nextBundleId = bundle.id;
        }
      }

      if (
        nextScenarioId === current.scenarioId &&
        nextBundleId === current.bundleId
      ) {
        return current;
      }

      return {
        ...current,
        scenarioId: nextScenarioId,
        bundleId: nextBundleId,
      };
    });
  }, [bundlesByScenario, scenarios, searchParams]);

  useEffect(() => {
    if (!booking.scenarioId) return;

    const allowedSet = new Set(visibleAddonIds);
    setBooking((current) => {
      const filteredEntries = Object.entries(current.addons).filter(([addonId]) =>
        allowedSet.has(addonId)
      );
      const nextAddons = Object.fromEntries(filteredEntries);
      const currentIds = Object.keys(current.addons).sort();
      const nextIds = Object.keys(nextAddons).sort();

      if (
        arraysEqual(currentIds, nextIds) &&
        currentIds.every((id) => current.addons[id] === nextAddons[id])
      ) {
        return current;
      }

      return {
        ...current,
        addons: nextAddons,
      };
    });
  }, [booking.scenarioId, visibleAddonIds]);

  useEffect(() => {
    if (!booking.bundleId) return;

    const scenarioBundles = booking.scenarioId
      ? bundlesByScenario[booking.scenarioId]
      : [];
    if (scenarioBundles.some((bundle) => bundle.id === booking.bundleId)) {
      return;
    }

    setBooking((current) => ({ ...current, bundleId: "" }));
  }, [booking.bundleId, booking.scenarioId, bundlesByScenario]);

  useEffect(() => {
    if (!selectedBundle) return;

    setBooking((current) => {
      const nextAddons = { ...current.addons };
      let changed = false;

      for (const addonId of selectedBundle.itemIds) {
        if (nextAddons[addonId]) {
          delete nextAddons[addonId];
          changed = true;
        }
      }

      if (!changed) return current;

      return {
        ...current,
        addons: nextAddons,
      };
    });
  }, [selectedBundle]);

  useEffect(() => {
    if (!booking.date) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    const controller = new AbortController();

    async function fetchQuote() {
      setQuoteLoading(true);
      setQuoteError(null);

      try {
        const response = await fetch("/api/v2/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: booking.date,
            extraHours: booking.extraHours,
            bundleId: booking.bundleId || undefined,
            addonSelections: Object.entries(booking.addons).map(([addonId, qty]) => ({
              addonId,
              qty,
            })),
          }),
          signal: controller.signal,
        });

        const data = (await response.json()) as
          | { ok: true; quote: BookingQuote }
          | { ok: false; message: string };

        if (!response.ok || !data.ok) {
          throw new Error(data.ok ? "Failed to create quote" : data.message);
        }

        setQuote(data.quote);
      } catch (error) {
        if (controller.signal.aborted) return;
        setQuote(null);
        setQuoteError(
          error instanceof Error ? error.message : "無法取得即時報價"
        );
      } finally {
        if (!controller.signal.aborted) {
          setQuoteLoading(false);
        }
      }
    }

    fetchQuote();

    return () => controller.abort();
  }, [booking.addons, booking.bundleId, booking.date, booking.extraHours]);

  const durationHours = venue.baseDurationHours + booking.extraHours;
  const startTime = getStartTime(booking);
  const endTime = getEndTime(startTime, durationHours);

  const updateCounterAddon = (item: AddonItemConfig, nextQty: number) => {
    const normalizedQty = Math.max(0, Math.min(item.max ?? Number.MAX_SAFE_INTEGER, nextQty));
    const finalQty =
      normalizedQty > 0 && item.minOrder && normalizedQty < item.minOrder
        ? 0
        : normalizedQty;

    setBooking((current) => {
      const nextAddons = { ...current.addons };

      if (finalQty <= 0) {
        delete nextAddons[item.id];
      } else {
        nextAddons[item.id] = finalQty;
      }

      return {
        ...current,
        addons: nextAddons,
      };
    });
  };

  const toggleAddon = (item: AddonItemConfig) => {
    const isSelected = (booking.addons[item.id] ?? 0) > 0;

    setBooking((current) => {
      const nextAddons = { ...current.addons };

      if (item.group) {
        for (const category of selectedCategories) {
          for (const otherItem of category.items) {
            if (otherItem.group === item.group) {
              delete nextAddons[otherItem.id];
            }
          }
        }
      }

      if (isSelected) {
        delete nextAddons[item.id];
      } else {
        nextAddons[item.id] = 1;
      }

      return {
        ...current,
        addons: nextAddons,
      };
    });
  };

  const goNext = () => setStep((current) => Math.min(current + 1, STEPS.length));
  const goPrev = () => setStep((current) => Math.max(current - 1, 1));

  const canGoStep2 = Boolean(booking.date);
  const canGoStep3 = Boolean(booking.scenarioId);
  const canSubmit =
    Boolean(quote) &&
    booking.guestName.trim().length > 0 &&
    /^09\d{8}$/.test(booking.guestPhone) &&
    Number(booking.guestCount) > 0;

  const submitToLine = async () => {
    if (!quote) return;

    const selectedAddonLines = Object.entries(booking.addons)
      .filter(([, qty]) => qty > 0)
      .map(([addonId, qty]) => {
        const item = selectedCategories
          .flatMap((category) => category.items)
          .find((candidate) => candidate.id === addonId);
        if (!item) return null;
        return `- ${item.name}${item.type === "counter" ? ` x ${qty}${item.unit}` : ""}`;
      })
      .filter(Boolean) as string[];

    let message = "您好，我想詢問 Ruins Bar 的包場檔期。\n\n";
    message += `📅 日期：${booking.date}\n`;
    message += `⏰ 時段：${startTime} - ${endTime}（共 ${durationHours} 小時）\n`;
    message += `🎯 用途：${selectedScenario?.name ?? "未指定"}\n`;
    if (selectedBundle) {
      message += `🎁 推薦組合：${selectedBundle.name}（${formatCurrency(
        selectedBundle.bundlePrice
      )}）\n`;
    }
    if (selectedAddonLines.length > 0) {
      message += `\n➕ 額外加購：\n${selectedAddonLines.join("\n")}\n`;
    }
    message += `\n👤 姓名：${booking.guestName}\n`;
    message += `📱 電話：${booking.guestPhone}\n`;
    message += `👥 人數：${booking.guestCount}\n`;
    if (booking.guestLine.trim()) {
      message += `💬 LINE：${booking.guestLine}\n`;
    }
    if (booking.guestNote.trim()) {
      message += `📝 備註：${booking.guestNote}\n`;
    }
    message += `\n💰 預估總價：${formatCurrency(quote.totalAmount)}\n`;
    message += `💳 預收金額：${formatCurrency(quote.depositAmount)}\n`;
    message += "\n付款完成後才會保留日期，請協助確認檔期與最終細節，謝謝。";

    try {
      await navigator.clipboard.writeText(message);
      setSent(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = message;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-32" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ ...S.heading, fontFamily: "var(--font-display)" }}
          >
            高雄鹽埕包場場地｜詢問檔期
          </h1>
          <p className="text-sm" style={S.sub}>
            先填日期、人數與活動類型，我們會直接幫你看時段、估算總價與預收金額。
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-8"
        >
          {[
            { label: "地點", value: "高雄鹽埕區" },
            { label: "適合活動", value: "求婚 / 慶生 / 抓周 / 企業活動 / 商攝" },
            { label: "價格", value: "NT$15,000 起" },
            { label: "預約方式", value: "LINE 詢問檔期" },
            { label: "需要提供", value: "日期 / 人數 / 活動類型 / 需求" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border p-4 text-left"
              style={{
                ...S.card,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
              }}
            >
              <p className="text-xs uppercase tracking-[0.18em] mb-1" style={S.sub}>
                {item.label}
              </p>
              <p className="font-bold" style={S.heading}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center mb-10 px-4">
          {STEPS.map((item, index) => (
            <div key={item.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => item.id < step && setStep(item.id)}
                className="flex flex-col items-center gap-1"
                disabled={item.id > step}
              >
                <div
                  className={`wizard-step-circle ${
                    step === item.id ? "active" : step > item.id ? "completed" : "inactive"
                  }`}
                >
                  {step > item.id ? <i className="fas fa-check text-xs" /> : item.id}
                </div>
                <span
                  className="text-xs hidden sm:block"
                  style={{
                    color:
                      step >= item.id ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  {item.label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={`wizard-connector mx-2 ${
                    step > item.id ? "completed" : "inactive"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr),360px] gap-6 items-start">
          <div>
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold mb-1" style={S.heading}>
                    先選日期與進場時間
                  </h2>
                  <p className="text-sm" style={S.sub}>
                    基本場租為 {venue.baseDurationHours} 小時，可再加時。
                  </p>
                </div>

                <CalendarPicker
                  value={booking.date}
                  onChange={(date) =>
                    setBooking((current) => ({ ...current, date }))
                  }
                  minLeadDays={venue.leadDays}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TIME_PRESETS.map((preset) => {
                    const active = booking.timePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() =>
                          setBooking((current) => ({ ...current, timePreset: preset.id }))
                        }
                        className="text-left p-5 rounded-2xl border transition-all"
                        style={{
                          ...S.card,
                          borderColor: active
                            ? "var(--accent-blue)"
                            : "var(--border-primary)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold" style={S.heading}>
                            {preset.label}
                          </p>
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: active
                                ? "rgba(0, 243, 255, 0.12)"
                                : "rgba(255,255,255,0.04)",
                              color: active
                                ? "var(--accent-blue)"
                                : "var(--text-faint)",
                            }}
                          >
                            {preset.time}
                          </span>
                        </div>
                        <p className="text-sm" style={S.sub}>
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {booking.timePreset === "custom" && (
                  <div style={S.card} className="p-5">
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      自訂進場時間
                    </label>
                    <input
                      type="time"
                      value={booking.customStart}
                      onChange={(event) =>
                        setBooking((current) => ({
                          ...current,
                          customStart: event.target.value,
                        }))
                      }
                      style={S.input}
                    />
                  </div>
                )}

                <div style={S.card} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold mb-1" style={S.heading}>
                        場地加時
                      </h3>
                      <p className="text-sm" style={S.sub}>
                        平日每小時 {formatCurrency(venue.weekdayExtraHourPrice)}，
                        假日每小時 {formatCurrency(venue.weekendExtraHourPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setBooking((current) => ({
                            ...current,
                            extraHours: Math.max(0, current.extraHours - 1),
                          }))
                        }
                        className="w-10 h-10 rounded-full border"
                        style={{
                          color: "var(--text-primary)",
                          borderColor: "var(--border-primary)",
                        }}
                      >
                        <i className="fas fa-minus" />
                      </button>
                      <div className="w-12 text-center font-bold" style={S.heading}>
                        {booking.extraHours}
                      </div>
                      <button
                        onClick={() =>
                          setBooking((current) => ({
                            ...current,
                            extraHours: Math.min(
                              venue.maxExtraHours,
                              current.extraHours + 1
                            ),
                          }))
                        }
                        className="w-10 h-10 rounded-full border"
                        style={{
                          color: "var(--text-primary)",
                          borderColor: "var(--border-primary)",
                        }}
                      >
                        <i className="fas fa-plus" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={goNext}
                    disabled={!canGoStep2}
                    style={{
                      ...S.btnPrimary,
                      opacity: canGoStep2 ? 1 : 0.45,
                      cursor: canGoStep2 ? "pointer" : "not-allowed",
                    }}
                  >
                    下一步
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold mb-1" style={S.heading}>
                    再選活動用途與推薦組合
                  </h2>
                  <p className="text-sm" style={S.sub}>
                    用途主要影響推薦內容與加購排序，不影響場地本身的基本租金。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {scenarios.map((scenario) => {
                    const active = booking.scenarioId === scenario.id;

                    return (
                      <button
                        key={scenario.id}
                        onClick={() =>
                          setBooking((current) => ({
                            ...current,
                            scenarioId: scenario.id,
                            bundleId: "",
                          }))
                        }
                        className="text-left rounded-2xl overflow-hidden border transition-all"
                        style={{
                          ...S.card,
                          borderColor: active
                            ? scenario.accentColor
                            : "var(--border-primary)",
                        }}
                      >
                        <div className="relative h-36">
                          <img
                            src={scenario.image}
                            alt={scenario.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                          <div className="absolute left-4 bottom-4 right-4">
                            <div className="flex items-center gap-2 mb-1">
                              <i className={scenario.icon} style={{ color: scenario.accentColor }} />
                              <h3 className="font-bold text-white">{scenario.name}</h3>
                            </div>
                            <p className="text-xs text-white/80">{scenario.suitableFor}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm" style={S.sub}>
                            {scenario.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {booking.scenarioId && (
                  <div style={S.card} className="p-5">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold" style={S.heading}>
                          推薦組合
                        </h3>
                        <p className="text-sm mt-1" style={S.sub}>
                          你也可以略過組合，直接在下一步自己挑單品。
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setBooking((current) => ({ ...current, bundleId: "" }))
                        }
                        className="text-sm font-medium"
                        style={{ color: "var(--accent-blue)" }}
                      >
                        不先選組合
                      </button>
                    </div>

                    {selectedBundles.length === 0 ? (
                      <p className="text-sm" style={S.sub}>
                        這個用途目前沒有預設組合，可直接進下一步挑單品加購。
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {selectedBundles.map((bundle) => {
                          const active = booking.bundleId === bundle.id;
                          return (
                            <button
                              key={bundle.id}
                              onClick={() =>
                                setBooking((current) => ({
                                  ...current,
                                  bundleId: active ? "" : bundle.id,
                                }))
                              }
                              className="w-full text-left rounded-2xl p-5 border transition-all"
                              style={{
                                backgroundColor: "var(--bg-secondary)",
                                borderColor: active
                                  ? selectedScenario?.accentColor ?? "var(--accent-blue)"
                                  : "var(--border-primary)",
                              }}
                            >
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span
                                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                                      style={{
                                        backgroundColor: `${selectedScenario?.accentColor ?? "#00f3ff"}22`,
                                        color: selectedScenario?.accentColor ?? "var(--accent-blue)",
                                      }}
                                    >
                                      {bundle.badge}
                                    </span>
                                    {active && (
                                      <span
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                                        style={{
                                          backgroundColor: "rgba(255, 0, 85, 0.12)",
                                          color: "var(--accent-pink)",
                                        }}
                                      >
                                        已選取
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-lg" style={S.heading}>
                                    {bundle.name}
                                  </h4>
                                  <p className="text-sm mt-1" style={S.sub}>
                                    {bundle.summary}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs line-through" style={{ color: "var(--text-faint)" }}>
                                    {formatCurrency(bundle.listPrice)}
                                  </p>
                                  <p className="font-bold" style={{ color: "var(--accent-blue)" }}>
                                    {formatCurrency(bundle.bundlePrice)}
                                  </p>
                                  <p className="text-xs" style={{ color: "var(--accent-pink)" }}>
                                    省 {formatCurrency(bundle.savings)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {bundle.itemNames.map((itemName) => (
                                  <span
                                    key={itemName}
                                    className="text-xs px-2.5 py-1 rounded-full"
                                    style={{
                                      backgroundColor: "rgba(255,255,255,0.04)",
                                      color: "var(--text-muted)",
                                      border: "1px solid var(--border-primary)",
                                    }}
                                  >
                                    {itemName}
                                  </span>
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button onClick={goPrev} style={S.btnSecondary}>
                    上一步
                  </button>
                  <button
                    onClick={goNext}
                    disabled={!canGoStep3}
                    style={{
                      ...S.btnPrimary,
                      opacity: canGoStep3 ? 1 : 0.45,
                      cursor: canGoStep3 ? "pointer" : "not-allowed",
                    }}
                  >
                    下一步
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold mb-1" style={S.heading}>
                    單品加購
                  </h2>
                  <p className="text-sm" style={S.sub}>
                    價格由 quote API 即時更新，前端不再自己算總價。
                  </p>
                </div>

                {selectedCategories.map((category) => (
                  <section key={category.id} style={S.card} className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-bold" style={S.heading}>
                          {category.name}
                        </h3>
                        <p className="text-sm" style={S.sub}>
                          依 {selectedScenario?.name} 場景排序
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {category.items.map((item) => {
                        const qty = booking.addons[item.id] ?? 0;
                        const includedByBundle = bundleItemIdSet.has(item.id);
                        const isToggle = item.type === "toggle";
                        const isActive = qty > 0;

                        return (
                          <div
                            key={item.id}
                            className="rounded-2xl p-4 border"
                            style={{
                              backgroundColor: "var(--bg-secondary)",
                              borderColor: isActive
                                ? "var(--accent-blue)"
                                : "var(--border-primary)",
                              opacity: includedByBundle ? 0.72 : 1,
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h4 className="font-semibold" style={S.heading}>
                                    {item.name}
                                  </h4>
                                  {item.popular && (
                                    <span
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold"
                                      style={{
                                        backgroundColor: "rgba(255, 0, 85, 0.12)",
                                        color: "var(--accent-pink)",
                                      }}
                                    >
                                      熱門
                                    </span>
                                  )}
                                  {includedByBundle && (
                                    <span
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold"
                                      style={{
                                        backgroundColor: "rgba(0, 243, 255, 0.12)",
                                        color: "var(--accent-blue)",
                                      }}
                                    >
                                      組合已含
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm mb-2" style={S.sub}>
                                  {item.description}
                                </p>
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                  {formatCurrency(item.priceWeekday)}
                                  {item.unit ? ` / ${item.unit}` : ""}
                                  {item.minOrder ? `，${item.minOrder}${item.unit}起` : ""}
                                </p>
                              </div>

                              {isToggle ? (
                                <button
                                  onClick={() => toggleAddon(item)}
                                  disabled={includedByBundle}
                                  className="shrink-0 px-4 py-2 rounded-full border text-sm font-bold transition"
                                  style={{
                                    backgroundColor: isActive
                                      ? "var(--accent-blue)"
                                      : "transparent",
                                    color: isActive ? "#05151b" : "var(--text-secondary)",
                                    borderColor: isActive
                                      ? "var(--accent-blue)"
                                      : "var(--border-primary)",
                                    cursor: includedByBundle ? "not-allowed" : "pointer",
                                  }}
                                >
                                  {isActive ? "已選" : "加入"}
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 shrink-0">
                                  <button
                                    onClick={() => updateCounterAddon(item, qty - 1)}
                                    disabled={includedByBundle}
                                    className="w-9 h-9 rounded-full border"
                                    style={{
                                      color: "var(--text-primary)",
                                      borderColor: "var(--border-primary)",
                                      cursor: includedByBundle ? "not-allowed" : "pointer",
                                    }}
                                  >
                                    <i className="fas fa-minus text-xs" />
                                  </button>
                                  <div
                                    className="min-w-12 text-center font-bold"
                                    style={S.heading}
                                  >
                                    {qty}
                                  </div>
                                  <button
                                    onClick={() =>
                                      updateCounterAddon(
                                        item,
                                        qty === 0 && item.minOrder
                                          ? item.minOrder
                                          : qty + 1
                                      )
                                    }
                                    disabled={includedByBundle}
                                    className="w-9 h-9 rounded-full border"
                                    style={{
                                      color: "var(--text-primary)",
                                      borderColor: "var(--border-primary)",
                                      cursor: includedByBundle ? "not-allowed" : "pointer",
                                    }}
                                  >
                                    <i className="fas fa-plus text-xs" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}

                <div className="flex items-center justify-between">
                  <button onClick={goPrev} style={S.btnSecondary}>
                    上一步
                  </button>
                  <button onClick={goNext} style={S.btnPrimary}>
                    下一步
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold mb-1" style={S.heading}>
                    確認需求並複製報價
                  </h2>
                  <p className="text-sm" style={S.sub}>
                    先複製即時報價，再把需求貼到 LINE，付款後才會保留日期。
                  </p>
                </div>

                <div style={S.card} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                        預約人姓名
                      </label>
                      <input
                        value={booking.guestName}
                        onChange={(event) =>
                          setBooking((current) => ({
                            ...current,
                            guestName: event.target.value,
                          }))
                        }
                        style={S.input}
                        placeholder="請填寫姓名"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                        手機號碼
                      </label>
                      <input
                        value={booking.guestPhone}
                        onChange={(event) =>
                          setBooking((current) => ({
                            ...current,
                            guestPhone: event.target.value,
                          }))
                        }
                        style={S.input}
                        placeholder="09xxxxxxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                        預估人數
                      </label>
                      <input
                        type="number"
                        min={venue.capacity.min}
                        max={venue.capacity.max}
                        value={booking.guestCount}
                        onChange={(event) =>
                          setBooking((current) => ({
                            ...current,
                            guestCount: event.target.value,
                          }))
                        }
                        style={S.input}
                        placeholder={`${venue.capacity.min}-${venue.capacity.max} 人`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                        LINE ID（選填）
                      </label>
                      <input
                        value={booking.guestLine}
                        onChange={(event) =>
                          setBooking((current) => ({
                            ...current,
                            guestLine: event.target.value,
                          }))
                        }
                        style={S.input}
                        placeholder="@yourlineid"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      備註
                    </label>
                    <textarea
                      value={booking.guestNote}
                      onChange={(event) =>
                        setBooking((current) => ({
                          ...current,
                          guestNote: event.target.value,
                        }))
                      }
                      style={{ ...S.input, minHeight: "120px", resize: "vertical" }}
                      placeholder="例如活動流程、特殊需求、想看的佈置風格"
                    />
                  </div>
                </div>

                {sent && (
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      backgroundColor: "rgba(6, 199, 85, 0.12)",
                      border: "1px solid rgba(6, 199, 85, 0.35)",
                    }}
                  >
                    <h3 className="font-bold mb-2" style={{ color: "#86efac" }}>
                      已複製報價內容
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "#dcfce7" }}>
                      直接前往 LINE 貼上訊息，就能把報價與需求送給店家確認。
                    </p>
                    <a
                      href={siteConfig.contact.lineUrl}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center px-5 py-3 rounded-full font-bold"
                      style={{ backgroundColor: "#06c755", color: "#fff" }}
                    >
                      <i className="fab fa-line mr-2" />
                      前往 LINE
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button onClick={goPrev} style={S.btnSecondary}>
                    上一步
                  </button>
                  <button
                    onClick={submitToLine}
                    disabled={!canSubmit}
                    style={{
                      ...S.btnPrimary,
                      opacity: canSubmit ? 1 : 0.45,
                      cursor: canSubmit ? "pointer" : "not-allowed",
                    }}
                  >
                    <i className="fas fa-copy mr-2" />
                    複製報價並前往 LINE
                  </button>
                </div>
              </div>
            )}
          </div>

          <SummaryCard
            venue={venue}
            booking={booking}
            scenarios={scenarios}
            selectedBundle={selectedBundle}
            quote={quote}
            quoteLoading={quoteLoading}
            quoteError={quoteError}
          />
        </div>
      </div>
    </div>
  );
}
