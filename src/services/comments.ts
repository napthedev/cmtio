import fauna from "faunadb";

const q = fauna.query;

export const getComment1 = (
  siteId: string,
  slug: string,
  limit: number,
  isSortedByOldest: boolean
) =>
  q.Map(
    q.Paginate(
      (!isSortedByOldest ? q.Reverse : (x: any) => x)(
        q.Match(
          q.Index("comment1_by_site_and_slug"),
          q.Ref(q.Collection("sites"), siteId),
          slug
        )
      ),
      { size: limit }
    ),
    q.Lambda(
      ["ts", "comment1"],
      q.Let(
        {
          data: q.Get(q.Var("comment1")),
          reply_count: q.Count(
            q.Match(q.Index("comment2_by_comment1"), q.Var("comment1"))
          ),
          user: q.Get(q.Select(["data", "user"], q.Var("data"))),
        },
        q.Merge(q.Var("data"), {
          reply_count: q.Var("reply_count"),
          user: q.Var("user"),
        })
      )
    )
  );

export const countComments = (siteId: string, slug: string) =>
  q.Add(
    q.Count(
      q.Match(
        q.Index("comment1_by_site_and_slug"),
        q.Ref(q.Collection("sites"), siteId),
        slug
      )
    ),
    q.Count(
      q.Match(
        q.Index("comment2_by_site_and_slug"),
        q.Ref(q.Collection("sites"), siteId),
        slug
      )
    ),
    q.Count(
      q.Match(
        q.Index("comment3_by_site_and_slug"),
        q.Ref(q.Collection("sites"), siteId),
        slug
      )
    )
  );

export const getComment2 = (parentId: string) =>
  q.Map(
    q.Paginate(
      q.Match(
        q.Index("comment2_by_comment1"),
        q.Ref(q.Collection("comment1"), parentId)
      )
    ),
    q.Lambda(
      "comment2",
      q.Let(
        {
          data: q.Get(q.Var("comment2")),
          reply_count: q.Count(
            q.Match(q.Index("comment3_by_comment2"), q.Var("comment2"))
          ),
          user: q.Get(q.Select(["data", "user"], q.Var("data"))),
        },
        q.Merge(q.Var("data"), {
          reply_count: q.Var("reply_count"),
          user: q.Var("user"),
        })
      )
    )
  );

export const getComment3 = (parentId: string) =>
  q.Map(
    q.Paginate(
      q.Match(
        q.Index("comment3_by_comment2"),
        q.Ref(q.Collection("comment2"), parentId)
      )
    ),
    q.Lambda(
      "comment3",
      q.Let(
        {
          data: q.Get(q.Var("comment3")),
          user: q.Get(q.Select(["data", "user"], q.Var("data"))),
        },
        q.Merge(q.Var("data"), {
          reply_count: 0,
          user: q.Var("user"),
        })
      )
    )
  );

export const writeComment = (
  userId: string,
  siteId: string,
  slug: string,
  text: string
) =>
  q.Create(q.Collection("comment1"), {
    data: {
      text,
      user: q.Ref(q.Collection("users"), userId),
      site: q.Ref(q.Collection("sites"), siteId),
      slug,
    },
  });

export const writeReply = (
  userId: string,
  siteId: string,
  slug: string,
  text: string,
  parentId: string,
  depth: number
) =>
  q.Create(q.Collection(`comment${depth}`), {
    data: {
      text,
      user: q.Ref(q.Collection("users"), userId),
      site: q.Ref(q.Collection("sites"), siteId),
      slug,
      parent: q.Ref(q.Collection(`comment${depth - 1}`), parentId),
    },
  });
