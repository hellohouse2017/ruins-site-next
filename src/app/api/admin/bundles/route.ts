import { NextRequest, NextResponse } from "next/server";
import { adminUnauthorized, isAdminAuthenticated } from "@/lib/admin/auth";
import { readBundleCatalog, writeBundleCatalog } from "@/lib/admin/v2-store";

export async function GET() {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();
  return NextResponse.json(await readBundleCatalog());
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return adminUnauthorized();

  try {
    const data = await req.json();
    await writeBundleCatalog(data);
    return NextResponse.json({ status: "success" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
