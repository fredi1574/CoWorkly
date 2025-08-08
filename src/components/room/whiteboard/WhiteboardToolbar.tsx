import { Button } from "@/components/ui/button";
import { ToolState } from "@/hooks/useWhiteboard";
import { Circle, Eraser, Minus, Pencil, Square } from "lucide-react";

interface WhiteboardToolbarProps {
  toolState: ToolState;
  setTool: (tool: "draw" | "erase" | "rectangle" | "circle" | "line") => void;
  setColor: (color: string) => void;
  setLineWidth: (lineWidth: number) => void;
  handleClearAll: () => void;
}

export function WhiteboardToolbar({
  toolState,
  setTool,
  setColor,
  setLineWidth,
  handleClearAll,
}: WhiteboardToolbarProps) {
  const { tool, color, lineWidth } = toolState;

  return (
    <div className="flex items-center justify-between gap-4 rounded-t-lg border-b bg-gray-100 p-2">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setTool("draw")}
          className={`${tool === "draw" ? "bg-gray-400 text-white" : ""}`}
        >
          <Pencil className="h-4 w-4" /> Pen
        </Button>
        <Button
          onClick={() => setTool("erase")}
          className={`${tool === "erase" ? "bg-gray-400 text-white" : ""}`}
        >
          <Eraser className="h-4 w-4" />
          Eraser
        </Button>
        <Button
          onClick={() => setTool("rectangle")}
          className={`${tool === "rectangle" ? "bg-gray-400 text-white" : ""}`}
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setTool("circle")}
          className={`${tool === "circle" ? "bg-gray-400 text-white" : ""}`}
        >
          <Circle className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setTool("line")}
          className={`${tool === "line" ? "bg-gray-400 text-white" : ""}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-10"
        />
        <input
          type="range"
          min="1"
          max="100"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
        />
        <span>{lineWidth}</span>
      </div>
      <Button
        onClick={handleClearAll}
        className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
      >
        Clear
      </Button>
    </div>
  );
}
