"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { users } from "@/types/models";
import { getSalesOrderPermissions } from "@/utils/salesOrderPermissions";
import { isSuperuser, isManagerSales, isSales } from "@/utils/userHelpers";
import {
  CreateSalesOrderData,
  UpdateSalesOrderData,
  SaleOrderDetailItem,
  validateSalesOrderFormData,
} from "@/lib/schemas/sales-orders";
import {
  createSalesOrderDb,
  updateSalesOrderDb,
  deleteSalesOrderDb,
  getSalesOrderByIdDb,
  getAllSalesOrdersDb,
} from "@/data/sales-orders";
import { checkSalesOrderOwnership, checkQuotationOwnership } from "@/utils/auth-utils";
import { ZodError } from "zod";

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

// Robust recursive conversion to ensure NO Decimals or BigInts reach the client
function safeSalesOrder(result: any): any {
  // Ensure no Decimal objects are passed to Client Components
  const toNum = (val: any) => {
    if (val == null) return 0;
    if (typeof val === "number") return val;
    if (typeof val === "string") return parseFloat(val) || 0;
    if (typeof val.toNumber === "function") return val.toNumber();
    if (typeof val.toString === "function") return parseFloat(val.toString()) || 0;
    return 0;
  };

  const toStr = (val: any) => (val != null ? val.toString() : "");

  const convertCompanyLevel = (cl: any) => {
    if (!cl) return null;
    return {
      id_level: cl.id_level,
      level_name: cl.level_name,
      disc1: toNum(cl.disc1),
      disc2: toNum(cl.disc2),
    };
  };

  const convertCompany = (c: any) => {
    if (!c) return null;
    return {
      id: c.id,
      company_name: c.company_name,
      address: c.address,
      npwp: c.npwp,
      id_level: c.id_level,
      note: c.note,
      created_at: c.created_at,
      company_level: convertCompanyLevel(c.company_level),
    };
  };

  const convertCustomer = (cust: any) => {
    if (!cust) return null;
    return {
      id: cust.id,
      customer_name: cust.customer_name,
      address: cust.address,
      phone: cust.phone,
      email: cust.email,
      type: cust.type,
      company_id: cust.company_id,
      note: cust.note,
      created_at: cust.created_at,
      company: convertCompany(cust.company),
    };
  };

  const convertQuotation = (q: any) => {
    if (!q) return null;
    return {
      id: q.id,
      quotation_no: q.quotation_no,
      customer_id: q.customer_id,
      user_id: q.user_id,
      lead_id: q.lead_id,
      total: toNum(q.total),
      discount: toNum(q.discount),
      shipping: toNum(q.shipping),
      tax: toNum(q.tax),
      grand_total: toNum(q.grand_total),
      status: q.status,
      note: q.note,
      target_date: q.target_date,
      created_at: q.created_at,
      customer: convertCustomer(q.customer),
    };
  };

  // Build clean object without spreading the original 'result' to avoid proxy/hidden field leaks
  return {
    id: toStr(result.id),
    sale_no: result.sale_no,
    quotation_id: toStr(result.quotation_id),
    customer_id: toStr(result.customer_id),
    user_id: result.user_id,
    total: toNum(result.total),
    discount: toNum(result.discount),
    shipping: toNum(result.shipping),
    tax: toNum(result.tax),
    grand_total: toNum(result.grand_total),
    status: result.status,
    note: result.note,
    sale_status: result.sale_status,
    payment_status: result.payment_status,
    file_po_customer: result.file_po_customer,
    created_at: result.created_at,
    sale_order_detail: (result.sale_order_detail || []).map((detail: any) => ({
      id: toStr(detail.id),
      sale_id: toStr(detail.sale_id),
      product_id: toStr(detail.product_id),
      product_name: detail.product_name,
      price: toNum(detail.price),
      qty: toNum(detail.qty),
      total: toNum(detail.total),
      status: detail.status,
    })),
    quotation: convertQuotation(result.quotation),
    customers: convertCustomer(result.customers),
    user: result.user ? {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role_id: result.user.role_id,
    } : null,
    payment_term_id: result.payment_term_id,
    payment_term: result.payment_term,
  };
}

