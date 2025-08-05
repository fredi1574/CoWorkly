"use client";
import { type Room } from "@prisma/client";
import { User } from "next-auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

interface RoomContextState {
  socket: Socket | null;
  room: Room;
  participants: string[];
}

const RoomContext = createContext<RoomContextState | null>(null);

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
}

interface RoomProviderProps {
  children: ReactNode;
  room: Room;
  user: User;
}

export function RoomProvider({ children, room, user }: RoomProviderProps) {
  const [participants, setParticipants] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      return;
    }

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
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [room.id, user.name]);

  const value = {
    socket: socketRef.current,
    room,
    participants,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}
