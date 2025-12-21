"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomerDb,
  updateCustomerDb,
  deleteCustomerDb,
  getCustomerByIdDb,
  getAllCustomersDb,
  CreateCustomerInput,
} from "@/data/customers";
import {
  validateCustomerFormData,
  extractCustomerId,
} from "@/lib/schemas/customers";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { users } from "@/types/models";
import { isSuperuser, isSales } from "@/utils/leadHelpers";

// CREATE
export async function createCustomerAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = validateCustomerFormData(formData, "create");
    if (!validatedData.customer_name) {
      throw new Error("Customer name is required");
    }

    const customer = await createCustomerDb(
      validatedData as CreateCustomerInput
    );

    revalidatePath("/crm/customers");
    return { success: true, message: "Customer created successfully" };
  } catch (error) {
    console.error("Error creating customer:", error);

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Failed to create customer. Please check your input and try again."
    );
  }
}

// UPDATE
export async function updateCustomerAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const id = Number(extractCustomerId(formData));
    const oldCustomer = await getCustomerByIdDb(id);

    const validatedData = validateCustomerFormData(formData, "update");
    const updatedCustomer = await updateCustomerDb(id, validatedData);

    revalidatePath("/crm/customers");
    revalidatePath(`/crm/customers/${id}`);
    return { success: true, message: "Customer updated successfully" };
  } catch (error) {
    console.error("Error updating customer:", error);

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Failed to update customer. Please check your input and try again."
    );
  }
}

// DELETE
export async function deleteCustomerAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  // Hanya superuser yang bisa delete
  if (!isSuperuser(user)) {
    throw new Error("Unauthorized");
  }

  try {
    const id = Number(formData.get("id"));
    if (!id) throw new Error("Customer ID is required");

    await deleteCustomerDb(id);

    revalidatePath("/crm/customers");
    return { success: true, message: "Customer deleted successfully" };
  } catch (error) {
    console.error("Error deleting customer:", error);

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return {
      success: false,
      message: "Failed to delete customer. Please try again.",
    };
  }
}

// GET BY ID
export async function getCustomerByIdAction(id: number) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  return getCustomerByIdDb(id);
}

// GET ALL
export async function getAllCustomersAction() {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    return await getAllCustomersDb();
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
}
