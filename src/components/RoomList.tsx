"use client";
import { Room } from "@/types";
import { Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function RoomList({ initialRooms }: { initialRooms: Room[] }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const router = useRouter();

  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  useEffect(() => {
    const socket = io();

    const onRoomUpdated = (data: {
      roomId: string;
      participants: Record<string, { userName: string }>;
    }) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === data.roomId
            ? { ...room, participants: data.participants }
            : room,
        ),
      );
    };

    socket.on("room-updated", onRoomUpdated);

    return () => {
      socket.off("room-updated", onRoomUpdated);
      socket.disconnect();
    };
  }, []);

  if (rooms.length === 0) {
    return (
      <p className="text-gray-500">
        No rooms available. Create one to get started!
      </p>
    );
  }

  const handleJoinRoom = (roomId: string) => {
    const roomUrl = `/room/${roomId}`;
    router.push(roomUrl);
  };

  return (
    <div className="mx-auto w-2/3 space-y-4 lg:w-1/3">
      {rooms.map((room) => (
        <Card
          key={room.id}
          className="border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
        >
          <CardHeader>
            <CardTitle>{room.name}</CardTitle>
            <CardDescription>Created by {room.creator.name}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between text-gray-600">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              {Object.keys(room.participants || {}).length}

              <Clock className="mr-1 ml-8 h-4 w-4" />
              {new Date(room.createdAt).toLocaleDateString("en-IL")}
            </div>

            <Button
              onClick={() => handleJoinRoom(room.id)}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Join
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
