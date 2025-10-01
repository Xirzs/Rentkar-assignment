import Dashboard from "@/components/Dashboard";
import { getSession } from "next-auth/react";

export default function Home() {
  return <Dashboard />;
}

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin", // your sign-in page
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
