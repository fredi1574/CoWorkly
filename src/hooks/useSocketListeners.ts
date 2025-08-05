import { CursorData, DrawData } from "@/types";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export function useSocketListeners(
  socket: Socket | null,
  drawLine: (data: DrawData) => void,
  redrawCanvas: (history: DrawData[]) => void,
) {
  const [cursors, setCursors] = useState<Record<string, CursorData>>({});

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleDraw = (data: DrawData) => drawLine(data);
    const handleHistory = (history: DrawData[]) => redrawCanvas(history);
    const handleCursors = (roomCursors: Record<string, CursorData>) =>
      setCursors(roomCursors);
    const handleCanvasCleared = () => redrawCanvas([]);

    socket.on("server-draw", handleDraw);
    socket.on("drawing-history", handleHistory);
    socket.on("update-cursors", handleCursors);
    socket.on("clear-canvas", handleCanvasCleared);

    return () => {
      socket.off("server-draw", handleDraw);
      socket.off("drawing-history", handleHistory);
      socket.off("update-cursors", handleCursors);
      socket.off("clear-canvas", handleCanvasCleared);
    };
  }, [socket, drawLine, redrawCanvas]);

  return { cursors };
}
