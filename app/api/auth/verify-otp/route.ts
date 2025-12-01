import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { signIn } from "@/auth"; // WAJIB pakai ini, BUKAN next-auth/react

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
});

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  otpSchema.parse({ email, otp });

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const otpRecord = await prisma.user_otp.findFirst({
    where: {
      user_id: user.id,
      otp_code: otp,
      is_used: false,
      expires_at: { gt: new Date() },
    },
  });

  if (!otpRecord) {
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 400 }
    );
  }

  // OTP valid → tandai used
  await prisma.user_otp.update({
    where: { id: otpRecord.id },
    data: { is_used: true },
  });

  // PENTING: LOGIN NEXTAUTH DI SINI
  const result = await signIn("credentials", {
    redirect: false,
    email,
    password: otp,
  });

  if (result?.error) {
    return NextResponse.json({ error: "Failed to sign in" }, { status: 400 });
  }

  // NextAuth berhasil login → cookie session dibuat otomatis

  return NextResponse.json({
    success: true,
    redirect: "/dashboard",
  });
}
