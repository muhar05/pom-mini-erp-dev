import { users } from "@/types/models";

// Sales Order statuses sesuai flow bisnis lintas divisi
export const SALE_STATUSES = {
  NEW: "NEW", // Sales
  PR: "PR", // Purchasing
  PO: "PO", // Purchasing
  SR: "SR", // Purchasing (Stock Receipt/Reservation)
  FAR: "FAR", // Purchasing (Finance Approval Request)
  DR: "DR", // Purchasing (Delivery Request)
  DELIVERY: "DELIVERY", // Warehouse
  DELIVERED: "DELIVERED", // Warehouse
  RECEIVED: "RECEIVED", // Sales (Final hand-over to customer)
  COMPLETED: "COMPLETED", // Final
  CANCELLED: "CANCELLED", // Final
} as const;

export const ITEM_STATUSES = {
  ACTIVE: "ACTIVE", // Belum diproses
  PARTIAL_DELIVERED: "PARTIAL_DELIVERED", // Sebagian sudah dikirim
  DELIVERED: "DELIVERED", // Sudah dikirim semua
  CANCELLED: "CANCELLED", // Item dibatalkan
} as const;

export const ITEM_STATUS_DETAILS: Record<string, { label: string, desc: string }> = {
  [ITEM_STATUSES.ACTIVE]: { label: "ACTIVE", desc: "Belum dikirim" },
  [ITEM_STATUSES.PARTIAL_DELIVERED]: { label: "PARTIAL", desc: "Dikirim sebagian" },
  [ITEM_STATUSES.DELIVERED]: { label: "DELIVERED", desc: "Dikirim semua" },
  [ITEM_STATUSES.CANCELLED]: { label: "CANCELLED", desc: "Dibatalkan" },
};

export const PAYMENT_STATUSES = {
  UNPAID: "UNPAID",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
} as const;

export const REOPEN_SYSTEM_PREFIXES = {
  REQUEST: "[REOPEN REQUEST]",
  APPROVED: "[REOPEN APPROVED]",
  REJECTED: "[REOPEN REJECTED]",
} as const;

export function hasPendingReopenRequest(note: string | null | undefined): boolean {
  if (!note) return false;
  return (
    note.includes(REOPEN_SYSTEM_PREFIXES.REQUEST) &&
    !note.includes(REOPEN_SYSTEM_PREFIXES.APPROVED) &&
    !note.includes(REOPEN_SYSTEM_PREFIXES.REJECTED)
  );
}

// Helper untuk check superuser
export function isSuperuser(user: users | any): boolean {
  const role = user?.role_name || user?.roles?.role_name || user?.role || "";
  return role.toLowerCase() === "superuser";
}

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
  canRequestReopen: boolean;
  editableFields: string[];
  availableActions: string[];
}

