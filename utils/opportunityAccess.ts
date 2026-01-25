import { OPPORTUNITY_STATUSES } from "@/utils/statusHelpers";
import { isSuperuser, isManagerSales, isSales } from "@/utils/userHelpers";
import { Opportunity, SessionUser } from "@/types/models";

/**
 * Mengambil ID Sales yang ditugaskan di Opportunity
 */
export function getOpportunityAssignedSales(opportunity: any): number | null {
    if (!opportunity) return null;
    return opportunity.assigned_to ? Number(opportunity.assigned_to) : null;
}

/**
 * Validasi apakah user memiliki hak untuk convert Opportunity (Owner atau Assigned)
 */
export function canConvertOpportunity(user: any, opportunity: any): boolean {
    if (!user || !opportunity) return false;

    const userId = Number(user.id);
    const ownerId = Number(opportunity.id_user);
    const assignedId = getOpportunityAssignedSales(opportunity);

    // Sales yang melakukan convert harus owner Opportunity atau yang di-assign
    return userId === ownerId || userId === assignedId || isSuperuser(user);
}

/**
 * Validasi apakah user bisa melakukan convert Opportunity ke SQ
 */
export function canConvertOpportunityToSQ(
    user: any,
    opportunity: Opportunity
): { can: boolean; reason?: string } {
    if (!user) return { can: false, reason: "Unauthorized" };

    const isSuper = isSuperuser(user);
    const isManager = isManagerSales(user);
    const isSalesRole = isSales(user);

    // 1. Rule: Manager Sales tidak diperbolehkan melakukan convert ke SQ
    if (isManager && !isSuper) {
        return { can: false, reason: "Manager Sales tidak diperbolehkan melakukan convert ke SQ." };
    }

    // 2. Rule: Hanya status Prospecting yang bisa di-convert
    if (opportunity.status !== OPPORTUNITY_STATUSES.PROSPECTING) {
        return { can: false, reason: "Hanya opportunity dengan status Prospecting yang bisa di-convert ke SQ." };
    }

    // 3. Rule: Pastikan Sales adalah owner atau assigned Sales (Gunakan helper baru)
    if (!canConvertOpportunity(user, opportunity)) {
        return { can: false, reason: "Hanya Sales yang ditugaskan atau pemilik data yang bisa melakukan convert." };
    }

    // 4. Rule: Role harus Sales (atau Superuser)
    if (!isSuper && !isSalesRole) {
        return { can: false, reason: "Role Anda tidak diizinkan melakukan convert ke SQ." };
    }

    return { can: true };
}

/**
 * Validasi apakah field tertentu boleh diupdate oleh user berdasarkan role dan status
 */
export function canUpdateOpportunityField(
    user: any,
    opportunity: Opportunity,
    fieldName: string,
    newValue?: any
): { can: boolean; reason?: string } {
    const isSuper = isSuperuser(user);
    const isManager = isManagerSales(user);
    const isSalesRole = isSales(user);
    const currentStatus = opportunity.status;

    // Rule: Customer Info selalu readonly
    const CUSTOMER_INFO_FIELDS = ["customer_name", "lead_name", "contact", "email", "phone", "type", "company", "location", "source"];
    if (CUSTOMER_INFO_FIELDS.includes(fieldName)) {
        return { can: false, reason: "Customer Information tidak dapat diubah." };
    }

    // VALIDASI MANAGER
    if (isManager && !isSuper) {
        // Manager hanya boleh update status dan assigned_to
        if (fieldName === "status") {
            if (newValue && !["opp_prospecting", "opp_lost"].includes(newValue)) {
                return { can: false, reason: "Manager Sales hanya boleh mengubah status ke Prospecting atau Lost." };
            }
            return { can: true };
        }

        if (fieldName === "assigned_to") {
            return { can: true };
        }

        return { can: false, reason: "Manager Sales hanya diizinkan mengubah Status dan Assignment Sales." };
    }

    // VALIDASI SALES
    if (isSalesRole && !isSuper) {
        // Sales hanya bisa update jika status Prospecting
        if (currentStatus !== OPPORTUNITY_STATUSES.PROSPECTING && fieldName !== "status") {
            return { can: false, reason: `Status ${currentStatus} tidak mengizinkan pengubahan data.` };
        }

        if (fieldName === "status") {
            // Sales tidak boleh ubah status ke SQ secara manual
            if (newValue === OPPORTUNITY_STATUSES.SQ) {
                return { can: false, reason: "Status SQ hanya bisa dicapai melalui proses Convert." };
            }
            return { can: true };
        }

        return { can: true };
    }

    return { can: isSuper };
}
