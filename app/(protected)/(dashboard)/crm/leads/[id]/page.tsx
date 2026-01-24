import { getLeadByIdAction } from "@/app/actions/leads";
import LeadDetailClient from "../_components/LeadDetailClient";
import { auth } from "@/auth"; // pastikan import auth

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const lead = await getLeadByIdAction(Number(id));
  const session = await auth();
  const currentUser = session?.user;

  const safeLead = {
    ...lead,
    potential_value: lead.potential_value ? Number(lead.potential_value) : 0,
  };

  return <LeadDetailClient lead={safeLead} currentUser={currentUser} />;
}
