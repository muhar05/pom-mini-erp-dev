import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { signIn } from "next-auth/react";

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
});

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  try {
    otpSchema.parse({ email, otp });

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const otpRecord = await prisma.user_otp.findFirst({
      where: {
        user_id: user.id,
        otp_code: otp,
        is_used: false,
        expires_at: { gt: new Date() },
      },
    });

    console.log("otpRecord", otpRecord);

    if (!otpRecord)
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );

    // Tandai OTP sudah dipakai
    await prisma.user_otp.update({
      where: { id: otpRecord.id },
      data: { is_used: true },
    });

    // Tambahkan log user login
    await prisma.user_logs.create({
      data: {
        user_id: user.id,
        activity: "Login",
        method: "POST",
        endpoint: "/api/auth/verify-otp",
        ip_address: (req.headers.get("x-forwarded-for") || "")
          .split(",")[0]
          .trim(), // atau ambil dari req
        user_agent: req.headers.get("user-agent") || "",
        created_at: new Date(),
      },
    });

    // Jangan panggil signIn di sini!

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 400 }
    );
  }
}
