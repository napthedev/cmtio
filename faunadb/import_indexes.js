Map(
  [
    {
      source: Collection("sites"),
      name: "sites_by_user",
      terms: [
        {
          field: ["data", "user"],
        },
      ],
    },
    {
      source: Collection("comment2"),
      name: "comment2_by_comment1",
      terms: [
        {
          field: ["data", "parent"],
        },
      ],
    },
    {
      source: Collection("comment3"),
      name: "comment3_by_comment2",
      terms: [
        {
          field: ["data", "parent"],
        },
      ],
    },
    {
      source: Collection("users"),
      name: "user_from_email",
      terms: [
        {
          field: ["data", "email"],
        },
      ],
    },
    {
      source: Collection("sites"),
      name: "site_by_user_and_name",
      terms: [
        {
          field: ["data", "user"],
        },
        {
          field: ["data", "name"],
        },
      ],
    },
    {
      source: Collection("comment2"),
      name: "comment2_by_site_and_slug",
      terms: [
        {
          field: ["data", "site"],
        },
        {
          field: ["data", "slug"],
        },
      ],
    },
    {
      source: Collection("comment3"),
      name: "comment3_by_site_and_slug",
      terms: [
        {
          field: ["data", "site"],
        },
        {
          field: ["data", "slug"],
        },
      ],
    },
    {
      source: Collection("comment1"),
      name: "comment1_by_site_and_slug",
      terms: [
        {
          field: ["data", "site"],
        },
        {
          field: ["data", "slug"],
        },
      ],
      values: [
        {
          field: ["ts"],
        },
        {
          field: ["ref"],
        },
      ],
    },
    {
      source: Collection("reactions"),
      name: "reactions_by_value_and_comment",
      terms: [
        {
          field: ["data", "value"],
        },
        {
          field: ["data", "comment"],
        },
      ],
    },
    {
      source: Collection("reactions"),
      name: "reactions_by_user_and_comment",
      terms: [
        {
          field: ["data", "user"],
        },
        {
          field: ["data", "comment"],
        },
      ],
    },
  ],
  Lambda("x", CreateIndex(Var("x")))
);
