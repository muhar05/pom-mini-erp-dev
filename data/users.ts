// src/data/users.ts
import { prisma } from "@/lib/prisma";
import type { user_logs } from "@prisma/client";

export async function createUserDb(input: {
  name: string;
  email: string;
  role_id: number;
}) {
  const { name, email, role_id } = input;

  const existingUser = await prisma.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  return prisma.users.create({
    data: {
      name,
      email,
      password_hash: "",
      role_id,
    },
  });
}

export async function updateUserDb(input: {
  id: number;
  name: string;
  email: string;
  role_id: number;
  password?: string; // tambahkan ini
}) {
  const { id, name, email, role_id, password } = input;

  const existingUser = await prisma.users.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (email !== existingUser.email) {
    const emailExists = await prisma.users.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw new Error("Email already exists");
    }
  }

  // Siapkan data update
  const updateData: any = {
    name,
    email,
    role_id,
  };
  if (password) {
    updateData.password_hash = password; // plain, sesuai permintaan
  }

  return prisma.users.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteUserDb(id: number) {
  const existingUser = await prisma.users.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  return prisma.users.delete({
    where: { id },
  });
}

export async function getUserByIdDb(id: number) {
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

  return {
    ...user,
    user_logs: user.user_logs.map((log: user_logs) => ({
      ...log,
      id: log.id.toString(),
    })),
  };
}

export async function getAllUsersDb() {
  return prisma.users.findMany({
    include: {
      roles: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}
