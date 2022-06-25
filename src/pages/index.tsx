import type { GetServerSideProps, NextPage } from "next";
import { getSession, signOut, useSession } from "next-auth/react";

const Home: NextPage = () => {
  const { data, status } = useSession();
  return (
    <div>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
};

export default Home;

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
