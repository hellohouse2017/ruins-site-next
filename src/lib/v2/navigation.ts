import type { ScenarioId } from "@/types/v2";

export interface BookingEntryTarget {
  scenarioId: ScenarioId;
  bundleId?: string;
}

export interface BookingEntryLink extends BookingEntryTarget {
  label: string;
}

const legacyPlanBookingMap: Record<string, BookingEntryTarget> = {
  proposal: { scenarioId: "proposal", bundleId: "proposal_popular" },
  wedding: { scenarioId: "wedding", bundleId: "wedding_complete" },
  baby: { scenarioId: "family", bundleId: "family_photo" },
  party: { scenarioId: "party" },
  meeting: { scenarioId: "business" },
  rental: { scenarioId: "venue" },
  custom: { scenarioId: "venue" },
};

export const legacyPlanSlugs = Object.keys(legacyPlanBookingMap);

export const bookingEntryLinks: BookingEntryLink[] = [
  { label: "求婚包場", scenarioId: "proposal", bundleId: "proposal_popular" },
  { label: "婚禮包場", scenarioId: "wedding", bundleId: "wedding_complete" },
  { label: "抓周 / 家庭慶典", scenarioId: "family", bundleId: "family_photo" },
  { label: "生日 / 派對包場", scenarioId: "party" },
  { label: "企業活動", scenarioId: "business" },
  { label: "純場地租借", scenarioId: "venue" },
];

export function buildBookingHref(target: BookingEntryTarget): string {
  const params = new URLSearchParams({ scenario: target.scenarioId });

  if (target.bundleId) {
    params.set("bundle", target.bundleId);
  }

  return `/book?${params.toString()}`;
}

export function getLegacyPlanBookingTarget(
  slug: string
): BookingEntryTarget | null {
  return legacyPlanBookingMap[slug] ?? null;
}

export function getLegacyPlanBookingHref(slug: string): string {
  const target = getLegacyPlanBookingTarget(slug);

  return target ? buildBookingHref(target) : "/book";
}
