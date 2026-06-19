import { v2AddonCatalog } from "@/lib/booking/config";
import type {
  AddonCategoryConfig,
  AddonItemConfig,
  ScenarioId,
} from "@/types/v2";

function sortItems(items: AddonItemConfig[]): AddonItemConfig[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function listAddonCategories(options?: {
  scenarioId?: ScenarioId;
  activeOnly?: boolean;
  includeEmpty?: boolean;
}): AddonCategoryConfig[] {
  const scenarioId = options?.scenarioId;
  const activeOnly = options?.activeOnly ?? true;
  const includeEmpty = options?.includeEmpty ?? false;

  return v2AddonCatalog.categories
    .map((category) => {
      const items = category.items.filter((item) => {
        if (activeOnly && !item.active) return false;
        if (scenarioId && !item.scenarioTags.includes(scenarioId)) return false;
        return true;
      });

      return {
        ...category,
        items: sortItems(items),
      };
    })
    .filter((category) => includeEmpty || category.items.length > 0);
}

export function listActiveAddons(options?: {
  scenarioId?: ScenarioId;
}): AddonItemConfig[] {
  return listAddonCategories({
    scenarioId: options?.scenarioId,
    activeOnly: true,
    includeEmpty: false,
  }).flatMap((category) => category.items);
}

export function listPopularAddons(options?: {
  scenarioId?: ScenarioId;
  limit?: number;
}): AddonItemConfig[] {
  const limit = options?.limit ?? 6;
  return listActiveAddons({ scenarioId: options?.scenarioId })
    .filter((item) => item.popular)
    .slice(0, limit);
}

export function getAddonById(id: string): AddonItemConfig | undefined {
  return v2AddonCatalog.categories
    .flatMap((category) => category.items)
    .find((item) => item.id === id);
}
