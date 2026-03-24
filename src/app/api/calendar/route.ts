import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const CALENDAR_ID =
  "ca2c7b507ddde4857cf5e679f087f337314b63454d2c94c049ebabde023f13a1@group.calendar.google.com";

// Reuse the same credential pattern as bnb-mgmt-system/src/lib/calendar.ts
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || "";
const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(
  /\\n/g,
  "\n"
);

function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });
  return google.calendar({ version: "v3", auth });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // format: 2026-03

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { status: "error", message: "Missing or invalid ?month=YYYY-MM" },
      { status: 400 }
    );
  }

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    return NextResponse.json(
      { status: "error", message: "Missing Google credentials env vars" },
      { status: 500 }
    );
  }

  const [year, mon] = month.split("-").map(Number);
  const timeMin = new Date(year, mon - 1, 1).toISOString();
  const timeMax = new Date(year, mon, 0, 23, 59, 59).toISOString();

  try {
    const calendar = getCalendarClient();

    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 100,
    });

    const items = res.data.items || [];

    // Expand multi-day events into individual dates (same logic as bnb system)
    const events: { date: string; summary: string }[] = [];
    for (const ev of items) {
      const start =
        ev.start?.date || (ev.start?.dateTime ? ev.start.dateTime.split("T")[0] : "");
      const end =
        ev.end?.date || (ev.end?.dateTime ? ev.end.dateTime.split("T")[0] : start);
      const summary = ev.summary || "已預約";

      // Expand date range
      const cur = new Date(start);
      const endD = new Date(end);
      while (cur < endD) {
        events.push({
          date: cur.toISOString().split("T")[0],
          summary,
        });
        cur.setDate(cur.getDate() + 1);
      }
      // For timed events (not all-day), just add the single date
      if (start === end || !ev.start?.date) {
        if (!events.some((e) => e.date === start && e.summary === summary)) {
          events.push({ date: start, summary });
        }
      }
    }

    return NextResponse.json({ status: "success", events });
  } catch (err) {
    console.error("Calendar API error:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to query calendar" },
      { status: 500 }
    );
  }
}
