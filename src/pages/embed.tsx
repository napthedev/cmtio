import Comments from "@/components/Comments";
import { FC, useEffect, useRef } from "react";
import { GetServerSideProps } from "next";
import { client } from "@/shared/client";
import { getSession } from "next-auth/react";
import { getSiteById } from "@/services/sites";
import { useRouter } from "next/router";
import { UserSession } from "@/shared/types";
import { idFromRef } from "@/utils/fauna";

interface EmbedProps {
  isInvalidRequest: boolean;
  isAdmin: boolean;
}

const Embed: FC<EmbedProps> = ({ isInvalidRequest = false, isAdmin }) => {
  const { siteId, slug } = useRouter().query;
  const heightRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (heightRef.current !== document.body.scrollHeight)
        window.parent?.postMessage(
          {
            siteId,
            slug,
            height: document.body.scrollHeight,
          },
          "*"
        );
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [siteId, slug]);

  if (isInvalidRequest)
    return <div className="my-6 text-center">Missing request params</div>;

  return <Comments isAdmin={isAdmin} />;
};

export default Embed;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const siteId = query.siteId as string;
  const slug = query.slug as string;

  if (!siteId || !slug)
    return {
      props: {
        isInvalidRequest: true,
      },
    };

  const session = (await getSession({ req })) as UserSession;

  const site = JSON.parse(
    JSON.stringify(await client.query(getSiteById(siteId)))
  );

  res.setHeader(
    "Content-Security-Policy",
    `frame-ancestors 'self' ${[
      ...new Set(
        site.data.allowed_origins.map((origin: string) => {
          const url = new URL(origin);
          return url.hostname === "localhost"
            ? "http://localhost:* https://localhost:*"
            : url.hostname + (url.port ? `:${url.port}` : "");
        })
      ),
    ].join(" ")};`
  );

  const isAdmin = session?.user?.id === idFromRef(site.data.user);

  return {
    props: {
      session,
      isAdmin,
      theme:
        query.theme === "dark"
          ? "dark"
          : query.theme === "light"
          ? "light"
          : null,
    },
  };
};
