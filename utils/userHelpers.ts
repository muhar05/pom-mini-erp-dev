// File baru untuk fungsi client-safe yang tidak menggunakan Prisma

import { users, leads } from "@/types/models";

export type UserLike =
  | { role_name?: string }
  | { roles?: { role_name?: string } | null }
  | null
  | undefined;

export function isSuperuser(user: UserLike): boolean {
  if (!user) return false;
  if ("role_name" in user && user.role_name)
    return user.role_name.toLowerCase() === "superuser";
  if (
    "roles" in user &&
    user.roles &&
    "role_name" in user.roles &&
    user.roles.role_name
  )
    return user.roles.role_name.toLowerCase() === "superuser";
  return false;
}

export function isSales(user: UserLike): boolean {
  if (!user) return false;
  if ("role_name" in user && user.role_name)
    return user.role_name.toLowerCase() === "sales";
  if (
    "roles" in user &&
    user.roles &&
    "role_name" in user.roles &&
    user.roles.role_name
  )
    return user.roles.role_name.toLowerCase() === "sales";
  return false;
}

export function isManagerSales(user: UserLike): boolean {
  if (!user) return false;
  if ("role_name" in user && user.role_name)
    return user.role_name.toLowerCase() === "manager-sales";
  if (
    "roles" in user &&
    user.roles &&
    "role_name" in user.roles &&
    user.roles.role_name
  )
    return user.roles.role_name.toLowerCase() === "manager-sales";
  return false;
}

export function isPurchasing(user: UserLike): boolean {
  if (!user) return false;
  const role = ("role_name" in user ? user.role_name : (user as any)?.roles?.role_name)?.toLowerCase();
  return role === "purchasing";
}

export function isManagerPurchasing(user: UserLike): boolean {
  if (!user) return false;
  const role = ("role_name" in user ? user.role_name : (user as any)?.roles?.role_name)?.toLowerCase();
  return role === "manager-purchasing";
}

export function isWarehouse(user: UserLike): boolean {
  if (!user) return false;
  const role = ("role_name" in user ? user.role_name : (user as any)?.roles?.role_name)?.toLowerCase();
  return role === "warehouse";
}

export function isManagerWarehouse(user: UserLike): boolean {
  if (!user) return false;
  const role = ("role_name" in user ? user.role_name : (user as any)?.roles?.role_name)?.toLowerCase();
  return role === "manager-warehouse";
}

export function isFinance(user: UserLike): boolean {
  if (!user) return false;
  const role = ("role_name" in user ? user.role_name : (user as any)?.roles?.role_name)?.toLowerCase();
  return role === "finance";
}

export function isManagerFinance(user: UserLike): boolean {
  if (!user) return false;
  const role = ("role_name" in user ? user.role_name : (user as any)?.roles?.role_name)?.toLowerCase();
  return role === "manager-finance";
}


