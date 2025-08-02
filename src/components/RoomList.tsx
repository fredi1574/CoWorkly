"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

function SafeHydrate({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted ? <>{children}</> : null;
}

interface Room {
  id: string;
  name: string;
  createdAt: string;
  creator: {
    name: string | null;
    email: string | null;
  };
}

export function RoomList({ initialRooms }: { initialRooms: Room[] }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const router = useRouter();

  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  if (rooms.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No rooms available. Create one to get started!
      </p>
    );
  }

  const handleJoinRoom = (roomId: string) => {
    const roomUrl = `/room/${roomId}`;
    router.push(roomUrl);
  };

  return (
    <div className="space-y-4">
      {rooms.map((room) => (
        <Card
          key={room.id}
          onClick={() => handleJoinRoom(room.id)}
          className="cursor-pointer bg-white shadow-xl transition-colors hover:bg-gray-300"
        >
          <CardHeader>
            <CardTitle>{room.name}</CardTitle>
            <CardDescription>
              Created by {room.creator.name} on{" "}
              <SafeHydrate>
                {new Date(room.createdAt).toLocaleDateString()}
              </SafeHydrate>
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
