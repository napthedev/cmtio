import Comments from "@/components/Comments";
import { FC } from "react";
import { GetServerSideProps } from "next";
import { client } from "@/shared/client";
import { getSession } from "next-auth/react";
import { getSiteById } from "@/services/sites";

interface EmbedProps {
  isInvalidRequest: boolean;
}

const Embed: FC<EmbedProps> = ({ isInvalidRequest = false }) => {
  if (isInvalidRequest)
    return <div className="my-6 text-center">Missing request params</div>;

  return <Comments />;
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

  const session = await getSession({ req });

  const site = JSON.parse(
    JSON.stringify(await client.query(getSiteById(siteId)))
  );

  res.setHeader(
    "Content-Security-Policy",
    `frame-ancestors 'self' ${site.data.allowed_origins
      .map((origin: string) => new URL(origin).hostname)
      .join(" ")};`
  );

  return {
    props: {
      session,
      site,
    },
  };
};
