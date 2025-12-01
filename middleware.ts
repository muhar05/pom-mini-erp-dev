import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const hasSession = req.cookies.get("__Secure-authjs.session-token");

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
