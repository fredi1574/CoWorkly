import { Server, Socket } from "socket.io";
import { getRoom, updateCode } from "./state";

export function registerCodeEditorHandlers(io: Server, socket: Socket) {
  const onClientCodeChange = (newCode: string, roomId: string) => {
    updateCode(roomId, newCode);

    // Broadcast the new code to all clients in the room
    socket.to(roomId).emit("server-code-change", newCode);
  };

  const onGetCodeHistory = (roomId: string) => {
    const room = getRoom(roomId);
    socket.emit("code-history", room.code);
  };

  socket.on("client-code-change", onClientCodeChange);
  socket.on("get-code-history", onGetCodeHistory);
}
