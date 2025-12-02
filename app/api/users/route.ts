import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all users with roles
export async function GET() {
  try {
    const users = await prisma.users.findMany({
      include: {
        roles: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// CREATE new user
export async function POST(req: Request) {
  try {
    const { name, email, role_id } = await req.json();

    // Validate required fields
    if (!name || !email || !role_id) {
      return NextResponse.json(
        { error: "Name, email, and role_id are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Create user
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash: "", // Empty since using OTP login
        role_id: parseInt(role_id),
        created_at: new Date(),
      },
      include: {
        roles: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
