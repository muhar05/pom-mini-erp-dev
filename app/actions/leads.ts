"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createLeadDb,
  updateLeadDb,
  deleteLeadDb,
  getLeadByIdDb,
  getAllLeadsDb,
} from "@/data/leads";

// CREATE
export async function createLeadAction(formData: FormData) {
  const lead_name = formData.get("lead_name") as string;
  const contact = formData.get("contact") as string | undefined;
  const email = formData.get("email") as string | undefined;
  const phone = formData.get("phone") as string | undefined;
  const type = formData.get("type") as string | undefined;
  const company = formData.get("company") as string | undefined;
  const location = formData.get("location") as string | undefined;
  const product_interest = formData.get("product_interest") as
    | string
    | undefined;
  const source = formData.get("source") as string | undefined;
  const note = formData.get("note") as string | undefined;
  const id_user = formData.get("id_user")
    ? Number(formData.get("id_user"))
    : undefined;
  const assigned_to = formData.get("assigned_to")
    ? Number(formData.get("assigned_to"))
    : undefined;
  const status = formData.get("status") as string | undefined;

  if (!lead_name) {
    throw new Error("Lead name is required");
  }

  await createLeadDb({
    lead_name,
    contact,
    email,
    phone,
    type,
    company,
    location,
    product_interest,
    source,
    note,
    id_user,
    assigned_to,
    status,
  });

  revalidatePath("/crm/leads");
  redirect("/crm/leads");
}

// UPDATE
export async function updateLeadAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) throw new Error("Lead ID is required");

  const data: any = {};
  [
    "lead_name",
    "contact",
    "email",
    "phone",
    "type",
    "company",
    "location",
    "product_interest",
    "source",
    "note",
    "id_user",
    "assigned_to",
    "status",
  ].forEach((key) => {
    const value = formData.get(key);
    if (value !== null && value !== undefined && value !== "") {
      data[key] =
        key === "id_user" || key === "assigned_to" ? Number(value) : value;
    }
  });

  await updateLeadDb(Number(id), data);

  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${id}`);

  return { success: true, message: "Lead updated successfully" };
}

// DELETE
export async function deleteLeadAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) throw new Error("Lead ID is required");

  await deleteLeadDb(Number(id));

  revalidatePath("/crm/leads");

  return { success: true, message: "Lead deleted successfully" };
}

// GET BY ID
export async function getLeadByIdAction(id: number) {
  return getLeadByIdDb(id);
}

// GET ALL
export async function getAllLeadsAction() {
  return getAllLeadsDb();
}
