import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { isSuperuser, isManagerSales, isSales } from "@/utils/userHelpers";

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
  mode: "create" | "update",
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
              key,
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

// Helper to convert company_level Decimal fields
const convertCompanyLevel = (companyLevel: any) => {
  if (!companyLevel) return null;
  return {
    id_level: companyLevel.id_level,
    level_name: companyLevel.level_name,
    disc1: companyLevel.disc1 ? Number(companyLevel.disc1) : 0,
    disc2: companyLevel.disc2 ? Number(companyLevel.disc2) : 0,
  };
};

// Helper to convert company with company_level
const convertCompany = (company: any) => {
  if (!company) return null;
  return {
    id: company.id,
    company_name: company.company_name,
    address: company.address,
    npwp: company.npwp,
    id_level: company.id_level,
    note: company.note,
    created_at: company.created_at,
    company_level: convertCompanyLevel(company.company_level),
  };
};

// Helper to convert customer with company
const convertCustomer = (customer: any) => {
  if (!customer) return null;
  return {
    id: customer.id,
    customer_name: customer.customer_name,
    address: customer.address,
    phone: customer.phone,
    email: customer.email,
    type: customer.type,
    company_id: customer.company_id,
    note: customer.note,
    created_at: customer.created_at,
    company: convertCompany(customer.company),
  };
};

// Gunakan tipe yang di-generate Prisma langsung
export type CreateSalesOrderInput = Prisma.sales_ordersCreateInput;
export type UpdateSalesOrderInput = Prisma.sales_ordersUpdateInput;

// CREATE
export async function createSalesOrderDb(input: CreateSalesOrderInput) {
  const salesOrder = await prisma.sales_orders.create({
    data: input,
    include: {
      quotation: {
        include: {
          customer: {
            include: { company: { include: { company_level: true } } },
          },
        },
      },
      customers: { include: { company: { include: { company_level: true } } } }, // <-- Tambahkan ini!
      sale_order_detail: true,
      user: true,
      payment_term: true,
    },
  });

  return {
    id: salesOrder.id.toString(),
    sale_no: salesOrder.sale_no,
    quotation_id: salesOrder.quotation_id ? Number(salesOrder.quotation_id) : null,
    customer_id: salesOrder.customer_id ? Number(salesOrder.customer_id) : null,
    payment_term_id: salesOrder.payment_term_id,
    payment_term: salesOrder.payment_term,
    user_id: salesOrder.user_id,
    total: salesOrder.total ? Number(salesOrder.total) : 0,
    discount: salesOrder.discount ? Number(salesOrder.discount) : 0,
    shipping: salesOrder.shipping ? Number(salesOrder.shipping) : 0,
    tax: salesOrder.tax ? Number(salesOrder.tax) : 0,
    grand_total: salesOrder.grand_total ? Number(salesOrder.grand_total) : 0,
    status: salesOrder.status,
    note: salesOrder.note,
    sale_status: salesOrder.sale_status,
    payment_status: salesOrder.payment_status,
    file_po_customer: salesOrder.file_po_customer,
    created_at: salesOrder.created_at,
    customers: convertCustomer(salesOrder.customers),
    quotation: salesOrder.quotation
      ? {
        ...salesOrder.quotation,
        total: salesOrder.quotation.total ? Number(salesOrder.quotation.total) : 0,
        discount: salesOrder.quotation.discount ? Number(salesOrder.quotation.discount) : 0,
        shipping: salesOrder.quotation.shipping ? Number(salesOrder.quotation.shipping) : 0,
        tax: salesOrder.quotation.tax ? Number(salesOrder.quotation.tax) : 0,
        grand_total: salesOrder.quotation.grand_total ? Number(salesOrder.quotation.grand_total) : 0,
        customer: convertCustomer(salesOrder.quotation.customer),
      }
      : null,
    sale_order_detail: salesOrder.sale_order_detail,
    user: salesOrder.user,
  };
}

