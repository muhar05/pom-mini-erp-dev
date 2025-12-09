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
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
  Open: "Open", // Default from database
} as const;

export const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
] as const;
