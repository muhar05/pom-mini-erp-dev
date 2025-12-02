import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all roles
export async function GET() {
  try {
    const roles = await prisma.roles.findMany({
      orderBy: {
        id: "asc",
      },
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
