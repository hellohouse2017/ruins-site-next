import fs from "fs/promises";
import path from "path";
import type {
  AddonCatalogConfig,
  BookingRulesConfig,
  BundleCatalogConfig,
  ScenarioConfig,
  VenueConfig,
} from "@/types/v2";

type V2DataKey =
  | "addons"
  | "bookingRules"
  | "bundles"
  | "scenarios"
  | "venue";

const FILES: Record<V2DataKey, string[]> = {
  addons: ["src/data/v2/addons.json", "v2/addons.json"],
  bookingRules: ["src/data/v2/booking-rules.json", "v2/booking-rules.json"],
  bundles: ["src/data/v2/bundles.json", "v2/bundles.json"],
  scenarios: ["src/data/v2/scenarios.json", "v2/scenarios.json"],
  venue: ["src/data/v2/venue.json", "v2/venue.json"],
};

async function readJson<T>(key: V2DataKey): Promise<T> {
  const [primaryPath] = FILES[key];
  const raw = await fs.readFile(path.join(process.cwd(), primaryPath), "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(key: V2DataKey, value: T) {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;

  await Promise.all(
    FILES[key].map((relativePath) =>
      fs.writeFile(path.join(process.cwd(), relativePath), serialized, "utf-8")
    )
  );
}

export async function readAddonCatalog() {
  return readJson<AddonCatalogConfig>("addons");
}

export async function writeAddonCatalog(value: AddonCatalogConfig) {
  await writeJson("addons", value);
}

export async function readBundleCatalog() {
  return readJson<BundleCatalogConfig>("bundles");
}

export async function writeBundleCatalog(value: BundleCatalogConfig) {
  await writeJson("bundles", value);
}

export async function readScenarioConfigs() {
  return readJson<ScenarioConfig[]>("scenarios");
}

export async function writeScenarioConfigs(value: ScenarioConfig[]) {
  await writeJson("scenarios", value);
}

export async function readVenueConfig() {
  return readJson<VenueConfig>("venue");
}

export async function writeVenueConfig(value: VenueConfig) {
  await writeJson("venue", value);
}

export async function readBookingRulesConfig() {
  return readJson<BookingRulesConfig>("bookingRules");
}

export async function writeBookingRulesConfig(value: BookingRulesConfig) {
  await writeJson("bookingRules", value);
}
