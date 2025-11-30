import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import GitHub from "next-auth/providers/github";
// import Google from "next-auth/providers/google";
// import { ZodError } from "zod";
// import { loginSchema } from "./lib/zod";
// import { getUserFromDb, roles } from "./utils/db";
import { prisma } from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials.email as string;
        const otp = credentials.password as string;

        console.log("Authorize called with:", { email, otp });

        const user = await prisma.users.findUnique({
          where: { email },
          include: { roles: true },
        });
        console.log("User found:", user);

        if (!user) return null;

        // Cari OTP yang cocok, sudah diverifikasi, dan belum expired
        const otpRecord = await prisma.user_otp.findFirst({
          where: {
            user_id: user.id,
            otp_code: otp,
            is_used: true,
            expires_at: { gt: new Date() },
          },
          orderBy: { expires_at: "desc" },
        });
        console.log("OTP record found:", otpRecord);

        if (!otpRecord) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role_id: user.role_id ? String(user.role_id) : "",
          role_name: user.roles?.role_name ?? undefined,
        };
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
    error: "/auth/login",
    // callback: "/auth/callback", // jika perlu
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // <-- tambahkan baris ini!
        token.role_id = user.role_id;
        token.role_name = user.role_name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = (token as any).id as string; // <-- tambahkan baris ini!
      session.user.role_id = (token as any).role_id as string;
      session.user.role_name = (token as any).role_name as string | undefined;
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
});
