"use server";

import { signIn, signOut } from "next-auth/react";

export async function doSocialLogin(formData: FormData) {
  const action = formData.get("action");

  // NextAuth akan handle redirect di client
  await signIn(action as string, {
    callbackUrl: "/dashboard",
  });
}

export async function doLogout() {
  await signOut({
    callbackUrl: "/auth/login",
  });
}