// UPDATE
export async function updateSalesOrderDb(
  id: string,
  data: UpdateSalesOrderInput,
) {
  const salesOrder = await prisma.sales_orders.update({
    where: { id: BigInt(id) },
    data,
    include: {
      quotation: {
        include: {
          customer: {
            include: { company: { include: { company_level: true } } },
          },
        },
      },
      customers: { include: { company: { include: { company_level: true } } } }, // <-- Tambahkan ini!
      sale_order_detail: true,
      user: true,
      payment_term: true,
    },
  });

  return {
    id: salesOrder.id.toString(),
    sale_no: salesOrder.sale_no,
    quotation_id: salesOrder.quotation_id ? Number(salesOrder.quotation_id) : null,
    customer_id: salesOrder.customer_id ? Number(salesOrder.customer_id) : null,
    payment_term_id: salesOrder.payment_term_id,
    payment_term: salesOrder.payment_term,
    user_id: salesOrder.user_id,
    total: salesOrder.total ? Number(salesOrder.total) : 0,
    discount: salesOrder.discount ? Number(salesOrder.discount) : 0,
    shipping: salesOrder.shipping ? Number(salesOrder.shipping) : 0,
    tax: salesOrder.tax ? Number(salesOrder.tax) : 0,
    grand_total: salesOrder.grand_total ? Number(salesOrder.grand_total) : 0,
    status: salesOrder.status,
    note: salesOrder.note,
    sale_status: salesOrder.sale_status,
    payment_status: salesOrder.payment_status,
    file_po_customer: salesOrder.file_po_customer,
    created_at: salesOrder.created_at,
    customers: convertCustomer(salesOrder.customers),
    quotation: salesOrder.quotation
      ? {
        ...salesOrder.quotation,
        total: salesOrder.quotation.total ? Number(salesOrder.quotation.total) : 0,
        discount: salesOrder.quotation.discount ? Number(salesOrder.quotation.discount) : 0,
        shipping: salesOrder.quotation.shipping ? Number(salesOrder.quotation.shipping) : 0,
        tax: salesOrder.quotation.tax ? Number(salesOrder.quotation.tax) : 0,
        grand_total: salesOrder.quotation.grand_total ? Number(salesOrder.quotation.grand_total) : 0,
        customer: convertCustomer(salesOrder.quotation.customer),
      }
      : null,
    sale_order_detail: salesOrder.sale_order_detail,
    user: salesOrder.user,
  };
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
      sale_order_detail: true,
      customers: { include: { company: { include: { company_level: true } } } }, // <-- Tambahkan ini!
      quotation: {
        include: {
          customer: {
            include: { company: { include: { company_level: true } } },
          },
        },
      },
      user: true,
      payment_term: true,
    },
  });
  if (!salesOrder) throw new Error("Sales order not found");

  // Convert quotation - tanpa spread operator
  const safeQuotation = salesOrder.quotation
    ? {
      id: salesOrder.quotation.id,
      quotation_no: salesOrder.quotation.quotation_no,
      customer_id: salesOrder.quotation.customer_id
        ? Number(salesOrder.quotation.customer_id)
        : null,
      user_id: salesOrder.quotation.user_id,
      lead_id: salesOrder.quotation.lead_id,
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
      status: salesOrder.quotation.status,
      note: salesOrder.quotation.note,
      target_date: salesOrder.quotation.target_date,
      created_at: salesOrder.quotation.created_at,
      updated_at: salesOrder.quotation.updated_at,
      customer: convertCustomer(salesOrder.quotation.customer),
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
          }),
        )
        : [],
    }
    : null;

  // Convert sale order details
  const safeSaleOrderDetails = salesOrder.sale_order_detail
    ? salesOrder.sale_order_detail.map((detail) => ({
      id: detail.id.toString(),
      sale_id: detail.sale_id.toString(),
      product_id: detail.product_id ? detail.product_id.toString() : null,
      product_name: detail.product_name,
      price: Number(detail.price),
      qty: Number(detail.qty),
      total: detail.total ? Number(detail.total) : 0,
      status: detail.status,
    }))
    : [];

  const safeUser = salesOrder.user
    ? {
      id: salesOrder.user.id,
      name: salesOrder.user.name,
      email: salesOrder.user.email,
      role_id: salesOrder.user.role_id,
      created_at: salesOrder.user.created_at,
    }
    : null;

  // Return clean object tanpa spread
  return {
    id: salesOrder.id.toString(),
    sale_no: salesOrder.sale_no,
    quotation_id: salesOrder.quotation_id
      ? Number(salesOrder.quotation_id)
      : null,
    customer_id: salesOrder.customer_id ? Number(salesOrder.customer_id) : null,
    user_id: salesOrder.user_id,
    total: salesOrder.total ? Number(salesOrder.total) : 0,
    discount: salesOrder.discount ? Number(salesOrder.discount) : 0,
    shipping: salesOrder.shipping ? Number(salesOrder.shipping) : 0,
    tax: salesOrder.tax ? Number(salesOrder.tax) : 0,
    grand_total: salesOrder.grand_total ? Number(salesOrder.grand_total) : 0,
    status: salesOrder.status,
    note: salesOrder.note,
    sale_status: salesOrder.sale_status,
    payment_status: salesOrder.payment_status,
    file_po_customer: salesOrder.file_po_customer,
    created_at: salesOrder.created_at,
    quotation: safeQuotation,
    customers: convertCustomer(salesOrder.customers),
    sale_order_detail: safeSaleOrderDetails,
    user: safeUser,
    payment_term_id: salesOrder.payment_term_id,
    payment_term: salesOrder.payment_term,
  };
}

