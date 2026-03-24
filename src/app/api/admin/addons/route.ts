import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const ADDONS_PATH = path.join(process.cwd(), "src/data/addons.json");
const SESSION_TOKEN = "ruins_admin_authenticated";

async function isAuth() {
  const c = await cookies();
  return c.get("ruins_admin_session")?.value === SESSION_TOKEN;
}

// GET — read all addons
export async function GET() {
  if (!(await isAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const raw = await fs.readFile(ADDONS_PATH, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}

// PUT — replace the entire addons structure
export async function PUT(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await req.json();
    await fs.writeFile(ADDONS_PATH, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ status: "success" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
