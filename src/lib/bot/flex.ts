/**
 * Ruins Bar LINE Bot — Flex Message Builders
 * Premium-looking LINE Flex Messages for the 廢墟策展導演
 */

import type { FlexMessage, FlexBubble, FlexCarousel } from "@line/bot-sdk";

const BRAND = {
  bg: "#0d0d0d",
  card: "#1a1a1a",
  gold: "#c5a47e",
  text: "#e8e8e8",
  muted: "#888888",
  accent: "#ff0055",
};

/* ═══════════════════════════════════════
   1. Welcome / Ice-Breaker Card
   ═══════════════════════════════════════ */
export function createWelcomeMessage(): FlexMessage {
  return {
    type: "flex",
    altText: "歡迎來到 Ruins Bar 🏚️",
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: BRAND.bg,
        paddingAll: "20px",
        contents: [
          { type: "text", text: "🏚️ RUINS BAR", size: "xl", weight: "bold", color: BRAND.gold, align: "center" },
          { type: "text", text: "在廢墟裡，寫你的故事", size: "sm", color: BRAND.muted, align: "center", margin: "sm" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        backgroundColor: BRAND.card,
        paddingAll: "20px",
        spacing: "md",
        contents: [
          { type: "text", text: "嗨！我是廢墟的策展導演 🎬", size: "md", color: BRAND.text, wrap: true },
          { type: "text", text: "不管是浪漫求婚、瘋狂派對、還是溫馨抓周，我都能幫你在水泥牆與暖光之間找到最適合的場景。", size: "sm", color: BRAND.muted, wrap: true, margin: "md" },
          { type: "separator", margin: "lg", color: "#333333" },
          { type: "text", text: "想先看看我們能做什麼？👇", size: "sm", color: BRAND.gold, margin: "md" },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        backgroundColor: BRAND.bg,
        paddingAll: "15px",
        spacing: "sm",
        contents: [
          {
            type: "button",
            action: { type: "message", label: "💍 求婚企劃", text: "我想規劃一場求婚" },
            style: "primary",
            color: BRAND.gold,
            height: "sm",
          },
          {
            type: "button",
            action: { type: "message", label: "🎉 派對包場", text: "我想辦派對" },
            style: "primary",
            color: "#333333",
            height: "sm",
          },
          {
            type: "button",
            action: { type: "message", label: "📋 看所有方案", text: "有哪些方案可以選？" },
            style: "link",
            color: BRAND.muted,
            height: "sm",
          },
        ],
      },
    } as FlexBubble,
  };
}

/* ═══════════════════════════════════════
   2. Plan Cards Carousel (導演提案卡)
   ═══════════════════════════════════════ */
interface PlanCardData {
  id: string; name: string; tagline: string; coverImage: string;
  priceWeekday: number; priceUnit: string;
  highlights: string[]; suitableFor: string; duration: string;
  accentColor: string; slug: string;
}

export function createPlanCards(plans: PlanCardData[]): FlexMessage {
  const bubbles: FlexBubble[] = plans.map((plan) => ({
    type: "bubble",
    size: "mega",
    hero: {
      type: "image",
      url: plan.coverImage.startsWith("http") ? plan.coverImage : `https://ruins.hello-stay.com${plan.coverImage}`,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      backgroundColor: BRAND.card,
      paddingAll: "20px",
      spacing: "sm",
      contents: [
        { type: "text", text: plan.name, size: "lg", weight: "bold", color: BRAND.text },
        { type: "text", text: plan.tagline, size: "xs", color: BRAND.muted, wrap: true, margin: "sm" },
        { type: "separator", margin: "md", color: "#333333" },
        {
          type: "box", layout: "horizontal", margin: "md", contents: [
            { type: "text", text: `👥 ${plan.suitableFor}`, size: "xs", color: BRAND.muted, flex: 1 },
            { type: "text", text: `⏱ ${plan.duration}`, size: "xs", color: BRAND.muted, flex: 1, align: "end" },
          ],
        },
        ...plan.highlights.slice(0, 3).map((h) => ({
          type: "text" as const, text: `✦ ${h}`, size: "xs" as const, color: BRAND.text, margin: "sm" as const, wrap: true,
        })),
        {
          type: "box", layout: "horizontal", margin: "lg", contents: [
            { type: "text", text: plan.priceWeekday > 0 ? `NT$${plan.priceWeekday.toLocaleString()}${plan.priceUnit}` : "依需求報價", size: "lg", weight: "bold", color: BRAND.gold, flex: 1 },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "horizontal",
      backgroundColor: BRAND.bg,
      paddingAll: "12px",
      spacing: "sm",
      contents: [
        {
          type: "button",
          action: { type: "message", label: "查檔期", text: `我想選「${plan.name}」，幫我查檔期` },
          style: "primary",
          color: BRAND.gold,
          height: "sm",
          flex: 1,
        },
        {
          type: "button",
          action: { type: "uri", label: "看詳情", uri: `https://ruins.hello-stay.com/plans/${plan.slug}` },
          style: "link",
          color: BRAND.muted,
          height: "sm",
          flex: 1,
        },
      ],
    },
  }));

  return {
    type: "flex",
    altText: `為您推薦 ${plans.length} 個方案`,
    contents: { type: "carousel", contents: bubbles } as FlexCarousel,
  };
}

/* ═══════════════════════════════════════
   3. Quote Message (報價單)
   ═══════════════════════════════════════ */
export function createQuoteMessage(
  planName: string,
  breakdown: string[],
  total: number,
  date?: string,
  isWeekend?: boolean
): FlexMessage {
  return {
    type: "flex",
    altText: `報價單：${planName} NT$${total.toLocaleString()}`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box", layout: "vertical", backgroundColor: BRAND.bg, paddingAll: "20px",
        contents: [
          { type: "text", text: "📋 報價單", size: "lg", weight: "bold", color: BRAND.gold, align: "center" },
          ...(date ? [{ type: "text" as const, text: `${date} ${isWeekend ? "(假日)" : "(平日)"}`, size: "xs" as const, color: BRAND.muted, align: "center" as const, margin: "sm" as const }] : []),
        ],
      },
      body: {
        type: "box", layout: "vertical", backgroundColor: BRAND.card, paddingAll: "20px", spacing: "sm",
        contents: [
          ...breakdown.map((line) => {
            const parts = line.split(": ");
            return {
              type: "box" as const, layout: "horizontal" as const, margin: "sm" as const,
              contents: [
                { type: "text" as const, text: parts[0], size: "sm" as const, color: BRAND.text, flex: 3, wrap: true },
                { type: "text" as const, text: parts[1] || "", size: "sm" as const, color: BRAND.gold, flex: 2, align: "end" as const },
              ],
            };
          }),
          { type: "separator", margin: "lg", color: "#333333" },
          {
            type: "box", layout: "horizontal", margin: "md",
            contents: [
              { type: "text", text: "合計", size: "md", weight: "bold", color: BRAND.text, flex: 1 },
              { type: "text", text: `NT$${total.toLocaleString()}`, size: "lg", weight: "bold", color: BRAND.gold, flex: 1, align: "end" },
            ],
          },
        ],
      },
      footer: {
        type: "box", layout: "vertical", backgroundColor: BRAND.bg, paddingAll: "12px", spacing: "sm",
        contents: [
          {
            type: "button",
            action: { type: "message", label: "✅ 確認，我要預約", text: "確認報價，我要預約" },
            style: "primary", color: BRAND.gold, height: "sm",
          },
          {
            type: "button",
            action: { type: "message", label: "🔄 調整內容", text: "我想調整方案內容" },
            style: "link", color: BRAND.muted, height: "sm",
          },
        ],
      },
    } as FlexBubble,
  };
}

/* ═══════════════════════════════════════
   4. Calendar Result
   ═══════════════════════════════════════ */
export function createCalendarResult(available: boolean, date: string): FlexMessage {
  return {
    type: "flex",
    altText: available ? `${date} 有空檔！` : `${date} 已被預約`,
    contents: {
      type: "bubble",
      size: "kilo",
      body: {
        type: "box", layout: "vertical", backgroundColor: available ? "#1a2e1a" : "#2e1a1a", paddingAll: "20px",
        contents: [
          { type: "text", text: available ? "✅ 有空檔！" : "❌ 已被預約", size: "lg", weight: "bold", color: available ? "#4ade80" : "#f87171", align: "center" },
          { type: "text", text: date, size: "md", color: BRAND.text, align: "center", margin: "md" },
          ...(available ? [{
            type: "button" as const,
            action: { type: "message" as const, label: "繼續預約", text: "這天可以，幫我報價" },
            style: "primary" as const, color: BRAND.gold, height: "sm" as const, margin: "lg" as const,
          }] : [{
            type: "button" as const,
            action: { type: "message" as const, label: "換個日期", text: "那換其他日期" },
            style: "link" as const, color: BRAND.muted, height: "sm" as const, margin: "lg" as const,
          }]),
        ],
      },
    } as FlexBubble,
  };
}

/* ═══════════════════════════════════════
   5. Signing Card (合約簽名)
   ═══════════════════════════════════════ */
export function createSigningCard(liffUrl: string): FlexMessage {
  return {
    type: "flex",
    altText: "📝 合約簽署",
    contents: {
      type: "bubble",
      size: "kilo",
      body: {
        type: "box", layout: "vertical", backgroundColor: BRAND.card, paddingAll: "20px",
        contents: [
          { type: "text", text: "📝 合約簽署", size: "lg", weight: "bold", color: BRAND.gold, align: "center" },
          { type: "text", text: "點擊下方按鈕開啟合約頁面，確認內容後簽名即可完成預約。", size: "sm", color: BRAND.muted, align: "center", wrap: true, margin: "md" },
          {
            type: "button",
            action: { type: "uri", label: "✍️ 開啟合約簽署", uri: liffUrl },
            style: "primary", color: BRAND.gold, margin: "lg", height: "sm",
          },
        ],
      },
    } as FlexBubble,
  };
}
