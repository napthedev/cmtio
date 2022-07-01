import { FaFacebookF, FaGithub } from "react-icons/fa";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";

import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

const SignIn: NextPage = () => {
  const { status } = useSession();

  const [loading, setLoading] = useState(false);

  const signInWithProvider = (provider: string) => {
    setLoading(true);
    signIn(provider, { callbackUrl: location.href }).catch(() =>
      setLoading(false)
    );
  };

  if (status === "authenticated") {
    window.close();
  }

  if (status === "loading") {
    return <></>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
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
  );
};

export default SignIn;
