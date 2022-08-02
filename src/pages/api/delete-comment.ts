import type { NextApiRequest, NextApiResponse } from "next";
import { deleteComment, getCommentByIdAndDepth } from "@/services/comments";

import { UserSession } from "@/shared/types";
import { client } from "@/shared/client";
import { getSession } from "next-auth/react";
import { idFromRef } from "@/utils/fauna";
import { getSiteById } from "@/services/sites";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.query.commentId || !req.query.depth)
    return res.status(400).send("Invalid request");

  const session = (await getSession({ req })) as UserSession;

  if (!session?.user?.id)
    return res.status(403).json({ message: "Invalid request" });

  const userId = session.user.id;

  const comment = JSON.parse(
    JSON.stringify(
      await client.query(
        getCommentByIdAndDepth(req.query.commentId as string, +req.query.depth)
      )
    )
  );

  const site = JSON.parse(
    JSON.stringify(
      await client.query(getSiteById(idFromRef(comment.data.site)))
    )
  );

  if (
    idFromRef(comment.data.user) !== userId &&
    idFromRef(site.data.user) !== userId
  )
    return res.status(403).json({ message: "Invalid request" });

  await client.query(
    deleteComment(req.query.commentId as string, +req.query.depth)
  );

  res.json({ message: "Comment deleted" });
}
