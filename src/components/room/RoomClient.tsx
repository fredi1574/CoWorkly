"use client";
import { RoomProvider } from "@/context/RoomContext";
import { type Room } from "@/generated/prisma";
import { type User } from "next-auth";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Chat } from "./chat/Chat";
import CodeEditor from "./codeEditor/CodeEditor";
import RoomHeader from "./RoomHeader";
import { Whiteboard } from "./whiteboard/Whiteboard";

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
      <div className="flex h-screen flex-col bg-gray-700">
        <RoomHeader />

        <ResizablePanelGroup direction="horizontal" className="">
          <ResizablePanel defaultSize={75}>
            {/* Main section for the code editor and whiteboard */}
            <main className="ml-2 h-full">
              <Tabs defaultValue="code" className="h-full">
                <TabsList className="mx-auto">
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
                </TabsList>
                <TabsContent value="whiteboard" className="mb-1">
                  <Whiteboard />
                </TabsContent>
                <TabsContent value="code" className="mb-1">
                  <CodeEditor />
                </TabsContent>
              </Tabs>
            </main>
          </ResizablePanel>

          <ResizableHandle withHandle className="px-1.5" />

          <ResizablePanel defaultSize={25}>
            {/* Secondary section for the chat and participants or video call */}
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="mx-auto">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="call">Call</TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="mb-1 rounded-md bg-white">
                <Chat />
              </TabsContent>
              <TabsContent value="call" className="mb-1 rounded-md bg-white">
                <h1 className="text-center text-2xl">Video/Audio Call</h1>
              </TabsContent>
            </Tabs>
            {/* </section> */}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      {/* </div> */}
    </RoomProvider>
  );
}
