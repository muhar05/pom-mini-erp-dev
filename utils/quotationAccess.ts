import { users } from "@/types/models";

export function canEditQuotation(
  user: users,
  quotation: { user_id?: number | null },
) {
  if (!user) return false;
  const role = getRole(user);
  if (role === "superuser" || role === "manager-sales") return true;
  return false;
}

export function canDeleteQuotation(
  user: users,
  quotation: { user_id?: number | null },
) {
  if (!user) return false;
  const role = getRole(user);
  if (role === "superuser" || role === "manager-sales") return true;
  return false;
}

export function canViewQuotation(
  user: users,
  quotation: { user_id?: number | null },
) {
  if (!user) return false;
  const role = getRole(user);
  if (role === "superuser" || role === "manager-sales") return true;
  return quotation.user_id === user.id;
}

export function getRole(user: users): string {
  if (typeof user.role_id === "string" && user.role_id)
    return user.role_id.toString().toLowerCase();
  if (
    "role_name" in user &&
    typeof user.role_name === "string" &&
    user.role_name
  )
    return user.role_name.toLowerCase();
  if (
    user.roles &&
    typeof user.roles.role_name === "string" &&
    user.roles.role_name
  )
    return user.roles.role_name.toLowerCase();
  return "";
}
