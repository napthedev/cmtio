Map(
  Paginate(
    Match(
      Index("comment1_by_site_and_slug"),
      Ref(Collection("sites"), "335355815353385556"),
      "/"
    )
  ),
  Lambda(
    "comment1",
    Merge(Get(Var("comment1")), {
      reply_count: Count(
        Paginate(Match(Index("comment2_by_comment1"), Var("comment1")))
      ),
    })
  )
);
