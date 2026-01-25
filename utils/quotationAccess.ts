import { isSuperuser, isManagerSales, isSales } from "./userHelpers";

export function canEditQuotation(
  user: any,
  quotation: { user_id?: number | null },
) {
  if (!user) return false;
  const userData = user.user ? user.user : user;
  if (isSuperuser(userData) || isManagerSales(userData)) return true;
  if (isSales(userData)) {
    return Number(quotation.user_id) === Number(userData.id);
  }
  return false;
}

export function canDeleteQuotation(
  user: any,
  quotation: { user_id?: number | null },
) {
  if (!user) return false;
  const userData = user.user ? user.user : user;
  if (isSuperuser(userData) || isManagerSales(userData)) return true;
  if (isSales(userData)) {
    return Number(quotation.user_id) === Number(userData.id);
  }
  return false;
}

export function canViewQuotation(
  user: any,
  quotation: { user_id?: number | null },
) {
  if (!user) return false;
  const userData = user.user ? user.user : user;
  if (isSuperuser(userData) || isManagerSales(userData)) return true;
  if (isSales(userData)) {
    return Number(quotation.user_id) === Number(userData.id);
  }
  return false;
}

export function canAccessQuotation(user: any, quotation: any): boolean {
  if (!user || !quotation) return false;

  // Handle if session object is passed instead of user object
  const userData = user.user ? user.user : user;

  if (isSuperuser(userData) || isManagerSales(userData)) return true;
  if (isSales(userData)) {
    return Number(quotation.user_id) === Number(userData.id);
  }
  return false;
}
