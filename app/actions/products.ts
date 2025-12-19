"use server";

import { revalidatePath } from "next/cache";
import {
  createProductDb,
  updateProductDb,
  deleteProductDb,
  getProductByIdDb,
  getAllProductsDb,
  CreateProductInput,
} from "@/data/products";
import {
  validateProductFormData,
  extractProductId,
} from "@/lib/schemas/products";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { users } from "@/types/models";
import { isSuperuser, isSales } from "@/utils/leadHelpers";

// CREATE
export async function createProductAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = validateProductFormData(formData, "create");
    if (!validatedData.product_code) {
      throw new Error("Product code is required");
    }
    if (!validatedData.name) {
      throw new Error("Product name is required");
    }

    const product = await createProductDb(validatedData as CreateProductInput);

    revalidatePath("/settings/products");
    return { success: true, message: "Product created successfully" };
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Failed to create product. Please check your input and try again."
    );
  }
}

// UPDATE
export async function updateProductAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const id = Number(extractProductId(formData));
    const oldProduct = await getProductByIdDb(id);

    const validatedData = validateProductFormData(formData, "update");
    const updatedProduct = await updateProductDb(id, validatedData);

    revalidatePath("/settings/products");
    revalidatePath(`/settings/products/${id}`);
    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessages}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Failed to update product. Please check your input and try again."
    );
  }
}

// DELETE
export async function deleteProductAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  // Hanya superuser yang bisa delete
  if (!isSuperuser(user)) {
    throw new Error("Unauthorized");
  }

  try {
    const id = Number(formData.get("id"));
    if (!id) throw new Error("Product ID is required");

    await deleteProductDb(id);

    revalidatePath("/settings/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return {
      success: false,
      message: "Failed to delete product. Please try again.",
    };
  }
}

// GET BY ID
export async function getProductByIdAction(id: number) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  return getProductByIdDb(id);
}

// GET ALL
export async function getAllProductsAction() {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    return await getAllProductsDb();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}
