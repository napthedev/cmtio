import fauna from "faunadb";

export const client = new fauna.Client({
  secret: process.env.FAUNADB_SECRET_KEY as string,
  domain: "db.fauna.com",
});
