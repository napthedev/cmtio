import fauna from "faunadb";
const q = fauna.query;

export const getSitesByUserId = (userId: string) =>
  q.Map(
    q.Paginate(
      q.Match(q.Index("sites_by_user"), q.Ref(q.Collection("users"), userId))
    ),
    q.Lambda((app) => q.Get(app))
  );
