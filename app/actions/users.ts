// src/actions/users.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createUserDb,
  updateUserDb,
  deleteUserDb,
  getUserByIdDb,
  getAllUsersDb,
} from "@/data/users";
import { getAllRolesDb } from "@/data/roles";
import { logUserActivity } from "@/lib/user-logger";

export async function createUserAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role_id = formData.get("role_id") as string;

  if (!name || !email || !role_id) {
    throw new Error("All fields are required");
  }

  const newUser = await createUserDb({
    name,
    email,
    role_id: parseInt(role_id),
  });

  // Log activity
  await logUserActivity({
    userId: newUser.id,
    activity: `User account created: ${name}`,
    method: "POST",
    endpoint: "/settings/users/new",
    newData: { name, email, role_id },
  });

  revalidatePath("/settings/users");
  redirect("/settings/users");
}

export async function updateUserAction(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role_id = formData.get("role_id") as string;
  const password = formData.get("password") as string; // tambahkan ini

  if (!id || !name || !email || !role_id) {
    throw new Error("All fields are required");
  }

  const userId = parseInt(id);

  // Get old data before update
  const oldUser = await getUserByIdDb(userId);

  await updateUserDb({
    id: userId,
    name,
    email,
    role_id: parseInt(role_id),
    password: password || undefined, // tambahkan ini
  });

  // Log activity
  await logUserActivity({
    userId: userId,
    activity: `User profile updated: ${name}`,
    method: "PUT",
    endpoint: `/settings/users/${userId}/edit`,
    oldData: {
      name: oldUser.name,
      email: oldUser.email,
      role_id: oldUser.role_id,
    },
    newData: { name, email, role_id },
  });

  revalidatePath("/settings/users");
  revalidatePath(`/settings/users/${userId}`);

  return { success: true, message: "User updated successfully" };
}

export async function deleteUserAction(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("User ID is required");
  }

  const userId = parseInt(id);

  // Get user data before delete
  const user = await getUserByIdDb(userId);

  // Log activity BEFORE deleting
  await logUserActivity({
    userId: userId,
    activity: `User account deleted: ${user.name}`,
    method: "DELETE",
    endpoint: `/settings/users/${userId}`,
    oldData: {
      name: user.name,
      email: user.email,
      role_id: user.role_id,
    },
  });

  await deleteUserDb(userId);

  revalidatePath("/settings/users");

  return { success: true, message: "User deleted successfully" };
}

export async function getUserByIdAction(id: number) {
  return getUserByIdDb(id);
}

export async function getAllUsersAction() {
  return getAllUsersDb();
}

export async function getAllRolesAction() {
  return getAllRolesDb();
}
