// In /components/Whiteboard.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { type Socket } from "socket.io-client";
import { Button } from "./ui/button";

// --- Type Definitions ---
interface DrawData {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  lineWidth: number;
  mode: "draw" | "erase";
}
interface CursorData {
  x: number;
  y: number;
  userName: string;
}
interface WhiteboardProps {
  socket: Socket | null;
  roomId: string;
}

// --- Drawing Utility ---
const drawLine = (
  ctx: CanvasRenderingContext2D,
  data: DrawData,
  canvasWidth: number,
  canvasHeight: number,
) => {
  ctx.globalCompositeOperation =
    data.mode === "erase" ? "destination-out" : "source-over";
  ctx.strokeStyle = data.color;
  ctx.lineWidth = data.lineWidth;

  ctx.beginPath();
  ctx.moveTo(data.x0 * canvasWidth, data.y0 * canvasHeight);
  ctx.lineTo(data.x1 * canvasWidth, data.y1 * canvasHeight);
  ctx.stroke();
  ctx.closePath();
};

export function Whiteboard({ socket, roomId }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // --- State Management ---
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"draw" | "erase">("draw");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [cursors, setCursors] = useState<Record<string, CursorData>>({});

  // --- Canvas Initialization and Resizing ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    contextRef.current = context;

    const setCanvasDimensions = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      context.lineCap = "round";
    };
    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);
    return () => window.removeEventListener("resize", setCanvasDimensions);
  }, []);

  // --- Socket Event Listeners ---
  useEffect(() => {
    if (!socket) return;

    const redrawCanvas = (history: DrawData[]) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!context || !canvas) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      history.forEach((data) =>
        drawLine(context, data, canvas.width, canvas.height),
      );
    };

    const handleDraw = (data: DrawData) =>
      drawLine(
        contextRef.current!,
        data,
        canvasRef.current!.width,
        canvasRef.current!.height,
      );
    const handleHistory = (history: DrawData[]) => redrawCanvas(history);
    const handleCursors = (roomCursors: Record<string, CursorData>) =>
      setCursors(roomCursors);

    socket.on("server-draw", handleDraw);
    socket.on("drawing-history", handleHistory);
    socket.on("update-cursors", handleCursors);

    // Redraw on resize to maintain quality
    const handleResize = () =>
      socket.emit("get-drawing-history", roomId, (history: DrawData[]) =>
        redrawCanvas(history),
      );
    window.addEventListener("resize", handleResize);

    return () => {
      socket.off("server-draw", handleDraw);
      socket.off("drawing-history", handleHistory);
      socket.off("update-cursors", handleCursors);
      window.removeEventListener("resize", handleResize);
    };
  }, [socket, roomId]);

  // --- Mouse Event Handlers ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    lastPointRef.current = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (socket) {
      socket.emit(
        "cursor-move",
        {
          x: offsetX / e.currentTarget.width,
          y: offsetY / e.currentTarget.height,
        },
        roomId,
      );
    }
    if (!isDrawing || !lastPointRef.current) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context || !socket) return;

    const data: DrawData = {
      x0: lastPointRef.current.x / canvas.width,
      y0: lastPointRef.current.y / canvas.height,
      x1: offsetX / canvas.width,
      y1: offsetY / canvas.height,
      color,
      lineWidth,
      mode: tool,
    };

    drawLine(context, data, canvas.width, canvas.height);
    socket.emit("client-draw", data, roomId);
    lastPointRef.current = { x: offsetX, y: offsetY };
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-4 border-b bg-gray-100 p-2">
        <Button
          onClick={() => setTool("draw")}
          variant={tool === "draw" ? "secondary" : "ghost"}
        >
          Pen
        </Button>
        <Button
          onClick={() => setTool("erase")}
          variant={tool === "erase" ? "secondary" : "ghost"}
        >
          Eraser
        </Button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-8"
        />
        <input
          type="range"
          min="1"
          max="50"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
        />
        <span>{lineWidth}px</span>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={draw}
          className="absolute top-0 left-0 h-full w-full rounded-b-lg bg-white"
        />
        {/* Cursors Overlay */}
        {Object.entries(cursors).map(([id, cursor]) => {
          if (id === socket?.id) return null;
          return (
            <div
              key={id}
              className="pointer-events-none absolute top-0 left-0 transition-transform duration-75 ease-out"
              style={{
                top: `${cursor.y * 100}%`,
                left: `${cursor.x * 100}%`,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-500"
              >
                <path
                  d="M5.25 3.25L18.75 12L11.25 14.25L9 21.75L5.25 3.25Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.25 3.25L18.75 12L11.25 14.25L9 21.75L5.25 3.25Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ml-2 rounded-full bg-blue-500 px-2 py-1 text-sm text-white">
                {cursor.userName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
