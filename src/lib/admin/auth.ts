import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "ruins_admin_session";
export const ADMIN_SESSION_TOKEN = "ruins_admin_authenticated";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return (
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_TOKEN
  );
}

export function adminUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
