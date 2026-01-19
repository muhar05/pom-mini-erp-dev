import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { roleMap } from "@/config/roleMap";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const url = req.nextUrl.pathname;

  // belum login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const roleId = token.role_id as string;
  const roleName = roleMap[roleId];

  console.log(roleName);

  // safety
  if (!roleName) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // kalau sudah di dashboard role sendiri
  if (url.startsWith(`/dashboard/${roleName}`)) {
    return NextResponse.next();
  }

  // akses root dashboard
  if (url === "/dashboard") {
    return NextResponse.redirect(new URL(`/dashboard/${roleName}`, req.url));
  }

  // akses dashboard role lain
  if (url.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(`/dashboard/${roleName}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
