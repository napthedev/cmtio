import fauna from "faunadb";
const q = fauna.query;

export const createOrUpdateUser = (user: {
  name: string;
  email: string;
  image: string;
}) =>
  q.Let(
    {
      match: q.Match(q.Index("user_from_email"), user.email as string),
      data: {
        data: {
          username: user.name,
          email: user.email,
          photo_url: user.image,
        },
      },
    },
    q.If(
      q.Exists(q.Var("match")),
      q.Update(q.Select("ref", q.Get(q.Var("match"))), q.Var("data")),
      q.Create(q.Collection("users"), q.Var("data"))
    )
  );
