"use client";

import { useState, useEffect, useCallback } from "react";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
  minLeadDays?: number;
}

interface BusyDate {
  date: string;
  summary?: string;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CalendarPicker({ value, onChange, minLeadDays = 0 }: CalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today.getTime() + minLeadDays * 86400000);
  const [viewYear, setViewYear] = useState(minDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(minDate.getMonth());
  const [busyDates, setBusyDates] = useState<BusyDate[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch busy dates from our own Next.js API route
  const fetchBusyDates = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
      const res = await fetch(`/api/calendar?month=${monthStr}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.events)) {
        setBusyDates(data.events);
      } else {
        setBusyDates([]);
      }
    } catch {
      setBusyDates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusyDates(viewYear, viewMonth);
  }, [viewYear, viewMonth, fetchBusyDates]);

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };
  const goPrevMonth = () => {
    if (viewYear === today.getFullYear() && viewMonth <= today.getMonth()) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const isBusy = (dateStr: string) => busyDates.some((b) => b.date === dateStr);
  const getBusyLabel = (dateStr: string) => busyDates.find((b) => b.date === dateStr)?.summary;

  const monthLabel = `${viewYear} 年 ${viewMonth + 1} 月`;
  const canGoPrev = !(viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", boxShadow: "var(--card-shadow)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
        <button onClick={goPrevMonth} disabled={!canGoPrev}
          className="w-8 h-8 rounded-full flex items-center justify-center transition disabled:opacity-20"
          style={{ color: "var(--text-muted)" }}
        ><i className="fas fa-chevron-left text-sm" /></button>
        <div className="text-center">
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{monthLabel}</span>
          {loading && <span className="text-xs ml-2" style={{ color: "var(--accent-blue)" }}><i className="fas fa-spinner fa-spin" /></span>}
        </div>
        <button onClick={goNextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center transition"
          style={{ color: "var(--text-muted)" }}
        ><i className="fas fa-chevron-right text-sm" /></button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={w} className="text-center py-2 text-xs font-bold" style={{ color: i === 0 || i === 6 ? "var(--accent-pink)" : "var(--text-muted)" }}>{w}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-0 pb-2">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="h-10" />;
          const dateObj = new Date(viewYear, viewMonth, day);
          const dateStr = toDateStr(dateObj);
          const isPast = dateObj < minDate;
          const busy = isBusy(dateStr);
          const isSelected = value === dateStr;
          const isToday = dateStr === toDateStr(today);
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          const disabled = isPast || busy;
          const busyLabel = getBusyLabel(dateStr);

          return (
            <div key={dateStr} className="flex justify-center py-0.5">
              <button onClick={() => { if (!disabled) onChange(dateStr); }} disabled={disabled}
                title={busy ? `已預約：${busyLabel}` : isPast ? "已過期" : ""}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all"
                style={{
                  backgroundColor: isSelected ? "var(--accent-pink)" : "transparent",
                  color: isSelected ? "#fff" : busy ? "var(--text-faint)" : isPast ? "var(--text-faint)" : isWeekend ? "var(--accent-pink)" : "var(--text-primary)",
                  fontWeight: isSelected || isToday ? "bold" : "normal",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: isPast ? 0.3 : busy ? 0.5 : 1,
                  textDecoration: busy ? "line-through" : "none",
                }}
              >
                {day}
                {isToday && !isSelected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: "var(--accent-blue)" }} />}
                {busy && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-2 text-xs" style={{ borderTop: "1px solid var(--border-primary)", color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#ef4444" }} /> 已預約</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "var(--accent-blue)" }} /> 今日</span>
        <span className="flex items-center gap-1"><span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-xs text-white" style={{ backgroundColor: "var(--accent-pink)" }}>✓</span> 已選</span>
      </div>
    </div>
  );
}
