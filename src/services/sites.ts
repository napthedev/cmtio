import fauna from "faunadb";
const q = fauna.query;

export const getSitesByUserId = (userId: string) =>
  q.Map(
    q.Paginate(
      q.Match(q.Index("sites_by_user"), q.Ref(q.Collection("users"), userId))
    ),
    q.Lambda((site) => q.Get(site))
  );

export const createSite = (
  userId: string,
  siteName: string,
  allowed_origins: string[]
) =>
  q.Let(
    {
      match: q.Match(
        q.Index("site_by_user_and_name"),
        q.Ref(q.Collection("users"), userId),
        siteName
      ),
      data: {
        data: {
          name: siteName,
          user: q.Ref(q.Collection("users"), userId),
          allowed_origins,
        },
      },
    },
    q.If(
      q.Exists(q.Var("match")),
      q.Update(q.Select("ref", q.Get(q.Var("match"))), q.Var("data")),
      q.Create(q.Collection("sites"), q.Var("data"))
    )
  );

export const getSiteById = (siteId: string) =>
  q.Get(q.Ref(q.Collection("sites"), siteId));
