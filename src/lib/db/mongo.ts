import { MongoClient, type Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.MONGODB_DB_NAME || "ruins_bar";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export function hasMongoConfig() {
  return Boolean(MONGODB_URI);
}

export async function getMongoDb(): Promise<Db> {
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

export async function closeMongoConnection() {
  if (cachedClient) {
    await cachedClient.close();
  }

  cachedClient = null;
  cachedDb = null;
}
