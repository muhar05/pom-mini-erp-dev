import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const path = req.nextUrl.pathname;
  const isDashboard = path.startsWith("/dashboard");
  const isSettings = path.startsWith("/settings");

  if (!token && (isDashboard || isSettings)) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isSettings && token?.role_name !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
