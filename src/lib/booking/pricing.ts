import { getAddonById } from "@/lib/addons/repository";
import { getDayType, isWeekendDate } from "@/lib/booking/availability";
import { v2BookingRules, v2VenueConfig } from "@/lib/booking/config";
import { getBundleById, resolveBundleItems } from "@/lib/bundles/repository";
import type {
  AddonItemConfig,
  BookingQuote,
  BookingQuoteInput,
  QuoteAddonSelection,
  QuoteLineItem,
} from "@/types/v2";

const TIME_ADDON_ID = "venue_extra_hr";

function roundCurrency(value: number): number {
  return Math.round(value);
}

function normalizeQuantity(qty: number): number {
  if (!Number.isFinite(qty)) return 0;
  return Math.max(0, Math.floor(qty));
}

function mergeSelections(selections: QuoteAddonSelection[]): Map<string, number> {
  const merged = new Map<string, number>();

  for (const selection of selections) {
    const qty = normalizeQuantity(selection.qty);
    if (qty <= 0) continue;
    if (selection.addonId === TIME_ADDON_ID) continue;

    merged.set(selection.addonId, (merged.get(selection.addonId) ?? 0) + qty);
  }

  return merged;
}

function validateAddonQuantity(addon: AddonItemConfig, qty: number): void {
  if (qty <= 0) return;

  if (typeof addon.minOrder === "number" && qty < addon.minOrder) {
    throw new Error(
      `Addon below min order: ${addon.id} ${qty} < ${addon.minOrder}`
    );
  }

  if (typeof addon.max === "number" && qty > addon.max) {
    throw new Error(`Addon exceeds max quantity: ${addon.id} ${qty} > ${addon.max}`);
  }
}

function registerAddonGroup(
  addon: AddonItemConfig,
  selectedGroups: Map<string, string>
): void {
  if (!addon.group) return;

  const existingAddonId = selectedGroups.get(addon.group);
  if (existingAddonId && existingAddonId !== addon.id) {
    throw new Error(
      `Addon group conflict: ${addon.group} already has ${existingAddonId}, cannot also select ${addon.id}`
    );
  }

  selectedGroups.set(addon.group, addon.id);
}

export function quoteBooking(input: BookingQuoteInput): BookingQuote {
  const extraHours = normalizeQuantity(input.extraHours ?? 0);
  if (extraHours > v2VenueConfig.maxExtraHours) {
    throw new Error(
      `Extra hours exceeds max: ${extraHours} > ${v2VenueConfig.maxExtraHours}`
    );
  }

  const weekend = isWeekendDate(input.date);
  const dayType = getDayType(input.date);
  const baseAmount = weekend
    ? v2VenueConfig.weekendPrice
    : v2VenueConfig.weekdayPrice;
  const extraHourUnitPrice = weekend
    ? v2VenueConfig.weekendExtraHourPrice
    : v2VenueConfig.weekdayExtraHourPrice;
  const extraHourAmount = extraHours * extraHourUnitPrice;

  const lines: QuoteLineItem[] = [];

  if (extraHours > 0) {
    lines.push({
      addonId: TIME_ADDON_ID,
      name: "場地加時",
      qty: extraHours,
      unitPrice: extraHourUnitPrice,
      subtotal: extraHourAmount,
      source: "time",
    });
  }

  const additionalSelections = mergeSelections(input.addonSelections ?? []);
  let bundleDiscountAmount = 0;
  let bundleCurrentListPrice = 0;
  let bundleSummary: BookingQuote["bundle"];
  const bundleSelections = new Map<string, number>();
  const selectedGroups = new Map<string, string>();

  if (input.bundleId) {
    const bundle = getBundleById(input.bundleId);
    if (!bundle || !bundle.active) {
      throw new Error(`Unknown or inactive bundle: ${input.bundleId}`);
    }

    for (const item of resolveBundleItems(input.bundleId)) {
      validateAddonQuantity(item.addon, item.qty);
      registerAddonGroup(item.addon, selectedGroups);

      const unitPrice = weekend
        ? item.addon.priceWeekend
        : item.addon.priceWeekday;
      const subtotal = unitPrice * item.qty;

      bundleCurrentListPrice += subtotal;
      bundleSelections.set(
        item.addon.id,
        (bundleSelections.get(item.addon.id) ?? 0) + item.qty
      );
      lines.push({
        addonId: item.addon.id,
        name: item.addon.name,
        qty: item.qty,
        unitPrice,
        subtotal,
        source: "bundle",
      });
    }

    bundleDiscountAmount = Math.max(
      0,
      bundleCurrentListPrice - bundle.bundlePrice
    );

    bundleSummary = {
      id: bundle.id,
      name: bundle.name,
      configuredListPrice: bundle.listPrice,
      configuredBundlePrice: bundle.bundlePrice,
      currentListPrice: bundleCurrentListPrice,
      appliedDiscount: bundleDiscountAmount,
    };
  }

  for (const [addonId, qty] of additionalSelections.entries()) {
    const addon = getAddonById(addonId);
    if (!addon || !addon.active) {
      throw new Error(`Unknown or inactive addon: ${addonId}`);
    }

    const totalQty = qty + (bundleSelections.get(addonId) ?? 0);
    validateAddonQuantity(addon, totalQty);
    registerAddonGroup(addon, selectedGroups);

    const unitPrice = weekend ? addon.priceWeekend : addon.priceWeekday;

    lines.push({
      addonId,
      name: addon.name,
      qty,
      unitPrice,
      subtotal: unitPrice * qty,
      source: "addon",
    });
  }

  const addonListAmount = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const addonsAmount = Math.max(0, addonListAmount - bundleDiscountAmount);
  const totalAmount = baseAmount + addonsAmount;
  const hasAnyAddons = extraHours > 0 || lines.some((line) => line.source !== "time");
  const depositAmount = hasAnyAddons
    ? roundCurrency(totalAmount * v2BookingRules.deposit.withAddonsRate)
    : v2BookingRules.deposit.venueOnlyFixed;

  return {
    dayType,
    baseAmount,
    extraHours,
    extraHourUnitPrice,
    extraHourAmount,
    addonListAmount,
    bundleDiscountAmount,
    addonsAmount,
    totalAmount,
    depositAmount,
    hasAnyAddons,
    bundle: bundleSummary,
    lines,
  };
}

export function quoteBundle(bundleId: string, date: string): BookingQuote {
  return quoteBooking({
    date,
    bundleId,
  });
}
