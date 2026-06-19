export type ScenarioId =
  | "proposal"
  | "wedding"
  | "party"
  | "family"
  | "business"
  | "venue";

export type AddonCategoryId =
  | "time"
  | "equipment"
  | "food"
  | "beverage"
  | "decoration"
  | "staff";

export type AddonInputType = "toggle" | "counter";
export type DayType = "weekday" | "weekend";
export type QuoteLineSource = "bundle" | "addon" | "time";
export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "confirmed"
  | "cancelled";
export type OrderSource = "web" | "line" | "admin";

export interface VenueConfig {
  id: "main";
  name: string;
  baseDurationHours: number;
  baseIncludes: string[];
  weekdayPrice: number;
  weekendPrice: number;
  weekdayExtraHourPrice: number;
  weekendExtraHourPrice: number;
  maxExtraHours: number;
  leadDays: number;
  capacity: {
    min: number;
    max: number;
  };
}

export interface ScenarioConfig {
  id: ScenarioId;
  name: string;
  icon: string;
  description: string;
  sortOrder: number;
}

export interface BookingRulesConfig {
  deposit: {
    venueOnlyFixed: number;
    withAddonsRate: number;
  };
  payment: {
    method: "bank_transfer";
    bankCode: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    requireLast5: boolean;
  };
  notifications: {
    email: boolean;
    line: boolean;
  };
  order: {
    prefix: string;
    successPagePath: string;
  };
}

export interface AddonItemConfig {
  id: string;
  name: string;
  unit: string;
  priceWeekday: number;
  priceWeekend: number;
  type: AddonInputType;
  max?: number;
  minOrder?: number;
  group?: string;
  description: string;
  scenarioTags: ScenarioId[];
  popular: boolean;
  active: boolean;
  sortOrder: number;
}

export interface AddonCategoryConfig {
  id: AddonCategoryId;
  name: string;
  icon: string;
  items: AddonItemConfig[];
}

export interface AddonCatalogConfig {
  categories: AddonCategoryConfig[];
}

export interface BundleItemSelection {
  addonId: string;
  qty: number;
}

export interface BundleConfig {
  id: string;
  name: string;
  scenarioId: ScenarioId;
  badge: string;
  summary: string;
  items: BundleItemSelection[];
  listPrice: number;
  bundlePrice: number;
  savings: number;
  active: boolean;
  sortOrder: number;
}

export interface BundleCatalogConfig {
  bundles: BundleConfig[];
}

export interface QuoteAddonSelection {
  /**
   * Additional addon quantity outside the selected bundle.
   * If the guest chooses a bundle and wants one more of the same addon,
   * only the extra quantity should be sent here.
   */
  addonId: string;
  qty: number;
}

export interface BookingQuoteInput {
  date: string;
  extraHours?: number;
  addonSelections?: QuoteAddonSelection[];
  bundleId?: string;
}

export interface QuoteLineItem {
  addonId: string;
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  source: QuoteLineSource;
}

export interface BundleQuoteSummary {
  id: string;
  name: string;
  configuredListPrice: number;
  configuredBundlePrice: number;
  currentListPrice: number;
  appliedDiscount: number;
}

export interface BookingQuote {
  dayType: DayType;
  baseAmount: number;
  extraHours: number;
  extraHourUnitPrice: number;
  extraHourAmount: number;
  addonListAmount: number;
  bundleDiscountAmount: number;
  addonsAmount: number;
  totalAmount: number;
  depositAmount: number;
  hasAnyAddons: boolean;
  bundle?: BundleQuoteSummary;
  lines: QuoteLineItem[];
}

export interface OrderCustomerInput {
  name: string;
  phone: string;
  lineId?: string;
  email?: string;
}

export interface CreateOrderInput {
  source?: OrderSource;
  customer: OrderCustomerInput;
  booking: {
    date: string;
    startTime: string;
    durationHours: number;
    guestCount: number;
    scenarioId?: ScenarioId;
    bundleId?: string;
    extraHours?: number;
    note?: string;
  };
  addonSelections?: QuoteAddonSelection[];
}

export interface PaymentSnapshot {
  method: BookingRulesConfig["payment"]["method"];
  bankCode: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  requireLast5: boolean;
  last5?: string;
  paidAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface OrderEvent {
  type:
    | "created"
    | "payment_submitted"
    | "status_changed"
    | "note_updated";
  createdAt: string;
  actor: OrderSource | "system" | "customer";
  message: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  source: OrderSource;
  customer: OrderCustomerInput;
  booking: {
    venueId: VenueConfig["id"];
    date: string;
    startTime: string;
    durationHours: number;
    guestCount: number;
    scenarioId?: ScenarioId;
    bundleId?: string;
    extraHours: number;
    note?: string;
  };
  pricing: BookingQuote;
  payment: PaymentSnapshot;
  events: OrderEvent[];
  internalNote?: string;
}

export interface OrderPaymentInput {
  last5: string;
}

export interface OrderAdminUpdateInput {
  status?: OrderStatus;
  internalNote?: string;
  verifiedBy?: string;
  paidAt?: string;
}
