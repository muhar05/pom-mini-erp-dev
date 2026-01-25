import { prisma } from "@/lib/prisma";
import { leads } from "@/types/models";
import { isSuperuser, isManagerSales, isSales } from "@/utils/userHelpers";

// Tipe input untuk create/update opportunity
export type CreateOpportunityInput = Omit<
  leads,
  | "id"
  | "created_at"
  | "users_leads_assigned_toTousers"
  | "users_leads_id_userTousers"
>;
export type UpdateOpportunityInput = Partial<CreateOpportunityInput>;

// CREATE
export async function createOpportunityDb(input: CreateOpportunityInput) {
  const cleanInput = Object.fromEntries(
    Object.entries(input).filter(([_, value]) => value !== undefined)
  ) as CreateOpportunityInput;

  return prisma.leads.create({
    data: cleanInput,
  });
}

// UPDATE
export async function updateOpportunityDb(
  id: number,
  data: UpdateOpportunityInput
) {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );
  return prisma.leads.update({
    where: { id },
    data: cleanData,
  });
}

// DELETE
export async function deleteOpportunityDb(id: number) {
  return prisma.leads.delete({
    where: { id },
  });
}

// GET BY ID
export async function getOpportunityByIdDb(id: number) {
  return prisma.leads.findUnique({
    where: { id },
    include: { users_leads_id_userTousers: true },
  });
}

// GET ALL
export async function getAllOpportunitiesDb(user?: any) {
  if (!user) throw new Error("Unauthorized");

  const userId = typeof user.id === "string" ? Number(user.id) : user.id;
  const isManager = isSuperuser(user) || isManagerSales(user);

  const baseWhere: any = {
    status: {
      in: [
        "opp_qualified",
        "opp_prospecting",
        "opp_lost",
        "opp_sq",
        "lead_converted",
        "converted",
      ],
    },
  };

  // Jika bukan manager/admin, filter milik sendiri
  if (!isManager && isSales(user)) {
    baseWhere.OR = [
      { id_user: userId },
      { assigned_to: userId }
    ];
  } else if (!isManager) {
    throw new Error("Forbidden access");
  }

  return prisma.leads.findMany({
    where: baseWhere,
    orderBy: { created_at: "desc" },
    include: { users_leads_id_userTousers: true },
  });
}
