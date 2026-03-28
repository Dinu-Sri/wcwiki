import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // /admin — only SUPER_ADMIN and APPROVER
  if (pathname.startsWith("/admin")) {
    if (!token || (token.role !== "SUPER_ADMIN" && token.role !== "APPROVER")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // /edit — only EDITOR+
  if (pathname.startsWith("/edit")) {
    if (
      !token ||
      !["EDITOR", "APPROVER", "SUPER_ADMIN"].includes(token.role as string)
    ) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // /dashboard — any authenticated user
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/edit/:path*", "/dashboard/:path*"],
};
