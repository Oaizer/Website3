import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Store message history
  let messageHistory: any[] = [];

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send history to new user
    socket.emit("init-messages", messageHistory);

    socket.on("send-message", (data) => {
      const message = {
        ...data,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
      };
      messageHistory.push(message);
      // Limit history
      if (messageHistory.length > 100) {
        messageHistory.shift();
      }
      io.emit("new-message", message);
    });

    socket.on("clear", () => {
      messageHistory = [];
      io.emit("clear");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
