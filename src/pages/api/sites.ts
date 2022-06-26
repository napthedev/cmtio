import type { NextApiRequest, NextApiResponse } from "next";

import { UserSession } from "@/shared/types";
import { client } from "@/shared/client";
import { getSession } from "next-auth/react";
import { getSitesByUserId } from "@/services/sites";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = (await getSession({ req })) as UserSession;

  if (!session?.user?.id)
    return res.status(403).json({ message: "Invalid request" });

  const id = session.user.id;

  const sites = await client.query(getSitesByUserId(id));

  res.status(200).json(sites);
}
