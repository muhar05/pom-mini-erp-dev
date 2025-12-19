export function formatStatusDisplay(status: string | null | undefined): string {
  if (!status) return "Open";

  // Replace underscores with spaces and capitalize each word
  return status
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatStatusValue(displayStatus: string): string {
  // Convert display format back to database format
  return displayStatus.toLowerCase().replace(/\s+/g, "_");
}

// Status mapping for consistent display
export const STATUS_DISPLAY_MAP = {
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
} as const;

// Pilihan status konsisten dengan LeadForm
export const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "nurturing", label: "Nurturing" },
  { value: "unqualified", label: "UnQualified" },
  { value: "invalid", label: "Invalid" },
  { value: "leadqualified", label: "LeadQualified" },
  { value: "converted", label: "Converted" },
  { value: "prospecting", label: "Prospecting" },
  { value: "opportunityqualified", label: "OpportunityQualified" },
  { value: "lost", label: "Lost" },
] as const;
