import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
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

  // Strip locale prefix for auth checks
  const pathWithoutLocale = pathname.replace(/^\/(en|zh|ja|ko|es|fr|ru|tr|ta|si)/, "") || "/";

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Build login redirect with callbackUrl
  const loginRedirect = () => {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  };

  // /admin — only SUPER_ADMIN and APPROVER
  if (pathWithoutLocale.startsWith("/admin")) {
    if (!token || (token.role !== "SUPER_ADMIN" && token.role !== "APPROVER")) {
      return loginRedirect();
    }
  }

  // /edit — only EDITOR+
  if (pathWithoutLocale.startsWith("/edit")) {
    if (
      !token ||
      !["EDITOR", "APPROVER", "SUPER_ADMIN"].includes(token.role as string)
    ) {
      return loginRedirect();
    }
  }

  // /dashboard — any authenticated user
  if (pathWithoutLocale.startsWith("/dashboard")) {
    if (!token) {
      return loginRedirect();
    }
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
