Select(
  "data",
  Map(
    Paginate(Collections()),
    Lambda(
      "x",
      Let(
        { collection: Get(Var("x")) },
        {
          name: Select("name", Var("collection")),
          history_days: Select("history_days", Var("collection")),
        }
      )
    )
  )
);
