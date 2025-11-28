import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const { email } = await req.json();
  try {
    emailSchema.parse({ email });

    // Cek user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    // Simpan OTP
    await prisma.user_otp.create({
      data: {
        user_id: user.id, // user_id wajib diisi
        otp_code: otp,
        expires_at: expires,
        is_used: false,
      },
    });

    // Kirim email (pakai nodemailer)
    const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER!);
    const templatePath = path.join(
      process.cwd(),
      "emails",
      "otp-template.html"
    );
    let html = fs.readFileSync(templatePath, "utf8");

    // Ambil domain dari ENV
    const domain = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const logoUrl = `${domain}/assets/images/LogoPOM.png`;
    // Replace {{name}}, {{otp}}}, dan domain logo
    html = html
      .replace("{{name}}", user.name)
      .replace("{{otp}}", otp)
      .replace("{{logo_url}}", logoUrl);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Kode Verifikasi OTP POM",
      html,
      text: `Halo ${user.name},

Terima kasih telah Login Aplikasi POM. Untuk melanjutkan, silakan gunakan kode verifikasi (OTP) di bawah ini:

${otp}

Kode ini akan kedaluwarsa dalam 10 menit. Mohon untuk tidak membagikan kode ini kepada siapa pun demi keamanan akun Anda.

Jika Anda tidak merasa melakukan pendaftaran ini, silakan abaikan email ini.
`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? (err as any).message
        : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const { otp, email } = await req.json();
  try {
    // Cek user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Cek OTP
    const otpRecord = await prisma.user_otp.findFirst({
      where: {
        user_id: user.id,
        otp_code: otp,
        is_used: false,
        expires_at: {
          gte: new Date(),
        },
      },
    });

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

    // Buat session cookie (simple, misal userId dan email, expired 6 jam)
    const sessionValue = JSON.stringify({ userId: user.id, email: user.email });
    const cookieStore = await cookies();
    cookieStore.set("session", sessionValue, {
      httpOnly: true,
      maxAge: 60 * 60 * 6, // 6 jam
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
    });
  } catch (err) {
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? (err as any).message
        : "Failed to verify OTP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
