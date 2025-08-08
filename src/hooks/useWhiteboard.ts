import { useState } from "react";
import { Tool } from "@/types";

export interface ToolState {
  tool: Tool;
  color: string;
  lineWidth: number;
}

export function useWhiteboard() {
  const [toolState, setToolState] = useState<ToolState>({
    tool: "draw",
    color: "#000000",
    lineWidth: 5,
  });

  const setTool = (tool: Tool) =>
    setToolState((previous) => ({ ...previous, tool }));
  const setColor = (color: string) =>
    setToolState((previous) => ({ ...previous, color }));
  const setLineWidth = (lineWidth: number) =>
    setToolState((previous) => ({ ...previous, lineWidth }));

  return {
    toolState,
    setTool,
    setColor,
    setLineWidth,
  };
}
