import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip i18n routing for API routes and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Apply i18n middleware
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match all pathnames except API, _next, and files with extensions
    "/((?!api|_next|.*\\..*).*)",
  ],
};
