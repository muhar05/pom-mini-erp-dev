import React, { useState } from "react";
import { getLeadByIdAction } from "@/app/actions/leads";
import LeadDetailClient from "../_components/LeadDetailClient";

interface LeadDetailPageProps {
  params: { id: string };
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = params;
  const lead = await getLeadByIdAction(Number(id));

  // Convert potential_value to number if it's a Prisma Decimal
  const safeLead = {
    ...lead,
    potential_value: lead.potential_value ? Number(lead.potential_value) : 0,
  };

  return <LeadDetailClient lead={safeLead} />;
}
