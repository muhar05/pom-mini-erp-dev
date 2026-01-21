// utils/quotationPermissions.ts
import { users } from "@/types/models";
import { isSuperuser, isSales, isManagerSales } from "@/utils/userHelpers";
import { SQ_STATUS_OPTIONS } from "./statusHelpers";

export interface QuotationPermission {
  allowedStatuses: string[];
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

// Status enum
export const QUOTATION_STATUSES = {
  DRAFT: "sq_draft",
  REVIEW: "sq_review",
  APPROVED: "sq_approved",
  SENT: "sq_sent",
  REVISED: "sq_revised",
  LOST: "sq_lost",
  WIN: "sq_win",
  REJECTED: "sq_rejected",
  CANCELLED: "sq_cancelled",
  CONVERTED: "sq_converted",
  WAITING_APPROVAL: "sq_waiting_approval",
} as const;

// Permission mapping (SUDAH FIX ROLE NAME)
export const ROLE_PERMISSIONS: Record<string, QuotationPermission> = {
  sales: {
    allowedStatuses: [
      QUOTATION_STATUSES.DRAFT,
      QUOTATION_STATUSES.REVIEW,
      QUOTATION_STATUSES.SENT,
      QUOTATION_STATUSES.REVISED,
      QUOTATION_STATUSES.LOST,
      QUOTATION_STATUSES.WIN,
      QUOTATION_STATUSES.CANCELLED,
      QUOTATION_STATUSES.CONVERTED,
    ],
    canEdit: true,
    canDelete: false,
    canApprove: false,
  },

  "manager-sales": {
    allowedStatuses: [
      QUOTATION_STATUSES.REVIEW,
      QUOTATION_STATUSES.APPROVED,
      QUOTATION_STATUSES.REVISED,
      QUOTATION_STATUSES.REJECTED,
    ],
    canEdit: true,
    canDelete: false,
    canApprove: true,
  },

  superuser: {
    allowedStatuses: SQ_STATUS_OPTIONS.map((opt) => opt.value),
    canEdit: true,
    canDelete: true,
    canApprove: true,
  },
};

// Helper get role
export function getUserRole(user: Partial<users>): string {
  if (isSuperuser(user)) return "superuser";
  if (isSales(user)) return "sales";
  if (isManagerSales(user)) return "manager-sales";

  const roleName = user.roles?.role_name?.toLowerCase();
  if (roleName === "manager-sales") return "manager-sales";

  return "sales";
}

// Get permission
export function getQuotationPermissions(
  user: Partial<users>,
): QuotationPermission {
  const role = getUserRole(user);
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.sales;
}

// Validate status change
export function canChangeStatus(
  user: Partial<users>,
  fromStatus: string,
  toStatus: string,
): { allowed: boolean; message?: string } {
  const permissions = getQuotationPermissions(user);

  if (!permissions.allowedStatuses.includes(toStatus)) {
    return {
      allowed: false,
      message: `Role ${getUserRole(
        user,
      )} tidak diizinkan mengubah status ke ${toStatus}`,
    };
  }

  return { allowed: true };
}

// Full validation
export function validateQuotationChange(
  user: Partial<users>,
  currentStatus: string,
  newStatus: string,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const statusCheck = canChangeStatus(user, currentStatus, newStatus);
  if (!statusCheck.allowed) {
    errors.push(statusCheck.message!);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