export function getSalesOrderPermissions(
  salesOrder: any,
  user: users | any
): SalesOrderPermissions {
  if (!user) {
    return getDefaultPermissions();
  }

  const status = salesOrder?.sale_status || salesOrder?.status;
  const userRole = (user.role_name || user.roles?.role_name || "sales").toLowerCase();

  const isOwner = Number(salesOrder?.user_id) === Number(user.id) || isSuperuser(user);

  let permissions: SalesOrderPermissions = getDefaultPermissions();
  const availableActions: string[] = [];

  // Superuser can always do everything
  if (isSuperuser(user)) {
    // Basic permissions for superuser
    permissions.canEdit = status === SALE_STATUSES.NEW;
    permissions.canCancel = true;
    permissions.canUpdateNote = true;
    // ... logic below will add more actions
  }

  // Role based status manipulation authorization
  switch (status) {
    case SALE_STATUSES.NEW:
    case "OPEN": // Handle legacy status
    case "DRAFT": // Handle legacy status
      if (isSales(user)) {
        permissions.canEdit = true;
        permissions.canUpdateNote = true;
        permissions.canUploadPO = true;

        // ONLY sales team (owner/manager) and superuser can move to PR
        availableActions.push("update_status_pr");
      }
      break;

    case SALE_STATUSES.PR:
    case SALE_STATUSES.PO:
    case SALE_STATUSES.SR:
    case SALE_STATUSES.FAR:
    case SALE_STATUSES.DR:
      if (["purchasing", "manager-purchasing", "superuser"].includes(userRole)) {
        permissions.canUpdateNote = true;

        if (status === SALE_STATUSES.PR) {
          availableActions.push("update_status_po");
          if (["manager-sales", "superuser", "manager-purchasing"].includes(userRole)) {
            availableActions.push("reopen_to_new");
          }
        }
        if (status === SALE_STATUSES.PO) availableActions.push("update_status_sr");
        if (status === SALE_STATUSES.SR) availableActions.push("update_status_far");
        if (status === SALE_STATUSES.FAR) availableActions.push("update_status_dr");
        if (status === SALE_STATUSES.DR) availableActions.push("update_status_delivery");
      }

      // Sales/Manager Sales can request or perform reopen
      if (["sales", "manager-sales", "superuser"].includes(userRole)) {
        if (status === SALE_STATUSES.PR) {
          if (["manager-sales", "superuser"].includes(userRole)) {
            if (!availableActions.includes("reopen_to_new")) {
              availableActions.push("reopen_to_new");
            }
          } else {
            permissions.canRequestReopen = true;
          }
        }
      }

      if (userRole === "finance" && status === SALE_STATUSES.FAR) {
        availableActions.push("approve_far");
      }
      break;

    case SALE_STATUSES.DELIVERY:
      if (["warehouse", "manager-warehouse", "superuser"].includes(userRole)) {
        availableActions.push("update_status_delivered");
      }
      break;

    case SALE_STATUSES.DELIVERED:
      if (["sales", "superuser"].includes(userRole)) {
        availableActions.push("update_status_received");
      }
      break;

    case SALE_STATUSES.RECEIVED:
      if (["sales", "manager-sales", "superuser"].includes(userRole)) {
        availableActions.push("complete");
      }
      break;
  }

  // Role based field authorization
  const editableFields: string[] = [];

  if (status === SALE_STATUSES.NEW || !status) {
    if (isSales(user)) {
      editableFields.push("note", "quotation_id", "customer_id", "payment_term_id", "items", "file_po_customer");
    }
  } else if (status === SALE_STATUSES.PR) {
    if (["sales", "manager-sales", "purchasing", "manager-purchasing", "superuser"].includes(userRole)) {
      editableFields.push("note");
    }
  }

  // Cancel is generally restricted
  if (["superuser", "manager-sales"].includes(userRole) && status !== SALE_STATUSES.COMPLETED && status !== SALE_STATUSES.CANCELLED) {
    permissions.canCancel = true;
    if (!availableActions.includes("cancel")) {
      availableActions.push("cancel");
    }
  }

  permissions.editableFields = editableFields;
  permissions.availableActions = availableActions;
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
    canRequestReopen: false,
    editableFields: [],
    availableActions: [],
  };
}

// Global role checks
export function isSales(user: users | any): boolean {
  const role = user?.role_name || user?.roles?.role_name || user?.role || "";
  return ["sales", "manager-sales", "superuser"].includes(role.toLowerCase());
}

export function isManagerSales(user: users | any): boolean {
  const role = user?.role_name || user?.roles?.role_name || user?.role || "";
  return ["manager-sales", "superuser"].includes(role.toLowerCase());
}

export function isPurchasing(user: users | any): boolean {
  const role = user?.role_name || user?.roles?.role_name || user?.role || "";
  return ["purchasing", "manager-purchasing", "superuser"].includes(role.toLowerCase());
}

export function isWarehouse(user: users | any): boolean {
  const role = user?.role_name || user?.roles?.role_name || user?.role || "";
  return ["warehouse", "manager-warehouse", "superuser"].includes(role.toLowerCase());
}

export function isFinance(user: users | any): boolean {
  const role = user?.role_name || user?.roles?.role_name || user?.role || "";
  return ["finance", "manager-finance", "superuser"].includes(role.toLowerCase());
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
    case SALE_STATUSES.NEW:
      return [SALE_STATUSES.PR, SALE_STATUSES.CANCELLED];
    case SALE_STATUSES.PR:
      return [SALE_STATUSES.PO, SALE_STATUSES.CANCELLED, SALE_STATUSES.NEW];
    case SALE_STATUSES.PO:
      return [SALE_STATUSES.SR, SALE_STATUSES.CANCELLED];
    case SALE_STATUSES.SR:
      return [SALE_STATUSES.FAR, SALE_STATUSES.CANCELLED];
    case SALE_STATUSES.FAR:
      return [SALE_STATUSES.DR, SALE_STATUSES.CANCELLED];
    case SALE_STATUSES.DR:
      return [SALE_STATUSES.DELIVERY, SALE_STATUSES.CANCELLED];
    case SALE_STATUSES.DELIVERY:
      return [SALE_STATUSES.DELIVERED, SALE_STATUSES.CANCELLED];
    case SALE_STATUSES.DELIVERED:
      return [SALE_STATUSES.RECEIVED, SALE_STATUSES.CANCELLED];
    case SALE_STATUSES.RECEIVED:
      return [SALE_STATUSES.COMPLETED];
    default:
      return [];
  }
}

// Validasi flow transition
export function isValidStatusTransition(from: string, to: string): boolean {
  const nextStatuses = getNextPossibleStatuses(from);
  return nextStatuses.includes(to);
}
