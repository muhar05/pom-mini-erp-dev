"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
    createStockReservationDb,
    getAllStockReservationsDb,
    getStockReservationByIdDb,
    updateStockReservationDb
} from "@/data/stock-reservations";
import { prisma } from "@/lib/prisma";
import { SALE_STATUSES } from "@/utils/salesOrderPermissions";
import { isSuperuser } from "@/utils/userHelpers";
import { serializeDecimal } from "@/utils/formatDecimal";

export async function getAllStockReservationsAction() {
    const session = await auth();
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const srs = await getAllStockReservationsDb(user);
    return serializeDecimal(srs);
}

export async function createStockReservationAction(data: any) {
    const session = await auth();
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    try {
        const prismaData: any = {
            ...data,
            user_id: Number(user.id),
        };

        // IF tied to a Sales Order, validate and update status
        if (data.sale_id) {
            const saleId = BigInt(data.sale_id);
            const salesOrder = await prisma.sales_orders.findUnique({
                where: { id: saleId }
            });

            if (!salesOrder) throw new Error("Sales Order not found");
            if (salesOrder.sale_status !== SALE_STATUSES.PO && !isSuperuser(user)) {
                throw new Error("Stock Reservation only can be created from Sales Order with status PO");
            }

            // Automate SO status update to SR
            await prisma.sales_orders.update({
                where: { id: saleId },
                data: { sale_status: SALE_STATUSES.SR }
            });

            prismaData.sale_id = saleId;
        }

        const sr = await createStockReservationDb(prismaData);
        revalidatePath("/warehouse/reservations");
        revalidatePath(`/sales/sales-orders/${data.sale_id}`);
        return { success: true, data: serializeDecimal(sr) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateStockReservationStatusAction(id: string, status: string) {
    const session = await auth();
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    try {
        const sr = await updateStockReservationDb(id, { status });
        revalidatePath("/warehouse/reservations");
        return { success: true, data: serializeDecimal(sr) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
