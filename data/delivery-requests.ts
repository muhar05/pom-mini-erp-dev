import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isSuperuser, isWarehouse, isFinance } from "@/utils/userHelpers";

const serializeDR = (dr: any) => {
    if (!dr) return null;
    return {
        ...dr,
        id: dr.id.toString(),
        sale_id: dr.sale_id.toString(),
        user_id: dr.user_id,
        user: dr.user,
    };
};

export async function createDeliveryRequestDb(input: any) {
    const dr = await prisma.delivery_requests.create({
        data: input,
        include: {
            user: true,
        },
    });
    return serializeDR(dr);
}

export async function getAllDeliveryRequestsDb(user: any) {
    if (!user) throw new Error("Unauthorized");

    const userId = typeof user.id === "string" ? Number(user.id) : user.id;

    const drs = await prisma.delivery_requests.findMany({
        orderBy: { created_at: "desc" },
        include: {
            user: true,
        },
    });

    return drs.map(serializeDR);
}

export async function updateDeliveryRequestDb(id: string, data: any) {
    const dr = await prisma.delivery_requests.update({
        where: { id: BigInt(id) },
        data,
        include: {
            user: true,
        },
    });
    return serializeDR(dr);
}

