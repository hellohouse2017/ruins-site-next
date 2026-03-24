import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const CATALOG_PATH = path.join(process.cwd(), "src/data/catalog.json");
const SESSION_TOKEN = "ruins_admin_authenticated";

async function isAuth() {
  const c = await cookies();
  return c.get("ruins_admin_session")?.value === SESSION_TOKEN;
}

export async function GET() {
  if (!(await isAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const raw = await fs.readFile(CATALOG_PATH, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}

export async function PUT(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await req.json();
    await fs.writeFile(CATALOG_PATH, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ status: "success" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
