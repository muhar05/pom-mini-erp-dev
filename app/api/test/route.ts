import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    // Query sederhana, misal ambil satu user
    const user = await prisma.users.findFirst();
    return NextResponse.json({
      success: true,
      message: "Connection to DB successful!",
      exampleUser: user,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Connection to DB failed!",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
}
