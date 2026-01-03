"use server";

import { revalidatePath } from "next/cache";
import {
  getAllCompanyLevelsDb,
  getCompanyLevelByIdDb,
  createCompanyLevelDb,
  updateCompanyLevelDb,
  deleteCompanyLevelDb,
} from "@/data/company-level";

export async function getAllCompanyLevelsAction() {
  const levels = await getAllCompanyLevelsDb();
  // Konversi Decimal ke number untuk setiap item
  return levels.map((level) => ({
    ...level,
    disc1: level.disc1 != null ? Number(level.disc1) : undefined,
    disc2: level.disc2 != null ? Number(level.disc2) : undefined,
  }));
}

export async function getCompanyLevelByIdAction(id_level: number) {
  const data = await getCompanyLevelByIdDb(id_level);
  if (!data) return null;
  return {
    ...data,
    disc1: data.disc1 != null ? Number(data.disc1) : undefined,
    disc2: data.disc2 != null ? Number(data.disc2) : undefined,
  };
}

export async function createCompanyLevelAction(data: any) {
  try {
    const created = await createCompanyLevelDb(data);
    revalidatePath("/company-level");
    return {
      success: true,
      message: "Company level created successfully",
      data: {
        ...created,
        disc1: created.disc1 != null ? Number(created.disc1) : undefined,
        disc2: created.disc2 != null ? Number(created.disc2) : undefined,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to create company level",
    };
  }
}

export async function updateCompanyLevelAction(id_level: number, data: any) {
  try {
    const updated = await updateCompanyLevelDb(id_level, data);
    revalidatePath("/company-level");
    revalidatePath(`/company-level/${id_level}`);
    return {
      success: true,
      message: "Company level updated successfully",
      data: {
        ...updated,
        disc1: updated.disc1 != null ? Number(updated.disc1) : undefined,
        disc2: updated.disc2 != null ? Number(updated.disc2) : undefined,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to update company level",
    };
  }
}

export async function deleteCompanyLevelAction(id_level: number) {
  try {
    await deleteCompanyLevelDb(id_level);
    revalidatePath("/company-level");
    return { success: true, message: "Company level deleted successfully" };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to delete company level",
    };
  }
}