// GET ALL
export async function getAllSalesOrdersDb(user?: any) {
  if (!user) throw new Error("Unauthorized");

  const userId = typeof user.id === "string" ? Number(user.id) : user.id;
  const isManager = isSuperuser(user) || isManagerSales(user);

  let where: any = undefined;

  if (!isManager && isSales(user)) {
    where = { user_id: userId };
  } else if (!isManager) {
    throw new Error("Forbidden access");
  }

  const salesOrders = await prisma.sales_orders.findMany({
    orderBy: { created_at: "desc" },
    where,
    include: {
      quotation: {
        include: {
          customer: {
            include: { company: { include: { company_level: true } } },
          },
        },
      },
      customers: { include: { company: { include: { company_level: true } } } }, // <-- Tambahkan ini!
      sale_order_detail: true,
      payment_term: true,
    },
  });

  return salesOrders.map((so) => ({
    ...so,
    id: so.id.toString(),
    quotation_id: so.quotation_id ? so.quotation_id.toString() : null,
    customer_id: so.customer_id ? so.customer_id.toString() : null,
    payment_term_id: so.payment_term_id,
    payment_term: so.payment_term,
    total: so.total ? Number(so.total) : 0,
    discount: so.discount ? Number(so.discount) : 0,
    shipping: so.shipping ? Number(so.shipping) : 0,
    tax: so.tax ? Number(so.tax) : 0,
    grand_total: so.grand_total ? Number(so.grand_total) : 0,
    quotation: so.quotation
      ? {
        ...so.quotation,
        customer: convertCustomer(so.quotation.customer),
      }
      : null,
    customers: convertCustomer(so.customers),
    sale_order_detail: so.sale_order_detail
      ? so.sale_order_detail.map((detail) => ({
        id: detail.id.toString(),
        sale_id: detail.sale_id.toString(),
        product_id: detail.product_id ? detail.product_id.toString() : null,
        product_name: detail.product_name,
        price: Number(detail.price), // Convert Decimal to number
        qty: Number(detail.qty), // Ensure qty is number
        total: detail.total ? Number(detail.total) : 0, // Convert Decimal to number
        status: detail.status,
      }))
      : [],
  }));
}

// ADD new function for checking conversion
export async function checkQuotationConversionDb(quotationId: number) {
  const existingSO = await prisma.sales_orders.findFirst({
    where: { quotation_id: quotationId },
  });
  return !!existingSO;
}
