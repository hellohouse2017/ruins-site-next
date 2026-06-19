/**
 * Ruins Bar LINE Bot — Smart Recommender
 * Uses v2 scenario / bundle / addon sources instead of legacy plans/catalog JSON.
 */

import { listActiveAddons, listPopularAddons } from "@/lib/addons/repository";
import { v2ScenarioConfigs, v2VenueConfig } from "@/lib/booking/config";
import { quoteBooking } from "@/lib/booking/pricing";
import { listActiveBundles, resolveBundleItems } from "@/lib/bundles/repository";
import { getLegacyPlanBookingHref } from "@/lib/v2/navigation";
import { getScenarioPresentation } from "@/lib/v2/presentation";
import type { SessionSlots } from "./session";
import type { QuoteAddonSelection, ScenarioId } from "@/types/v2";

interface Plan {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  accentColor: string;
  coverImage: string;
  tagline: string;
  description: string;
  highlights: string[];
  priceWeekday: number;
  priceWeekend: number;
  priceUnit: string;
  suitableFor: string;
  duration: string;
  includes: string[];
  allowedAddons: string[];
  slug: string;
}

interface RecommendationOption extends Plan {
  scenarioId: ScenarioId;
  bundleId?: string;
}

const WEEKDAY_SAMPLE = "2026-05-27";
const WEEKEND_SAMPLE = "2026-05-30";

const EVENT_SCENARIO_MAP: Record<string, ScenarioId[]> = {
  求婚: ["proposal"],
  婚禮: ["wedding"],
  抓周: ["family"],
  家庭: ["family"],
  生日: ["party"],
  派對: ["party"],
  尾牙: ["party"],
  會議: ["business"],
  講座: ["business"],
  公司: ["business", "party"],
  場租: ["venue"],
  場地: ["venue"],
};

const SCENARIO_SLUG_MAP: Record<ScenarioId, string> = {
  proposal: "proposal",
  wedding: "wedding",
  party: "party",
  family: "baby",
  business: "meeting",
  venue: "rental",
};

function toAddonSelections(
  addonSelections: Record<string, number>
): QuoteAddonSelection[] {
  return Object.entries(addonSelections)
    .filter(([, qty]) => qty > 0)
    .map(([addonId, qty]) => ({ addonId, qty }));
}

function buildScenarioRecommendation(
  scenarioId: ScenarioId
): RecommendationOption[] {
  const scenario = v2ScenarioConfigs.find((item) => item.id === scenarioId);
  if (!scenario) return [];

  const visual = getScenarioPresentation(scenario.id);
  const bundles = listActiveBundles({ scenarioId: scenario.id });
  const slug = SCENARIO_SLUG_MAP[scenario.id];

  if (bundles.length === 0) {
    const popularAddons = listPopularAddons({ scenarioId: scenario.id, limit: 3 });
    const highlightItems =
      popularAddons.length > 0
        ? popularAddons.map((item) => item.name)
        : v2VenueConfig.baseIncludes.slice(0, 3);

    return [
      {
        id: `scenario:${scenario.id}`,
        scenarioId: scenario.id,
        name: `${scenario.name}場地配置`,
        shortName: scenario.name,
        icon: scenario.icon,
        accentColor: visual.accentColor,
        coverImage: visual.image,
        tagline: scenario.description,
        description: `${scenario.description}，可從場租開始，再逐步加入加購內容。`,
        highlights: highlightItems,
        priceWeekday: v2VenueConfig.weekdayPrice,
        priceWeekend: v2VenueConfig.weekendPrice,
        priceUnit: "起",
        suitableFor: visual.suitableFor,
        duration: `${v2VenueConfig.baseDurationHours} 小時`,
        includes: [],
        allowedAddons: listActiveAddons({ scenarioId: scenario.id }).map(
          (item) => item.id
        ),
        slug,
      },
    ];
  }

  return bundles.map((bundle) => {
    const bundleItems = resolveBundleItems(bundle.id);

    return {
      id: bundle.id,
      scenarioId: scenario.id,
      bundleId: bundle.id,
      name: bundle.name,
      shortName: bundle.name,
      icon: scenario.icon,
      accentColor: visual.accentColor,
      coverImage: visual.image,
      tagline: bundle.summary,
      description: `${scenario.description}，推薦從「${bundle.name}」開始，再依需要微調。`,
      highlights: bundleItems.map((item) => item.addon.name).slice(0, 4),
      priceWeekday: v2VenueConfig.weekdayPrice + bundle.bundlePrice,
      priceWeekend: v2VenueConfig.weekendPrice + bundle.bundlePrice,
      priceUnit: "起",
      suitableFor: visual.suitableFor,
      duration: `${v2VenueConfig.baseDurationHours} 小時`,
      includes: bundleItems.map((item) => item.addon.id),
      allowedAddons: listActiveAddons({ scenarioId: scenario.id }).map(
        (item) => item.id
      ),
      slug,
    };
  });
}

