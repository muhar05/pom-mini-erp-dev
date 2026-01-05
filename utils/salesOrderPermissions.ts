import { users } from "@/types/models";

// Sales Order statuses sesuai flow bisnis
export const SALES_ORDER_STATUSES = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const SALE_STATUSES = {
  OPEN: "OPEN",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const PAYMENT_STATUSES = {
  UNPAID: "UNPAID",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
} as const;

// Sales Order permissions berdasarkan status dan role
export interface SalesOrderPermissions {
  canEdit: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  canUpdateNote: boolean;
  canUploadPO: boolean;
  canRequestFinance: boolean;
  canCreateDelivery: boolean;
  canUpdatePayment: boolean;
  canClose: boolean;
  editableFields: string[];
  availableActions: string[];
}

export function getSalesOrderPermissions(
  salesOrder: any,
  user: users | null
): SalesOrderPermissions {
  if (!user) {
    return getDefaultPermissions();
  }

  const status = salesOrder?.sale_status || salesOrder?.status;
  const userRole = user.roles?.role_name || "sales";

  // Default permissions - no access
  let permissions: SalesOrderPermissions = getDefaultPermissions();

  // Hanya SO yang berasal dari quotation yang bisa diakses
  if (!salesOrder?.quotation_id) {
    return permissions;
  }

  switch (status) {
    case SALE_STATUSES.OPEN:
      permissions = {
        canEdit: false, // Tidak ada edit bebas
        canConfirm: isAuthorizedToConfirm(userRole),
        canCancel: isAuthorizedToCancel(userRole),
        canUpdateNote: true,
        canUploadPO: true,
        canRequestFinance: false,
        canCreateDelivery: false,
        canUpdatePayment: false,
        canClose: false,
        editableFields: ["note", "file_po_customer"],
        availableActions: ["confirm", "cancel", "update_note", "upload_po"],
      };
      break;

    case SALE_STATUSES.CONFIRMED:
      permissions = {
        canEdit: false, // Items, price, qty terkunci
        canConfirm: false,
        canCancel: isAuthorizedToCancel(userRole),
        canUpdateNote: true,
        canUploadPO: true,
        canRequestFinance: isAuthorizedForFinance(userRole),
        canCreateDelivery: false, // Hanya setelah finance approve
        canUpdatePayment: isAuthorizedForPayment(userRole),
        canClose: false,
        editableFields: ["note", "file_po_customer", "payment_status"],
        availableActions: [
          "cancel",
          "request_finance",
          "update_payment",
          "update_note",
        ],
      };
      break;

    case SALE_STATUSES.IN_PROGRESS:
      permissions = {
        canEdit: false,
        canConfirm: false,
        canCancel: isAuthorizedToCancel(userRole),
        canUpdateNote: true,
        canUploadPO: false,
        canRequestFinance: false,
        canCreateDelivery: isAuthorizedForDelivery(userRole),
        canUpdatePayment: isAuthorizedForPayment(userRole),
        canClose: false,
        editableFields: ["note", "payment_status"],
        availableActions: [
          "create_delivery",
          "update_payment",
          "update_note",
          "cancel",
        ],
      };
      break;

    case SALE_STATUSES.COMPLETED:
      permissions = {
        canEdit: false,
        canConfirm: false,
        canCancel: false,
        canUpdateNote: true,
        canUploadPO: false,
        canRequestFinance: false,
        canCreateDelivery: false,
        canUpdatePayment: isAuthorizedForPayment(userRole),
        canClose: isAuthorizedToClose(userRole),
        editableFields: ["note", "payment_status"],
        availableActions: ["update_payment", "close", "update_note"],
      };
      break;

    case SALE_STATUSES.CANCELLED:
      permissions = {
        canEdit: false,
        canConfirm: false,
        canCancel: false,
        canUpdateNote: true,
        canUploadPO: false,
        canRequestFinance: false,
        canCreateDelivery: false,
        canUpdatePayment: false,
        canClose: false,
        editableFields: ["note"],
        availableActions: ["update_note"],
      };
      break;

    default:
      permissions = getDefaultPermissions();
  }

  return permissions;
}

function getDefaultPermissions(): SalesOrderPermissions {
  return {
    canEdit: false,
    canConfirm: false,
    canCancel: false,
    canUpdateNote: false,
    canUploadPO: false,
    canRequestFinance: false,
    canCreateDelivery: false,
    canUpdatePayment: false,
    canClose: false,
    editableFields: [],
    availableActions: [],
  };
}

// Role-based authorization helpers
function isAuthorizedToConfirm(role: string): boolean {
  return ["superadmin", "manager_sales", "sales"].includes(role);
}

function isAuthorizedToCancel(role: string): boolean {
  return ["superadmin", "manager_sales"].includes(role);
}

function isAuthorizedForFinance(role: string): boolean {
  return ["superadmin", "manager_sales", "finance"].includes(role);
}

function isAuthorizedForDelivery(role: string): boolean {
  return ["superadmin", "manager_sales", "warehouse"].includes(role);
}

function isAuthorizedForPayment(role: string): boolean {
  return ["superadmin", "manager_sales", "finance"].includes(role);
}

function isAuthorizedToClose(role: string): boolean {
  return ["superadmin", "manager_sales"].includes(role);
}

// Helper untuk check apakah field bisa diedit
export function isFieldEditable(
  field: string,
  permissions: SalesOrderPermissions
): boolean {
  return permissions.editableFields.includes(field);
}

// Helper untuk check apakah action tersedia
export function isActionAvailable(
  action: string,
  permissions: SalesOrderPermissions
): boolean {
  return permissions.availableActions.includes(action);
}

// Helper untuk mendapatkan next possible statuses
export function getNextPossibleStatuses(currentStatus: string): string[] {
  switch (currentStatus) {
    case SALE_STATUSES.OPEN:
      return [SALE_STATUSES.CONFIRMED, SALE_STATUSES.CANCELLED];
    case SALE_STATUSES.CONFIRMED:
      return [SALE_STATUSES.IN_PROGRESS, SALE_STATUSES.CANCELLED];
    case SALE_STATUSES.IN_PROGRESS:
      return [SALE_STATUSES.COMPLETED, SALE_STATUSES.CANCELLED];
    case SALE_STATUSES.COMPLETED:
      return []; // Final state, hanya bisa close
    case SALE_STATUSES.CANCELLED:
      return []; // Final state
    default:
      return [];
  }
}

// Validasi flow transition
export function isValidStatusTransition(from: string, to: string): boolean {
  const nextStatuses = getNextPossibleStatuses(from);
  return nextStatuses.includes(to);
}
