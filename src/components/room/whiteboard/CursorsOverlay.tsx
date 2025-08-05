import { CursorData } from "@/types";
import { Socket } from "socket.io-client";

interface CursorsOverlayProps {
  cursors: Record<string, CursorData>;
  socket: Socket | null;
}

export function CursorsOverlay({ cursors, socket }: CursorsOverlayProps) {
  return (
    <>
      {Object.entries(cursors).map(([id, cursor]) => {
        if (id === socket?.id) return null;
        return (
          <div
            key={id}
            className="pointer-events-none absolute top-0 left-0 transition-transform duration-75 ease-out"
            style={{ top: `${cursor.y * 100}%`, left: `${cursor.x * 100}%` }}
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
    </>
  );
}
