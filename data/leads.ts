import { prisma } from "@/lib/prisma";
import { users, leads } from "@/types/models";
import { isSuperuser, isSales, isManagerSales } from "@/utils/leadHelpers";

export interface CreateLeadInput extends Omit<
  leads,
  | "id"
  | "created_at"
  | "users_leads_assigned_toTousers"
  | "users_leads_id_userTousers"
> {}
export interface UpdateLeadInput extends Partial<CreateLeadInput> {}

// CREATE
export async function createLeadDb(input: CreateLeadInput) {
  const cleanInput = Object.fromEntries(
    Object.entries(input).filter(([_, value]) => value !== undefined),
  ) as CreateLeadInput;

  return prisma.leads.create({
    data: cleanInput,
  });
}

// UPDATE
export async function updateLeadDb(id: number, data: UpdateLeadInput) {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );
  return prisma.leads.update({
    where: { id },
    data: cleanData,
  });
}

// DELETE
export async function deleteLeadDb(id: number) {
  return prisma.leads.delete({
    where: { id },
  });
}

// GET BY ID
export async function getLeadByIdDb(id: number) {
  const lead = await prisma.leads.findUnique({
    where: { id },
    include: {
      users_leads_assigned_toTousers: true,
      users_leads_id_userTousers: true,
    },
  });
  if (!lead) throw new Error("Lead not found");
  return lead;
}

// GET ALL
export async function getAllLeadsDb(
  user?: users | { id: string | number; role_name?: string },
) {
  if (!user) throw new Error("Unauthorized");
  if (isSuperuser(user) || isManagerSales(user) || isSales(user)) {
    return prisma.leads.findMany({
      include: {
        users_leads_assigned_toTousers: true,
        users_leads_id_userTousers: true,
      },
      orderBy: { created_at: "desc" },
    });
  }
  if (isSales(user)) {
    // Konversi id ke number jika perlu
    const userId = typeof user.id === "string" ? Number(user.id) : user.id;
    return prisma.leads.findMany({
      where: { id_user: userId },
      include: {
        users_leads_assigned_toTousers: true,
        users_leads_id_userTousers: true,
      },
      orderBy: { created_at: "desc" },
    });
  }
  throw new Error("Unauthorized");
}
