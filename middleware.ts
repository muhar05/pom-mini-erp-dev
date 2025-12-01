import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export default auth((req: NextRequest & { auth?: any }) => {
  const session = req.auth;
  
  const url = req.nextUrl.pathname;
  const isDashboard = url.startsWith("/dashboard");
  const isSettings = url.startsWith("/settings");

  if (!session && (isDashboard || isSettings)) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isSettings && session?.user?.role_name !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};