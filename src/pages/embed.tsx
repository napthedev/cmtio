import Comments from "@/components/Comments";
import { FC } from "react";
import { GetServerSideProps } from "next";
import { client } from "@/shared/client";
import { getSession } from "next-auth/react";
import { getSiteById } from "@/services/sites";

interface EmbedProps {
  siteId: string;
  slug: string;
  isOriginNotAllowed: boolean;
  isInvalidRequest: boolean;
}

const Embed: FC<EmbedProps> = ({
  siteId,
  slug,
  isOriginNotAllowed = false,
  isInvalidRequest = false,
}) => {
  if (isOriginNotAllowed)
    return <div className="my-6 text-center">Origin is not allowed</div>;

  if (isInvalidRequest)
    return <div className="my-6 text-center">Missing request params</div>;

  return <Comments siteId={siteId} slug={slug} />;
};

export default Embed;

export const getServerSideProps: GetServerSideProps = async ({
  req,
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

  const session = await getSession({ req });

  const site = JSON.parse(
    JSON.stringify(await client.query(getSiteById(siteId)))
  );

  if (
    !site.data.allowed_origins.some((origin: string) =>
      origin.includes(req.headers.host as string)
    )
  ) {
    return {
      props: {
        isOriginNotAllowed: true,
      },
    };
  }

  return {
    props: {
      siteId,
      slug,
      session,
      site,
    },
  };
};
