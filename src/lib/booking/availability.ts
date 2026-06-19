import { v2VenueConfig } from "@/lib/booking/config";
import type { DayType } from "@/types/v2";

interface IsoDateParts {
  year: number;
  month: number;
  day: number;
}

function parseIsoDate(date: string): IsoDateParts {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid ISO date: ${date}`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function toUtcDate(parts: IsoDateParts): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

export function formatIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: string, days: number): string {
  const base = toUtcDate(parseIsoDate(date));
  base.setUTCDate(base.getUTCDate() + days);
  return formatIsoDate(base);
}

export function getDayType(date: string): DayType {
  const weekday = toUtcDate(parseIsoDate(date)).getUTCDay();
  return weekday === 0 || weekday === 6 ? "weekend" : "weekday";
}

export function isWeekendDate(date: string): boolean {
  return getDayType(date) === "weekend";
}

export function getTodayIso(now = new Date()): string {
  return formatIsoDate(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  );
}

export function getMinimumBookableDate(
  now = new Date(),
  leadDays = v2VenueConfig.leadDays
): string {
  return addDays(getTodayIso(now), leadDays);
}

export function isDateWithinLeadTime(
  date: string,
  now = new Date(),
  leadDays = v2VenueConfig.leadDays
): boolean {
  return date >= getMinimumBookableDate(now, leadDays);
}
