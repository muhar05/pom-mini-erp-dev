/**
 * Status Helper Utilities
 * Handles prefixed status names with clean display formatting
 */

// Lead Status Enum
export const LEAD_STATUSES = {
  NEW: "lead_new",
  CONTACTED: "lead_contacted",
  INTERESTED: "lead_interested",
  QUALIFIED: "lead_qualified",
  UNQUALIFIED: "lead_unqualified",
  CONVERTED: "lead_converted",
} as const;

// Opportunity Status Enum
export const OPPORTUNITY_STATUSES = {
  PROSPECTING: "prospecting",
  LOST: "opp_lost",
  SQ: "opp_sq",
} as const;

// Sales Quotation Status Enum
export const SQ_STATUSES = {
  DRAFT: "sq_draft", // Menunggu approval Sales Manager & belum dikirim ke customer
  APPROVED: "sq_approved", // Sudah di-approve Sales Manager, bisa dikirim ke customer
  SENT: "sq_sent", // Sudah dikirim ke customer
  REVISED: "sq_revised", // Perlu revisi/negosiasi
  LOST: "sq_lost", // Customer menolak SQ
  WIN: "sq_win", // Sudah dapat PO dari customer
  CONVERTED: "sq_converted", // Sudah berubah menjadi SO
} as const;

// Sales Order Status Enum
export const SO_STATUSES = {
  DRAFT: "so_draft",
  CONFIRMED: "so_confirmed",
  IN_PROGRESS: "so_in_progress",
  READY_TO_SHIP: "so_ready_to_ship",
  PARTIALLY_SHIPPED: "so_partially_shipped",
  SHIPPED: "so_shipped",
  DELIVERED: "so_delivered",
  CLOSED: "so_closed",
  CANCELLED: "so_cancelled",
} as const;

// Payment Status Enum
export const PAYMENT_STATUSES = {
  UNPAID: "pay_unpaid",
  PARTIAL: "pay_partial",
  PAID: "pay_paid",
  OVERDUE: "pay_overdue",
  REFUNDED: "pay_refunded",
} as const;

// BOQ Line Status Enum
export const BOQ_STATUSES = {
  PENDING: "boq_pending",
  APPROVED: "boq_approved",
  ORDERED: "boq_ordered",
  PURCHASED: "boq_purchased",
  DELIVERED: "boq_delivered",
  CANCELLED: "boq_cancelled",
} as const;

// Combined status types
export type LeadStatus = (typeof LEAD_STATUSES)[keyof typeof LEAD_STATUSES];
export type OpportunityStatus =
  (typeof OPPORTUNITY_STATUSES)[keyof typeof OPPORTUNITY_STATUSES];
export type SqStatus = (typeof SQ_STATUSES)[keyof typeof SQ_STATUSES];
export type SoStatus = (typeof SO_STATUSES)[keyof typeof SO_STATUSES];
export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
export type BoqStatus = (typeof BOQ_STATUSES)[keyof typeof BOQ_STATUSES];

export type AllStatuses =
  | LeadStatus
  | OpportunityStatus
  | SqStatus
  | SoStatus
  | PaymentStatus
  | BoqStatus;

/**
 * Extract prefix from prefixed status
 */
export function getStatusPrefix(status: string): string {
  const parts = status.split("_");
  return parts.length > 1 ? parts[0] : "";
}

/**
 * Extract display name from prefixed status
 */
export function getStatusName(status: string): string {
  const parts = status.split("_");
  return parts.length > 1 ? parts.slice(1).join("_") : status;
}

/**
 * Format status for display (clean, capitalized)
 */
