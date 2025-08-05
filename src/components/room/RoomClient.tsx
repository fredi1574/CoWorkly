"use client";
import { type Room } from "@/generated/prisma";
import { type User } from "next-auth";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import RoomHeader from "./RoomHeader";
import { Whiteboard } from "./whiteboard/Whiteboard";
import { RoomProvider } from "@/context/RoomContext";
import CodeEditor from "./codeEditor/CodeEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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

        <div className="flex flex-1">
          {/* Main section for the code editor and whiteboard */}
          <main className="flex flex-1 gap-2 p-2">
            <Tabs defaultValue="code" className="w-full">
              <TabsList>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
              </TabsList>
              <TabsContent className="w-full" value="whiteboard">
                <Whiteboard />
              </TabsContent>
              <TabsContent className="w-full" value="code">
                <CodeEditor />
              </TabsContent>
            </Tabs>
          </main>

          {/* Secondary section for the chat and participants or video call */}
          <section>
            <Tabs defaultValue="chat" className="w-full">
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
              </TabsList>
              <TabsContent value="chat">
                <h1>Chat</h1>
              </TabsContent>
              <TabsContent value="participants">
                <h1>Participants</h1>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </RoomProvider>
  );
}
