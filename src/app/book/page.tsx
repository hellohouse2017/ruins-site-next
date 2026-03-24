"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { CalendarPicker } from "@/components/CalendarPicker";
import plans from "@/data/plans.json";
import addonsData from "@/data/addons.json";
import siteConfig from "@/data/site-config.json";

/* ─── Types ─── */
interface AddonSelection { [id: string]: number; }
interface BookingState {
  planId: string; date: string;
  slotMode: "lunch" | "dinner" | "allday" | "custom";
  customStart: string; customEnd: string;
  addons: AddonSelection;
  guestName: string; guestPhone: string; guestNote: string;
}

const SLOT_OPTIONS = [
  { id: "lunch" as const, label: "午場", time: "11:00 - 14:00", icon: "fa-sun", desc: "適合抓周、家庭聚會" },
  { id: "dinner" as const, label: "晚場", time: "17:00 - 20:00", icon: "fa-moon", desc: "適合派對、婚禮" },
  { id: "allday" as const, label: "全日包場", time: "09:00 - 21:00", icon: "fa-calendar-day", desc: "佈置+活動一整天" },
  { id: "custom" as const, label: "自訂時段", time: "彈性安排", icon: "fa-sliders-h", desc: "依需求自由安排" },
];

const STEPS = [
  { id: 1, label: "選擇方案", icon: "fa-clipboard-list" },
  { id: 2, label: "日期時段", icon: "fa-calendar-alt" },
  { id: 3, label: "加購服務", icon: "fa-cart-plus" },
  { id: 4, label: "確認送出", icon: "fa-paper-plane" },
];

const initialState: BookingState = {
  planId: "", date: "", slotMode: "dinner", customStart: "", customEnd: "",
  addons: {}, guestName: "", guestPhone: "", guestNote: "",
};

/* ─── Plan categories for better UX ─── */
const PLAN_CATEGORIES = [
  {
    title: "🎉 慶典活動",
    desc: "人生重要時刻",
    plans: ["proposal", "wedding_afterparty", "wedding_ceremony", "baby"],
  },
  {
    title: "🎈 社交派對",
    desc: "歡聚時光",
    plans: ["party"],
  },
  {
    title: "🏢 場地租借",
    desc: "空間自由運用",
    plans: ["rental", "meeting", "custom"],
  },
];

