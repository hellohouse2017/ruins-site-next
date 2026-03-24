import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ruins2024";
const COOKIE_NAME = "ruins_admin_session";
const SESSION_TOKEN = "ruins_admin_authenticated";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (password === ADMIN_PASSWORD) {
      const res = NextResponse.json({ status: "success" });
      res.cookies.set(COOKIE_NAME, SESSION_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24hr
        path: "/",
      });
      return res;
    }
    return NextResponse.json({ status: "error", message: "密碼錯誤" }, { status: 401 });
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (session?.value === SESSION_TOKEN) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ status: "success" });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
