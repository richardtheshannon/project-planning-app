import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

// Extend the built-in session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isActive: boolean; // Add isActive to the session
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    isActive: boolean; // Add isActive to the user
  }
}

// Extend the built-in JWT type
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    isActive: boolean; // Add isActive to the JWT
  }
}
