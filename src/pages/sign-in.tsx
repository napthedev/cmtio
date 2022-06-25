import { FaFacebookF, FaGithub } from "react-icons/fa";
import type { GetServerSideProps, NextPage } from "next";
import { getSession, signIn } from "next-auth/react";

import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

const SignIn: NextPage = () => {
  const [loading, setLoading] = useState(false);

  const signInWithProvider = (provider: string) => {
    setLoading(true);
    signIn(provider).catch(() => setLoading(false));
  };

  return (
    <div className="flex justify-center">
      <div className="min-h-screen flex items-center justify-center flex-col md:flex-row px-[10vw] gap-5 w-screen max-w-[1200px]">
        <div className="md:flex-1">
          <h1 className="text-primary text-[70px] leading-[70px] mb-5 text-center md:text-left">
            CmtIO
          </h1>
          <p className="text-3xl max-w-[460px] text-center md:text-left">
            A comment system alternatives to Disqus
          </p>
        </div>
        <div className="md:flex-1 flex flex-col items-center justify-center gap-3">
          <button
            disabled={loading}
            onClick={() => signInWithProvider("google")}
            className="flex items-center bg-dark-200 p-3 gap-3 rounded-md cursor-pointer hover:brightness-90 disabled:!brightness-75 disabled:!cursor-default transition duration-300 w-64"
          >
            <FcGoogle className="w-6 h-6" />

            <span className="text-lg">Sign In With Google</span>
          </button>
          <button
            disabled={loading}
            onClick={() => signInWithProvider("facebook")}
            className="flex items-center bg-primary p-3 gap-3 rounded-md cursor-pointer hover:brightness-90 disabled:!brightness-75 disabled:!cursor-default transition duration-300 w-64"
          >
            <FaFacebookF fill="#ffffff" className="w-6 h-6" />

            <span className="text-lg">Sign In With Facebook</span>
          </button>
          <button
            disabled={loading}
            onClick={() => signInWithProvider("github")}
            className="flex items-center bg-black p-3 gap-3 rounded-md cursor-pointer hover:brightness-90 disabled:!brightness-75 disabled:!cursor-default transition duration-300 w-64"
          >
            <FaGithub fill="#ffffff" className="w-6 h-6" />

            <span className="text-lg">Sign In With Github</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (session?.user)
    return {
      redirect: {
        destination: `/`,
        permanent: false,
      },
      props: {},
    };
  return {
    props: {},
  };
};
