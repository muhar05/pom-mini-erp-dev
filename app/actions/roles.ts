// src/actions/roles.ts
"use server";

import { getAllRolesDb } from "@/data/roles";

export async function getAllRolesAction() {
  return getAllRolesDb();
}