// CREATE
export async function createSalesOrderAction(data: CreateSalesOrderData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  // Only Sales and Superuser can create
  if (isManagerSales(user) && !isSuperuser(user)) {
    throw new Error("Managers cannot create Sales Orders directly");
  }

  try {
    const validatedData = validateSalesOrderFormData(data, "create");

    if (!validatedData.sale_no) {
      validatedData.sale_no = await generateSaleOrderNo();
    }

    const { quotation_id, customer_id, boq_items, ...rest } = validatedData;

    // Validate quotation ownership if provided
    if (quotation_id) {
      const quotation = await prisma.quotations.findUnique({
        where: { id: Number(quotation_id) },
      });
      if (!quotation) throw new Error("Quotation not found");
      checkQuotationOwnership(quotation, user);
    }

    const prismaData = {
      ...rest,
      sale_no: validatedData.sale_no,
      quotation_id: quotation_id ? Number(quotation_id) : null,
      customer_id: customer_id ? Number(customer_id) : null,
      user_id: user.id ? Number(user.id) : null,
    } as any;

    // Create sales order first
    const salesOrder = await createSalesOrderDb(prismaData);

    // Create sale order details if BOQ items exist
    if (boq_items && boq_items.length > 0) {
      const saleOrderDetails = boq_items.map((item: SaleOrderDetailItem) => ({
        sale_id: BigInt(salesOrder.id),
        product_id: item.product_id ? BigInt(item.product_id) : null,
        product_name: item.product_name,
        price: item.price,
        qty: item.qty,
        // Remove total field - let database calculate it automatically
        status: item.status || "ACTIVE",
      }));

      await prisma.sale_order_detail.createMany({
        data: saleOrderDetails,
      });
    }

    revalidatePath("/sales/sales-orders");
    return {
      success: true,
      message: "Sales order created successfully",
      data: safeSalesOrder(salesOrder),
    };
  } catch (error) {
    console.error("Error creating sales order:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.errors,
      };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// UPDATE
export async function updateSalesOrderAction(
  id: string,
  data: UpdateSalesOrderData,
) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = validateSalesOrderFormData(data, "update");

    const currentSO = await getSalesOrderByIdDb(id);

    // Ownership check
    checkSalesOrderOwnership(currentSO, user);

    // Manager Role Constraint: Cannot edit detail if manager
    if (isManagerSales(user) && !isSuperuser(user)) {
      throw new Error("Manager Sales cannot edit Sales Order details");
    }

    const { quotation_id, customer_id, boq_items, ...rest } = validatedData;
    const prismaData = {
      ...rest,
      quotation_id: quotation_id ? Number(quotation_id) : undefined,
      customer_id: customer_id ? Number(customer_id) : undefined,
    } as any;

    // Remove undefined values
    Object.keys(prismaData).forEach((key) => {
      if (prismaData[key] === undefined) {
        delete prismaData[key];
      }
    });

    // Update sales order
    const salesOrder = await updateSalesOrderDb(id, prismaData);

    // Update sale order details if BOQ items are provided
    if (boq_items !== undefined) {
      // Delete existing details
      await prisma.sale_order_detail.deleteMany({
        where: { sale_id: BigInt(id) },
      });

      // Create new details if items exist
      if (boq_items.length > 0) {
        const saleOrderDetails = boq_items.map((item: SaleOrderDetailItem) => ({
          sale_id: BigInt(id),
          product_id: item.product_id ? BigInt(item.product_id) : null,
          product_name: item.product_name,
          price: item.price,
          qty: item.qty,
          // Remove total field - let database calculate it automatically
          status: item.status || "ACTIVE",
        }));

        await prisma.sale_order_detail.createMany({
          data: saleOrderDetails,
        });
      }
    }

    revalidatePath("/sales/sales-orders");
    return {
      success: true,
      message: "Sales order updated successfully",
      data: safeSalesOrder(salesOrder),
    };
  } catch (error) {
    console.error("Error updating sales order:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.errors,
      };
    }

    if (error instanceof Error) {
      return { success: false, message: error.message };
    }

    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

// DELETE
export async function deleteSalesOrderAction(formData: FormData) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  // Only superuser can delete
  // if (!isSuperuser(user)) {
  //   throw new Error("Only superuser can delete sales orders");
  // }

  try {
    const id = formData.get("id") as string;
    if (!id) throw new Error("Sales order ID is required");

    const currentSO = await getSalesOrderByIdDb(id);

    // Ownership check
    checkSalesOrderOwnership(currentSO, user);

    // Delete sale order details first (if needed, though CASCADE should handle it)
    await prisma.sale_order_detail.deleteMany({
      where: { sale_id: BigInt(id) },
    });

    // Delete the sales order
    await deleteSalesOrderDb(id);

    revalidatePath("/sales/sales-orders");
    return {
      success: true,
      message: "Sales order deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting sales order:", error);
    return {
      success: false,
      message: "Failed to delete sales order",
    };
  }
}

