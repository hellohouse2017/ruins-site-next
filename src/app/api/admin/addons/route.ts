import { NextRequest, NextResponse } from "next/server";
import { adminUnauthorized, isAdminAuthenticated } from "@/lib/admin/auth";
import { readAddonCatalog, writeAddonCatalog } from "@/lib/admin/v2-store";

// GET — read all addons
export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();
  return NextResponse.json(await readAddonCatalog());
}

// PUT — replace the entire addons structure
export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();
  try {
    const data = await req.json();
    await writeAddonCatalog(data);
    return NextResponse.json({ status: "success" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
