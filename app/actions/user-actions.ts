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
        password_hash: "",
        role_id: parseInt(role_id),
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

export async function updateUser(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role_id = formData.get("role_id") as string;

    if (!id || !name || !email || !role_id) {
      throw new Error("All fields are required");
    }

    const userId = parseInt(id);

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Check if email is being changed and if it's already taken
    if (email !== existingUser.email) {
      const emailExists = await prisma.users.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw new Error("Email already exists");
      }
    }

    // Update user
    await prisma.users.update({
      where: { id: userId },
      data: {
        name,
        email,
        role_id: parseInt(role_id),
      },
    });

    // Revalidate users page cache
    revalidatePath("/settings/users");

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("User ID is required");
    }

    const userId = parseInt(id);

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Delete user
    await prisma.users.delete({
      where: { id: userId },
    });

    // Revalidate users page cache
    revalidatePath("/settings/users");

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function getUserById(id: number) {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        roles: true,
        user_logs: {
          take: 10,
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Convert BigInt to string untuk user_logs
    const userWithConvertedLogs = {
      ...user,
      user_logs: user.user_logs.map((log) => ({
        ...log,
        id: log.id.toString(), // Convert BigInt to string
      })),
    };

    return userWithConvertedLogs;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.users.findMany({
      include: {
        roles: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Convert BigInt fields if needed
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getAllRoles() {
  try {
    const roles = await prisma.roles.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return roles;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
}