// GET BY ID
export async function getSalesOrderByIdAction(id: string) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  const salesOrder = await getSalesOrderByIdDb(id);

  // Ownership check
  checkSalesOrderOwnership(salesOrder, user);

  return safeSalesOrder(salesOrder);
}

// GET ALL
export async function getAllSalesOrdersAction() {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const salesOrders = await getAllSalesOrdersDb(user);
    return salesOrders.map((so: any) => safeSalesOrder(so));
  } catch (error) {
    console.error("Error fetching sales orders:", error);
    throw error;
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
    console.error("Error generating sales order number:", error);
    throw error;
  }
}

// CREATE FROM QUOTATION (existing functionality preserved)
export async function createSalesOrderFromQuotationAction(quotationId: number) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    // Get quotation data
    const quotation = await prisma.quotations.findUnique({
      where: { id: quotationId },
      include: { customer: true },
    });

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    // Parse quotation detail to create BOQ items
    let boqItems: SaleOrderDetailItem[] = [];

    if (quotation.quotation_detail) {
      try {
        const quotationDetail = Array.isArray(quotation.quotation_detail)
          ? quotation.quotation_detail
          : JSON.parse(quotation.quotation_detail as string);

        boqItems = quotationDetail.map((item: any) => ({
          product_id: item.product_id || null,
          product_name: item.product_name || item.name || "",
          product_code: item.product_code || "",
          price: Number(item.unit_price || item.price || 0),
          qty: Number(item.quantity || item.qty || 1),
          total: Number(
            item.total ||
            (item.unit_price || item.price || 0) *
            (item.quantity || item.qty || 1),
          ),
          status: "ACTIVE",
        }));
      } catch (error) {
        console.warn("Failed to parse quotation detail:", error);
        boqItems = [];
      }
    }

    // Create sales order from quotation
    const salesOrderData: CreateSalesOrderData = {
      sale_no: await generateSaleOrderNo(),
      quotation_id: quotationId.toString(),
      total: Number(quotation.total || 0),
      discount: Number(quotation.discount || 0),
      shipping: Number(quotation.shipping || 0),
      tax: Number(quotation.tax || 0),
      grand_total: Number(quotation.grand_total || 0),
      status: "DRAFT",
      sale_status: "OPEN",
      payment_status: "UNPAID",
      note: quotation.note || "",
      boq_items: boqItems, // Add BOQ items from quotation
    };

    return await createSalesOrderAction(salesOrderData);
  } catch (error) {
    console.error("Error creating sales order from quotation:", error);
    throw error;
  }
}

// CONFIRM SALES ORDER - New action
export async function confirmSalesOrderAction(id: string) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    // Get current sales order
    const currentSO = await getSalesOrderByIdDb(id);

    // Validate current status
    if (currentSO.sale_status !== "OPEN") {
      throw new Error("Only OPEN sales orders can be confirmed");
    }

    // Check permissions
    const permissions = getSalesOrderPermissions(currentSO, user);
    if (!permissions.canConfirm) {
      throw new Error("You don't have permission to confirm this sales order");
    }

    // Update status to CONFIRMED
    const updatedSO = await updateSalesOrderDb(id, {
      sale_status: "CONFIRMED",
      status: "ACTIVE", // Also update general status
    });

    // Trigger automatic stock check and reservation
    await handlePostConfirmationProcess(updatedSO);

    // Log activity
    await prisma.user_logs.create({
      data: {
        user_id: typeof user.id === "string" ? parseInt(user.id) : user.id,
        activity: `Confirmed sales order ${currentSO.sale_no}`,
        method: "PUT",
        endpoint: "/actions/confirm-sales-order",
        old_data: { sale_status: currentSO.sale_status },
        new_data: { sale_status: "CONFIRMED" },
      },
    });

    revalidatePath("/sales/orders");
    return {
      success: true,
      message: "Sales order confirmed successfully",
      data: {
        ...updatedSO,
        id: updatedSO.id.toString(),
        quotation_id: updatedSO.quotation_id?.toString() || null,
        total: updatedSO.total ? Number(updatedSO.total) : 0,
        shipping: updatedSO.shipping ? Number(updatedSO.shipping) : 0,
        discount: updatedSO.discount ? Number(updatedSO.discount) : 0,
        tax: updatedSO.tax ? Number(updatedSO.tax) : 0,
        grand_total: updatedSO.grand_total ? Number(updatedSO.grand_total) : 0,
      },
    };
  } catch (error) {
    console.error("Error confirming sales order:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to confirm sales order");
  }
}

