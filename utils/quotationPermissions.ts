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
  WAITING_APPROVAL: "sq_waiting_approval",
  REVIEW: "sq_review",
  APPROVED: "sq_approved",
  SENT: "sq_sent",
  REVISED: "sq_revised",
  LOST: "sq_lost",
  WIN: "sq_win",
  CONVERTED: "sq_converted",
} as const;

// Permission mapping (SUDAH FIX ROLE NAME)
export const ROLE_PERMISSIONS: Record<string, QuotationPermission> = {
  sales: {
    allowedStatuses: [
      QUOTATION_STATUSES.DRAFT,
      QUOTATION_STATUSES.WAITING_APPROVAL,
      QUOTATION_STATUSES.REVIEW,
      QUOTATION_STATUSES.APPROVED,
      QUOTATION_STATUSES.SENT,
      QUOTATION_STATUSES.REVISED,
      QUOTATION_STATUSES.LOST,
      QUOTATION_STATUSES.WIN,
      QUOTATION_STATUSES.CONVERTED,
    ],
    canEdit: true, // Akan divalidasi lebih lanjut di canEditQuotationByStatus
    canDelete: false,
    canApprove: false,
  },

  "manager-sales": {
    allowedStatuses: [
      QUOTATION_STATUSES.WAITING_APPROVAL,
      QUOTATION_STATUSES.REVIEW,
      QUOTATION_STATUSES.APPROVED,
      QUOTATION_STATUSES.REVISED,
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

/**
 * Validasi apakah data Quotation boleh diedit berdasarkan status saat ini
 */
export function canEditQuotationByStatus(user: any, status: string): boolean {
  if (isSuperuser(user)) return true;

  const currentStatus = status.toLowerCase();

  // Hanya bisa edit jika status Draft
  if (isSales(user)) {
    return currentStatus === QUOTATION_STATUSES.DRAFT;
  }

  // Manager Sales tidak boleh edit jika sudah Approved
  if (isManagerSales(user)) {
    return currentStatus !== QUOTATION_STATUSES.APPROVED;
  }

  return false;
}

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

  // Khusus Sales setelah Approved: Hanya boleh status tertentu
  if (isSales(user) && fromStatus === QUOTATION_STATUSES.APPROVED) {
    const allowedAfterApproved = [
      QUOTATION_STATUSES.APPROVED,
      QUOTATION_STATUSES.SENT,
      QUOTATION_STATUSES.REVISED, // Sebagai trigger revisi
      QUOTATION_STATUSES.LOST,
      QUOTATION_STATUSES.WIN,
      QUOTATION_STATUSES.CONVERTED,
    ];
    if (!allowedAfterApproved.includes(toStatus as any)) {
      return {
        allowed: false,
        message: "Setelah Approved, Anda hanya boleh mengubah status ke Sent, Revised, Lost, Win, atau Converted.",
      };
    }
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
