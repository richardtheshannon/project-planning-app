import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Check if the user's account is active BEFORE checking the password.
        if (!user.isActive) {
          // This specific error message will be sent to the front end.
          throw new Error("Account not activated");
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
            throw new Error("Incorrect password");
        }
        
        // If everything is correct, return the user object.
        // We include isActive and role for the session callbacks.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive, // Pass isActive to the token
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    // Add isActive and role to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isActive = user.isActive;
        token.id = user.id;
      }
      return token;
    },
    // Add isActive and role to the session object
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // Add a custom error page to handle our "Account not activated" message
    error: "/auth/signin", 
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
