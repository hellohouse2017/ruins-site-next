/**
 * Ruins Bar LINE Bot — Webhook Route
 * POST /api/line/webhook
 *
 * Pattern: Verify signature → 200 OK → Background processing
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Client, type WebhookEvent } from "@line/bot-sdk";
import { handleLineEvent } from "@/lib/bot/orchestrator";

// Lazy-init LINE client (must read env at runtime, not build time)
let lineClient: Client | null = null;
function getClient(): Client {
  if (!lineClient) {
    lineClient = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
    });
  }
  return lineClient;
}

// LINE webhook verification (GET)
export async function GET() {
  return NextResponse.json({ status: "ok", service: "ruins-bar-linebot" });
}

// LINE webhook handler (POST)
export async function POST(request: NextRequest) {
  // Read env vars at RUNTIME (not module-level, which gets baked at build time)
  const channelSecret = process.env.LINE_CHANNEL_SECRET || "";

  try {
    const bodyText = await request.text();

    // 1. Verify signature
    const signature = request.headers.get("x-line-signature");

    if (!channelSecret) {
      console.error("[Webhook] LINE_CHANNEL_SECRET is not set!");
      return NextResponse.json({ status: "ok" }); // Return 200 anyway for LINE
    }

    if (!signature) {
      console.error("[Webhook] Missing x-line-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const hash = crypto
      .createHmac("SHA256", channelSecret)
      .update(bodyText)
      .digest("base64");

    if (hash !== signature) {
      console.error("[Webhook] Signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(bodyText);
    const events: WebhookEvent[] = body.events;

    if (!events || events.length === 0) {
      // LINE verifying webhook URL — return 200
      return NextResponse.json({ status: "ok" });
    }

    // 2. Fire-and-forget: process in background
    const client = getClient();
    Promise.allSettled(
      events.map(async (event) => {
        try {
          const messages = await handleLineEvent(event);
          if (messages.length > 0 && "replyToken" in event && event.replyToken) {
            await client.replyMessage(event.replyToken, messages);
          }
        } catch (err) {
          console.error("[Webhook] Event processing error:", err);
          if ("replyToken" in event && event.replyToken) {
            try {
              await client.replyMessage(event.replyToken, [
                { type: "text", text: "系統繁忙中，請稍後再試 🙏" },
              ]);
            } catch {
              // ignore reply failure
            }
          }
        }
      })
    ).catch((err) => console.error("[Webhook] Background error:", err));

    // 3. Return 200 OK immediately
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[Webhook] Request error:", err);
    return NextResponse.json({ status: "ok" }); // Always return 200 to LINE
  }
}