export function formatStatusDisplay(status: string | null | undefined): string {
  if (!status) return "Open";

  // Extract the name part after prefix
  const statusName = getStatusName(status);

  // Replace underscores with spaces and capitalize each word
  return statusName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Convert display format back to prefixed status
 */
export function formatStatusValue(
  displayStatus: string,
  prefix: string
): string {
  const cleanStatus = displayStatus.toLowerCase().replace(/\s+/g, "_");
  return `${prefix}_${cleanStatus}`;
}

/**
 * Get all statuses for a specific prefix
 */
export function getStatusesByPrefix(
  prefix: string
): Array<{ value: string; label: string }> {
  const statusMap: Record<string, any> = {
    lead: LEAD_STATUSES,
    opp: OPPORTUNITY_STATUSES,
    sq: SQ_STATUSES,
    so: SO_STATUSES,
    pay: PAYMENT_STATUSES,
    boq: BOQ_STATUSES,
  };

  const statuses = statusMap[prefix];
  if (!statuses) return [];

  return (Object.values(statuses) as string[]).map((status) => ({
    value: status,
    label: formatStatusDisplay(status),
  }));
}

/**
 * Validate if status belongs to correct prefix
 */
export function validateStatusPrefix(
  status: string,
  expectedPrefix: string
): boolean {
  return getStatusPrefix(status) === expectedPrefix;
}

/**
 * Check if status transition is allowed
 */
export function isValidStatusTransition(
  fromStatus: string,
  toStatus: string
): boolean {
  const prefix = getStatusPrefix(fromStatus);

  // Must be same prefix
  if (getStatusPrefix(toStatus) !== prefix) return false;

  // Define allowed transitions based on prefix
  const transitions: Record<string, Record<string, string[]>> = {
    lead: {
      [LEAD_STATUSES.NEW]: [LEAD_STATUSES.CONTACTED],
      [LEAD_STATUSES.CONTACTED]: [
        LEAD_STATUSES.INTERESTED,
        LEAD_STATUSES.UNQUALIFIED,
      ],
      [LEAD_STATUSES.INTERESTED]: [
        LEAD_STATUSES.QUALIFIED,
        LEAD_STATUSES.UNQUALIFIED,
      ],
      [LEAD_STATUSES.QUALIFIED]: [LEAD_STATUSES.CONVERTED],
      [LEAD_STATUSES.UNQUALIFIED]: [],
      [LEAD_STATUSES.CONVERTED]: [],
    },
    opp: {
      [OPPORTUNITY_STATUSES.PROSPECTING]: [OPPORTUNITY_STATUSES.LOST],
      [OPPORTUNITY_STATUSES.LOST]: [],
      [OPPORTUNITY_STATUSES.SQ]: [],
    },
    sq: {
      [SQ_STATUSES.DRAFT]: [SQ_STATUSES.APPROVED, SQ_STATUSES.SENT],
      [SQ_STATUSES.APPROVED]: [
        SQ_STATUSES.SENT,
        SQ_STATUSES.REVISED,
        SQ_STATUSES.LOST,
        SQ_STATUSES.WIN,
        SQ_STATUSES.CONVERTED,
      ],
      [SQ_STATUSES.SENT]: [
        SQ_STATUSES.REVISED,
        SQ_STATUSES.LOST,
        SQ_STATUSES.WIN,
        SQ_STATUSES.CONVERTED,
      ],
      [SQ_STATUSES.REVISED]: [
        SQ_STATUSES.SENT,
        SQ_STATUSES.LOST,
        SQ_STATUSES.WIN,
        SQ_STATUSES.CONVERTED,
      ],
      [SQ_STATUSES.LOST]: [],
      [SQ_STATUSES.WIN]: [],
      [SQ_STATUSES.CONVERTED]: [],
    },
    so: {
      [SO_STATUSES.DRAFT]: [SO_STATUSES.CONFIRMED, SO_STATUSES.CANCELLED],
      [SO_STATUSES.CONFIRMED]: [SO_STATUSES.IN_PROGRESS, SO_STATUSES.CANCELLED],
      [SO_STATUSES.IN_PROGRESS]: [
        SO_STATUSES.READY_TO_SHIP,
        SO_STATUSES.CANCELLED,
      ],
      [SO_STATUSES.READY_TO_SHIP]: [
        SO_STATUSES.PARTIALLY_SHIPPED,
        SO_STATUSES.SHIPPED,
      ],
      [SO_STATUSES.PARTIALLY_SHIPPED]: [SO_STATUSES.SHIPPED],
      [SO_STATUSES.SHIPPED]: [SO_STATUSES.DELIVERED],
      [SO_STATUSES.DELIVERED]: [SO_STATUSES.CLOSED],
      [SO_STATUSES.CLOSED]: [],
      [SO_STATUSES.CANCELLED]: [],
    },
    pay: {
      [PAYMENT_STATUSES.UNPAID]: [
        PAYMENT_STATUSES.PARTIAL,
        PAYMENT_STATUSES.PAID,
        PAYMENT_STATUSES.OVERDUE,
      ],
      [PAYMENT_STATUSES.PARTIAL]: [
        PAYMENT_STATUSES.PAID,
        PAYMENT_STATUSES.OVERDUE,
        PAYMENT_STATUSES.REFUNDED,
      ],
      [PAYMENT_STATUSES.PAID]: [PAYMENT_STATUSES.REFUNDED],
      [PAYMENT_STATUSES.OVERDUE]: [
        PAYMENT_STATUSES.PARTIAL,
        PAYMENT_STATUSES.PAID,
        PAYMENT_STATUSES.REFUNDED,
      ],
      [PAYMENT_STATUSES.REFUNDED]: [],
    },
    boq: {
      [BOQ_STATUSES.PENDING]: [BOQ_STATUSES.APPROVED, BOQ_STATUSES.CANCELLED],
      [BOQ_STATUSES.APPROVED]: [BOQ_STATUSES.ORDERED, BOQ_STATUSES.CANCELLED],
      [BOQ_STATUSES.ORDERED]: [BOQ_STATUSES.PURCHASED, BOQ_STATUSES.CANCELLED],
      [BOQ_STATUSES.PURCHASED]: [
        BOQ_STATUSES.DELIVERED,
        BOQ_STATUSES.CANCELLED,
      ],
      [BOQ_STATUSES.DELIVERED]: [],
      [BOQ_STATUSES.CANCELLED]: [],
    },
  };

  const prefixTransitions = transitions[prefix];
  if (!prefixTransitions) return false;

  const allowedNext = prefixTransitions[fromStatus];
  return allowedNext ? allowedNext.includes(toStatus) : false;
}

// Status options for forms
export const LEAD_STATUS_OPTIONS = (
  Object.values(LEAD_STATUSES) as string[]
).map((status) => ({
  value: status,
  label: formatStatusDisplay(status),
}));

export const OPPORTUNITY_STATUS_OPTIONS = [
  { value: OPPORTUNITY_STATUSES.PROSPECTING, label: "Prospecting" },
  { value: OPPORTUNITY_STATUSES.LOST, label: "Lost" },
  { value: OPPORTUNITY_STATUSES.SQ, label: "SQ" },
];

export const SQ_STATUS_OPTIONS = [
  { value: SQ_STATUSES.DRAFT, label: "Draft" },
  { value: SQ_STATUSES.APPROVED, label: "Approved" },
  { value: SQ_STATUSES.SENT, label: "Sent" },
  { value: SQ_STATUSES.REVISED, label: "Negotiation / Revised" },
  { value: SQ_STATUSES.LOST, label: "Lost" },
  { value: SQ_STATUSES.WIN, label: "Win" },
  { value: SQ_STATUSES.CONVERTED, label: "Converted" },
];

export const SO_STATUS_OPTIONS = (Object.values(SO_STATUSES) as string[]).map(
  (status) => ({
    value: status,
    label: formatStatusDisplay(status),
  })
);

export const PAYMENT_STATUS_OPTIONS = (
  Object.values(PAYMENT_STATUSES) as string[]
).map((status) => ({
  value: status,
  label: formatStatusDisplay(status),
}));

export const BOQ_STATUS_OPTIONS = (Object.values(BOQ_STATUSES) as string[]).map(
  (status) => ({
    value: status,
    label: formatStatusDisplay(status),
  })
);
