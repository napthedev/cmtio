Map(
  [
    {
      name: "users",
      history_days: 7,
    },
    {
      name: "sites",
      history_days: 7,
    },
    {
      name: "comment1",
      history_days: 7,
    },
    {
      name: "comment2",
      history_days: 7,
    },
    {
      name: "comment3",
      history_days: 7,
    },
    {
      name: "reactions",
      history_days: 7,
    },
  ],
  Lambda("x", CreateCollection(Var("x")))
);
