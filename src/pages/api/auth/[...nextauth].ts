import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import { client } from "@/shared/client";
import { createOrUpdateUser } from "@/services/users";
import { idFromRef } from "@/utils/fauna";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  theme: {
    colorScheme: "dark",
    logo: "/icon.png",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FB_APP_ID as string,
      clientSecret: process.env.FB_APP_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return { ...session, user: { ...session.user, id: token.sub } };
    },
    signIn: async ({ user }) => {
      const result = (await client.query(
        createOrUpdateUser(user as any)
      )) as any;
      user.id = idFromRef(result.ref);

      return true;
    },
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
});