function loadRecommendations(): RecommendationOption[] {
  return v2ScenarioConfigs.flatMap((scenario) =>
    buildScenarioRecommendation(scenario.id)
  );
}

function getMatchedScenarios(eventType?: string): ScenarioId[] {
  if (!eventType) return [];

  const matched = Object.entries(EVENT_SCENARIO_MAP)
    .filter(([keyword]) => eventType.includes(keyword))
    .flatMap(([, scenarioIds]) => scenarioIds);

  return [...new Set(matched)];
}

export function recommendPlans(slots: SessionSlots): Plan[] {
  const allRecommendations = loadRecommendations();
  let candidates = allRecommendations;
  const matchedScenarios = getMatchedScenarios(slots.eventType);

  if (matchedScenarios.length > 0) {
    const byScenario = allRecommendations.filter((item) =>
      matchedScenarios.includes(item.scenarioId)
    );
    if (byScenario.length > 0) {
      candidates = byScenario;
    }
  }

  if (slots.budget && slots.budget > 0) {
    const budgetMax = slots.budget * 1.2;
    const inBudget = candidates.filter((item) => item.priceWeekday <= budgetMax);

    if (inBudget.length > 0) {
      candidates = inBudget;
    } else {
      candidates = [...candidates].sort(
        (a, b) => a.priceWeekday - b.priceWeekday
      );
    }

    candidates.sort((a, b) => {
      const distA = Math.abs(a.priceWeekday - slots.budget!);
      const distB = Math.abs(b.priceWeekday - slots.budget!);
      return distA - distB;
    });
  } else {
    candidates = [...candidates].sort((a, b) => a.priceWeekday - b.priceWeekday);
  }

  return candidates.slice(0, 3);
}

export function suggestAddons(planId: string): {
  name: string;
  price: number;
  unit: string;
  description: string;
}[] {
  const plan = getPlan(planId);
  if (!plan) return [];

  const candidates =
    listPopularAddons({ scenarioId: plan.scenarioId, limit: 6 }).length > 0
      ? listPopularAddons({ scenarioId: plan.scenarioId, limit: 6 })
      : listActiveAddons({ scenarioId: plan.scenarioId });

  return candidates
    .filter((item) => !plan.includes.includes(item.id))
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      price: item.priceWeekday,
      unit: item.unit,
      description: item.description,
    }));
}

export function getPlan(planId: string): RecommendationOption | undefined {
  return loadRecommendations().find((item) => item.id === planId);
}

export function calculateTotal(
  planId: string,
  addonSelections: Record<string, number>,
  isWeekend: boolean
): { planPrice: number; addonsTotal: number; total: number; breakdown: string[] } {
  const plan = getPlan(planId);
  if (!plan) {
    return { planPrice: 0, addonsTotal: 0, total: 0, breakdown: [] };
  }

  const quote = quoteBooking({
    date: isWeekend ? WEEKEND_SAMPLE : WEEKDAY_SAMPLE,
    bundleId: plan.bundleId,
    addonSelections: toAddonSelections(addonSelections),
  });

  const breakdown = [
    `${v2VenueConfig.name}: NT$${quote.baseAmount.toLocaleString()}`,
    ...quote.lines.map(
      (line) => `${line.name}${line.qty > 1 ? ` ×${line.qty}` : ""}: NT$${line.subtotal.toLocaleString()}`
    ),
  ];

  if (quote.bundleDiscountAmount > 0) {
    breakdown.push(`組合折扣: -NT$${quote.bundleDiscountAmount.toLocaleString()}`);
  }

  return {
    planPrice: quote.baseAmount,
    addonsTotal: quote.addonsAmount,
    total: quote.totalAmount,
    breakdown,
  };
}

export function getPlanDetailUrl(planId: string): string {
  const plan = getPlan(planId);
  if (!plan) return "/book";
  return getLegacyPlanBookingHref(plan.slug);
}
