import { users, leads } from "@/types/models";
import { prisma } from "@/lib/prisma";

type UserLike =
  | { role_name?: string }
  | { roles?: { role_name?: string } | null }
  | null
  | undefined;

export function isSuperuser(user: UserLike): boolean {
  if (!user) return false;
  if ("role_name" in user && user.role_name)
    return user.role_name.toLowerCase() === "superuser";
  if (
    "roles" in user &&
    user.roles &&
    "role_name" in user.roles &&
    user.roles.role_name
  )
    return user.roles.role_name.toLowerCase() === "superuser";
  return false;
}
export function isSales(user: UserLike): boolean {
  if (!user) return false;
  if ("role_name" in user && user.role_name)
    return user.role_name.toLowerCase() === "sales";
  if (
    "roles" in user &&
    user.roles &&
    "role_name" in user.roles &&
    user.roles.role_name
  )
    return user.roles.role_name.toLowerCase() === "sales";
  return false;
}

// Log helper
export async function logLeadActivity(
  lead_id: number,
  user_id: number,
  action: string,
  old_value: unknown,
  new_value: unknown
) {
  await prisma.user_logs.create({
    data: {
      user_id,
      activity: action,
      old_data: old_value ? JSON.stringify(old_value) : undefined,
      new_data: new_value ? JSON.stringify(new_value) : undefined,
    },
  });
}

// Stub for opportunity
// export async function createOpportunityFromLead(lead: leads, user_id: number) {
//   await prisma.opportunity.create({
//     data: {
//       lead_id: lead.id,
//       name: lead.lead_name,
//       company: lead.company,
//       contact: lead.contact,
//       // ...field lain yang relevan
//       created_by: user_id,
//     },
//   });
// }
