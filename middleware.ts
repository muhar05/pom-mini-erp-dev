import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Ambil cookie session (misal: "session" atau dari next-auth)
  const session = request.cookies.get("session");

  // Proteksi semua route dashboard dan settings
  if (
    !session &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/settings"))
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
