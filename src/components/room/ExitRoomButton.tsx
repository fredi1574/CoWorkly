"use client";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/context/RoomContext";
import { DoorClosed, DoorOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ExitRoomButton() {
  const { socket, room } = useRoom();
  const [hovered, setHovered] = useState<boolean>(false);
  const router = useRouter();

  const handleLeaveRoom = () => {
    socket?.emit("leave-room", room.id);
    router.push("/");
  };

  return (
    <Button
      onClick={handleLeaveRoom}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-md bg-red-500 px-4 py-2 text-xs text-white hover:bg-red-700 focus:outline-none active:bg-red-600"
    >
      {hovered ? (
        <DoorOpen className="mr-1 h-2 w-2" />
      ) : (
        <DoorClosed className="mr-1 h-2 w-2" />
      )}
      Leave Room
    </Button>
  );
}
