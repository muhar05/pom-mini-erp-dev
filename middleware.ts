// middleware.ts
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bebasin asset & API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/manifest.json")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  // Jika belum login dan bukan halaman public → redirect login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Jika sudah login dan mencoba masuk login/register → redirect dashboard
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Semua selain itu dilepas, biar NextJS handle sendiri
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico|manifest.json).*)"],
};
