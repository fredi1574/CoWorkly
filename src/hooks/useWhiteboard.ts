import { useState } from "react";

export interface ToolState {
  tool: "draw" | "erase";
  color: string;
  lineWidth: number;
}

export function useWhiteboard() {
  const [toolState, setToolState] = useState<ToolState>({
    tool: "draw",
    color: "#000000",
    lineWidth: 5,
  });

  const setTool = (tool: "draw" | "erase") =>
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
