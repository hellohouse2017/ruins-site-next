/**
 * Ruins Bar LINE Bot — Orchestrator
 * Routes webhook events through: Session → AI → Tag Intercept → Flex Messages → Reply
 */

import type { WebhookEvent, Message } from "@line/bot-sdk";
import { chatWithAI } from "./ai";
import { getSession, saveSession, updateSlots, transitionState, type Session, type SessionSlots } from "./session";
import { recommendPlans, getPlan, calculateTotal } from "./recommender";
import {
  createWelcomeMessage,
  createPlanCards,
  createQuoteMessage,
  createCalendarResult,
  createSigningCard,
} from "./flex";

/**
 * Main event handler — called from webhook route
 */
export async function handleLineEvent(event: WebhookEvent): Promise<Message[]> {
  // Only handle text messages and follow events
  if (event.type === "follow") {
    return [{ type: "text", text: "歡迎來到 Ruins Bar！🏚️" } as Message, createWelcomeMessage()];
  }

  if (event.type !== "message" || event.message.type !== "text") {
    return [];
  }

  const userMessage = event.message.text;
  const userId = event.source.userId || "anonymous";

  // Load session
  const session = getSession(userId);

  // Get AI response
  const aiResponse = await chatWithAI(session, userMessage);

  // Build reply messages
  const messages: Message[] = [];

  // Extract and process tags
  let cleanedResponse = aiResponse;

  // 1. Extract [SESSION:...] tags and update slots
  const sessionMatch = aiResponse.match(/\[SESSION:([^\]]+)\]/);
  if (sessionMatch) {
    cleanedResponse = cleanedResponse.replace(/\[SESSION:[^\]]*\]/g, "").trim();
    const slotUpdates = parseSessionTag(sessionMatch[1]);
    updateSlots(session, slotUpdates);

    // Auto-transition based on filled slots
    if (slotUpdates.eventType && session.state === "idle") {
      transitionState(session, "screening");
    }
  }

  // 2. [FLEX_PLANS] — Recommend plans
  if (aiResponse.includes("[FLEX_PLANS]")) {
    cleanedResponse = cleanedResponse.replace(/\[FLEX_PLANS\]/g, "").trim();
    const plans = recommendPlans(session.slots);
    if (plans.length > 0) {
      messages.push(createPlanCards(plans));
      transitionState(session, "recommending");
    }
  }

  // 3. [CHECK_CALENDAR] — Check availability
  if (aiResponse.includes("[CHECK_CALENDAR]")) {
    cleanedResponse = cleanedResponse.replace(/\[CHECK_CALENDAR\]/g, "").trim();

    // Extract plan selection from context
    const planNameMatch = userMessage.match(/「([^」]+)」/);
    if (planNameMatch) {
      const planName = planNameMatch[1];
      // Find plan by name
      const plans = recommendPlans(session.slots);
      const matched = plans.find((p) => p.name === planName);
      if (matched) {
        updateSlots(session, { selectedPlan: matched.id });
      }
    }

    if (session.slots.preferredDate) {
      transitionState(session, "calendar_checking");
      try {
        const calRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/calendar?date=${session.slots.preferredDate}`);
        const calData = await calRes.json();
        const busyDates: string[] = calData.busyDates || [];
        const isAvailable = !busyDates.includes(session.slots.preferredDate);
        messages.push(createCalendarResult(isAvailable, session.slots.preferredDate));

        if (isAvailable) {
          transitionState(session, "quoting");
        } else {
          transitionState(session, "recommending");
        }
      } catch (err) {
        console.error("[Orchestrator] Calendar check failed:", err);
        messages.push({ type: "text", text: "檔期查詢暫時無法使用，請稍後再試。" } as Message);
      }
    } else {
      // Ask for date
      cleanedResponse += "\n想看哪一天的檔期呢？請告訴我日期 📅";
    }
  }

  // 4. [FLEX_QUOTE] — Generate quote
  if (aiResponse.includes("[FLEX_QUOTE]")) {
    cleanedResponse = cleanedResponse.replace(/\[FLEX_QUOTE\]/g, "").trim();

    if (session.slots.selectedPlan) {
      const isWeekend = session.slots.preferredDate
        ? [0, 6].includes(new Date(session.slots.preferredDate).getDay())
        : false;

      const result = calculateTotal(session.slots.selectedPlan, {}, isWeekend);
      const plan = getPlan(session.slots.selectedPlan);

      if (plan && result.total > 0) {
        messages.push(createQuoteMessage(
          plan.name,
          result.breakdown,
          result.total,
          session.slots.preferredDate,
          isWeekend,
        ));
        transitionState(session, "quoting");
      }
    }
  }

  // 5. [FLEX_SIGNING] — Contract signing
  if (aiResponse.includes("[FLEX_SIGNING]")) {
    cleanedResponse = cleanedResponse.replace(/\[FLEX_SIGNING\]/g, "").trim();
    const liffUrl = process.env.LIFF_URL || "https://ruins.hello-stay.com/sign";
    messages.push(createSigningCard(liffUrl));
    transitionState(session, "signing");
  }

  // 6. [ESCALATION] — Human handoff
  if (aiResponse.includes("[ESCALATION]")) {
    cleanedResponse = cleanedResponse.replace(/\[ESCALATION\]/g, "").trim();
    // Could notify admin here
    console.log(`[ESCALATION] User ${userId} needs human help`);
  }

  // Add text response (if any remains after tag stripping)
  if (cleanedResponse.trim()) {
    messages.unshift({ type: "text", text: cleanedResponse.trim() } as Message);
  }

  // Fallback if no messages
  if (messages.length === 0) {
    messages.push({ type: "text", text: "收到！讓我想想... 🤔" } as Message);
  }

  // Save session
  saveSession(session);

  return messages;
}

/**
 * Parse [SESSION:key=value,key=value] into slot updates
 */
function parseSessionTag(tagContent: string): Partial<SessionSlots> {
  const slots: Partial<SessionSlots> = {};
  const pairs = tagContent.split(",");

  for (const pair of pairs) {
    const [key, value] = pair.split("=").map((s) => s.trim());
    switch (key) {
      case "eventType":
        slots.eventType = value;
        break;
      case "guestCount":
        slots.guestCount = parseInt(value, 10) || undefined;
        break;
      case "budget":
        slots.budget = parseInt(value, 10) || undefined;
        break;
      case "preferredDate":
        slots.preferredDate = value;
        break;
      case "preferences":
        slots.preferences = value;
        break;
      case "selectedPlan":
        slots.selectedPlan = value;
        break;
    }
  }

  return slots;
}

/**
 * Try to extract date from user message via regex fallback
 */
export function extractDateFromMessage(message: string): string | undefined {
  // YYYY-MM-DD
  const isoMatch = message.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

  // MM/DD or M月D日
  const mdMatch = message.match(/(\d{1,2})[/月](\d{1,2})[日號]?/);
  if (mdMatch) {
    const year = new Date().getFullYear();
    return `${year}-${mdMatch[1].padStart(2, "0")}-${mdMatch[2].padStart(2, "0")}`;
  }

  return undefined;
}
