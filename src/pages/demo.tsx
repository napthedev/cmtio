import type { NextPage } from "next";
import Link from "next/link";
import Script from "next/script";

const Demo: NextPage = () => {
  if (!process.env.NEXT_PUBLIC_DEMO_SITE_ID)
    return <div>Demo site ID hasn&apos;t been specified</div>;

  return (
    <div className="flex justify-center mx-3">
      <div className="w-full max-w-xl my-8">
        <div className="flex items-center gap-4 my-4 mx-4 md:mx-0">
          <img className="w-12 h-12" src="/icon.png" alt="" />
          <h1 className="text-3xl">CmtIO</h1>
        </div>
        <p className="mx-4 md:mx-0">A comment system alternative to Disqus</p>
        <Link href="/">
          <a className="text-blue-400">Embed this into your site now</a>
        </Link>

        <div
          className="border border-zinc-200 dark:border-zinc-800 mt-8"
          id="cmtio"
        ></div>

        <Script
          src="/client.js"
          data-site-id={process.env.NEXT_PUBLIC_DEMO_SITE_ID}
          onLoad={() => {
            // @ts-ignore
            window.initCmtioIframe(document.getElementById("cmtio"));
          }}
        ></Script>
      </div>
    </div>
  );
};

export default Demo;
