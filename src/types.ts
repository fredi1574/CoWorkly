import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface DrawData {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  lineWidth: number;
  mode: "draw" | "erase" | "rectangle" | "circle" | "line";
}

export interface CursorData {
  x: number;
  y: number;
  userName: string;
}

export interface Room {
  id: string;
  name: string;
  participants: Record<string, { userName: string }>;
  createdAt: string;
  creator: {
    name: string;
    email: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
}
