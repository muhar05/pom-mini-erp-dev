import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  cookies: {
    sessionToken: {
      name: "__Secure-authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials.email as string;
        const otp = credentials.password as string;

        const user = await prisma.users.findUnique({
          where: { email },
          include: { roles: true },
        });
        if (!user) return null;

        const otpRecord = await prisma.user_otp.findFirst({
          where: {
            user_id: user.id,
            otp_code: otp,
            is_used: true,
            expires_at: { gt: new Date() },
          },
        });
        if (!otpRecord) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role_id: user.role_id ? String(user.role_id) : "",
          role_name: user.roles?.role_name,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role_id = user.role_id;
        token.role_name = user.role_name;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role_id = token.role_id;
      session.user.role_name = token.role_name;
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
});
