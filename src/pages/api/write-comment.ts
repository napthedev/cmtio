import type { NextApiRequest, NextApiResponse } from "next";
import { writeComment, writeReply } from "@/services/comments";

import { UserSession } from "@/shared/types";
import { client } from "@/shared/client";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.body.siteId || !req.body.slug || !req.body.text)
    return res.status(400).send("Invalid request");

  const session = (await getSession({ req })) as UserSession;

  if (!session?.user?.id)
    return res.status(403).json({ message: "Invalid request" });

  const userId = session.user.id;

  switch (req.body.depth) {
    case 1: {
      const result = await client.query(
        writeComment(
          userId,
          req.body.siteId as string,
          req.body.slug as string,
          (req.body.text as string).trim().slice(0, 5000)
        )
      );
      res.json(result);
      break;
    }

    case 2:
    case 3: {
      const result = await client.query(
        writeReply(
          userId,
          req.body.siteId as string,
          req.body.slug,
          (req.body.text as string).trim().slice(0, 5000),
          req.body.parentId,
          req.body.depth
        )
      );
      res.json(result);
      break;
    }

    default: {
      res.status(400).send("Invalid request");
      break;
    }
  }
}
