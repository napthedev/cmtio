Select(
  "data",
  Map(
    Paginate(Indexes()),
    Lambda(
      "x",
      Let(
        { index: Get(Var("x")) },
        Merge(
          {
            source: Select("source", Var("index")),
            name: Select("name", Var("index")),
            terms: Select("terms", Var("index")),
          },
          If(
            ContainsField("values", Var("index")),
            { values: Select("values", Var("index")) },
            {}
          )
        )
      )
    )
  )
);
