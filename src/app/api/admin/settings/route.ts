import { NextRequest, NextResponse } from "next/server";
import { adminUnauthorized, isAdminAuthenticated } from "@/lib/admin/auth";
import {
  readBookingRulesConfig,
  readVenueConfig,
  writeBookingRulesConfig,
  writeVenueConfig,
} from "@/lib/admin/v2-store";
import type { BookingRulesConfig, VenueConfig } from "@/types/v2";

interface SettingsPayload {
  venue: VenueConfig;
  bookingRules: BookingRulesConfig;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  return NextResponse.json({
    venue: await readVenueConfig(),
    bookingRules: await readBookingRulesConfig(),
  } satisfies SettingsPayload);
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const data = (await req.json()) as SettingsPayload;
    await Promise.all([
      writeVenueConfig(data.venue),
      writeBookingRulesConfig(data.bookingRules),
    ]);
    return NextResponse.json({ status: "success" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
