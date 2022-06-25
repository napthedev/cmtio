Map(
  Paginate(Documents(Collection("users"))),
  Lambda(
    "user",
    Merge(Get(Var("user")), {
      apps: Map(
        Paginate(Match(Index("apps_by_user"), Var("user"))),
        Lambda("app", Get(Var("app")))
      ),
    })
  )
);
