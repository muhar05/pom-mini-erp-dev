import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Cek berbagai kemungkinan nama cookie session NextAuth
  const sessionCookies = [
    req.cookies.get("__Secure-authjs.session-token"), // prod (HTTPS)
    req.cookies.get("authjs.session-token"), // dev (HTTP)
    req.cookies.get("next-auth.session-token"), // fallback
    req.cookies.get("__Secure-next-auth.session-token"), // NextAuth v4
  ];

  const hasSession = sessionCookies.some((cookie) => cookie?.value);

  const url = req.nextUrl.pathname;
  const isDashboard = url.startsWith("/dashboard");
  const isSettings = url.startsWith("/settings");

  if (!hasSession && (isDashboard || isSettings)) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
