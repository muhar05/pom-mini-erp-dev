"use server";

import { revalidatePath } from "next/cache";
import {
  createCompanyDb,
  updateCompanyDb,
  deleteCompanyDb,
  getCompanyByIdDb,
  getAllCompaniesDb,
  CreateCompanyInput,
} from "@/data/companies";
import { validateCompanyFormData } from "@/lib/schemas/companies";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { users } from "@/types/models";
import { serializeDecimal } from "@/utils/formatDecimal";

export async function createCompanyAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");
  try {
    const validatedData = validateCompanyFormData(formData, "create");
    await createCompanyDb(validatedData as CreateCompanyInput);
    revalidatePath("/companies");
    return { success: true, message: "Company created successfully" };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.errors.map((err) => err.message).join(", "));
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to create company"
    );
  }
}

export async function updateCompanyAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");
  try {
    const id = Number(formData.get("id"));
    const validatedData = validateCompanyFormData(formData, "update");
    await updateCompanyDb(id, validatedData);
    revalidatePath("/companies");
    revalidatePath(`/companies/${id}`);
    return { success: true, message: "Company updated successfully" };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.errors.map((err) => err.message).join(", "));
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to update company"
    );
  }
}

export async function deleteCompanyAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");
  try {
    const id = Number(formData.get("id"));
    await deleteCompanyDb(id);
    revalidatePath("/companies");
    return { success: true, message: "Company deleted successfully" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete company",
    };
  }
}

export async function getCompanyByIdAction(id: number) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");
  return getCompanyByIdDb(id);
}

export async function getAllCompaniesAction() {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  const companies = await getAllCompaniesDb();
  return companies.map(serializeDecimal); // Serialize di server
}
