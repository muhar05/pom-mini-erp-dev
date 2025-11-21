import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "experimental-edge";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/create-password",
];

const globalAllowedRoutes = ["/dashboard"];

const roleAccess: Record<string, string[]> = {
  "1": ["/superuser"],
  "2": ["/sales"],
  "3": ["/warehouse"],
  "4": ["/finance"],
  "5": ["/purchasing"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/manifest.json")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); // <-- GANTI auth() JADI getToken()

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    token &&
    globalAllowedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  if (token) {
    const role = token.role_id;
    const allowedRoutes = roleAccess[role] || [];

    const isRestricted =
      pathname.startsWith("/") &&
      !allowedRoutes.some((route) => pathname.startsWith(route));

    if (isRestricted) {
      return NextResponse.redirect(
        new URL(allowedRoutes[0] || "/dashboard", req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico|manifest.json).*)"],
};
