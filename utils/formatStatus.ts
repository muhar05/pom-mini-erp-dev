import {
  formatStatusDisplay as formatDisplay,
  formatStatusValue,
  getStatusPrefix,
  getStatusName,
  LEAD_STATUS_OPTIONS,
  OPPORTUNITY_STATUS_OPTIONS,
  LEAD_STATUSES,
  OPPORTUNITY_STATUSES,
} from "./statusHelpers";

// Re-export for backward compatibility
export {
  formatStatusValue,
  getStatusPrefix,
  getStatusName,
  LEAD_STATUS_OPTIONS,
  OPPORTUNITY_STATUS_OPTIONS,
  LEAD_STATUSES,
  OPPORTUNITY_STATUSES,
} from "./statusHelpers";

// Legacy function - use formatDisplay from statusHelpers instead
export function formatStatusDisplay(status: string | null | undefined): string {
  return formatDisplay(status);
}

// Status mapping for backward compatibility
export const STATUS_DISPLAY_MAP = {
  // Legacy mappings
  new: "New",
  contacted: "Contacted",
  nurturing: "Nurturing",
  unqualified: "UnQualified",
  invalid: "Invalid",
  leadqualified: "LeadQualified",
  converted: "Converted",
  prospecting: "Prospecting",
  opportunityqualified: "OpportunityQualified",
  lost: "Lost",
  open: "Open",

  // New prefixed mappings
  lead_new: "New",
  lead_contacted: "Contacted",
  lead_interested: "Interested",
  lead_qualified: "Qualified",
  lead_unqualified: "Unqualified",
  lead_converted: "Converted",

  opp_new: "New",
  opp_qualified: "Qualified",
  opp_proposal: "Proposal",
  opp_negotiation: "Negotiation",
  opp_won: "Won",
  opp_lost: "Lost",
  opp_cancelled: "Cancelled",
} as const;

// Updated STATUS_OPTIONS for backward compatibility
export const STATUS_OPTIONS = LEAD_STATUS_OPTIONS;
