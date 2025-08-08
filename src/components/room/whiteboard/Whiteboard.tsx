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
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const previewContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapeStartPoint, setShapeStartPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const { toolState, setTool, setColor, setLineWidth } = useWhiteboard();

  // Drawing Logic
  const draw = useCallback((data: DrawData) => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) {
      return;
    }

    const x0 = data.x0 * canvas.width;
    const y0 = data.y0 * canvas.height;
    const x1 = data.x1 * canvas.width;
    const y1 = data.y1 * canvas.height;

    ctx.globalCompositeOperation =
      data.mode === "erase" ? "destination-out" : "source-over";
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.lineWidth;

    ctx.beginPath();
    switch (data.mode) {
      case "draw":
      case "erase":
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        break;
      case "rectangle":
        ctx.rect(x0, y0, x1 - x0, y1 - y0);
        break;
      case "circle":
        const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
        break;
      case "line":
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        break;
      default:
        break;
    }
    ctx.stroke();
    ctx.closePath();
  }, []);

  const redrawCanvas = useCallback(
    (history: DrawData[]) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!context || !canvas) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      history.forEach((data) => draw(data));
    },
    [draw],
  );

  const { cursors } = useSocketListeners(socket, draw, redrawCanvas);

  // Canvas Initialization and Resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) {
      return;
    }

    contextRef.current = canvas.getContext("2d");
    previewContextRef.current = previewCanvas.getContext("2d");

    const setCanvasDimensions = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      previewCanvas.width = previewCanvas.offsetWidth;
      previewCanvas.height = previewCanvas.offsetHeight;
      if (contextRef.current) {
        contextRef.current.lineCap = "round";
      }
      socket?.emit("get-drawing-history", room.id, (history: DrawData[]) => {
        redrawCanvas(history);
      });
    };

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setCanvasDimensions, 100); // 100ms debounce
    };

    const resizeObserver = new ResizeObserver(handleResize);
    const parentElement = canvas.parentElement;
    if (parentElement) {
      resizeObserver.observe(parentElement);
    }

    setCanvasDimensions();

    return () => {
      if (parentElement) {
        resizeObserver.unobserve(parentElement);
      }
      clearTimeout(resizeTimeout);
    };
  }, [socket, room.id, redrawCanvas]);

  // Mouse Event Handlers
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;
    if (toolState.tool === "draw" || toolState.tool === "erase") {
      lastPointRef.current = { x: offsetX, y: offsetY };
    } else {
      setShapeStartPoint({ x: offsetX, y: offsetY });
    }
  };

  const stopDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    const previewCtx = previewContextRef.current;
    if (previewCtx && previewCanvasRef.current) {
      previewCtx.clearRect(
        0,
        0,
        previewCanvasRef.current.width,
        previewCanvasRef.current.height,
      );
    }
    if (shapeStartPoint) {
      const { offsetX, offsetY } = event.nativeEvent;
      const canvas = event.currentTarget;
      const data: DrawData = {
        x0: shapeStartPoint.x / canvas.width,
        y0: shapeStartPoint.y / canvas.height,
        x1: offsetX / canvas.width,
        y1: offsetY / canvas.height,
        color: toolState.color,
        lineWidth: toolState.lineWidth,
        mode: toolState.tool,
      };
      draw(data);
      socket?.emit("client-draw", data, room.id);
      setShapeStartPoint(null);
    }
    lastPointRef.current = null;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
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
    if (!isDrawing || !contextRef.current) {
      return;
    }

    if (shapeStartPoint) {
      const previewCtx = previewContextRef.current;
      if (!previewCtx || !previewCanvasRef.current) return;
      previewCtx.clearRect(
        0,
        0,
        previewCanvasRef.current.width,
        previewCanvasRef.current.height,
      );
      const data: DrawData = {
        x0: shapeStartPoint.x / canvas.width,
        y0: shapeStartPoint.y / canvas.height,
        x1: offsetX / canvas.width,
        y1: offsetY / canvas.height,
        color: toolState.color,
        lineWidth: toolState.lineWidth,
        mode: toolState.tool,
      };
      drawPreview(data);
    } else if (lastPointRef.current) {
      const data: DrawData = {
        x0: lastPointRef.current.x / canvas.width,
        y0: lastPointRef.current.y / canvas.height,
        x1: offsetX / canvas.width,
        y1: offsetY / canvas.height,
        color: toolState.color,
        lineWidth: toolState.lineWidth,
        mode: toolState.tool,
      };
      draw(data);
      socket?.emit("client-draw", data, room.id);
      lastPointRef.current = {
        x: offsetX,
        y: offsetY,
      };
    }
  };

  const drawPreview = (data: DrawData) => {
    const ctx = previewContextRef.current;
    const canvas = previewCanvasRef.current;
    if (!ctx || !canvas) {
      return;
    }
    const x0 = data.x0 * canvas.width;
    const y0 = data.y0 * canvas.height;
    const x1 = data.x1 * canvas.width;
    const y1 = data.y1 * canvas.height;

    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.lineWidth;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    switch (data.mode) {
      case "rectangle":
        ctx.rect(x0, y0, x1 - x0, y1 - y0);
        break;
      case "circle":
        const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
        break;
      case "line":
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        break;
      default:
        break;
    }
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]); // Reset to solid line
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
          className="absolute top-0 left-0 h-full w-full rounded-b-lg bg-white"
        />
        <canvas
          ref={previewCanvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={handleMouseMove}
          onMouseLeave={stopDrawing}
          className="absolute top-0 left-0 h-full w-full rounded-b-lg"
        />
        {/* Cursors Overlay */}
        <CursorsOverlay cursors={cursors} socket={socket} />
      </div>
    </div>
  );
}
