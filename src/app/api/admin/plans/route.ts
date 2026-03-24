import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const PLANS_PATH = path.join(process.cwd(), "src/data/plans.json");
const SESSION_TOKEN = "ruins_admin_authenticated";

async function isAuth() {
  const c = await cookies();
  return c.get("ruins_admin_session")?.value === SESSION_TOKEN;
}

// GET — read all plans
export async function GET() {
  if (!(await isAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const raw = await fs.readFile(PLANS_PATH, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}

// POST — add a new plan
export async function POST(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const newPlan = await req.json();
    const raw = await fs.readFile(PLANS_PATH, "utf-8");
    const plans = JSON.parse(raw);
    // Ensure unique id
    if (plans.some((p: { id: string }) => p.id === newPlan.id)) {
      return NextResponse.json({ error: "方案 ID 已存在" }, { status: 400 });
    }
    plans.push(newPlan);
    await fs.writeFile(PLANS_PATH, JSON.stringify(plans, null, 2), "utf-8");
    return NextResponse.json({ status: "success", count: plans.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT — update an existing plan by id
export async function PUT(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const updated = await req.json();
    const raw = await fs.readFile(PLANS_PATH, "utf-8");
    const plans = JSON.parse(raw);
    const idx = plans.findIndex((p: { id: string }) => p.id === updated.id);
    if (idx === -1) return NextResponse.json({ error: "找不到該方案" }, { status: 404 });
    plans[idx] = updated;
    await fs.writeFile(PLANS_PATH, JSON.stringify(plans, null, 2), "utf-8");
    return NextResponse.json({ status: "success" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE — remove a plan by id (via query param)
export async function DELETE(req: NextRequest) {
  if (!(await isAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ?id=" }, { status: 400 });
  try {
    const raw = await fs.readFile(PLANS_PATH, "utf-8");
    const plans = JSON.parse(raw);
    const filtered = plans.filter((p: { id: string }) => p.id !== id);
    if (filtered.length === plans.length) return NextResponse.json({ error: "找不到該方案" }, { status: 404 });
    await fs.writeFile(PLANS_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    return NextResponse.json({ status: "success", count: filtered.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
