import type { NextApiRequest, NextApiResponse } from "next";
import { countComments, getComment1, getComment2 } from "@/services/comments";

import { client } from "@/shared/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.query.depth) {
    case "1": {
      if (!req.query.siteId || !req.query.slug)
        return res.status(400).send("Invalid request");

      const [comments, count] = await Promise.all([
        client.query(
          getComment1(req.query.siteId as string, req.query.slug as string)
        ),
        client.query(
          countComments(req.query.siteId as string, req.query.slug as string)
        ),
      ]);

      res.json({ count, comments });
      break;
    }

    case "2": {
      if (!req.query.parentId) return res.status(400).send("Invalid request");

      const comments = await client.query(
        getComment2(req.query.parentId as string)
      );

      res.json(comments);

      break;
    }

    default: {
      res.status(400).send("Invalid request");
      break;
    }
  }
}
