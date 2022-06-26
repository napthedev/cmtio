import type { NextApiRequest, NextApiResponse } from "next";
import { createSite, getSitesByUserId } from "@/services/sites";

import { UserSession } from "@/shared/types";
import { client } from "@/shared/client";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = (await getSession({ req })) as UserSession;

  if (!session?.user?.id)
    return res.status(403).json({ message: "Invalid request" });

  const id = session.user.id;

  if (req.method === "GET") {
    const sites = await client.query(getSitesByUserId(id));

    res.status(200).json(sites);
  } else {
    if (!req.body?.name || !req.body?.allowed_origins)
      return res.status(403).json({ message: "Invalid request" });

    const created = await client.query(
      createSite(id, req.body.name, req.body.allowed_origins)
    );

    if (created) res.send(created);
    else res.status(500).send("Internal server error");
  }
}
