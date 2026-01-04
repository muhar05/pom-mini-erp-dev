"use server";

import { auth } from "@/auth";
import { users } from "@/types/models";
import { isSuperuser, isSales } from "@/utils/leadHelpers";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import {
  CreateSalesOrderInput,
  UpdateSalesOrderInput,
  createSalesOrderDb,
  updateSalesOrderDb,
  deleteSalesOrderDb,
  getSalesOrderByIdDb,
  getAllSalesOrdersDb,
} from "@/data/sales-orders";
import {
  validateSalesOrderFormData,
  CreateSalesOrderData,
  UpdateSalesOrderData,
} from "@/lib/schemas/sales-orders";
import { prisma } from "@/lib/prisma";

// Helper to generate sale order number following pattern: SO2515020001
async function generateSaleOrderNo(): Promise<string> {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2); // 25
  const companyCode = "15"; // You can make this configurable
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 02

  // Get the latest sale order number for this year and month
  const prefix = `SO${year}${companyCode}${month}`;

  const lastSaleOrder = await prisma.sales_orders.findFirst({
    where: {
      sale_no: {
        startsWith: prefix,
      },
    },
    orderBy: {
      sale_no: "desc",
    },
  });

  let sequentialNumber = 1;

  if (lastSaleOrder) {
    // Extract the sequential number from the last sale order
    // Pattern: SO2515020001
    //              ^^^^
    const lastNumber = lastSaleOrder.sale_no.substring(8, 12);
    sequentialNumber = parseInt(lastNumber) + 1;
  }

  const sequence = String(sequentialNumber).padStart(4, "0");

  return `${prefix}${sequence}`;
}

// CREATE
export async function createSalesOrderAction(data: CreateSalesOrderData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = validateSalesOrderFormData(data, "create");

    if (!validatedData.sale_no) {
      validatedData.sale_no = await generateSaleOrderNo();
    }

    // Calculate totals
    const total = validatedData.total || 0;
    const grandTotal =
      total +
      (validatedData.shipping || 0) +
      (validatedData.tax || 0) -
      (validatedData.discount || 0);

    validatedData.total = total;
    validatedData.grand_total = grandTotal;

    const { quotation_id, ...rest } = validatedData;
    const prismaData = {
      ...rest,
      sale_no: validatedData.sale_no,
      quotation_id: quotation_id ? Number(quotation_id) : null,
    } as any;

    const salesOrder = await createSalesOrderDb(prismaData);

    const safeSalesOrder = {
      ...salesOrder,
      id: salesOrder.id.toString(),
      quotation_id: salesOrder.quotation_id?.toString() || null,
      total: salesOrder.total ? Number(salesOrder.total) : 0,
      shipping: salesOrder.shipping ? Number(salesOrder.shipping) : 0,
      discount: salesOrder.discount ? Number(salesOrder.discount) : 0,
      tax: salesOrder.tax ? Number(salesOrder.tax) : 0,
      grand_total: salesOrder.grand_total ? Number(salesOrder.grand_total) : 0,
    };

    revalidatePath("/sales/orders");
    return {
      success: true,
      message: "Sales order created successfully",
      data: safeSalesOrder,
    };
  } catch (error) {
    console.error("Error creating sales order:", error);

    if (error instanceof ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "Failed to create sales order. Please check your input and try again."
    );
  }
}

// UPDATE
export async function updateSalesOrderAction(
  id: string,
  data: UpdateSalesOrderData
) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    // Convert quotation_id from string to BigInt if present
    const { quotation_id, ...rest } = data;
    const prismaData = {
      ...rest,
      quotation_id: quotation_id ? Number(quotation_id) : undefined,
    } as any;

    const updatedSalesOrder = await updateSalesOrderDb(id, prismaData);

    revalidatePath("/sales/orders");
    return {
      success: true,
      message: "Sales order updated successfully",
      data: updatedSalesOrder,
    };
  } catch (error) {
    console.error("Error updating sales order:", error);
    throw error;
  }
}

// DELETE
export async function deleteSalesOrderAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  // Only superuser can delete
  if (!isSuperuser(user)) {
    throw new Error("Unauthorized");
  }

  try {
    const id = formData.get("id")?.toString();
    if (!id) throw new Error("Sales order ID is required");

    await deleteSalesOrderDb(id);

    revalidatePath("/sales/orders");
    return { success: true, message: "Sales order deleted successfully" };
  } catch (error) {
    console.error("Error deleting sales order:", error);

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return {
      success: false,
      message: "Failed to delete sales order. Please try again.",
    };
  }
}

// GET BY ID
export async function getSalesOrderByIdAction(id: string) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  return getSalesOrderByIdDb(id);
}

// GET ALL
export async function getAllSalesOrdersAction() {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    return await getAllSalesOrdersDb();
  } catch (error) {
    console.error("Error fetching sales orders:", error);
    throw new Error("Failed to fetch sales orders");
  }
}

// Generate sales order number without saving
export async function generateSalesOrderNumberAction(): Promise<string> {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    return await generateSaleOrderNo();
  } catch (error) {
    throw new Error("Failed to generate sales order number");
  }
}

// CREATE FROM QUOTATION
export async function createSalesOrderFromQuotationAction(quotationId: number) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    // Get quotation data
    const quotation = await prisma.quotations.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
      },
    });

    if (!quotation) throw new Error("Quotation not found");

    // Create sales order from quotation
    const salesOrderData: CreateSalesOrderData = {
      sale_no: await generateSaleOrderNo(),
      quotation_id: quotationId.toString(),
      total: quotation.total ? Number(quotation.total) : 0,
      shipping: quotation.shipping ? Number(quotation.shipping) : 0,
      discount: quotation.discount ? Number(quotation.discount) : 0,
      tax: quotation.tax ? Number(quotation.tax) : 0,
      grand_total: quotation.grand_total ? Number(quotation.grand_total) : 0,
      status: "DRAFT",
      sale_status: "OPEN",
      payment_status: "UNPAID",
      note: quotation.note || "",
    };

    return await createSalesOrderAction(salesOrderData);
  } catch (error) {
    console.error("Error creating sales order from quotation:", error);
    throw error;
  }
}

