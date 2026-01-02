// File server-side untuk fungsi yang menggunakan Prisma

import { users, leads } from "@/types/models";
import { prisma } from "@/lib/prisma";

// Re-export client-safe functions
export { isSuperuser, isSales, type UserLike } from "./userHelpers";

// Server-side only functions
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
