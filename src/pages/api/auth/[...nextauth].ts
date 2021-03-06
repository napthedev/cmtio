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
    colorScheme: "auto",
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
      const result = JSON.parse(
        JSON.stringify(await client.query(createOrUpdateUser(user as any)))
      );
      user.id = idFromRef(result.ref);

      return true;
    },
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        path: "/",
        sameSite: "none",
        secure: true,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
    },
  },
});
