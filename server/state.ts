import { CursorData, DrawData } from "@/types";

interface RoomState {
  participants: Record<string, { userName: string }>;
  drawingHistory: DrawData[];
  cursorPositions: Record<string, CursorData>;
}

export const roomState: Record<string, RoomState> = {};

export function getRoom(roomId: string): RoomState {
  // If the room doesn't exist, create it
  if (!roomState[roomId]) {
    roomState[roomId] = {
      participants: {},
      drawingHistory: [],
      cursorPositions: {},
    };
  }
  return roomState[roomId];
}

export function addUserToRoom(
  roomId: string,
  socketId: string,
  userName: string,
) {
  const room = getRoom(roomId);
  room.participants[socketId] = { userName };
}

export function removeUserFromRoom(
  roomId: string,
  socketId: string,
): {
  userName: string | null;
} {
  const room = roomState[roomId];
  if (!room.participants[socketId]) {
    return { userName: null };
  }

  const { userName } = room.participants[socketId];
  delete room.participants[socketId];
  delete room.cursorPositions[socketId];

  return { userName };
}

export function addDrawDataToHistory(roomId: string, data: DrawData) {
  const room = getRoom(roomId);
  room.drawingHistory.push(data);
}

export function clearDrawingHistory(roomId: string) {
  const room = getRoom(roomId);
  room.drawingHistory = [];
}

export function updateUserCursor(
  roomId: string,
  socketId: string,
  position: { x: number; y: number },
) {
  const room = getRoom(roomId);
  const user = room.participants[socketId];
  if (user) {
    room.cursorPositions[socketId] = { ...position, userName: user.userName };
  }
}
