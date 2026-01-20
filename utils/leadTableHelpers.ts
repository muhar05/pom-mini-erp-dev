import { getStatusPrefix, LEAD_STATUSES } from "@/utils/statusHelpers";
import { leads } from "@/types/models";

// Helper function to get status badge styling based on prefix and status
export function getStatusBadgeClass(status: string | null | undefined): string {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

  const statusLower = status.toLowerCase();
  const prefix = getStatusPrefix(statusLower);

  if (prefix === "lead") {
    switch (statusLower) {
      case "lead_new":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "lead_contacted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "lead_interested":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "lead_qualified":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "lead_unqualified":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "lead_converted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  }

  if (prefix === "opp") {
    switch (statusLower) {
      case "opp_new":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "opp_qualified":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "opp_proposal":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "opp_negotiation":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "opp_won":
        return "bg-green-100 text-green-800 border-green-200";
      case "opp_lost":
        return "bg-red-100 text-red-800 border-red-200";
      case "opp_cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  switch (statusLower) {
    case "new":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "contacted":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "qualified":
    case "leadqualified":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "prospecting":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "closed_won":
      return "bg-green-100 text-green-800 border-green-200";
    case "closed_lost":
      return "bg-red-100 text-red-800 border-red-200";
    case "nurturing":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "unqualified":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "invalid":
      return "bg-red-100 text-red-800 border-red-200";
    case "converted":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Filter function
export function filterLeads(
  leads: leads[] | undefined | null,
  filters?: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  },
): leads[] {
  const validStatuses = Object.values(LEAD_STATUSES) as string[];

  // Pastikan leads adalah array
  const leadsArray = Array.isArray(leads) ? leads : [];

  if (!filters) {
    return leadsArray.filter(
      (lead) => lead.status && validStatuses.includes(lead.status),
    );
  }

  return leadsArray.filter((lead) => {
    if (!lead.status || !validStatuses.includes(lead.status)) return false;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        lead.lead_name?.toLowerCase().includes(searchTerm) ||
        lead.reference_no?.toLowerCase().includes(searchTerm) ||
        lead.company?.toLowerCase().includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    if (filters.status && filters.status !== "all") {
      const leadStatus = lead.status?.toLowerCase() || "";
      const filterStatus = filters.status.toLowerCase();

      const statusMatches =
        leadStatus === filterStatus ||
        leadStatus.includes(filterStatus) ||
        filterStatus.includes(leadStatus);

      if (!statusMatches) return false;
    }

    if (filters.dateFrom || filters.dateTo) {
      const leadDate = lead.created_at ? new Date(lead.created_at) : null;
      if (!leadDate) return false;

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (leadDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (leadDate > toDate) return false;
      }
    }

    return true;
  });
}
