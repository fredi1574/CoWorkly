import { createServer } from "http";
import next from "next";
import { Server, Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// --- Define the structure for our data packets ---
interface DrawData {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  // Add properties for color, line width, and mode
  color: string;
  lineWidth: number;
  mode: "draw" | "erase";
}

interface CursorData {
  x: number;
  y: number;
  userName: string;
}

// --- SERVER MEMORY ---
const rooms: Record<
  string,
  { participants: Record<string, { userName: string }> }
> = {};
const drawingHistory: Record<string, DrawData[]> = {};
const cursorPositions: Record<string, Record<string, CursorData>> = {};

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  io.on("connection", (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);

    const onJoinRoom = (roomId: string, userName: string) => {
      socket.join(roomId);
      console.log(`User ${userName} (${socket.id}) joined room ${roomId}`);

      if (!rooms[roomId]) {
        rooms[roomId] = { participants: {} };
        drawingHistory[roomId] = [];
        cursorPositions[roomId] = {};
      }
      rooms[roomId].participants[socket.id] = { userName };

      io.to(roomId).emit(
        "update-participants",
        Object.values(rooms[roomId].participants).map((p) => p.userName),
      );
      socket.emit("drawing-history", drawingHistory[roomId]);
    };

    const onClientDraw = (data: DrawData, roomId: string) => {
      if (drawingHistory[roomId]) {
        drawingHistory[roomId].push(data);
      }
      socket.to(roomId).emit("server-draw", data);
    };

    // --- NEW: Handle cursor movement ---
    const onCursorMove = (data: { x: number; y: number }, roomId: string) => {
      const user = rooms[roomId]?.participants[socket.id];
      if (user) {
        cursorPositions[roomId][socket.id] = {
          ...data,
          userName: user.userName,
        };
        // Broadcast all cursor positions for this room
        io.to(roomId).emit("update-cursors", cursorPositions[roomId]);
      }
    };

    const onDisconnecting = () => {
      const disconnectedUserRooms = Array.from(socket.rooms).filter(
        (r) => r !== socket.id,
      );
      disconnectedUserRooms.forEach((roomId) => {
        if (rooms[roomId]?.participants[socket.id]) {
          console.log(
            `User ${rooms[roomId].participants[socket.id].userName} disconnected from room ${roomId}`,
          );
          delete rooms[roomId].participants[socket.id];
          delete cursorPositions[roomId]?.[socket.id];

          // Broadcast the updated lists
          io.to(roomId).emit(
            "update-participants",
            Object.values(rooms[roomId].participants).map((p) => p.userName),
          );
          io.to(roomId).emit("update-cursors", cursorPositions[roomId]);
        }
      });
    };

    const onClearCanvas = (roomId: string) => {
      drawingHistory[roomId] = []; // Removes all drawing history
      io.to(roomId).emit("clear-canvas"); // Broadcast the whole room the clear event
    };

    socket.on("join-room", onJoinRoom);
    socket.on("client-draw", onClientDraw);
    socket.on("cursor-move", onCursorMove);
    socket.on("clear-canvas", onClearCanvas);
    socket.on("disconnecting", onDisconnecting);
  });

  httpServer
    .listen(port, () => console.log(`> Ready on http://${hostname}:${port}`))
    .on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
});
