import { NextResponse } from "next/server";
import { quoteBooking } from "@/lib/booking/pricing";
import type { BookingQuoteInput } from "@/types/v2";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingQuoteInput;
    const quote = quoteBooking(body);

    return NextResponse.json({ ok: true, quote });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create quote";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
