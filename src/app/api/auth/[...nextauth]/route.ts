import NextAuth from "next-auth";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // ✅ ADDED: Import the Prisma Adapter
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

// This allows us to add custom properties like 'role' to the session object.
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isActive: boolean;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isActive: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    role: UserRole;
    isActive: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  // ✅ ADDED: The PrismaAdapter connects NextAuth to your database for session management.
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }
        
        try {
          const passwordMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordMatch) {
            return null;
          }
        } catch (error) {
          console.error("Bcrypt compare error:", error);
          return null;
        }
        
        if (!user.isActive) {
          throw new Error("Your account has not been activated.");
        }

        // This return is still essential for the CredentialsProvider flow
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // The user object is available on the first sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      // The token object contains the data from the jwt callback
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isActive = token.isActive;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Redirect to sign-in page on errors
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
