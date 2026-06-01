import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/workspaces",
  "/tasks",
  "/checkins",
  "/outreach",
  "/ai",
  "/notifications",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const authToken = request.cookies.get("founderos_token")?.value;

  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/workspaces/:path*", "/tasks/:path*", "/checkins/:path*", "/outreach/:path*", "/ai/:path*", "/notifications/:path*", "/settings/:path*"],
};

