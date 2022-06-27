import type { NextPage } from "next";

const Demo: NextPage = () => {
  return <div>{process.env.NEXT_PUBLIC_DEMO_SITE_ID}</div>;
};

export default Demo;
