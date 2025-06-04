import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");
  const isHomePage = request.nextUrl.pathname === "/";

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isHomePage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*"],
};
