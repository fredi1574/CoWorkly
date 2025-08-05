"use client";
import { type Room } from "@/generated/prisma";
import { type User } from "next-auth";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import RoomHeader from "./RoomHeader";
import { Whiteboard } from "./whiteboard/Whiteboard";
import { RoomProvider } from "@/context/RoomContext";

interface RoomClientProps {
  room: Room;
  user: User;
}

export function RoomClient({ room, user }: RoomClientProps) {
  const [participants, setParticipants] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) return;

    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("CLIENT: Connected to socket server");
      socket.emit("join-room", room.id, user.name);
    });

    socket.on("update-participants", (participantsList: string[]) => {
      setParticipants(participantsList);
    });

    socket.on("disconnect", () => {
      console.log("CLIENT: Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [room.id, user.name]);

  return (
    <RoomProvider room={room} user={user}>
      <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-900">
        <RoomHeader />

        <main className="flex flex-1 gap-2 p-2">
          <div className="w-3/4 rounded-lg bg-white">
            <Whiteboard />
          </div>

          <div className="flex flex-1 rounded-lg bg-red-500">
            {/* Placeholder */}
          </div>
        </main>
      </div>
    </RoomProvider>
  );
}