// CONVERT QUOTATION TO SALES ORDER
export async function convertQuotationToSalesOrderAction(quotationId: number) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    // 1. Validasi: Pastikan quotation status = approved dan belum dikonversi
    const quotation = await prisma.quotations.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
      },
    });

    if (!quotation) throw new Error("Quotation not found");

    // Validasi status approved
    if (quotation.status !== "sq_approved" && quotation.status !== "approved") {
      throw new Error(
        "Only approved quotations can be converted to sales orders"
      );
    }

    // Validasi belum pernah dikonversi - Check directly in database
    const existingSalesOrder = await prisma.sales_orders.findFirst({
      where: { quotation_id: quotationId },
    });

    if (existingSalesOrder) {
      throw new Error(
        "This quotation has already been converted to a sales order"
      );
    }

    // 2. Generate sale_no otomatis
    const saleNo = await generateSaleOrderNo();

    // 3. Convert Decimal fields to numbers before using them
    const total = quotation.total ? Number(quotation.total) : 0;
    const discount = quotation.discount ? Number(quotation.discount) : 0;
    const shipping = quotation.shipping ? Number(quotation.shipping) : 0;
    const tax = quotation.tax ? Number(quotation.tax) : 0;
    const grand_total = quotation.grand_total
      ? Number(quotation.grand_total)
      : 0;

    // 4. Buat Sales Order
    const salesOrderData = {
      sale_no: saleNo,
      quotation_id: quotationId,
      total: total,
      discount: discount,
      shipping: shipping,
      tax: tax,
      grand_total: grand_total,
      status: "DRAFT",
      sale_status: "OPEN",
      payment_status: "UNPAID",
      note: `Converted from quotation ${quotation.quotation_no}`,
    };

    const salesOrder = await prisma.sales_orders.create({
      data: salesOrderData,
    });

    // 5. Buat Sales Order Detail dari quotation_detail
    const quotationDetails = quotation.quotation_detail as any[];
    if (quotationDetails && Array.isArray(quotationDetails)) {
      const createdDetails = [];
      for (const item of quotationDetails) {
        const createdDetail = await prisma.sale_order_detail.create({
          data: {
            sale_id: salesOrder.id,
            product_id: item.product_id ? BigInt(item.product_id) : null,
            product_name: item.product_name,
            price: Number(item.unit_price || item.price || 0), // Convert to Number
            qty: Number(item.quantity || item.qty || 0), // Convert to Number
            total: Number(
              (item.unit_price || item.price || 0) *
                (item.quantity || item.qty || 0)
            ), // Calculate and convert
            status: "ACTIVE",
          },
        });

        // Convert BigInt and Decimal for safe return
        createdDetails.push({
          ...createdDetail,
          id: createdDetail.id.toString(),
          sale_id: createdDetail.sale_id.toString(),
          product_id: createdDetail.product_id
            ? createdDetail.product_id.toString()
            : null,
          price: createdDetail.price ? Number(createdDetail.price) : 0,
          qty: Number(createdDetail.qty),
          total: createdDetail.total ? Number(createdDetail.total) : 0,
        });
      }
    }

    // 6. Lock Quotation - Update status menjadi CONVERTED
    await prisma.quotations.update({
      where: { id: quotationId },
      data: {
        status: "sq_converted",
        stage: "closed",
        updated_at: new Date(),
      },
    });

    // 7. Audit dan log aktivitas user
    await prisma.user_logs.create({
      data: {
        user_id: typeof user.id === "string" ? parseInt(user.id) : user.id,
        activity: `Converted quotation ${quotation.quotation_no} to sales order ${saleNo}`,
        method: "POST",
        endpoint: "/actions/convert-quotation-to-sales-order",
        old_data: {
          quotation_id: quotationId,
          quotation_no: quotation.quotation_no,
          status: quotation.status,
        },
        new_data: {
          sales_order_id: salesOrder.id.toString(),
          sale_no: saleNo,
          status: "DRAFT",
          sale_status: "OPEN",
        },
      },
    });

    // 8. Convert all BigInt and Decimal fields to safe types for client
    const safeSalesOrder = {
      id: salesOrder.id.toString(),
      sale_no: salesOrder.sale_no,
      quotation_id: salesOrder.quotation_id?.toString() || null,
      total: Number(salesOrder.total),
      shipping: Number(salesOrder.shipping),
      discount: Number(salesOrder.discount),
      tax: Number(salesOrder.tax),
      grand_total: Number(salesOrder.grand_total),
      status: salesOrder.status,
      sale_status: salesOrder.sale_status,
      payment_status: salesOrder.payment_status,
      note: salesOrder.note,
      created_at: salesOrder.created_at?.toISOString(),
    };

    revalidatePath("/crm/quotations");
    revalidatePath("/crm/sales-orders");

    return {
      success: true,
      message: `Quotation ${quotation.quotation_no} successfully converted to Sales Order ${saleNo}`,
      data: {
        sales_order_id: safeSalesOrder.id,
        sale_no: saleNo,
        quotation_no: quotation.quotation_no,
        sales_order: safeSalesOrder,
      },
    };
  } catch (error) {
    console.error("Error converting quotation to sales order:", error);
    throw error;
  }
}
