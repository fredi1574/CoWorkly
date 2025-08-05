import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RoomClient } from "@/components/room/RoomClient";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface RoomPageProps {
  params: {
    roomId: string;
  };
}

async function getRoomDetails(roomId: string) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { creator: { select: { name: true, email: true } } },
    });
    return room;
  } catch (error) {
    console.error("Error fetching room details: ", error);
    return null;
  }
}

export default async function RoomPage(props: RoomPageProps) {
  const { roomId } = props.params;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const room = await getRoomDetails(roomId);
  if (!room) {
    redirect("/");
  }

  return <RoomClient room={room} user={session.user} />;
}
