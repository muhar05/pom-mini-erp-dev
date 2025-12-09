import { prisma } from "@/lib/prisma";

// Define interfaces to match our exact needs
interface CreateLeadInput {
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
}

interface UpdateLeadInput {
  lead_name?: string;
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
}

// CREATE - lead_name is required
export async function createLeadDb(input: CreateLeadInput) {
  // Filter out undefined values
  const cleanInput = Object.fromEntries(
    Object.entries(input).filter(([_, value]) => value !== undefined)
  ) as CreateLeadInput;

  return prisma.leads.create({
    data: cleanInput,
  });
}

// UPDATE - all fields optional
export async function updateLeadDb(id: number, data: UpdateLeadInput) {
  // Filter out undefined values to avoid overwriting with null
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
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
export async function getAllLeadsDb() {
  return prisma.leads.findMany({
    include: {
      users_leads_assigned_toTousers: true,
      users_leads_id_userTousers: true,
    },
    orderBy: { created_at: "desc" },
  });
}
