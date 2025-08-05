import { DrawData } from "@/types";
import { Server, Socket } from "socket.io";
import {
  addDrawDataToHistory,
  clearDrawingHistory,
  getRoom,
  updateUserCursor,
} from "./state";

export function registerWhiteboardHandlers(io: Server, socket: Socket) {
  const onClientDraw = (data: DrawData, roomId: string) => {
    addDrawDataToHistory(roomId, data);
    socket.to(roomId).emit("server-draw", data);
  };

  const onCursorMove = (data: { x: number; y: number }, roomId: string) => {
    updateUserCursor(roomId, socket.id, data);
    const room = getRoom(roomId);
    io.to(roomId).emit("update-cursors", room.cursorPositions);
  };

  const onClearCanvas = (roomId: string) => {
    clearDrawingHistory(roomId);
    io.to(roomId).emit("clear-canvas");
  };

  const onGetDrawingHistory = (
    roomId: string,
    callback: (history: DrawData[]) => void,
  ) => {
    const room = getRoom(roomId);
    callback(room.drawingHistory);
  };

  socket.on("client-draw", onClientDraw);
  socket.on("cursor-move", onCursorMove);
  socket.on("clear-canvas", onClearCanvas);
  socket.on("get-drawing-history", onGetDrawingHistory);
}
