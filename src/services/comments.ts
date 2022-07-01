import fauna from "faunadb";

const q = fauna.query;

const getCommentReactionsInfo = (comment: ReturnType<typeof q.Ref>) =>
  q.Filter(
    q.Map(
      [1, 2, 3, 4, 5, 6, 7],
      q.Lambda(
        ["value"],
        q.Let(
          {
            reactionRef: q.Match(
              q.Index("reactions_by_value_and_comment"),
              q.Var("value"),
              comment
            ),
            reactionsCount: q.Count(q.Var("reactionRef")),
          },
          {
            count: q.Var("reactionsCount"),
            value: q.Var("value"),
          }
        )
      )
    ),
    q.Lambda("item", q.GT(q.Select("count", q.Var("item")), 0))
  );

const getCurrentUserReaction = (
  userId: string,
  comment: ReturnType<typeof q.Ref>
) =>
  userId
    ? q.If(
        q.IsEmpty(
          q.Match(
            q.Index("reactions_by_user_and_comment"),
            q.Ref(q.Collection("users"), userId),
            comment
          )
        ),
        0,
        q.Select(
          ["data", "value"],
          q.Get(
            q.Match(
              q.Index("reactions_by_user_and_comment"),
              q.Ref(q.Collection("users"), userId),
              comment
            )
          )
        )
      )
    : 0;

export const getComment1 = (
  siteId: string,
  slug: string,
  limit: number,
  isSortedByOldest: boolean,
  userId: string = ""
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
          reactions: getCommentReactionsInfo(q.Var("comment1")),
          current_user_reaction: getCurrentUserReaction(
            userId,
            q.Var("comment1")
          ),
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

export const getComment2 = (parentId: string, userId: string = "") =>
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
          reactions: getCommentReactionsInfo(q.Var("comment2")),
          current_user_reaction: getCurrentUserReaction(
            userId,
            q.Var("comment2")
          ),
        })
      )
    )
  );

export const getComment3 = (parentId: string, userId: string = "") =>
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
          reactions: getCommentReactionsInfo(q.Var("comment3")),
          current_user_reaction: getCurrentUserReaction(
            userId,
            q.Var("comment3")
          ),
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

export const addReaction = (
  depth: number,
  commentId: string,
  value: number,
  userId: string
) =>
  q.Let(
    {
      match: q.Match(
        q.Index("reactions_by_user_and_comment"),
        q.Ref(q.Collection("users"), userId),
        q.Ref(q.Collection(`comment${depth}`), commentId)
      ),
      data: {
        data: {
          comment: q.Ref(q.Collection(`comment${depth}`), commentId),
          user: q.Ref(q.Collection("users"), userId),
          value,
        },
      },
    },
    q.If(
      q.Exists(q.Var("match")),
      q.Update(q.Select("ref", q.Get(q.Var("match"))), q.Var("data")),
      q.Create(q.Collection("reactions"), q.Var("data"))
    )
  );
