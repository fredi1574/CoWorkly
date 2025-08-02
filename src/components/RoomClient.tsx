"use client";

import { useEffect, useState, useRef } from "react";
import { type User } from "next-auth";
import { type Room } from "@prisma/client";
import { io, type Socket } from "socket.io-client";
// --- FIX: Ensure the filename casing is exact ---
import { Whiteboard } from "./Whiteboard";

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
    <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-900">
      <header className="flex items-center justify-between bg-white p-4 shadow-md dark:bg-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {room.name}
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Participants: {participants.join(", ")}
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-3">
        <div className="rounded-lg bg-white shadow-lg lg:col-span-2">
          <Whiteboard socket={socketRef.current} roomId={room.id} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 rounded-lg bg-white shadow-lg">
            <p className="p-4 text-center text-gray-500">Code Editor Area</p>
          </div>
          <div className="flex-1 rounded-lg bg-white shadow-lg">
            <p className="p-4 text-center text-gray-500">Video Chat Area</p>
          </div>
        </div>
      </main>
    </div>
  );
}
