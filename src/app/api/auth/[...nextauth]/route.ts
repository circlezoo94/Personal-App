import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim());

      const allowedDomains = (process.env.ALLOWED_DOMAINS ?? "")
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      const email = user.email ?? "";
      const domain = email.split("@")[1] ?? "";

      return allowedEmails.includes(email) || allowedDomains.includes(domain);
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export { handler as GET, handler as POST };
