import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { isSuperuser, isWarehouse, isPurchasing } from "@/utils/userHelpers";

const serializeSR = (sr: any) => {
    if (!sr) return null;
    return {
        ...sr,
        id: sr.id.toString(),
        lead_id: sr.lead_id ? sr.lead_id.toString() : null,
        user_id: sr.user_id,
        item_detail: sr.item_detail,
        user: sr.user,
    };
};

export async function createStockReservationDb(input: any) {
    const sr = await prisma.stock_reservations.create({
        data: input,
        include: {
            user: true,
        },
    });
    return serializeSR(sr);
}

export async function getStockReservationByIdDb(id: string) {
    const sr = await prisma.stock_reservations.findUnique({
        where: { id: BigInt(id) },
        include: {
            user: true,
        },
    });
    return serializeSR(sr);
}

export async function getAllStockReservationsDb(user: any) {
    if (!user) throw new Error("Unauthorized");

    const userId = typeof user.id === "string" ? Number(user.id) : user.id;
    const isManager = isSuperuser(user); // Add more managers if needed

    let where: any = undefined;

    if (!isManager && (isWarehouse(user) || isPurchasing(user))) {
        // Both can see reservations? Or only owner?
        // Let's allow both roles to see all for now, or filter by user_id if needed.
    }

    const srs = await prisma.stock_reservations.findMany({
        where,
        orderBy: { created_at: "desc" },
        include: {
            user: true,
        },
    });

    return srs.map(serializeSR);
}

export async function updateStockReservationDb(id: string, data: any) {
    const sr = await prisma.stock_reservations.update({
        where: { id: BigInt(id) },
        data,
        include: {
            user: true,
        },
    });
    return serializeSR(sr);
}

