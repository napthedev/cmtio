import { FormEvent, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";

import { AiFillPlusCircle } from "react-icons/ai";
import Alert from "@/components/Alert";
import { FaTrashAlt } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import { getSession } from "next-auth/react";
import { idFromRef } from "@/utils/fauna";
import { useRouter } from "next/router";

const Create: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpened, setIsAlertOpened] = useState(false);

  const [siteNameInputValue, setSiteNameInputValue] = useState("");
  const [allowedOrigins, setAllowedOrigins] = useState([
    {
      id: Math.random(),
      value: "http://localhost:3000",
    },
  ]);

  const router = useRouter();

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
      .then((data) => {
        router.push(`/site/${idFromRef(data.ref)}`);
      })
      .catch((err) => {
        console.log(err);
        setIsAlertOpened(true);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <div className="flex flex-col items-stretch min-h-screen">
        <Navbar />

        <div className="flex justify-center mx-[5vw]">
          <div className="my-10 w-full max-w-lg">
            <h1 className="text-3xl">Create a site</h1>
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
                  className="bg-dark-200 hover:bg-dark-300 transition px-3 py-2 rounded-md w-24 flex justify-center items-center"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-[3px] border-[#ffffff59] border-t-white animate-spin rounded-full"></div>
                  ) : (
                    <>Create</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Alert
        isOpened={isAlertOpened}
        setIsOpened={setIsAlertOpened}
        text="Something went wrong"
        isError
      />
    </>
  );
};

export default Create;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user)
    return {
      redirect: {
        destination: `/sign-in`,
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
