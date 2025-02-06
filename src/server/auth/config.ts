import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { signInSchema } from "~/schemas";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Конфигурация для NextAuth
export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        name: {},
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } =
              await signInSchema.parseAsync(credentials);

          const user = await db.user.findUnique({
            where: {
              email: email,
            },
          });

          const passwordMatch = await bcrypt.compare(
              password,
              user?.password ?? "",
          );

          if (!passwordMatch) {
            return null;
          }

          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
} satisfies NextAuthConfig;
