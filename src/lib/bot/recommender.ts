/**
 * Ruins Bar LINE Bot — Smart Recommender
 * Reads plans.json + catalog.json to recommend plans and addons
 */

import fs from "fs";
import path from "path";
import type { SessionSlots } from "./session";

interface Plan {
  id: string; name: string; shortName: string; icon: string; accentColor: string;
  coverImage: string; tagline: string; description: string; highlights: string[];
  priceWeekday: number; priceWeekend: number; priceUnit: string;
  suitableFor: string; duration: string; includes: string[];
  allowedAddons: string[]; slug: string;
}

interface CatalogItem {
  id: string; name: string; unit: string;
  pricePackage: number; priceDirect: number;
  description: string; tags: string[];
}

interface CatalogCategory { id: string; name: string; icon: string; items: CatalogItem[]; }

function loadPlans(): Plan[] {
  const fp = path.join(process.cwd(), "src/data/plans.json");
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

function loadCatalog(): { categories: CatalogCategory[] } {
  const fp = path.join(process.cwd(), "src/data/catalog.json");
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

// Event type → plan ID mapping
const EVENT_PLAN_MAP: Record<string, string[]> = {
  "求婚": ["proposal"],
  "婚禮": ["wedding", "afterparty"],
  "抓周": ["baby"],
  "派對": ["party", "afterparty"],
  "生日": ["party"],
  "會議": ["meeting"],
  "場租": ["venue"],
  "公司": ["meeting", "party"],
};

/**
 * Recommend plans based on user's slots
 */
export function recommendPlans(slots: SessionSlots): Plan[] {
  const allPlans = loadPlans();
  let candidates = allPlans;

  // Filter by event type
  if (slots.eventType) {
    const matched = Object.entries(EVENT_PLAN_MAP)
      .filter(([key]) => slots.eventType!.includes(key))
      .flatMap(([, ids]) => ids);

    if (matched.length > 0) {
      const byType = allPlans.filter((p) => matched.includes(p.id));
      if (byType.length > 0) candidates = byType;
    }
  }

  // Filter by budget
  if (slots.budget && slots.budget > 0) {
    const inBudget = candidates.filter((p) => p.priceWeekday <= slots.budget! * 1.2); // 20% tolerance
    if (inBudget.length > 0) candidates = inBudget;
  }

  // Sort: cheapest first if budget-sensitive, otherwise by relevance
  candidates.sort((a, b) => a.priceWeekday - b.priceWeekday);

  // Return top 3
  return candidates.slice(0, 3);
}

/**
 * Suggest addons for a specific plan
 */
export function suggestAddons(planId: string): { name: string; price: number; unit: string; description: string }[] {
  const plans = loadPlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return [];

  const catalog = loadCatalog();
  const allItems = catalog.categories.flatMap((c) => c.items);

  return plan.allowedAddons
    .filter((id) => !plan.includes.includes(id)) // exclude already-included
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item): item is CatalogItem => !!item)
    .map((item) => ({
      name: item.name,
      price: item.pricePackage,
      unit: item.unit,
      description: item.description,
    }));
}

/**
 * Get plan details by ID
 */
export function getPlan(planId: string): Plan | undefined {
  return loadPlans().find((p) => p.id === planId);
}

/**
 * Calculate total price for a plan + addons selection
 */
export function calculateTotal(
  planId: string,
  addonSelections: Record<string, number>,
  isWeekend: boolean
): { planPrice: number; addonsTotal: number; total: number; breakdown: string[] } {
  const plans = loadPlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return { planPrice: 0, addonsTotal: 0, total: 0, breakdown: [] };

  const catalog = loadCatalog();
  const allItems = catalog.categories.flatMap((c) => c.items);

  const planPrice = isWeekend ? plan.priceWeekend : plan.priceWeekday;
  let addonsTotal = 0;
  const breakdown: string[] = [`${plan.name}: NT$${planPrice.toLocaleString()}`];

  for (const [addonId, qty] of Object.entries(addonSelections)) {
    if (qty <= 0) continue;
    const item = allItems.find((i) => i.id === addonId);
    if (!item) continue;
    const price = item.pricePackage * qty;
    addonsTotal += price;
    breakdown.push(`${item.name} ×${qty}: NT$${price.toLocaleString()}`);
  }

  return { planPrice, addonsTotal, total: planPrice + addonsTotal, breakdown };
}
