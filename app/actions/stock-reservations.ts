"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
    createStockReservationDb,
    getAllStockReservationsDb,
    getStockReservationByIdDb,
    updateStockReservationDb
} from "@/data/stock-reservations";
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
        const sr = await createStockReservationDb({
            ...data,
            user_id: Number(user.id),
        });
        revalidatePath("/warehouse/reservations");
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
