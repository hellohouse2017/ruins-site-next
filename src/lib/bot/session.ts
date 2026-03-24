/**
 * Ruins Bar LINE Bot — MongoDB Session Store
 * Persistent chat history + session state across serverless invocations
 */

import { MongoClient, type Db, type Collection } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = "ruins_bot";

// Connection pool (reused across invocations in warm containers)
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(DB_NAME);
  return cachedDb;
}

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

async function getCollection(): Promise<Collection<Session>> {
  const db = await getDb();
  return db.collection<Session>("sessions");
}

export async function getSession(userId: string): Promise<Session> {
  try {
    const col = await getCollection();
    const session = await col.findOne({ userId });
    if (session) return session;
  } catch (err) {
    console.error("[Session] MongoDB read error:", err);
  }

  // Return new session
  return {
    userId,
    state: "idle",
    slots: {},
    history: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export async function saveSession(session: Session): Promise<void> {
  try {
    session.updatedAt = Date.now();
    const col = await getCollection();
    await col.updateOne(
      { userId: session.userId },
      { $set: session },
      { upsert: true }
    );
  } catch (err) {
    console.error("[Session] MongoDB write error:", err);
  }
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
