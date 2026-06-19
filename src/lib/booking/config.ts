import rawAddons from "@/data/v2/addons.json";
import rawBookingRules from "@/data/v2/booking-rules.json";
import rawBundles from "@/data/v2/bundles.json";
import rawScenarios from "@/data/v2/scenarios.json";
import rawVenue from "@/data/v2/venue.json";
import type {
  AddonCatalogConfig,
  BookingRulesConfig,
  BundleCatalogConfig,
  ScenarioConfig,
  VenueConfig,
} from "@/types/v2";

export const v2VenueConfig = rawVenue as VenueConfig;
export const v2ScenarioConfigs = rawScenarios as ScenarioConfig[];
export const v2BookingRules = rawBookingRules as BookingRulesConfig;
export const v2AddonCatalog = rawAddons as AddonCatalogConfig;
export const v2BundleCatalog = rawBundles as BundleCatalogConfig;
