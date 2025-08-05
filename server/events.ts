import { Server, Socket } from "socket.io";
import { addUserToRoom, getRoom, removeUserFromRoom } from "./state";

export function registerRoomHandlers(io: Server, socket: Socket) {
  const onJoinRoom = (roomId: string, userName: string) => {
    socket.join(roomId);
    addUserToRoom(roomId, socket.id, userName);

    const room = getRoom(roomId);
    console.log(`User ${userName} (${socket.id}) joined room ${roomId}`);

    // Send drawing history to the new user
    socket.emit("drawing-history", room.drawingHistory);

    // Send the current code to the new user
    socket.emit("code-history", room.code);

    // Notify everyone in the room about the updated participants list
    io.to(roomId).emit(
      "update-participants",
      Object.values(room.participants).map(
        (participant) => participant.userName,
      ),
    );
  };

  const handleUserLeaving = (roomId: string) => {
    const { userName } = removeUserFromRoom(roomId, socket.id);
    if (userName) {
      console.log(`User ${userName} (${socket.id}) left room ${roomId}`);

      const room = getRoom(roomId);

      io.to(roomId).emit(
        "update-participants",
        Object.values(room.participants).map(
          (participant) => participant.userName,
        ),
      );
      io.to(roomId).emit("update-cursors", room.cursorPositions);
    }
  };

  const onLeaveRoom = (roomId: string) => {
    socket.leave(roomId);
    handleUserLeaving(roomId);
  };

  const onDisconnecting = () => {
    const disconnectedUserRooms = Array.from(socket.rooms).filter(
      (room) => room !== socket.id,
    );
    disconnectedUserRooms.forEach(handleUserLeaving);
  };

  socket.on("join-room", onJoinRoom);
  socket.on("leave-room", onLeaveRoom);
  socket.on("disconnecting", onDisconnecting);
}
