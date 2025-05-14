import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

// Define user role type
type UserRole = 'admin' | 'editor' | 'user';

// Extend the next-auth types
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }
  
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    }
  }
}
// Simplified Auth.js configuration for Cloudflare compatibility
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        
        try {
          // For development and testing, use hardcoded admin credentials
          // In production, this would be replaced with a database lookup
          if (credentials.username === "admin" && credentials.password === "admin123") {
            return {
              id: "admin-user-id-1",
              name: "Admin User",
              email: "admin@soundmaster.com",
              role: "admin" as UserRole,
            };
          }
          
          // For editor role
          if (credentials.username === "editor" && credentials.password === "editor123") {
            return {
              id: "editor-user-id-1",
              name: "Editor User",
              email: "editor@soundmaster.com",
              role: "editor" as UserRole,
            };
          }
          
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/admin",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User | undefined }) {
      // Add role to the token if available from the user
      if (user && user.role) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Add role to the session from the token
      if (token && session.user && token.role) {
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
});
