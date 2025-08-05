"use client";
import { useRoom } from "@/context/RoomContext";
import { useSocketListeners } from "@/hooks/useSocketListeners";
import { useWhiteboard } from "@/hooks/useWhiteboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { CursorsOverlay } from "./CursorsOverlay";
import { WhiteboardToolbar } from "./WhiteboardToolbar";
import { DrawData } from "@/types";

export function Whiteboard() {
  const { socket, room } = useRoom();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const { toolState, setTool, setColor, setLineWidth } = useWhiteboard();

  // Drawing Logic
  const drawLine = useCallback((data: DrawData) => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) {
      return;
    }

    ctx.globalCompositeOperation =
      data.mode === "erase" ? "destination-out" : "source-over";
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.lineWidth;

    ctx.beginPath();
    ctx.moveTo(data.x0 * canvas.width, data.y0 * canvas.height);
    ctx.lineTo(data.x1 * canvas.width, data.y1 * canvas.height);
    ctx.stroke();
    ctx.closePath();
  }, []);

  const redrawCanvas = useCallback(
    (history: DrawData[]) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!context || !canvas) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      history.forEach((data) => drawLine(data));
    },
    [drawLine],
  );

  const { cursors } = useSocketListeners(socket, drawLine, redrawCanvas);

  // Canvas Initialization and Resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    contextRef.current = canvas.getContext("2d");
    const setCanvasDimensions = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (contextRef.current) {
        contextRef.current.lineCap = "round";
      }
      socket?.emit("get-drawing-history", room.id, (history: DrawData[]) => {
        redrawCanvas(history);
      });
    };
    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);
    return () => window.removeEventListener("resize", setCanvasDimensions);
  }, [socket, room.id, redrawCanvas]);

  // Mouse Event Handlers
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    lastPointRef.current = {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const hadnleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const canvas = event.currentTarget;
    if (socket) {
      socket.emit(
        "cursor-move",
        {
          x: offsetX / canvas.width,
          y: offsetY / canvas.height,
        },
        room.id,
      );
    }
    if (!isDrawing || !lastPointRef.current || !contextRef.current) {
      return;
    }

    const data: DrawData = {
      x0: lastPointRef.current.x / canvas.width,
      y0: lastPointRef.current.y / canvas.height,
      x1: offsetX / canvas.width,
      y1: offsetY / canvas.height,
      color: toolState.color,
      lineWidth: toolState.lineWidth,
      mode: toolState.tool,
    };

    drawLine(data);
    socket?.emit("client-draw", data, room.id);
    lastPointRef.current = {
      x: offsetX,
      y: offsetY,
    };
  };

  // Trigger clear-canvas event in the server
  const handleClearAll = () => {
    socket?.emit("clear-canvas", room.id);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Toolbar */}
      <WhiteboardToolbar
        toolState={toolState}
        setTool={setTool}
        setColor={setColor}
        setLineWidth={setLineWidth}
        handleClearAll={handleClearAll}
      />

      {/* Canvas Area */}
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={hadnleMouseMove}
          className="absolute top-0 left-0 h-full w-full rounded-b-lg bg-white"
        />
        {/* Cursors Overlay */}
        <CursorsOverlay cursors={cursors} socket={socket} />
      </div>
    </div>
  );
}
