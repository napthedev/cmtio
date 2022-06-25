Map(
  Paginate(Documents(Collection("apps"))),
  Lambda((app) =>
    Let(
      {
        app: Get(app),
        user: Get(Select(["data", "user"], Var("app"))),
      },
      Merge(Var("app"), { user: Var("user") })
    )
  )
);
