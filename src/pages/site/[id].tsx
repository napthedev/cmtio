import { FormEvent, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import { SiteResponse, UserSession } from "@/shared/types";

import { AiFillPlusCircle } from "react-icons/ai";
import Alert from "@/components/Alert";
import { FaTrashAlt } from "react-icons/fa";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { client } from "@/shared/client";
import { getSession } from "next-auth/react";
import { getSiteById } from "@/services/sites";
import { idFromRef } from "@/utils/fauna";

interface SiteProps {
  site: SiteResponse;
}

const Site: NextPage<SiteProps> = ({ site }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [isAlertOpened, setIsAlertOpened] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [isAlertError, setIsAlertError] = useState(false);

  const [siteNameInputValue, setSiteNameInputValue] = useState(site.data.name);
  const [allowedOrigins, setAllowedOrigins] = useState(
    site.data.allowed_origins.map((origin) => ({
      id: Math.random(),
      value: origin,
    }))
  );

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    fetch("/api/sites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: siteNameInputValue.trim(),
        allowed_origins: allowedOrigins.map((i) => i.value),
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setIsAlertError(false);
        setAlertText("Site updated successfully");
        setIsAlertOpened(true);
      })
      .catch((err) => {
        console.log(err);
        setIsAlertError(true);
        setAlertText("Something went wrong");
        setIsAlertOpened(true);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/github-dark.min.css"
        />
      </Head>

      <div className="flex flex-col items-stretch min-h-screen">
        <Navbar />

        <div className="mx-[2vw] grid lg:gap-10 grid-cols-1 lg:grid-cols-2">
          <div className="py-6">
            <h1 className="text-3xl">Update site info</h1>
            <form
              onSubmit={handleFormSubmit}
              className={`create-site-form ${
                isLoading ? "pointer-events-none" : ""
              }`}
              autoComplete="off"
            >
              <label className="block mt-3 mb-1" htmlFor="name">
                Site name
              </label>
              <input
                id="name"
                type="text"
                placeholder="My site"
                required
                minLength={3}
                maxLength={100}
                value={siteNameInputValue}
                onChange={(e) => setSiteNameInputValue(e.target.value)}
              />

              <label className="block mt-3 mb-1">Allowed origins</label>

              {allowedOrigins.map((origin, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <input
                    id="name"
                    type="url"
                    placeholder="https://example.com"
                    required
                    className="flex-grow mb-2"
                    value={origin.value}
                    onChange={(e) =>
                      setAllowedOrigins((prev) => {
                        const clone = [...prev];

                        // @ts-ignore
                        clone.find((item) => item.id === origin.id).value =
                          e.target.value;

                        return clone;
                      })
                    }
                  />
                  {allowedOrigins.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setAllowedOrigins((prev) => {
                          const clone = [...prev];
                          return clone.filter((item) => item.id !== origin.id);
                        })
                      }
                      className="flex-shrink-0"
                    >
                      <FaTrashAlt className="fill-red-500" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setAllowedOrigins((prev) => [
                    ...prev,
                    { id: Math.random(), value: "" },
                  ])
                }
                className="flex items-center gap-1"
              >
                <AiFillPlusCircle className="fill-green-500" />
                <span>Add origin</span>
              </button>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-light-200 dark:bg-dark-200 hover:bg-light-200 dark:hover:bg-dark-300 transition px-3 py-2 rounded-md w-24 flex justify-center items-center"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-[3px] border-[#ffffff59] border-t-white animate-spin rounded-full"></div>
                  ) : (
                    <>Update</>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="py-6">
            <h1 className="text-3xl">How to embed</h1>

            <div className="w-full overflow-x-auto my-6 bg-[#0d1117] text-[#c9d1d9] p-2">
              <pre
                dangerouslySetInnerHTML={{
                  __html: `<span class="hljs-tag">&lt;<span class="hljs-name">div</span> <span class="hljs-attr">id</span>=<span class="hljs-string">&quot;cmtio&quot;</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span>

<span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">src</span>=<span class="hljs-string">&quot;${
                    process.env.NEXT_PUBLIC_URL
                  }/client.js&quot;</span> <span class="hljs-attr">data-site-id</span>=<span class="hljs-string">&quot;${idFromRef(
                    site.ref
                  )}&quot;</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>

<span class="hljs-tag">&lt;<span class="hljs-name">script</span>&gt;</span><span class="language-javascript">
  <span class="hljs-title function_">initCmtioIframe</span>(<span class="hljs-variable language_">document</span>.<span class="hljs-title function_">getElementById</span>(<span class="hljs-string">&quot;cmtio&quot;</span>));
</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>`,
                }}
              ></pre>
            </div>

            <h1 className="text-2xl">Settings</h1>
            <p className="mb-3">
              Add these attributes directly to the main script tag to change the
              settings
            </p>

            <table>
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Description</th>
                  <th>Default value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>data-theme</td>
                  <td>The theme between dark and light</td>
                  <td>The system color scheme</td>
                </tr>
                <tr>
                  <td>data-sorting</td>
                  <td>Sorting option between newest and oldest</td>
                  <td>&quot;newest&quot;</td>
                </tr>
                <tr>
                  <td>data-comments-per-page</td>
                  <td>
                    The number of comments loaded the first time and pressing
                    load more button
                  </td>
                  <td>5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Alert
        isOpened={isAlertOpened}
        setIsOpened={setIsAlertOpened}
        text={alertText}
        isError={isAlertError}
      />
    </>
  );
};

export default Site;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const siteId = params?.id as string;

  const session = (await getSession({ req })) as UserSession;

  if (!session?.user)
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
      props: {},
    };

  const site = JSON.parse(
    JSON.stringify(await client.query(getSiteById(siteId)))
  ) as SiteResponse;

  if (session.user.id !== idFromRef(site.data.user))
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };

  return {
    props: {
      session,
      site,
    },
  };
};
