import type { NextAuthConfig } from "next-auth";

// Lightweight auth config used in middleware (Edge runtime — no Node.js/Prisma imports)
export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      if (!isLoggedIn && !isAuthPage) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
};
