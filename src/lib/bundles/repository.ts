import { getAddonById } from "@/lib/addons/repository";
import { v2BundleCatalog } from "@/lib/booking/config";
import type {
  AddonItemConfig,
  BundleConfig,
  QuoteAddonSelection,
  ScenarioId,
} from "@/types/v2";

export function listActiveBundles(options?: {
  scenarioId?: ScenarioId;
  limit?: number;
}): BundleConfig[] {
  const scenarioId = options?.scenarioId;
  const limit = options?.limit;

  const bundles = v2BundleCatalog.bundles
    .filter((bundle) => bundle.active)
    .filter((bundle) => !scenarioId || bundle.scenarioId === scenarioId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return typeof limit === "number" ? bundles.slice(0, limit) : bundles;
}

export function getBundleById(id: string): BundleConfig | undefined {
  return v2BundleCatalog.bundles.find((bundle) => bundle.id === id);
}

export function expandBundleSelections(bundleId: string): QuoteAddonSelection[] {
  const bundle = getBundleById(bundleId);
  if (!bundle || !bundle.active) {
    throw new Error(`Unknown or inactive bundle: ${bundleId}`);
  }

  return bundle.items.map((item) => ({
    addonId: item.addonId,
    qty: item.qty,
  }));
}

export function resolveBundleItems(bundleId: string): Array<{
  addon: AddonItemConfig;
  qty: number;
}> {
  return expandBundleSelections(bundleId).map((selection) => {
    const addon = getAddonById(selection.addonId);
    if (!addon) {
      throw new Error(
        `Bundle item references unknown addon: ${selection.addonId}`
      );
    }

    return {
      addon,
      qty: selection.qty,
    };
  });
}
