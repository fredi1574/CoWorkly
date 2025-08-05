import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { registerRoomHandlers } from "./server/events";
import { registerWhiteboardHandlers } from "./server/whiteboardEvents";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    registerRoomHandlers(io, socket);
    registerWhiteboardHandlers(io, socket);
    // registerCodeEditorHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer
    .listen(port, () => console.log(`> Ready on http://${hostname}:${port}`))
    .on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
});
