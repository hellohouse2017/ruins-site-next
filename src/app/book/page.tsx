import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlowV2, type BookingBundleView, type BookingScenarioView } from "@/components/BookingFlowV2";
import { listAddonCategories } from "@/lib/addons/repository";
import { v2ScenarioConfigs, v2VenueConfig } from "@/lib/booking/config";
import { listActiveBundles, resolveBundleItems } from "@/lib/bundles/repository";
import { getScenarioPresentation } from "@/lib/v2/presentation";
import type { AddonCategoryConfig, ScenarioId } from "@/types/v2";

export const metadata: Metadata = {
  title: "詢問檔期｜Ruins Bar 高雄鹽埕包場場地",
  description:
    "先填日期、人數、活動類型與需求，Ruins Bar 會幫你確認可預約時段、推薦組合與預估總價。",
};

const scenarios: BookingScenarioView[] = v2ScenarioConfigs.map((scenario) => ({
  ...scenario,
  ...getScenarioPresentation(scenario.id),
}));

const bundlesByScenario = Object.fromEntries(
  v2ScenarioConfigs.map((scenario) => [
    scenario.id,
    listActiveBundles({ scenarioId: scenario.id }).map(
      (bundle): BookingBundleView => ({
        id: bundle.id,
        scenarioId: bundle.scenarioId,
        name: bundle.name,
        badge: bundle.badge,
        summary: bundle.summary,
        listPrice: bundle.listPrice,
        bundlePrice: bundle.bundlePrice,
        savings: bundle.savings,
        itemNames: resolveBundleItems(bundle.id).map((item) => item.addon.name),
        itemIds: resolveBundleItems(bundle.id).map((item) => item.addon.id),
      })
    ),
  ])
) as Record<ScenarioId, BookingBundleView[]>;

const addonCategoriesByScenario = Object.fromEntries(
  v2ScenarioConfigs.map((scenario) => [
    scenario.id,
    listAddonCategories({ scenarioId: scenario.id }),
  ])
) as Record<ScenarioId, AddonCategoryConfig[]>;

function BookingFallback() {
  return (
    <div
      className="min-h-screen pt-20 pb-24 px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div
        className="max-w-4xl mx-auto rounded-2xl p-8 text-center border"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-primary)",
          boxShadow: "var(--card-shadow)",
          color: "var(--text-muted)",
        }}
      >
        <i className="fas fa-spinner fa-spin mr-2" />
        載入預約配置中
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingFallback />}>
      <BookingFlowV2
        venue={v2VenueConfig}
        scenarios={scenarios}
        bundlesByScenario={bundlesByScenario}
        addonCategoriesByScenario={addonCategoriesByScenario}
      />
    </Suspense>
  );
}
