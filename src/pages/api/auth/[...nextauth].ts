import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import fauna from "faunadb";
import { idFromRef } from "../../../utils/fauna";

const q = fauna.query;

const client = new fauna.Client({
  secret: process.env.FAUNADB_SECRET_KEY as string,
  domain: "db.fauna.com",
});

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
        q.Let(
          {
            match: q.Match(q.Index("user_from_email"), user.email as string),
            data: {
              data: {
                username: user.name,
                email: user.email,
                photo_url: user.picture,
              },
            },
          },
          q.If(
            q.Exists(q.Var("match")),
            q.Update(q.Select("ref", q.Get(q.Var("match"))), q.Var("data")),
            q.Create(q.Collection("users"), q.Var("data"))
          )
        )
      )) as any;
      user.id = idFromRef(result.ref);

      return true;
    },
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
});
