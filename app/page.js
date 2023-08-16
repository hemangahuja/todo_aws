import { getServerSession } from "next-auth";
import ToDo from "./components/ToDo";
import options from "./lib/auth/options";
import Login from "./components/Login";
import Logout from "./components/Logout";

export default async function Home() {
  const session = await getServerSession(options);

  console.log(session);
  if (session) {
    return (
      <div className="flex flex-col justify-center items-center">
        <Logout></Logout>
        <ToDo></ToDo>
      </div>
    )
  }
  return (
    <>
      <Login></Login>
    </>
  )
}