// Handle post-confirmation automatic processes
async function handlePostConfirmationProcess(salesOrder: any) {
  try {
    // 1. Check stock availability for all items
    const orderDetails = await prisma.sale_order_detail.findMany({
      where: { sale_id: BigInt(salesOrder.id) },
    });

    for (const detail of orderDetails) {
      if (detail.product_id) {
        const product = await prisma.products.findUnique({
          where: { id: Number(detail.product_id) }, // Convert BigInt to number
        });

        if (product && (product.stock ?? 0) >= detail.qty) {
          // Stock sufficient - create stock reservation
          await prisma.stock_reservations.create({
            data: {
              item_detail: {
                product_id: detail.product_id.toString(),
                product_name: detail.product_name,
                qty: detail.qty,
              },
              lead_id: BigInt(salesOrder.id),
              type: "SALES_ORDER",
              status: "RESERVED",
              created_at: new Date(),
            },
          });

          // Reduce available stock
          await prisma.products.update({
            where: { id: Number(detail.product_id) }, // Convert BigInt to number
            data: { stock: (product.stock ?? 0) - detail.qty },
          });
        } else {
          // Stock insufficient - create draft purchase order
          const existingPO = await prisma.purchase_orders.findFirst({
            where: {
              supplier_so: salesOrder.id.toString(),
              status: "DRAFT",
            },
          });

          if (!existingPO) {
            const poNo = await generatePurchaseOrderNumber();
            await prisma.purchase_orders.create({
              data: {
                po_no: poNo,
                po_detail_items: [
                  {
                    product_id: detail.product_id.toString(),
                    product_name: detail.product_name,
                    qty: detail.qty,
                    price: detail.price,
                  },
                ],
                status: "DRAFT",
                total: detail.total || 0,
                supplier_so: salesOrder.id.toString(),
                created_at: new Date(),
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in post-confirmation process:", error);
    // Don't throw error here as confirmation was successful
    // Just log the issue for manual handling
  }
}

// Helper to generate PO number (implement based on your pattern)
async function generatePurchaseOrderNumber(): Promise<string> {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const prefix = `PO${year}${month}`;

  const lastPO = await prisma.purchase_orders.findFirst({
    where: { po_no: { startsWith: prefix } },
    orderBy: { po_no: "desc" },
  });

  let sequence = 1;
  if (lastPO) {
    const lastNumber = lastPO.po_no.substring(5);
    sequence = parseInt(lastNumber) + 1;
  }

  return `${prefix}${String(sequence).padStart(4, "0")}`;
}

// UPDATE NOTE ONLY - New limited action
export async function updateSalesOrderNoteAction(id: string, note: string) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const currentSO = await getSalesOrderByIdDb(id);
    const permissions = getSalesOrderPermissions(currentSO, user);

    if (!permissions.canUpdateNote) {
      throw new Error(
        "You don't have permission to update notes for this sales order",
      );
    }

    const updatedSO = await updateSalesOrderDb(id, {
      note: note,
    });

    revalidatePath("/sales/orders");
    return {
      success: true,
      message: "Sales order note updated successfully",
    };
  } catch (error) {
    console.error("Error updating sales order note:", error);
    throw error;
  }
}

// UPLOAD PO CUSTOMER FILE - New limited action
export async function updateSalesOrderPOFileAction(
  id: string,
  filePath: string,
) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const currentSO = await getSalesOrderByIdDb(id);
    const permissions = getSalesOrderPermissions(currentSO, user);

    if (!permissions.canUploadPO) {
      throw new Error(
        "You don't have permission to upload PO file for this sales order",
      );
    }

    const updatedSO = await updateSalesOrderDb(id, {
      file_po_customer: filePath,
    });

    revalidatePath("/sales/orders");
    return {
      success: true,
      message: "Customer PO file updated successfully",
    };
  } catch (error) {
    console.error("Error updating customer PO file:", error);
    throw error;
  }
}

// CONVERT QUOTATION TO SALES ORDER - Complete version
export async function convertQuotationToSalesOrderAction(quotationId: number) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  // Only Sales and Superuser can convert
  if (isManagerSales(user) && !isSuperuser(user)) {
    throw new Error("Managers cannot create Sales Orders");
  }

  try {
    // 1. Get quotation data with all relations
    const quotation = await prisma.quotations.findUnique({
      where: { id: quotationId },
      include: {
        customer: {
          include: {
            company: {
              include: {
                company_level: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!quotation) {
      return {
        success: false,
        message: "Quotation not found",
      };
    }

    // Ownership check
    checkQuotationOwnership(quotation, user);

    // 2. Check if quotation is eligible for conversion (not draft)
    if (quotation.status?.toLowerCase() === "draft") {
      return {
        success: false,
        message:
          "Cannot convert draft quotation to sales order. Please approve the quotation first.",
      };
    }

    // 3. Check if quotation already converted
    const existingSO = await prisma.sales_orders.findFirst({
      where: { quotation_id: quotationId },
    });

    if (existingSO) {
      return {
        success: false,
        message: `Quotation already converted to Sales Order: ${existingSO.sale_no}`,
      };
    }

    // 4. Parse quotation detail (BOQ items)
    let boqItems: any[] = [];
    if (quotation.quotation_detail) {
      try {
        const quotationDetail = Array.isArray(quotation.quotation_detail)
          ? quotation.quotation_detail
          : JSON.parse(quotation.quotation_detail as string);

        boqItems = quotationDetail.map((item: any) => ({
          product_id: item.product_id ? BigInt(item.product_id) : null,
          product_name: item.product_name || item.name || "Unknown Product",
          product_code: item.product_code || "",
          price: Number(item.unit_price || item.price || 0),
          qty: Number(item.quantity || item.qty || 1),
          total: Number(
            item.total ||
            (item.unit_price || item.price || 0) *
            (item.quantity || item.qty || 1),
          ),
          status: "ACTIVE",
        }));
      } catch (error) {
        console.warn("Failed to parse quotation detail:", error);
        boqItems = [];
      }
    }

    // 5. Generate new sale order number
    const saleNo = await generateSaleOrderNo();

    // 6. Create sales order with transaction to ensure data integrity
    const salesOrderId = await prisma.$transaction(async (tx) => {
      // Create sales order
      const salesOrder = await tx.sales_orders.create({
        data: {
          sale_no: saleNo,
          quotation_id: quotationId,
          customer_id: quotation.customer_id || null,
          user_id: typeof user.id === "string" ? parseInt(user.id) : user.id,
          total: quotation.total || 0,
          discount: quotation.discount || 0,
          shipping: quotation.shipping || 0,
          tax: quotation.tax || 0,
          grand_total: quotation.grand_total || 0,
          status: "DRAFT",
          sale_status: "OPEN",
          payment_status: "UNPAID",
          note: quotation.note || "",
          file_po_customer: null,
        },
      });

      // Create sale order details from BOQ items
      if (boqItems.length > 0) {
        const saleOrderDetails = boqItems.map((item) => ({
          sale_id: salesOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          qty: item.qty,
          total: item.total,
          status: item.status,
        }));

        await tx.sale_order_detail.createMany({
          data: saleOrderDetails,
        });
      }

      // Update quotation status to converted
      await tx.quotations.update({
        where: { id: quotationId },
        data: {
          status: "sq_converted",
        },
      });

      return salesOrder.id;
    });

    // Fetch complete sales order with relations OUTSIDE the transaction
    const result = await prisma.sales_orders.findUnique({
      where: { id: salesOrderId },
      include: {
        quotation: {
          include: { customer: true },
        },
        customers: true,
        sale_order_detail: true,
        user: true,
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Failed to create sales order",
      };
    }

    // 7. Convert BigInt and Decimal to safe types for client
    const safeResult = safeSalesOrder(result);

    revalidatePath("/sales/sales-orders");
    revalidatePath("/sales/quotations");

    return {
      success: true,
      message: `Successfully converted to Sales Order: ${saleNo}`,
      data: safeSalesOrder(result),
    };
  } catch (error) {
    console.error("Error converting quotation to sales order:", error);

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred while converting quotation",
    };
  }
}