/* ─── Shared inline styles ─── */
const S = {
  heading: { color: "var(--text-primary)" } as React.CSSProperties,
  sub: { color: "var(--text-muted)" } as React.CSSProperties,
  card: { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", boxShadow: "var(--card-shadow)", borderRadius: "1rem" } as React.CSSProperties,
  input: { width: "100%", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "0.5rem", padding: "0.75rem 1rem", color: "var(--text-primary)", outline: "none" } as React.CSSProperties,
  btnPrimary: { backgroundColor: "var(--accent-pink)", color: "#fff", fontWeight: "bold", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", transition: "all 0.3s" } as React.CSSProperties,
  btnSecondary: { backgroundColor: "transparent", color: "var(--text-muted)", fontWeight: "500", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", border: "1px solid var(--border-primary)", cursor: "pointer", transition: "all 0.3s" } as React.CSSProperties,
};

/* ─────────── Wizard Inner ─────────── */
function BookingWizardInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingState>(initialState);
  const [isWeekend, setIsWeekend] = useState(false);
  const [availability, setAvailability] = useState<null | { available: boolean; recommendations?: Array<{ date: string; start: string; end: string; label: string }> }>(null);
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam) { setBooking((b) => ({ ...b, planId: planParam })); setStep(2); }
  }, [searchParams]);

  const selectedPlan = plans.find((p) => p.id === booking.planId);

  useEffect(() => { if (booking.date) { const d = new Date(booking.date); setIsWeekend(d.getDay() === 0 || d.getDay() === 6); } }, [booking.date]);

  const minDate = selectedPlan
    ? new Date(Date.now() + selectedPlan.leadDays * 86400000).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const getTimeText = useCallback(() => {
    const slot = SLOT_OPTIONS.find((s) => s.id === booking.slotMode);
    if (booking.slotMode === "custom") return `自訂 (${booking.customStart}-${booking.customEnd})`;
    return slot?.time || "";
  }, [booking.slotMode, booking.customStart, booking.customEnd]);

  const getTimeRange = useCallback(() => {
    if (booking.slotMode === "lunch") return { start: "11:00", end: "14:00" };
    if (booking.slotMode === "dinner") return { start: "17:00", end: "20:00" };
    if (booking.slotMode === "allday") return { start: "09:00", end: "21:00" };
    return { start: booking.customStart, end: booking.customEnd };
  }, [booking.slotMode, booking.customStart, booking.customEnd]);

  const checkAvailability = async () => {
    if (!booking.date) return;
    setChecking(true);
    const { start, end } = getTimeRange();
    try {
      const res = await fetch(`${siteConfig.api.gasUrl}?date=${booking.date}&start=${start}&end=${end}`);
      const data = await res.json();
      setAvailability(data);
      if (data.available) setStep(3);
    } catch { alert("查詢連線失敗，請稍後再試。"); }
    finally { setChecking(false); }
  };

  const calcPrice = useCallback(() => {
    if (!selectedPlan) return { base: 0, addonsTotal: 0, total: 0 };
    const base = isWeekend ? selectedPlan.priceWeekend : selectedPlan.priceWeekday;
    let addonsTotal = 0;
    for (const cat of addonsData.categories) {
      for (const item of cat.items) {
        const qty = booking.addons[item.id] || 0;
        if (qty > 0) {
          const price = isWeekend ? item.priceWeekend : item.priceWeekday;
          addonsTotal += price * qty;
        }
      }
    }
    return { base, addonsTotal, total: base > 0 ? base + addonsTotal : 0 };
  }, [selectedPlan, isWeekend, booking.addons]);

  const prices = calcPrice();

  const allowedAddons = selectedPlan
    ? addonsData.categories.map((cat) => ({ ...cat, items: cat.items.filter((item) => selectedPlan.allowedAddons.includes(item.id)) })).filter((cat) => cat.items.length > 0)
    : [];
  const includedAddonIds = selectedPlan?.includes || [];

  const sendBooking = async () => {
    if (!booking.guestName.trim()) { alert("❌ 請填寫「預約人姓名」"); return; }
    if (!/^09\d{8}$/.test(booking.guestPhone)) { alert("❌ 請填寫正確的「台灣手機號碼」"); return; }
    setSending(true);
    const { start } = getTimeRange();
    const extraHours = booking.addons["time_plus"] || 0;
    const baseDuration = booking.slotMode === "allday" ? 12 : 3;
    const totalDuration = baseDuration + extraHours;
    const [sh, sm] = start.split(":").map(Number);
    let totalMin = sh * 60 + sm + totalDuration * 60;
    let eh = Math.floor(totalMin / 60);
    const em = totalMin % 60;
    if (eh >= 24) eh -= 24;
    const endTime = `${eh < 10 ? "0" + eh : eh}:${em === 0 ? "00" : em}`;

    let msg = `您好！我想預約 RUINS BAR 廢墟場地 🥂\n\n`;
    msg += `👤 姓名：${booking.guestName}\n📱 電話：${booking.guestPhone}\n------------------------\n`;
    msg += `📅 日期：${booking.date} ${isWeekend ? "(假日)" : "(平日)"}\n⏰ 時段：${start} - ${endTime}\n📋 方案：${selectedPlan?.name}\n`;
    if (includedAddonIds.length > 0) { msg += `\n✅ 內含項目：\n`; for (const id of includedAddonIds) { const opt = addonsData.categories.flatMap((c) => c.items).find((i) => i.id === id); if (opt) msg += `- ${opt.name}\n`; } }
    msg += `\n➕ 加購/升級：\n`;
    let hasAddons = false;
    for (const cat of addonsData.categories) { for (const item of cat.items) { const qty = booking.addons[item.id] || 0; if (qty > 0) { hasAddons = true; msg += `- ${item.name}${item.type === "counter" ? ` x ${qty}${item.unit}` : ""}\n`; } } }
    if (!hasAddons) msg += `無\n`;
    if (prices.total > 0) msg += `\n💰 預估總價：NT$ ${prices.total.toLocaleString()}\n`;
    else msg += `\n💰 預估總價：待專人報價\n`;
    if (booking.guestNote) msg += `\n📝 備註：${booking.guestNote}\n`;
    msg += `\n請協助確認檔期與最終報價，謝謝！`;
    try { await navigator.clipboard.writeText(msg); setSent(true); }
    catch { const ta = document.createElement("textarea"); ta.value = msg; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); setSent(true); }
    setSending(false);
  };

  const goNext = () => setStep((s) => Math.min(s + 1, 4));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));
  const selectPlan = (id: string) => { setBooking((b) => ({ ...b, planId: id })); setStep(2); };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen pt-20 pb-32" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ ...S.heading, fontFamily: "var(--font-display)" }}>預約場地</h1>
          <p className="text-sm" style={S.sub}>依步驟完成預約，快速簡單</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-10 px-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button onClick={() => s.id < step && setStep(s.id)} className="flex flex-col items-center gap-1" disabled={s.id > step}>
                <div className={`wizard-step-circle ${step === s.id ? "active" : step > s.id ? "completed" : "inactive"}`}>
                  {step > s.id ? <i className="fas fa-check text-xs" /> : s.id}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: step >= s.id ? "var(--text-primary)" : "var(--text-muted)" }}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`wizard-connector mx-2 ${step > s.id ? "completed" : "inactive"}`} />}
            </div>
          ))}
        </div>

        {/* ═══ Step 1: Categorized Plan Selection ═══ */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-1" style={S.heading}>你想辦什麼活動？</h2>
              <p className="text-sm" style={S.sub}>選擇最接近你需求的方案，後續可加購客製</p>
            </div>

            {PLAN_CATEGORIES.map((cat) => (
              <div key={cat.title} className="mb-8">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={S.heading}>
                  {cat.title} <span className="font-normal text-xs" style={S.sub}>— {cat.desc}</span>
                </h3>
                <div className="space-y-3">
                  {cat.plans.map((pid) => {
                    const plan = plans.find((p) => p.id === pid);
                    if (!plan) return null;
                    const isSelected = booking.planId === plan.id;
                    return (
                      <button
                        key={plan.id}
                        onClick={() => selectPlan(plan.id)}
                        className="w-full text-left rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 group"
                        style={{ ...S.card, borderColor: isSelected ? "var(--accent-blue)" : "var(--border-primary)" }}
                      >
                        <div className="flex gap-0">
                          {/* Image thumbnail */}
                          <div className="relative w-24 sm:w-32 shrink-0">
                            <Image src={plan.coverImage} alt={plan.shortName} fill className="object-cover" sizes="128px" />
                          </div>
                          {/* Content */}
                          <div className="flex-1 p-4 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <i className={plan.icon} style={{ color: plan.accentColor, fontSize: "14px" }} />
                                  <h4 className="font-bold text-sm truncate" style={S.heading}>{plan.name}</h4>
                                </div>
                                <p className="text-xs line-clamp-1 mb-2" style={S.sub}>{plan.tagline}</p>
                                <div className="flex flex-wrap gap-2 text-xs" style={S.sub}>
                                  <span><i className="fas fa-users mr-1" />{plan.suitableFor}</span>
                                  <span><i className="fas fa-clock mr-1" />{plan.duration}</span>
                                </div>
                              </div>
                              {/* Price */}
                              <div className="text-right shrink-0">
                                {plan.priceWeekday > 0 ? (
                                  <>
                                    <div className="font-bold text-sm" style={{ color: plan.accentColor }}>
                                      NT${plan.priceWeekday.toLocaleString()}
                                    </div>
                                    <div className="text-xs" style={S.sub}>{plan.priceUnit || "起"}</div>
                                  </>
                                ) : (
                                  <div className="font-bold text-sm" style={{ color: plan.accentColor }}>洽詢報價</div>
                                )}
                              </div>
                            </div>
                            {/* Highlights preview */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {plan.highlights.slice(0, 3).map((h, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                  {h.length > 8 ? h.slice(0, 8) + "…" : h}
                                </span>
                              ))}
                              {plan.highlights.length > 3 && (
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-faint)" }}>
                                  +{plan.highlights.length - 3} 項
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="flex items-center pr-4 shrink-0">
                            <i className="fas fa-chevron-right text-sm group-hover:translate-x-1 transition-transform" style={S.sub} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <p className="text-center text-xs mt-4" style={S.sub}>
              <i className="fas fa-info-circle mr-1" />
              不確定選哪個？直接 <a href={siteConfig.contact.lineUrl} target="_blank" rel="noopener" className="underline" style={{ color: "var(--accent-blue)" }}>LINE 諮詢</a> 讓我們幫你推薦
            </p>
          </div>
        )}

        {/* ═══ Step 2: Date & Time ═══ */}
        {step === 2 && selectedPlan && (
          <div className="animate-fade-in">
            {/* Selected plan summary */}
            <div className="flex items-center gap-3 p-4 rounded-xl mb-6" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <Image src={selectedPlan.coverImage} alt="" fill className="object-cover" sizes="48px" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate" style={S.heading}>{selectedPlan.name}</h3>
                <p className="text-xs" style={S.sub}>{selectedPlan.suitableFor} · {selectedPlan.duration}</p>
              </div>
              <button onClick={() => setStep(1)} className="text-xs underline shrink-0" style={{ color: "var(--accent-blue)" }}>
                更換方案
              </button>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-1" style={S.heading}>選擇日期與時段</h2>
              {selectedPlan.leadDays > 0 && <p className="text-xs" style={{ color: "var(--accent-pink)" }}>⚠ 此方案需提前 {selectedPlan.leadDays} 天預約</p>}
            </div>

            {/* Date — Calendar Picker */}
            <div className="mb-4">
              <label className="block text-sm font-bold mb-3" style={S.heading}>
                <i className="fas fa-calendar-alt mr-2" style={{ color: "var(--accent-blue)" }} />選擇活動日期
                <span className="font-normal text-xs ml-2" style={S.sub}>（紅點 = 已預約）</span>
              </label>
              <CalendarPicker
                value={booking.date}
                onChange={(d) => { setBooking((b) => ({ ...b, date: d })); setAvailability(null); }}
                minLeadDays={selectedPlan.leadDays}
              />
              {booking.date && (
                <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={S.heading}>{booking.date}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{
                        backgroundColor: isWeekend ? "rgba(217,119,6,0.15)" : "rgba(16,185,129,0.15)",
                        color: isWeekend ? "#b45309" : "#15803d",
                        border: isWeekend ? "1px solid rgba(217,119,6,0.3)" : "1px solid rgba(16,185,129,0.3)",
                      }}>{isWeekend ? "假日" : "平日"}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--accent-gold)" }}>
                      {selectedPlan.priceWeekday > 0
                        ? `NT$${(isWeekend ? selectedPlan.priceWeekend : selectedPlan.priceWeekday).toLocaleString()}`
                        : "待報價"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Time Slot */}
            <div className="p-6 mb-4 rounded-2xl" style={S.card}>
              <label className="block text-sm font-bold mb-3" style={S.heading}>
                <i className="fas fa-clock mr-2" style={{ color: "var(--accent-blue)" }} />活動時段
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SLOT_OPTIONS.map((slot) => (
                  <button key={slot.id} onClick={() => setBooking((b) => ({ ...b, slotMode: slot.id }))}
                    className="rounded-xl p-4 text-left transition-all"
                    style={{
                      border: booking.slotMode === slot.id ? "2px solid var(--accent-blue)" : "1px solid var(--border-primary)",
                      backgroundColor: booking.slotMode === slot.id ? "var(--accent-blue)" : "var(--bg-secondary)",
                      color: booking.slotMode === slot.id ? "#fff" : "var(--text-secondary)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <i className={`fas ${slot.icon}`} />
                      <span className="text-sm font-bold">{slot.label}</span>
                    </div>
                    <span className="text-xs block" style={{ opacity: 0.7 }}>{slot.time}</span>
                    <span className="text-xs block mt-0.5" style={{ opacity: 0.6 }}>{slot.desc}</span>
                  </button>
                ))}
              </div>
              {booking.slotMode === "custom" && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div><label className="text-xs mb-1 block" style={S.sub}>開始時間</label><input type="time" value={booking.customStart} onChange={(e) => setBooking((b) => ({ ...b, customStart: e.target.value }))} style={S.input} /></div>
                  <div><label className="text-xs mb-1 block" style={S.sub}>結束時間</label><input type="time" value={booking.customEnd} onChange={(e) => setBooking((b) => ({ ...b, customEnd: e.target.value }))} style={S.input} /></div>
                </div>
              )}
            </div>

            <button onClick={checkAvailability}
              disabled={!booking.date || checking || (booking.slotMode === "custom" && (!booking.customStart || !booking.customEnd))}
              className="w-full flex items-center justify-center disabled:opacity-50"
              style={S.btnPrimary}
            >
              {checking ? <><i className="fas fa-spinner fa-spin mr-2" /> 查詢檔期中...</> : <><i className="fas fa-search mr-2" /> 查詢檔期並繼續</>}
            </button>

            {availability && !availability.available && availability.recommendations && (
              <div className="p-5 mt-4 rounded-2xl" style={S.card}>
                <h3 className="font-bold text-sm mb-3" style={{ color: "#b45309" }}>
                  <i className="fas fa-exclamation-triangle mr-2" />該時段已被預約
                </h3>
                <div className="space-y-2">
                  {availability.recommendations.map((rec, i) => (
                    <button key={i} onClick={() => { setBooking((b) => ({ ...b, date: rec.date })); setAvailability(null); }}
                      className="w-full flex items-center justify-between p-3 rounded-lg transition-all"
                      style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
                    >
                      <div><span className="text-xs px-2 py-0.5 rounded mr-2" style={{ backgroundColor: "var(--border-primary)", color: "var(--text-muted)" }}>{rec.label}</span><span className="text-sm font-bold" style={S.heading}>{rec.date}</span></div>
                      <i className="fas fa-chevron-right" style={S.sub} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={goPrev} className="w-full mt-3 flex items-center justify-center" style={S.btnSecondary}><i className="fas fa-arrow-left mr-2" /> 更換方案</button>
          </div>
        )}

        {/* ═══ Step 3: Add-ons ═══ */}
        {step === 3 && selectedPlan && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-1" style={S.heading}>加購服務</h2>
              <p className="text-sm" style={S.sub}>可跳過，讓活動更完美</p>
            </div>

            {includedAddonIds.length > 0 && (
              <div className="p-5 mb-4 rounded-2xl" style={S.card}>
                <h3 className="text-sm font-bold mb-3" style={{ color: "#15803d" }}><i className="fas fa-check-circle mr-2" />方案已內含</h3>
                <div className="space-y-2">
                  {includedAddonIds.map((id) => { const item = addonsData.categories.flatMap((c) => c.items).find((i) => i.id === id); return item ? (<div key={id} className="flex items-center justify-between py-1.5"><span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.name}</span><span className="badge-included">已內含</span></div>) : null; })}
                </div>
              </div>
            )}

            {allowedAddons.map((cat) => (
              <div key={cat.id} className="p-5 mb-4 rounded-2xl" style={S.card}>
                <h3 className="text-sm font-bold mb-3" style={S.heading}>{cat.icon} {cat.name}</h3>
                <div className="space-y-3">
                  {cat.items.map((item) => {
                    if (includedAddonIds.includes(item.id)) return null;
                    const qty = booking.addons[item.id] || 0;
                    const price = isWeekend ? item.priceWeekend : item.priceWeekday;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg transition-all"
                        style={{ border: qty > 0 ? "1px solid var(--accent-blue)" : "1px solid var(--border-primary)", backgroundColor: qty > 0 ? "var(--bg-card-hover)" : "transparent" }}
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{item.name}</div>
                          <div className="text-xs" style={S.sub}>{item.description}</div>
                          <div className="text-xs mt-0.5 font-medium" style={{ color: "var(--accent-gold)" }}>NT${price.toLocaleString()}/{item.unit}</div>
                        </div>
                        {item.type === "counter" ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => setBooking((b) => ({ ...b, addons: { ...b.addons, [item.id]: Math.max(0, qty - 1) } }))}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                              style={{ border: "1px solid var(--border-primary)", color: "var(--text-muted)" }}><i className="fas fa-minus text-xs" /></button>
                            <span className="w-6 text-center text-sm font-bold" style={S.heading}>{qty}</span>
                            <button onClick={() => setBooking((b) => ({ ...b, addons: { ...b.addons, [item.id]: Math.min((item as Record<string, unknown>).max as number || 99, qty + 1) } }))}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                              style={{ border: "1px solid var(--border-primary)", color: "var(--text-muted)" }}><i className="fas fa-plus text-xs" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setBooking((b) => ({ ...b, addons: { ...b.addons, [item.id]: qty > 0 ? 0 : 1 } }))}
                            className="w-12 h-7 rounded-full transition-all relative shrink-0"
                            style={{ backgroundColor: qty > 0 ? "var(--accent-blue)" : "var(--border-primary)" }}
                          ><div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${qty > 0 ? "left-[22px]" : "left-0.5"}`} /></button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {allowedAddons.length === 0 && (
              <div className="text-center py-8 rounded-2xl mb-4" style={S.card}>
                <i className="fas fa-info-circle text-2xl mb-2" style={S.sub} />
                <p className="text-sm" style={S.sub}>此方案目前不支援加購服務，請直接進入下一步</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={goPrev} className="flex-1 flex items-center justify-center" style={S.btnSecondary}><i className="fas fa-arrow-left mr-2" /> 上一步</button>
              <button onClick={goNext} className="flex-1 flex items-center justify-center" style={S.btnPrimary}>下一步 <i className="fas fa-arrow-right ml-2" /></button>
            </div>
          </div>
        )}

        {/* ═══ Step 4: Confirm ═══ */}
        {step === 4 && selectedPlan && !sent && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-1" style={S.heading}>確認預約資訊</h2>
              <p className="text-sm" style={S.sub}>填寫聯絡方式後送出</p>
            </div>

            <div className="p-6 mb-4 rounded-2xl" style={S.card}>
              <h3 className="font-bold mb-4" style={S.heading}>預約摘要</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span style={S.sub}>方案</span><span className="font-medium" style={S.heading}>{selectedPlan.name}</span></div>
                <div className="flex justify-between"><span style={S.sub}>日期</span><span style={S.heading}>{booking.date} {isWeekend ? "(假日)" : "(平日)"}</span></div>
                <div className="flex justify-between"><span style={S.sub}>時段</span><span style={S.heading}>{getTimeText()}</span></div>
                <div style={{ borderTop: "1px solid var(--border-primary)", margin: "0.5rem 0" }} />
                <div className="flex justify-between"><span style={S.sub}>方案費用</span><span className="font-medium" style={{ color: "var(--accent-gold)" }}>{prices.base > 0 ? `NT$ ${prices.base.toLocaleString()}` : "依報價"}</span></div>
                {prices.addonsTotal > 0 && <div className="flex justify-between"><span style={S.sub}>加購</span><span style={{ color: "var(--accent-gold)" }}>+NT$ {prices.addonsTotal.toLocaleString()}</span></div>}
                <div style={{ borderTop: "1px solid var(--border-primary)", margin: "0.5rem 0" }} />
                <div className="flex justify-between text-lg"><span className="font-bold" style={S.heading}>預估總價</span><span className="font-bold text-xl" style={{ color: "var(--accent-pink)" }}>{prices.total > 0 ? `NT$ ${prices.total.toLocaleString()}` : "待報價"}</span></div>
              </div>
            </div>

            <div className="p-6 mb-4 rounded-2xl" style={S.card}>
              <h3 className="font-bold mb-4" style={S.heading}>聯絡資訊</h3>
              <div className="space-y-4">
                <div><label className="text-xs mb-1 block" style={S.sub}>預約人姓名 <span style={{ color: "var(--accent-pink)" }}>*</span></label><input type="text" placeholder="請輸入姓名" value={booking.guestName} onChange={(e) => setBooking((b) => ({ ...b, guestName: e.target.value }))} style={S.input} /></div>
                <div><label className="text-xs mb-1 block" style={S.sub}>手機號碼 <span style={{ color: "var(--accent-pink)" }}>*</span></label><input type="tel" placeholder="09xxxxxxxx" value={booking.guestPhone} onChange={(e) => setBooking((b) => ({ ...b, guestPhone: e.target.value }))} style={S.input} /></div>
                <div><label className="text-xs mb-1 block" style={S.sub}>備註（選填）</label><textarea placeholder="特殊需求或其他說明..." value={booking.guestNote} onChange={(e) => setBooking((b) => ({ ...b, guestNote: e.target.value }))} rows={3} style={{ ...S.input, resize: "none" as const }} /></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={goPrev} className="flex-1 flex items-center justify-center" style={S.btnSecondary}><i className="fas fa-arrow-left mr-2" /> 上一步</button>
              <button onClick={sendBooking} disabled={sending} className="flex-1 flex items-center justify-center disabled:opacity-50" style={S.btnPrimary}>
                {sending ? <><i className="fas fa-spinner fa-spin mr-2" /> 處理中...</> : <><i className="fas fa-copy mr-2" /> 複製並前往 LINE</>}
              </button>
            </div>
          </div>
        )}

        {/* ═══ Success ═══ */}
        {sent && (
          <div className="animate-fade-in text-center py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <i className="fas fa-check text-3xl" style={{ color: "#15803d" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={S.heading}>預約單已複製！</h2>
            <p className="mb-8" style={S.sub}>請前往 LINE 貼上預約單即可</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={siteConfig.contact.lineUrl} target="_blank" rel="noopener" className="inline-flex items-center" style={{ ...S.btnPrimary, backgroundColor: "#06c755", display: "inline-flex" }}>
                <i className="fab fa-line mr-2" /> 前往 LINE 傳送
              </a>
              <button onClick={() => { setSent(false); setStep(1); setBooking(initialState); }} style={S.btnSecondary}>重新預約</button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Sticky Summary ─── */}
      {step >= 2 && selectedPlan && !sent && (
        <div className="fixed bottom-0 left-0 right-0 z-50" style={{ backgroundColor: "var(--nav-bg)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--border-primary)" }}>
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium truncate max-w-[120px]" style={S.heading}>{selectedPlan.shortName}</span>
              {booking.date && <span className="hidden sm:inline" style={S.sub}><i className="fas fa-calendar-alt mr-1" />{booking.date}</span>}
            </div>
            <div className="text-right">
              <div className="text-xs" style={S.sub}>預估總價</div>
              <div className="font-bold" style={{ color: "var(--accent-gold)" }}>{prices.total > 0 ? `NT$ ${prices.total.toLocaleString()}` : "待報價"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><i className="fas fa-spinner fa-spin text-3xl" style={{ color: "var(--accent-blue)" }} /></div>}>
      <BookingWizardInner />
    </Suspense>
  );
}
