import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALE_PREFIXES = ["/zh", "/en", "/ja", "/ko"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /:locale and /:locale/* → / or /*
  for (const prefix of LOCALE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length) || "/";
      const url = request.nextUrl.clone();
      url.pathname = rest;
      return NextResponse.redirect(url, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/zh/:path*", "/en/:path*", "/ja/:path*", "/ko/:path*"],
};
