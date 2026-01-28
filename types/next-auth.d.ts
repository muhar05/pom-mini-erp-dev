import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string | null;
    role_id: string;
    role_name?: string; // <= tambahkan
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role_id: string;
      role_name?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    role_id: string;
    role_name?: string; // <= tambahkan
  }
}
