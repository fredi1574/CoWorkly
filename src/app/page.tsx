import { CreateRoomForm } from "@/components/CreateRoomForm";
import { RoomList } from "@/components/RoomList";
import SignOutButton from "@/components/SignOutButton";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";

async function getRooms() {
  const result = await fetch(`${process.env.NEXTAUTH_URL}/api/rooms`, {
    cache: "no-store",
  });

  if (!result.ok) {
    console.error("Failed to fetch rooms");
    return [];
  }
  return result.json();
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const rooms = await getRooms();

  return (
    <div className="h-screen bg-gray-100">
      <header className="flex items-center justify-between bg-gray-700 shadow-md">
        <div className="items-center p-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400">
            Logged in as {session.user?.email}
          </p>
        </div>
        <SignOutButton />
      </header>

      <main className="mx-auto px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">
          Welcome back, {session.user?.name}
        </h1>
        <div>
          <h2 className="mb-4 text-lg font-semibold">Create a New Room</h2>
          <CreateRoomForm />
        </div>
      </main>

      <div className="md:col-span-2">
        <h2 className="mb-4 text-lg font-semibold">Join a Room</h2>
        <RoomList initialRooms={rooms} />
      </div>
    </div>
  );
}
