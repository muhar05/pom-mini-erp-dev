import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";

export const { handlers, auth } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,

  session: { strategy: "jwt" },

  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
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
      credentials: { email: {}, password: {}, mode: {} },

      authorize: async (credentials) => {
        const email = credentials?.email as string;
        const input = credentials?.password as string;
        const mode = credentials?.mode as string;

        const user = await prisma.users.findUnique({
          where: { email },
          include: { roles: true },
        });

        if (!user) return null;

        // MODE PASSWORD
        if (mode === "password") {
          if (!user.password_hash) return null;

          // Support both plain text (legacy) and hashed passwords
          const isMatch = input === user.password_hash || await (async () => {
            try {
              const bcrypt = await import("bcryptjs");
              return await bcrypt.compare(input, user.password_hash);
            } catch (e) {
              return false;
            }
          })();

          if (!isMatch) return null;
        }

        // MODE OTP
        if (mode === "otp") {
          const otpRecord = await prisma.user_otp.findFirst({
            where: {
              user_id: user.id,
              otp_code: input,
              is_used: false,
              expires_at: { gt: new Date() },
            },
            orderBy: { expires_at: "desc" },
          });

          if (!otpRecord) return null;

          await prisma.user_otp.update({
            where: { id: otpRecord.id },
            data: { is_used: true },
          });
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role_id: String(user.role_id ?? ""),
          role_name: user.roles?.role_name,
        };
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },

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
    error: "/auth/login",
  },
});
