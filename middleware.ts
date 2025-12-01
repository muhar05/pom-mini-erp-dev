import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function middleware(request: NextRequest) {
  const cookies = request.cookies.getAll();
  const sessionCookie = cookies.find(
    (cookie) =>
      typeof cookie.value === "string" && cookie.value.split(".").length === 3
  );

  if (
    !sessionCookie &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/settings"))
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (sessionCookie) {
    try {
      // Verifikasi dan decode JWT
      const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);

      // Cek expired
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      // Cek role (misal: hanya admin boleh akses /settings)
      if (
        request.nextUrl.pathname.startsWith("/settings") &&
        payload.role_name !== "admin"
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Kamu bisa akses payload lain di sini jika perlu
    } catch (e) {
      // JWT tidak valid
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
