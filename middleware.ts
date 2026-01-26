import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { roleMap } from "@/config/roleMap";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,

    // WAJIB TAMBAH INI
    cookieName: "__Secure-next-auth.session-token",
  });

  const url = req.nextUrl.pathname;

  console.log("TOKEN:", token); // DEBUG

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const roleId = token.role_id as string;
  const roleName = roleMap[roleId];

  if (!roleName) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (url === "/dashboard") {
    return NextResponse.redirect(new URL(`/dashboard/${roleName}`, req.url));
  }

  // Allow superuser to access any dashboard path
  if (roleName === "superuser" && url.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Allow manager-sales to access sales dashboard
  if (roleName === "manager-sales" && url.startsWith("/dashboard/sales")) {
    return NextResponse.next();
  }

  if (url.startsWith("/dashboard") && !url.startsWith(`/dashboard/${roleName}`)) {
    return NextResponse.redirect(new URL(`/dashboard/${roleName}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
