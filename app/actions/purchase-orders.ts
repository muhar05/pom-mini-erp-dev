"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSuperuser, isPurchasing, isManagerPurchasing } from "@/utils/userHelpers";
import { SALE_STATUSES } from "@/utils/salesOrderPermissions";
import {
    createPurchaseOrderDb,
    updatePurchaseOrderDb,
    getPurchaseOrderByIdDb,
    getAllPurchaseOrdersDb,
    deletePurchaseOrderDb
} from "@/data/purchase-orders";
import { serializeDecimal } from "@/utils/formatDecimal";

async function generatePurchaseOrderNo(): Promise<string> {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const companyCode = "15";
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const prefix = `PO${year}${companyCode}${month}`;

    const lastPO = await prisma.purchase_orders.findFirst({
        where: {
            po_no: {
                startsWith: prefix,
            },
        },
        orderBy: {
            po_no: "desc",
        },
    });

    let sequentialNumber = 1;
    if (lastPO) {
        const lastNumber = lastPO.po_no.substring(8, 12);
        sequentialNumber = parseInt(lastNumber) + 1;
    }

    const sequence = String(sequentialNumber).padStart(4, "0");
    return `${prefix}${sequence}`;
}

export async function getAllPurchaseOrdersAction() {
    const session = await auth();
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const pos = await getAllPurchaseOrdersDb(user);
    return serializeDecimal(pos);
}

export async function getPurchaseOrderByIdAction(id: string) {
    const session = await auth();
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const po = await getPurchaseOrderByIdDb(id);
    return serializeDecimal(po);
}

export async function createPurchaseOrderAction(data: any) {
    const session = await auth();
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    try {
        const po_no = data.po_no || (await generatePurchaseOrderNo());

        const prismaData = {
            ...data,
            po_no,
            user_id: Number(user.id),
            status: "DRAFT",
        };

        // IF tied to a Sales Order, validate and update status
        if (data.sale_id) {
            const saleId = BigInt(data.sale_id);
            const salesOrder = await prisma.sales_orders.findUnique({
                where: { id: saleId }
            });

            if (!salesOrder) throw new Error("Sales Order not found");
            if (salesOrder.sale_status !== SALE_STATUSES.PR && !isSuperuser(user)) {
                throw new Error("Purchase Order only can be created from Sales Order with status PR");
            }

            // Automate SO status update to PO
            await prisma.sales_orders.update({
                where: { id: saleId },
                data: { sale_status: SALE_STATUSES.PO }
            });

            prismaData.sale_id = saleId;
        }

        if (data.supplier_id) {
            prismaData.supplier = { connect: { id: BigInt(data.supplier_id) } };
            delete prismaData.supplier_id;
        }

        const po = await createPurchaseOrderDb(prismaData);
        revalidatePath("/purchasing/purchase-orders");
        revalidatePath(`/sales/sales-orders/${data.sale_id}`);
        return { success: true, data: serializeDecimal(po) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updatePurchaseOrderAction(id: string, data: any) {
    const session = await auth();
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    try {
        // Permission check for Manager tasks
        if (data.assigned_to && !isManagerPurchasing(user) && !isSuperuser(user)) {
            throw new Error("Only managers can assign PIC");
        }

        const updateData = { ...data };

        if (data.supplier_id) {
            updateData.supplier = { connect: { id: BigInt(data.supplier_id) } };
            delete updateData.supplier_id;
        }

        if (data.assigned_to) {
            updateData.assigned_user = { connect: { id: Number(data.assigned_to) } };
            delete updateData.assigned_to;
        }

        const po = await updatePurchaseOrderDb(id, updateData);
        revalidatePath("/purchasing/purchase-orders");
        return { success: true, data: serializeDecimal(po) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deletePurchaseOrderAction(id: string) {
    const session = await auth();
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    try {
        await deletePurchaseOrderDb(id);
        revalidatePath("/purchasing/purchase-orders");
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function approvePurchaseOrderAction(id: string) {
    const session = await auth();
    const user = session?.user;
    if (!user || (!isManagerPurchasing(user) && !isSuperuser(user))) {
        throw new Error("Unauthorized: Only Purchasing Manager can approve PO");
    }

    const po = await updatePurchaseOrderDb(id, { status: "APPROVED" });
    revalidatePath("/purchasing/purchase-orders");
    return { success: true, data: serializeDecimal(po) };
}
