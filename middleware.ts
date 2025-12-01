import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;

  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isSettings = nextUrl.pathname.startsWith("/settings");

  if (!req.auth && (isDashboard || isSettings)) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isSettings && req.auth?.user?.role_name !== "superadmin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
