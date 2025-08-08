import { ChatMessage } from "@/types";
import { Server, Socket } from "socket.io";

export function registerChatHandlers(io: Server, socket: Socket) {
  const onSendMessage = (message: ChatMessage, roomId: string) => {
    io.to(roomId).emit("receive-message", message);
  };

  socket.on("send-message", onSendMessage);
}
