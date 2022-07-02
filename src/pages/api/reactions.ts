import { addReaction } from "@/services/comments";
import { client } from "@/shared/client";
import { UserSession } from "@/shared/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    !Number(req.query.depth) ||
    !req.query.commentId ||
    req.query.value === null
  )
    return res.status(400).send("Invalid request");

  const session = (await getSession({ req })) as UserSession;

  if (!session?.user?.id)
    return res.status(403).json({ message: "Invalid request" });

  const userId = session.user.id;

  const result = await client.query(
    addReaction(
      Number(req.query.depth),
      req.query.commentId as string,
      Number(req.query.value),
      userId
    )
  );

  res.json(result);
}
