// utils/quotationPermissions.ts
import { users } from "@/types/models";
import { isSuperuser, isSales } from "@/utils/userHelpers"; // Fix: Change from leadHelpers to userHelpers

export interface QuotationPermission {
  allowedStatuses: string[];
  allowedStages: string[];
  canEdit: boolean;
  canDelete: boolean;
}

// Status dan Stage yang valid
export const QUOTATION_STATUSES = {
  DRAFT: "sq_draft",
  REVIEW: "sq_review",
  APPROVED: "sq_approved",
  SENT: "sq_sent",
  REVISED: "sq_revised", // Added
  LOST: "sq_lost", // Added
  WIN: "sq_win", // Added
  REJECTED: "sq_rejected",
  CANCELLED: "sq_cancelled",
  CONVERTED: "sq_converted", // Added
} as const;

export const QUOTATION_STAGES = {
  DRAFT: "draft",
  REVIEW: "review",
  APPROVED: "approved",
  SENT: "sent",
  NEGOTIATION: "negotiation", // Added for revised status
  CLOSED: "closed", // Added for win/lost/converted
} as const;

// Type untuk stage values
type QuotationStageValue =
  (typeof QUOTATION_STAGES)[keyof typeof QUOTATION_STAGES];

// Mapping Status ke Stage yang valid
export const STATUS_STAGE_MAPPING: Record<string, QuotationStageValue[]> = {
  [QUOTATION_STATUSES.DRAFT]: [QUOTATION_STAGES.DRAFT],
  [QUOTATION_STATUSES.REVIEW]: [QUOTATION_STAGES.REVIEW],
  [QUOTATION_STATUSES.APPROVED]: [QUOTATION_STAGES.APPROVED],
  [QUOTATION_STATUSES.SENT]: [QUOTATION_STAGES.SENT],
  [QUOTATION_STATUSES.REVISED]: [QUOTATION_STAGES.NEGOTIATION],
  [QUOTATION_STATUSES.LOST]: [QUOTATION_STAGES.CLOSED],
  [QUOTATION_STATUSES.WIN]: [QUOTATION_STAGES.CLOSED],
  [QUOTATION_STATUSES.CONVERTED]: [QUOTATION_STAGES.CLOSED],
  [QUOTATION_STATUSES.REJECTED]: [QUOTATION_STAGES.REVIEW],
  [QUOTATION_STATUSES.CANCELLED]: [
    QUOTATION_STAGES.DRAFT,
    QUOTATION_STAGES.REVIEW,
  ],
} as const;

// Permission mapping berdasarkan role - UPDATED
export const ROLE_PERMISSIONS: Record<string, QuotationPermission> = {
  // Role Sales - bisa create, edit, dan update status sampai sent
  sales: {
    allowedStatuses: [
      QUOTATION_STATUSES.DRAFT,
      QUOTATION_STATUSES.REVIEW,
      QUOTATION_STATUSES.SENT, // Sales bisa kirim ke customer
      QUOTATION_STATUSES.REVISED, // Sales bisa revisi
      QUOTATION_STATUSES.LOST, // Sales bisa mark sebagai lost
      QUOTATION_STATUSES.WIN, // Sales bisa mark sebagai win
      QUOTATION_STATUSES.CANCELLED,
    ],
    allowedStages: [
      QUOTATION_STAGES.DRAFT,
      QUOTATION_STAGES.REVIEW,
      QUOTATION_STAGES.SENT,
      QUOTATION_STAGES.NEGOTIATION,
      QUOTATION_STAGES.CLOSED,
    ],
    canEdit: true,
    canDelete: false,
  },

  // Role Manager Sales - bisa approve dan semua status
  manager_sales: {
    allowedStatuses: [
      QUOTATION_STATUSES.REVIEW,
      QUOTATION_STATUSES.APPROVED, // Manager approve
      QUOTATION_STATUSES.SENT,
      QUOTATION_STATUSES.REVISED,
      QUOTATION_STATUSES.LOST,
      QUOTATION_STATUSES.WIN,
      QUOTATION_STATUSES.CONVERTED, // Manager bisa convert ke SO
      QUOTATION_STATUSES.REJECTED,
      QUOTATION_STATUSES.CANCELLED,
    ],
    allowedStages: [
      QUOTATION_STAGES.REVIEW,
      QUOTATION_STAGES.APPROVED,
      QUOTATION_STAGES.SENT,
      QUOTATION_STAGES.NEGOTIATION,
      QUOTATION_STAGES.CLOSED,
    ],
    canEdit: true,
    canDelete: false,
  },

  // Role Superuser - akses penuh
  superuser: {
    allowedStatuses: Object.values(QUOTATION_STATUSES),
    allowedStages: Object.values(QUOTATION_STAGES),
    canEdit: true,
    canDelete: true,
  },
};

// Helper function untuk mendapatkan role name
export function getUserRole(user: users): string {
  if (isSuperuser(user)) return "superuser";
  if (isSales(user)) return "sales";

  // Check untuk manager roles - hanya dari roles relation
  const roleName = user.roles?.role_name?.toLowerCase();
  if (roleName?.includes("manager_sales")) return "manager_sales";

  return "sales"; // default fallback
}

// Validasi permission berdasarkan user role
export function getQuotationPermissions(user: users): QuotationPermission {
  const role = getUserRole(user);
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.sales;
}

// Validasi apakah user boleh mengubah status
export function canChangeStatus(
  user: users,
  fromStatus: string,
  toStatus: string
): { allowed: boolean; message?: string } {
  const permissions = getQuotationPermissions(user);

  if (!permissions.allowedStatuses.includes(toStatus)) {
    return {
      allowed: false,
      message: `Role ${getUserRole(
        user
      )} tidak diizinkan mengubah status ke ${toStatus}`,
    };
  }

  return { allowed: true };
}

// Validasi apakah user boleh mengubah stage
export function canChangeStage(
  user: users,
  fromStage: string,
  toStage: string
): { allowed: boolean; message?: string } {
  const permissions = getQuotationPermissions(user);

  if (!permissions.allowedStages.includes(toStage)) {
    return {
      allowed: false,
      message: `Role ${getUserRole(
        user
      )} tidak diizinkan mengubah stage ke ${toStage}`,
    };
  }

  return { allowed: true };
}

// Validasi konsistensi status dan stage
export function isStatusStageConsistent(
  status: string,
  stage: string
): { consistent: boolean; message?: string } {
  const validStages = STATUS_STAGE_MAPPING[status];

  if (!validStages || !validStages.includes(stage as QuotationStageValue)) {
    return {
      consistent: false,
      message: `Status ${status} tidak konsisten dengan stage ${stage}`,
    };
  }

  return { consistent: true };
}

// Validasi lengkap untuk perubahan quotation
export function validateQuotationChange(
  user: users,
  currentStatus: string,
  newStatus: string,
  currentStage: string,
  newStage: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validasi permission status
  const statusCheck = canChangeStatus(user, currentStatus, newStatus);
  if (!statusCheck.allowed) {
    errors.push(statusCheck.message!);
  }

  // Validasi permission stage
  const stageCheck = canChangeStage(user, currentStage, newStage);
  if (!stageCheck.allowed) {
    errors.push(stageCheck.message!);
  }

  // Validasi konsistensi status-stage
  const consistencyCheck = isStatusStageConsistent(newStatus, newStage);
  if (!consistencyCheck.consistent) {
    errors.push(consistencyCheck.message!);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
