import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Gunakan tipe yang di-generate Prisma langsung
export type CreateProductInput = Prisma.productsCreateInput;
export type UpdateProductInput = Prisma.productsUpdateInput;

// CREATE
export async function createProductDb(input: CreateProductInput) {
  return prisma.products.create({
    data: input,
  });
}

// UPDATE
export async function updateProductDb(id: number, data: UpdateProductInput) {
  return prisma.products.update({
    where: { id },
    data,
  });
}

// DELETE
export async function deleteProductDb(id: number) {
  return prisma.products.delete({
    where: { id },
  });
}

// GET BY ID
export async function getProductByIdDb(id: number) {
  const product = await prisma.products.findUnique({
    where: { id },
  });
  if (!product) throw new Error("Product not found");
  return product;
}

// GET ALL
export async function getAllProductsDb() {
  return prisma.products.findMany({
    orderBy: { created_at: "desc" },
  });
}

// GET BY PRODUCT CODE
export async function getProductByCodeDb(product_code: string) {
  const product = await prisma.products.findUnique({
    where: { product_code },
  });
  if (!product) throw new Error("Product not found");
  return product;
}
