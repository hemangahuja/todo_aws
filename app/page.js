

import { getServerSession } from "next-auth";
import ToDo from "./components/ToDo";
import options from "./lib/auth/options";
import Login from "./components/Login";

export default async function Home() {
  const session = await getServerSession(options);
  console.log(session);
  if (session) {
    return (
      <>
        <ToDo></ToDo>
      </>
    )
  }
  return (
    <>
      <Login></Login>
    </>
  )

}
