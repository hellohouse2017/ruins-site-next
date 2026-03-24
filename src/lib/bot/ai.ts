/**
 * Ruins Bar LINE Bot — Dual AI Module
 * Main: Qwen3-Max (cheap, fast) | Premium: GPT-5.4 (creative copy)
 * All Qwen output goes through OpenCC 簡→繁 conversion
 */

import * as OpenCC from "opencc-js";
import { buildSystemPrompt } from "./prompts";
import { Session, addMessage } from "./session";

// OpenCC converter: Simplified → Traditional (Taiwan standard)
const s2t = OpenCC.Converter({ from: "cn", to: "twp" });

interface AIConfig {
  model: string;
  apiKey: string;
  baseUrl: string;
  needsS2T: boolean; // whether output needs simplified→traditional conversion
}

function getQwenConfig(): AIConfig {
  return {
    model: process.env.QWEN_MODEL || "qwen-max",
    apiKey: process.env.DASHSCOPE_API_KEY || "",
    baseUrl: process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
    needsS2T: true,
  };
}

function getGPTConfig(): AIConfig {
  return {
    model: "gpt-5.4",
    apiKey: process.env.GPT54_API_KEY || "",
    baseUrl: process.env.GPT54_BASE_URL || "https://api.openai.com/v1",
    needsS2T: false,
  };
}

async function callLLM(config: AIConfig, systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> {
  const body = {
    model: config.model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 500,
  };

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[AI] ${config.model} error:`, err);
    throw new Error(`AI API error: ${res.status}`);
  }

  const data = await res.json();
  let text = data.choices?.[0]?.message?.content || "";

  // Apply 簡→繁 conversion if needed
  if (config.needsS2T && text) {
    text = s2t(text);
  }

  return text;
}

/**
 * Main chat function — uses Qwen by default, GPT for premium
 */
export async function chatWithAI(
  session: Session,
  userMessage: string,
  tier: "main" | "premium" = "main"
): Promise<string> {
  // Build context
  const systemPrompt = buildSystemPrompt(session.state, session.slots);

  // Convert history to messages format (last 10 messages for context)
  const contextMessages = session.history.slice(-10).map((entry) => ({
    role: entry.role,
    content: entry.content,
  }));

  // Add current user message
  contextMessages.push({ role: "user", content: userMessage });

  // Record user message
  addMessage(session, "user", userMessage);

  // Pick AI config
  const config = tier === "premium" && process.env.GPT54_API_KEY
    ? getGPTConfig()
    : getQwenConfig();

  try {
    const response = await callLLM(config, systemPrompt, contextMessages);

    // Record AI response (strip tags for history)
    const cleanResponse = response
      .replace(/\[SESSION:[^\]]*\]/g, "")
      .replace(/\[FLEX_PLANS\]/g, "")
      .replace(/\[CHECK_CALENDAR\]/g, "")
      .replace(/\[FLEX_QUOTE\]/g, "")
      .replace(/\[FLEX_SIGNING\]/g, "")
      .replace(/\[ESCALATION\]/g, "")
      .trim();

    if (cleanResponse) {
      addMessage(session, "assistant", cleanResponse);
    }

    return response;
  } catch (error) {
    console.error("[AI] Chat error:", error);

    // Fallback: try the other model
    if (tier === "main" && process.env.GPT54_API_KEY) {
      console.log("[AI] Falling back to GPT-5.4...");
      try {
        const fallback = await callLLM(getGPTConfig(), systemPrompt, contextMessages);
        addMessage(session, "assistant", fallback.replace(/\[[A-Z_:,=\s\d]*\]/g, "").trim());
        return fallback;
      } catch (e2) {
        console.error("[AI] Fallback also failed:", e2);
      }
    }

    return "系統暫時忙碌中，請稍後再試，或直接撥打我們的電話。🙏";
  }
}
