const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

/* ---------------------------
   Basic Middleware
---------------------------- */

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"
}));
app.use(express.json());

/* ---------------------------
   Optional Rate Limiting
---------------------------- */

const limiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 200,             // requests per IP
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

/* ---------------------------
   HTTP Server
---------------------------- */

const server = http.createServer(app);

/* ---------------------------
   Socket.IO Server
---------------------------- */

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

/* ---------------------------
   Routes
---------------------------- */

app.get("/", (req, res) => {
  res.send("Quick Screen Backend Running");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

/* Simple docs endpoint */
app.get("/docs", (req, res) => {
  res.json({
    name: "Quick Screen Signaling API",
    version: "1.0",
    endpoints: {
      "/": "Health check",
      "/health": "Server status",
      socket_events: {
        "join-room": "Join a room with roomId",
        "signal": "Exchange WebRTC signaling data",
        "peer-joined": "Emitted when a new user joins a room"
      }
    }
  });
});

/* ---------------------------
   Socket Logic
---------------------------- */

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join Room
  socket.on("join-room", (roomId) => {
    if (!roomId || typeof roomId !== "string") return;

    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // 🔥 Notify others that a peer joined
    socket.to(roomId).emit("peer-joined");
  });

  // Relay WebRTC signals
  socket.on("signal", ({ roomId, signal }) => {
    if (!roomId || !signal) return;

    socket.to(roomId).emit("signal", signal);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* ---------------------------
   Start Server
---------------------------- */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
