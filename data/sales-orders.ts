import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Base field schemas
const saleNoSchema = z
  .string()
  .min(1, "Sale number is required")
  .max(50, "Sale number must be less than 50 characters")
  .trim();

const quotationIdSchema = z.string().optional(); // BigInt as string

// Sale order detail item schema
const saleOrderDetailItemSchema = z.object({
  product_id: z.string().optional(), // BigInt as string
  product_name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  qty: z.number().int().min(1, "Quantity must be at least 1"),
  total: z.number().min(0).optional(),
  status: z.string().optional().default("ACTIVE"),
});

const statusSchema = z
  .string()
  .max(30, "Status must be less than 30 characters")
  .optional()
  .default("DRAFT");

const saleStatusSchema = z
  .string()
  .max(30, "Sale status must be less than 30 characters")
  .optional()
  .default("OPEN");

const paymentStatusSchema = z
  .string()
  .max(30, "Payment status must be less than 30 characters")
  .optional()
  .default("UNPAID");

// Main sales order schema for CREATE
export const createSalesOrderSchema = z.object({
  sale_no: saleNoSchema,
  quotation_id: quotationIdSchema,
  total: z.number().min(0).optional().default(0),
  discount: z.number().min(0).optional().default(0),
  shipping: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
  grand_total: z.number().min(0).optional().default(0),
  status: statusSchema,
  note: z
    .string()
    .max(1000, "Note must be less than 1000 characters")
    .optional(),
  sale_status: saleStatusSchema,
  payment_status: paymentStatusSchema,
  file_po_customer: z.string().optional(),
});

// Schema untuk update (all fields optional except required validations)
export const updateSalesOrderSchema = z.object({
  sale_no: z.string().max(50).trim().optional(),
  quotation_id: z.string().optional(),
  total: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  grand_total: z.number().min(0).optional(),
  status: z.string().max(30).optional(),
  note: z.string().max(1000).optional(),
  sale_status: z.string().max(30).optional(),
  payment_status: z.string().max(30).optional(),
  file_po_customer: z.string().optional(),
});

// Export base schema
export const salesOrderSchema = createSalesOrderSchema;

// Type definitions
export type CreateSalesOrderData = z.infer<typeof createSalesOrderSchema>;
export type UpdateSalesOrderData = z.infer<typeof updateSalesOrderSchema>;
export type SaleOrderDetailItem = z.infer<typeof saleOrderDetailItemSchema>;

// Helper function untuk validasi FormData atau object
export function validateSalesOrderFormData(
  formData: FormData | Record<string, any>,
  mode: "create" | "update"
) {
  let data: Record<string, any> = {};

  if (typeof FormData !== "undefined" && formData instanceof FormData) {
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue === "") {
          data[key] = undefined;
        } else {
          // Handle numeric fields
          if (
            ["total", "shipping", "discount", "tax", "grand_total"].includes(
              key
            )
          ) {
            const numValue = Number(trimmedValue);
            data[key] = isNaN(numValue) ? undefined : numValue;
          } else {
            data[key] = trimmedValue;
          }
        }
      } else {
        data[key] = value;
      }
    }
  } else {
    // Assume it's a plain object
    data = { ...formData };
  }

  // Validate based on mode
  if (mode === "create") {
    return createSalesOrderSchema.parse(data);
  } else {
    return updateSalesOrderSchema.parse(data);
  }
}

// Extract ID from FormData
export function extractSalesOrderId(formData: FormData): string {
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    throw new Error("Sales order ID is required for update");
  }

  return id;
}

// Gunakan tipe yang di-generate Prisma langsung
export type CreateSalesOrderInput = Prisma.sales_ordersCreateInput;
export type UpdateSalesOrderInput = Prisma.sales_ordersUpdateInput;

// CREATE
export async function createSalesOrderDb(input: CreateSalesOrderInput) {
  return prisma.sales_orders.create({
    data: input,
  });
}

