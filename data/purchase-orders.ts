import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { isSuperuser, isManagerPurchasing, isPurchasing } from "@/utils/userHelpers";

// Base field schemas
const poNoSchema = z
    .string()
    .min(1, "PO number is required")
    .max(50, "PO number must be less than 50 characters")
    .trim();

const poDetailItemSchema = z.object({
    product_id: z.number().or(z.string()).optional(),
    product_name: z.string().min(1, "Product name is required"),
    price: z.number().min(0, "Price must be greater than or equal to 0"),
    qty: z.number().int().min(1, "Quantity must be at least 1"),
    total: z.number().min(0).optional(),
});

const statusSchema = z
    .string()
    .max(30, "Status must be less than 30 characters")
    .optional()
    .default("DRAFT");

// Main purchase order schema for CREATE
export const createPurchaseOrderSchema = z.object({
    po_no: poNoSchema.optional(),
    pr_id: z.string().optional(),
    supplier_id: z.number().or(z.string()).optional(),
    total: z.number().min(0).optional().default(0),
    status: statusSchema,
    note: z.string().max(1000).optional(),
    po_detail_items: z.array(poDetailItemSchema).optional().default([]),
    supplier_do: z.string().optional(),
    supplier_so: z.string().optional(),
});

export type CreatePurchaseOrderData = z.infer<typeof createPurchaseOrderSchema>;

// Helper to convert Decimal and BigInt for client
const serializePO = (po: any) => {
    if (!po) return null;
    return {
        ...po,
        id: po.id.toString(),
        pr_id: po.pr_id ? po.pr_id.toString() : null,
        supplier_id: po.supplier_id ? po.supplier_id.toString() : null,
        total: po.total ? Number(po.total) : 0,
        po_detail_items: Array.isArray(po.po_detail_items)
            ? po.po_detail_items.map((item: any) => ({
                ...item,
                price: Number(item.price || 0),
                qty: Number(item.qty || 0),
                total: Number(item.total || 0),
            }))
            : [],
        supplier: po.supplier ? {
            ...po.supplier,
            id: po.supplier.id.toString(),
        } : null,
        user: po.user,
        assigned_user: po.assigned_user,
    };
};

export async function createPurchaseOrderDb(input: any) {
    const po = await prisma.purchase_orders.create({
        data: input,
        include: {
            supplier: true,
            user: true,
            assigned_user: true,
        },
    });
    return serializePO(po);
}

export async function updatePurchaseOrderDb(id: string, data: any) {
    const po = await prisma.purchase_orders.update({
        where: { id: BigInt(id) },
        data,
        include: {
            supplier: true,
            user: true,
            assigned_user: true,
        },
    });
    return serializePO(po);
}

export async function getPurchaseOrderByIdDb(id: string) {
    const po = await prisma.purchase_orders.findUnique({
        where: { id: BigInt(id) },
        include: {
            supplier: true,
            user: true,
            assigned_user: true,
        },
    });
    return serializePO(po);
}

export async function getAllPurchaseOrdersDb(user: any) {
    if (!user) throw new Error("Unauthorized");

    const userId = typeof user.id === "string" ? Number(user.id) : user.id;
    const isManager = isSuperuser(user) || isManagerPurchasing(user);

    let where: any = undefined;

    // Pattern: Purchasing only sees their own or assigned POs, Manager sees all
    if (!isManager && isPurchasing(user)) {
        where = {
            OR: [
                { user_id: userId },
                { assigned_to: userId }
            ]
        };
    } else if (!isManager) {
        throw new Error("Forbidden access");
    }

    const pos = await prisma.purchase_orders.findMany({
        where,
        orderBy: { created_at: "desc" },
        include: {
            supplier: true,
            user: true,
            assigned_user: true,
        },
    });

    return pos.map(serializePO);
}

export async function deletePurchaseOrderDb(id: string) {
    return prisma.purchase_orders.delete({
        where: { id: BigInt(id) },
    });
}

