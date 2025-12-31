import { NextResponse } from "next/server";
import { getAllRolesDb } from "@/data/roles";
import { prisma } from "@/lib/prisma";

// GET all roles
export async function GET() {
  try {
    const roles = await getAllRolesDb();
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

// POST create new role
export async function POST(req: Request) {
  try {
    const { role_name } = await req.json();
    if (!role_name) {
      return NextResponse.json(
        { error: "role_name is required" },
        { status: 400 }
      );
    }
    // Insert langsung ke prisma.roles karena data layer belum ada fungsi create
    const newRole = await prisma.roles.create({
      data: {
        role_name,
      },
    });
    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}
