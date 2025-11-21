import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "./auth";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/create-password",
];

// Mapping role ke path
const roleAccess: Record<string, string[]> = {
  "1": ["/superuser"],
  "2": ["/sales"],
  "3": ["/warehouse"],
  "4": ["/finance"],
  "5": ["/purchasing"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Abaikan static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/manifest.json")
  ) {
    return NextResponse.next();
  }

  // Ambil session
  let session = null;
  try {
    session = await auth();
  } catch (_) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Cek route publik
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  // Kalau belum login, lempar ke login
  if (!session?.user && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Kalau sudah login tapi sedang akses halaman public, lempar ke halaman role
  if (session?.user && isPublic) {
    const role = session.user.role_id;
    const allowedPath = roleAccess[role]?.[0] || "/";
    return NextResponse.redirect(new URL(allowedPath, req.url));
  }

  // Cek role access ke folder tertentu
  if (session?.user) {
    const role = session.user.role_id;
    const allowedRoutes = roleAccess[role] || [];

    const isRestricted =
      pathname.startsWith("/") &&
      !allowedRoutes.some((route) => pathname.startsWith(route)) &&
      !isPublic;

    if (isRestricted) {
      const redirectTo = allowedRoutes[0] || "/";
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico|manifest.json).*)"],
};