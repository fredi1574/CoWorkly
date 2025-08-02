import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";
import SignOutButton from "@/components/SignOutButton";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { RoomList } from "@/components/RoomList";

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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Logged in as {session.user?.email}
            </p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left Column: Create Room */}
          <div className="md:col-span-1">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Create a New Room
            </h2>
            <CreateRoomForm />
          </div>

          {/* Right Column: Room List */}
          <div className="md:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Join a Room
            </h2>
            <RoomList initialRooms={rooms} />
          </div>
        </div>
      </main>
    </div>
  );
}