// UPDATE
export async function updateSalesOrderDb(
  id: string,
  data: UpdateSalesOrderInput
) {
  return prisma.sales_orders.update({
    where: { id: BigInt(id) },
    data,
  });
}

// DELETE
export async function deleteSalesOrderDb(id: string) {
  return prisma.sales_orders.delete({
    where: { id: BigInt(id) },
  });
}

// GET BY ID
export async function getSalesOrderByIdDb(id: string) {
  const salesOrder = await prisma.sales_orders.findUnique({
    where: { id: BigInt(id) },
    include: {
      quotation: {
        include: { customer: true },
      },
    },
  });
  if (!salesOrder) throw new Error("Sales order not found");

  const saleOrderDetails = await prisma.sale_order_detail.findMany({
    where: { sale_id: salesOrder.id },
  });

  // Convert Decimal and BigInt fields to safe types for client
  const safeSalesOrder = {
    ...salesOrder,
    id: salesOrder.id.toString(),
    quotation_id: salesOrder.quotation_id
      ? Number(salesOrder.quotation_id)
      : null,
    total: salesOrder.total ? Number(salesOrder.total) : 0,
    discount: salesOrder.discount ? Number(salesOrder.discount) : 0,
    shipping: salesOrder.shipping ? Number(salesOrder.shipping) : 0,
    tax: salesOrder.tax ? Number(salesOrder.tax) : 0,
    grand_total: salesOrder.grand_total ? Number(salesOrder.grand_total) : 0,
  };

  // Convert quotation and customer data if exists
  const safeQuotation = salesOrder.quotation
    ? {
        ...salesOrder.quotation,
        id: salesOrder.quotation.id,
        customer_id: salesOrder.quotation.customer_id
          ? Number(salesOrder.quotation.customer_id)
          : null,
        total: salesOrder.quotation.total
          ? Number(salesOrder.quotation.total)
          : 0,
        discount: salesOrder.quotation.discount
          ? Number(salesOrder.quotation.discount)
          : 0,
        shipping: salesOrder.quotation.shipping
          ? Number(salesOrder.quotation.shipping)
          : 0,
        tax: salesOrder.quotation.tax ? Number(salesOrder.quotation.tax) : 0,
        grand_total: salesOrder.quotation.grand_total
          ? Number(salesOrder.quotation.grand_total)
          : 0,
        top: salesOrder.quotation.top ? Number(salesOrder.quotation.top) : 0,
        customer: salesOrder.quotation.customer,
        quotation_detail: salesOrder.quotation.quotation_detail
          ? (salesOrder.quotation.quotation_detail as any[]).map(
              (item: any) => ({
                ...item,
                product_id: item.product_id ? Number(item.product_id) : null,
                unit_price: item.unit_price ? Number(item.unit_price) : 0,
                price: item.price ? Number(item.price) : 0,
                quantity: item.quantity ? Number(item.quantity) : 0,
                qty: item.qty ? Number(item.qty) : 0,
                total: item.total ? Number(item.total) : 0,
              })
            )
          : [],
      }
    : null;

  // Convert sale order details
  const safeSaleOrderDetails = saleOrderDetails.map((detail) => ({
    ...detail,
    id: detail.id.toString(),
    sale_id: detail.sale_id.toString(),
    product_id: detail.product_id ? detail.product_id.toString() : null,
    price: Number(detail.price),
    total: detail.total ? Number(detail.total) : null,
  }));

  return {
    ...safeSalesOrder,
    quotation: safeQuotation,
    sale_order_detail: safeSaleOrderDetails,
  };
}

// GET ALL
export async function getAllSalesOrdersDb() {
  return prisma.sales_orders.findMany({
    include: {
      quotation: {
        include: { customer: true },
      },
      sale_order_detail: true,
    },
    orderBy: { created_at: "desc" },
  });
}

// ADD new function for checking conversion
export async function checkQuotationConversionDb(quotationId: number) {
  const existingSalesOrder = await prisma.sales_orders.findFirst({
    where: { quotation_id: quotationId },
  });
  return !!existingSalesOrder;
}
