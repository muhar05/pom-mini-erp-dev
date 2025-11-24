import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import GitHub from "next-auth/providers/github";
// import Google from "next-auth/providers/google";
import { ZodError } from "zod";
import { loginSchema } from "./lib/zod";
import { getUserFromDb, roles } from "./utils/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials);
          const user = await getUserFromDb(email, password);

          if (!user) return null;

          // Penting: format return user sesuai NextAuth
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            role_name: roles.find((r) => r.id === user.role_id)?.role_name,
          };
        } catch (error) {
          if (error instanceof ZodError) return null;
          return null;
        }
      },
    }),

    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //   authorization: {
    //     params: {
    //       prompt: "consent",
    //       access_type: "offline",
    //       response_type: "code",
    //     },
    //   },
    // }),
    // GitHub({
    //   clientId: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    //   authorization: {
    //     params: {
    //       prompt: "consent",
    //       access_type: "offline",
    //       response_type: "code",
    //     },
    //   },
    // }),
  ],

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login", // bisa custom error page
    // callback: "/auth/callback", // jika perlu
  },

  // Tambahkan callback agar role tertanam di session JWT
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role_id = user.role_id;
        token.role_name = user.role_name; // <= tambahkan
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role_id = token.role_id;
      session.user.role_name = token.role_name; // <= tambahkan
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
});
