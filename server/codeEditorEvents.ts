import { Server, Socket } from "socket.io";
import { updateCode } from "./state";

export function registerCodeEditorHandlers(io: Server, socket: Socket) {
  const onClientCodeChange = (newCode: string, roomId: string) => {
    updateCode(roomId, newCode);

    // Broadcast the new code to all clients in the room
    socket.to(roomId).emit("server-code-change", newCode);
  };

  socket.on("client-code-change", onClientCodeChange);
}
