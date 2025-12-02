import { prisma } from "@/lib/prisma";

// CREATE
export async function createLeadDb(input: {
  lead_name: string;
  contact?: string;
  email?: string;
  phone?: string;
  type?: string;
  company?: string;
  location?: string;
  product_interest?: string;
  source?: string;
  note?: string;
  id_user?: number;
  assigned_to?: number;
  status?: string;
}) {
  return prisma.leads.create({
    data: input,
  });
}

// UPDATE
export async function updateLeadDb(
  id: number,
  data: Partial<{
    lead_name: string;
    contact?: string;
    email?: string;
    phone?: string;
    type?: string;
    company?: string;
    location?: string;
    product_interest?: string;
    source?: string;
    note?: string;
    id_user?: number;
    assigned_to?: number;
    status?: string;
  }>
) {
  return prisma.leads.update({
    where: { id },
    data,
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
export async function getAllLeadsDb() {
  return prisma.leads.findMany({
    include: {
      users_leads_assigned_toTousers: true,
      users_leads_id_userTousers: true,
    },
    orderBy: { created_at: "desc" },
  });
}
