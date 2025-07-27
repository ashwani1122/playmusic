import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prismaClient } from "@/app/lib/db"; // adjust path if needed
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
        clientId: process.env.GOOGLE_ID ?? "",
        clientSecret: process.env.GOOGLE_SECRETE ?? "",
        }),
    ],
    adapter: PrismaAdapter(prismaClient),
    secret: process.env.NEXTAUTH_SECRET ?? "some-secret", // use env var in production

    callbacks: {
        // Include user ID in the JWT token
        async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
        }
        return token;
        },
        // Expose user ID in the session object
        async session({ session, token }) {
        if (token?.id) {
            session.user.id = token.id as string;
        }
        return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
