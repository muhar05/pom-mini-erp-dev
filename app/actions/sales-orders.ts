"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { users } from "@/types/models";
import {
  getSalesOrderPermissions,
  SALE_STATUSES,
  ITEM_STATUSES,
  isValidStatusTransition,
  isSales,
  isPurchasing,
  isWarehouse,
  isFinance,
  REOPEN_SYSTEM_PREFIXES,
  hasPendingReopenRequest
} from "@/utils/salesOrderPermissions";
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
import { isManagerSales, isSuperuser } from "@/utils/userHelpers";

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

  if (!isSuperuser(user) && !isSales(user)) {
    throw new Error("Only Sales team can create orders");
  }

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
        total: Number(item.price) * Number(item.qty),
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

    const { quotation_id, customer_id, boq_items, ...rest } = validatedData;

    // Constraint: Cannot edit detail (items/qty) if status is not NEW
    if (currentSO.sale_status !== SALE_STATUSES.NEW && boq_items !== undefined) {
      throw new Error("Cannot change order quantities after the order has left the NEW stage. Please create a revision instead.");
    }

    // PREVENT MANUAL NOTE INJECTION
    if (rest.note && !isSuperuser(user)) {
      const manualNote = rest.note;
      const systemPrefixes = Object.values(REOPEN_SYSTEM_PREFIXES);

      // Check if user is trying to type the prefix manually
      // Note: We only block if the prefix is at the start of a line OR if it's appearing for the first time in this update
      // But a more robust way is to check if it's being ADDED compared to old note.
      const oldNote = currentSO.note || "";
      for (const prefix of systemPrefixes) {
        if (manualNote.includes(prefix) && !oldNote.includes(prefix)) {
          throw new Error("System note prefixes cannot be manually injected.");
        }
      }
    }

    // NEW: Validation for RECEIVED status sync with items
    if (validatedData.sale_status === SALE_STATUSES.RECEIVED) {
      const pendingItems = await prisma.sale_order_detail.findMany({
        where: {
          sale_id: BigInt(id),
          status: {
            in: [ITEM_STATUSES.ACTIVE, ITEM_STATUSES.PARTIAL_DELIVERED],
          },
        },
      });

      if (pendingItems.length > 0) {
        throw new Error(
          `Cannot set Sales Order to RECEIVED because ${pendingItems.length} item(s) are still ACTIVE or PARTIAL. All items must be DELIVERED or CANCELLED first.`
        );
      }
    }

    // Manager Role Constraint: Cannot edit detail if manager
    if (isManagerSales(user) && !isSuperuser(user)) {
      throw new Error("Manager Sales cannot edit Sales Order details");
    }

    // ROLE & FIELD RESTRICTION: Limit what can be updated based on status
    const isNew = currentSO.sale_status === SALE_STATUSES.NEW;
    const userRole = ((user as any).role_name || user.roles?.role_name || "sales").toLowerCase();

    // If not NEW, restrict fields to: note, sale_status, file_po_customer
    if (!isNew && !isSuperuser(user)) {
      const allowedFields = ["note", "sale_status", "file_po_customer"];
      const attemptKeys = Object.keys(rest).filter(k => (rest as any)[k] !== undefined);
      const invalidKeys = attemptKeys.filter(k => !allowedFields.includes(k));

      if (invalidKeys.length > 0 && boq_items === undefined) {
        throw new Error(`Fields ${invalidKeys.join(", ")} cannot be updated after the NEW stage.`);
      }
    }

    // STATUS TRANSITION VALIDATION in main update
    if (validatedData.sale_status && validatedData.sale_status !== currentSO.sale_status) {
      if (!isValidStatusTransition(currentSO.sale_status || SALE_STATUSES.NEW, validatedData.sale_status)) {
        throw new Error(`Invalid status transition from ${currentSO.sale_status} to ${validatedData.sale_status}`);
      }

      // Role validation for status change
      if (!isSuperuser(user)) {
        const newStatus = validatedData.sale_status;
        const oldStatus = currentSO.sale_status;

        // NEW RESTRICTION: PR -> NEW only allowed for Manager Sales or Superuser
        if (oldStatus === SALE_STATUSES.PR && newStatus === SALE_STATUSES.NEW) {
          if (!isManagerSales(user)) {
            throw new Error("Only Manager Sales or Superuser can reopen Sales Order from PR to NEW");
          }
        }

        if ((newStatus === SALE_STATUSES.PR || newStatus === SALE_STATUSES.RECEIVED) && !isSales(user)) {
          throw new Error("Only Sales team can set this status");
        }
        if ([SALE_STATUSES.PO, SALE_STATUSES.SR, SALE_STATUSES.FAR, SALE_STATUSES.DR].includes(newStatus as any) && !isPurchasing(user)) {
          throw new Error("Only Purchasing team can set this status");
        }
        if ([SALE_STATUSES.DELIVERY, SALE_STATUSES.DELIVERED].includes(newStatus as any) && !isWarehouse(user)) {
          throw new Error("Only Warehouse team can set this status");
        }
      }
    }

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
          total: Number(item.price) * Number(item.qty),
          status: item.status || "ACTIVE",
        }));

        await prisma.sale_order_detail.createMany({
          data: saleOrderDetails,
        });
      }
    }

    // Audit Log for Header Update
    try {
      let activity = `Updated Sales Order ${currentSO.sale_no}`;
      const isReopenDecision = currentSO.sale_status === SALE_STATUSES.PR && (rest as any).note;
      const newNote = (rest as any).note || "";

      if (isReopenDecision) {
        if (newNote.includes(REOPEN_SYSTEM_PREFIXES.APPROVED)) {
          activity = "APPROVE_REOPEN_SO";
        } else if (newNote.includes(REOPEN_SYSTEM_PREFIXES.REJECTED)) {
          activity = "REJECT_REOPEN_SO";
        } else if (newNote.includes(REOPEN_SYSTEM_PREFIXES.REQUEST)) {
          activity = "REQUEST_REOPEN_SO";
        }
      }

      await prisma.user_logs.create({
        data: {
          user_id: typeof user.id === "string" ? parseInt(user.id) : user.id,
          activity: activity,
          method: "PATCH",
          old_data: { sale_status: currentSO.sale_status, role: userRole, sale_id: currentSO.id },
          new_data: {
            sale_status: validatedData.sale_status || currentSO.sale_status,
            role: userRole,
            note_summary: newNote.length > 50 ? newNote.substring(0, 50) + "..." : newNote
          },
        },
      });
    } catch (logErr) {
      console.error("Audit log failed:", logErr);
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
      status: "ACTIVE",
      sale_status: SALE_STATUSES.NEW,
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

// UPDATE SALES ORDER STATUS - New multi-departmental action
export async function updateSalesOrderStatusAction(id: string, newStatus: string) {
  const session = await auth();
  const user = session?.user as users | undefined;
  if (!user) throw new Error("Unauthorized");

  try {
    const currentSO = await getSalesOrderByIdDb(id);
    const oldStatus = currentSO.sale_status || SALE_STATUSES.NEW;

    // 1. Validate status transition
    if (!isValidStatusTransition(oldStatus, newStatus)) {
      throw new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`);
    }

    // 2. Validate role authorization
    const userRole = ((user as any).role_name || user.roles?.role_name || "sales").toLowerCase();
    const isSU = userRole === "superuser";

    if (!isSU) {
      // NEW RESTRICTION: PR -> NEW only allowed for Manager Sales or Superuser
      if (oldStatus === SALE_STATUSES.PR && newStatus === SALE_STATUSES.NEW) {
        if (!isManagerSales(user)) {
          throw new Error("Only Manager Sales or Superuser can reopen Sales Order from PR to NEW");
        }
      }

      // BLOCK PURCHASING IF REOPEN REQUEST PENDING
      if (oldStatus === SALE_STATUSES.PR && [SALE_STATUSES.PO, SALE_STATUSES.SR, SALE_STATUSES.FAR, SALE_STATUSES.DR].includes(newStatus as any)) {
        if (hasPendingReopenRequest(currentSO.note)) {
          throw new Error("Sales Order sedang dalam proses permintaan perubahan oleh Sales. Tunggu keputusan Manager Sales.");
        }
      }

      if ((newStatus === SALE_STATUSES.PR || newStatus === SALE_STATUSES.RECEIVED) && !isSales(user)) {
        throw new Error("Only Sales team can set this status");
      }
      if ([SALE_STATUSES.PO, SALE_STATUSES.SR, SALE_STATUSES.FAR, SALE_STATUSES.DR].includes(newStatus as any) && !isPurchasing(user)) {
        throw new Error("Only Purchasing team can set this status");
      }
      if ([SALE_STATUSES.DELIVERY, SALE_STATUSES.DELIVERED].includes(newStatus as any) && !isWarehouse(user)) {
        throw new Error("Only Warehouse team can set this status");
      }
    }

    // 3. Special Validation for RECEIVED: All items must be DELIVERED or CANCELLED
    if (newStatus === SALE_STATUSES.RECEIVED) {
      const items = currentSO.sale_order_detail || [];
      const unfinishedItems = items.filter(
        (item: any) => item.status !== ITEM_STATUSES.DELIVERED && item.status !== ITEM_STATUSES.CANCELLED
      );
      if (unfinishedItems.length > 0) {
        throw new Error("Cannot receive Sales Order until all items are Delivered or Cancelled");
      }
    }

    // 4. Update status
    const updatedSO = await updateSalesOrderDb(id, {
      sale_status: newStatus,
      status: newStatus === SALE_STATUSES.CANCELLED ? "CANCELLED" : "ACTIVE",
    });

    // 4.5. Trigger stock check/PO generation if moving from NEW to PR
    if (oldStatus === SALE_STATUSES.NEW && newStatus === SALE_STATUSES.PR) {
      await handlePostConfirmationProcess(updatedSO);
    }

    // 5. Audit Log
    await prisma.user_logs.create({
      data: {
        user_id: typeof user.id === "string" ? parseInt(user.id) : user.id,
        activity: `Updated Sales Order ${currentSO.sale_no} status to ${newStatus}`,
        method: "PATCH",
        endpoint: "/actions/update-sales-order-status",
        old_data: { sale_status: oldStatus, role: userRole },
        new_data: { sale_status: newStatus, role: userRole },
      },
    });

    revalidatePath(`/sales/sales-orders/${id}`);
    revalidatePath("/sales/sales-orders");

    return {
      success: true,
      message: `Status updated to ${newStatus}`,
      data: safeSalesOrder(updatedSO),
    };
  } catch (error) {
    console.error("Error updating SO status:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to update status" };
  }
}

// UPDATE SALES ORDER ITEM STATUS - Enhanced for role-based tracking and terminal status protection
export async function updateSalesOrderItemStatusAction(itemId: number | string, newStatus: string) {
  const session = await auth();
  const user = session?.user as any; // Cast as any to access roles safely
  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const item = await prisma.sale_order_detail.findUnique({
      where: { id: BigInt(itemId) },
    });
    if (!item) {
      return { success: false, message: "Item not found" };
    }

    const userRole = (user.role_name || user.roles?.role_name || "sales").toLowerCase();

    // 1. Authorization Check
    const isWarehouseUser = ["warehouse", "manager-warehouse", "superuser"].includes(userRole);
    const isSuper = userRole === "superuser";

    if (newStatus === ITEM_STATUSES.CANCELLED && !isSuper) {
      return { success: false, message: "Only Superuser can cancel specific items." };
    }

    if (!isWarehouseUser) {
      return { success: false, message: "Only Warehouse team or Superuser can update item status." };
    }

    // 2. Prevent update if already terminal (unless superuser)
    if (!isSuper) {
      if (item.status === ITEM_STATUSES.DELIVERED || item.status === ITEM_STATUSES.CANCELLED) {
        return { success: false, message: `Cannot update item that is already ${item.status}.` };
      }
    }

    // 3. Item Status Transition Validation
    const oldItemStatus = item.status || ITEM_STATUSES.ACTIVE;
    const validTransitions: Record<string, string[]> = {
      [ITEM_STATUSES.ACTIVE]: [ITEM_STATUSES.PARTIAL_DELIVERED, ITEM_STATUSES.DELIVERED, ITEM_STATUSES.CANCELLED],
      [ITEM_STATUSES.PARTIAL_DELIVERED]: [ITEM_STATUSES.DELIVERED, ITEM_STATUSES.CANCELLED],
      [ITEM_STATUSES.DELIVERED]: [],
      [ITEM_STATUSES.CANCELLED]: [],
    };

    if (!isSuper && !validTransitions[oldItemStatus].includes(newStatus)) {
      return { success: false, message: `Invalid status transition for item from ${oldItemStatus} to ${newStatus}` };
    }

    // 4. Update the item
    await prisma.sale_order_detail.update({
      where: { id: BigInt(itemId) },
      data: { status: newStatus },
    });

    // 4. Audit Log
    try {
      await prisma.user_logs.create({
        data: {
          user_id: Number(user.id),
          activity: `Updated SO Item #${itemId} status to ${newStatus}`,
          method: "PATCH",
          old_data: { status: item.status, role: userRole },
          new_data: { status: newStatus, role: userRole },
        },
      });
    } catch (logErr) {
      console.error("Audit log failed:", logErr);
    }

    const saleId = item.sale_id.toString();
    revalidatePath(`/sales/sales-orders/${saleId}`);
    revalidatePath("/sales/sales-orders");

    return {
      success: true,
      message: `Item status updated to ${newStatus}`,
    };
  } catch (error) {
    console.error("Error updating item status:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update item status"
    };
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
          status: "ACTIVE",
          sale_status: SALE_STATUSES.NEW,
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

