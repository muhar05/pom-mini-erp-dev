"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role_id = formData.get("role_id") as string;

    // Validate required fields
    if (!name || !email || !role_id) {
      throw new Error("All fields are required");
    }

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Create user in database
    await prisma.users.create({
      data: {
        name,
        email,
        password_hash: "", // Set empty since using OTP login
        role_id: parseInt(role_id),
        created_at: new Date(),
      },
    });

    // Revalidate users page cache
    revalidatePath("/settings/users");

    // Redirect to users page after success
    redirect("/settings/users");
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}
