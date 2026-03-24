/**
 * Ruins Bar LINE Bot — Session Store
 * File-based session storage (can migrate to MongoDB later)
 */

import fs from "fs";
import path from "path";

const SESSION_DIR = path.join("/tmp", "ruins-sessions");

export interface SessionSlots {
  eventType?: string;     // 求婚 | 派對 | 婚禮 | 抓周 | 會議 | 場租 | 其他
  guestCount?: number;
  budget?: number;
  preferredDate?: string; // YYYY-MM-DD
  preferences?: string;   // 用戶備註
  selectedPlan?: string;  // plan ID
}

export interface ChatEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Session {
  userId: string;
  displayName?: string;
  state: "idle" | "screening" | "recommending" | "quoting" | "calendar_checking" | "signing" | "completed";
  slots: SessionSlots;
  history: ChatEntry[];
  createdAt: number;
  updatedAt: number;
}

function ensureDir() {
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }
}

function sessionPath(userId: string): string {
  return path.join(SESSION_DIR, `${userId}.json`);
}

export function getSession(userId: string): Session {
  ensureDir();
  const fp = sessionPath(userId);
  if (fs.existsSync(fp)) {
    try {
      return JSON.parse(fs.readFileSync(fp, "utf-8"));
    } catch {
      // corrupted file, reset
    }
  }
  return {
    userId,
    state: "idle",
    slots: {},
    history: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function saveSession(session: Session): void {
  ensureDir();
  session.updatedAt = Date.now();
  fs.writeFileSync(sessionPath(session.userId), JSON.stringify(session, null, 2), "utf-8");
}

export function addMessage(session: Session, role: "user" | "assistant", content: string): void {
  session.history.push({ role, content, timestamp: Date.now() });
  // Keep last 20 messages to avoid context overflow
  if (session.history.length > 20) {
    session.history = session.history.slice(-20);
  }
}

export function updateSlots(session: Session, updates: Partial<SessionSlots>): void {
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && value !== null && value !== "") {
      (session.slots as Record<string, unknown>)[key] = value;
    }
  }
}

export function transitionState(session: Session, newState: Session["state"]): void {
  session.state = newState;
}
