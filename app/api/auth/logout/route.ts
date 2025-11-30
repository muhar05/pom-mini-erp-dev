import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    const ip_address =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "";
    const user_agent = req.headers.get("user-agent") || "";

    // Ambil token dari request (langsung, tanpa parsing manual)
    const secret = process.env.NEXTAUTH_SECRET;
    const decoded = await getToken({ req, secret });
    console.log("Decoded token at logout:", decoded);

    let userId: number | undefined = undefined;
    if (decoded?.id) {
      userId = Number(decoded.id);
    }

    if (userId) {
      await prisma.user_logs.create({
        data: {
          user_id: userId,
          activity: "Logout",
          method: "POST",
          endpoint: "/api/auth/logout",
          ip_address,
          user_agent,
          created_at: new Date(),
        },
      });
    }

    // Hapus cookie session (opsional, bisa juga di client)
    const res = NextResponse.json({ success: true });
    res.cookies.set("authjs.session-token", "", { maxAge: 0, path: "/" });
    return res;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
