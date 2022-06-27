import type { GetServerSideProps, NextPage } from "next";

import Link from "next/link";
import Navbar from "../components/Navbar";
import { SitesListResponse } from "@/shared/types";
import dayjs from "dayjs";
import { fetcher } from "@/utils/fetch";
import { getSession } from "next-auth/react";
import { idFromRef } from "@/utils/fauna";
import useSWR from "swr";

const Home: NextPage = () => {
  const { data, error } = useSWR(`/api/sites`, (url) =>
    fetcher<SitesListResponse>(url)
  );

  if (error) return <div>Error</div>;

  return (
    <div className="flex flex-col items-stretch min-h-screen">
      <Navbar />

      {!data ? (
        <div className="flex-grow flex justify-center items-center">
          <div className="w-10 h-10 border-[3px] border-[#1a78f259] border-t-primary animate-spin rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="mt-10 mx-[10vw] flex justify-between">
            <h1 className="text-3xl">Select your site</h1>
            <Link href="/create">
              <a className="bg-light-200 dark:bg-dark-200 hover:bg-light-300 dark:hover:bg-dark-300 transition px-3 py-2 rounded-md">
                Create a new Site
              </a>
            </Link>
          </div>
          {data.data.length === 0 ? (
            <div className="flex flex-col justify-center items-center gap-6 my-20">
              <img className="w-40 h-40" src="/empty.png" alt="" />
              <h1 className="text-2xl">{`You don't have any site`}</h1>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-6 mx-[10vw] my-8">
              {data.data.map((site) => (
                <Link
                  key={idFromRef(site.ref)}
                  href={`/site/${idFromRef(site.ref)}`}
                >
                  <a className="block bg-light-100 dark:bg-dark-100 p-5 rounded-lg">
                    <h1 className="text-3xl">{site.data.name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Created on: {dayjs(site.ts / 1000).format("DD/MM/YYYY")}
                    </p>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user)
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
      props: {},
    };
  return {
    props: {
      session,
    },
  };
};
