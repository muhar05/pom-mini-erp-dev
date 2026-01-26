import { auth } from "@/auth";
import { isSuperuser, isManagerSales, isSales, isPurchasing, isManagerPurchasing, isFinance, isManagerFinance, isWarehouse, isManagerWarehouse } from "./userHelpers";
import { canAccessQuotation } from "./quotationAccess";
import { users } from "@/types/models";
import { notFound, redirect } from "next/navigation";

export async function getSessionUser() {
    const session = await auth();
    return session?.user as users | undefined;
}

export function canAccessAll(user: any) {
    return isSuperuser(user) || isManagerSales(user);
}

export function validateOwnership(resourceUserId: number | null | undefined, user: any) {
    if (canAccessAll(user)) return true;
    if (isSales(user)) {
        return Number(resourceUserId) === Number(user.id);
    }
    return false;
}

export function checkLeadOwnership(lead: any, user: any) {
    if (canAccessAll(user)) return true;
    if (isSales(user)) {
        const userId = Number(user.id);
        const isOwner = Number(lead.id_user) === userId;
        const isAssigned = Number(lead.assigned_to) === userId;
        if (isOwner || isAssigned) return true;
    }
    notFound();
}

export function checkOpportunityOwnership(opportunity: any, user: any) {
    // Opportunity is just a lead with specific status
    return checkLeadOwnership(opportunity, user);
}

export function checkQuotationOwnership(quotation: any, user: any) {
    if (canAccessAll(user)) return true;
    if (isSales(user)) {
        if (Number(quotation.user_id) === Number(user.id)) return true;
    }
    notFound();
}

export function checkSalesOrderOwnership(so: any, user: any) {
    if (canAccessAll(user)) return true;

    // IZINKAN role pendukung untuk melihat data (termasuk manager mereka)
    if (
        isPurchasing(user) || isManagerPurchasing(user) ||
        isFinance(user) || isManagerFinance(user) ||
        isWarehouse(user) || isManagerWarehouse(user)
    ) return true;

    if (isSales(user)) {
        if (Number(so.user_id) === Number(user.id)) return true;
    }
    notFound();
}
