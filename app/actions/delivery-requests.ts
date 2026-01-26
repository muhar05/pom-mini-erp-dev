"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
    createDeliveryRequestDb,
    getAllDeliveryRequestsDb,
    updateDeliveryRequestDb
} from "@/data/delivery-requests";
import { serializeDecimal } from "@/utils/formatDecimal";
import { isFinance, isSuperuser } from "@/utils/userHelpers";

export async function getAllDeliveryRequestsAction() {
    const session = await auth();
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const drs = await getAllDeliveryRequestsDb(user);
    return serializeDecimal(drs);
}

export async function createDeliveryRequestAction(data: any) {
    const session = await auth();
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    try {
        const dr = await createDeliveryRequestDb({
            ...data,
            user_id: Number(user.id),
            status: "OPEN",
        });
        revalidatePath("/warehouse/delivery/requests");
        return { success: true, data: serializeDecimal(dr) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function approveDeliveryRequestAction(id: string) {
    const session = await auth();
    const user = session?.user;
    if (!user || (!isFinance(user) && !isSuperuser(user))) {
        throw new Error("Unauthorized: Only Finance can approve Delivery Requests");
    }

    try {
        const dr = await updateDeliveryRequestDb(id, { status: "APPROVED" });
        revalidatePath("/warehouse/delivery/requests");
        revalidatePath("/finance/approvals");
        return { success: true, data: serializeDecimal(dr) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
