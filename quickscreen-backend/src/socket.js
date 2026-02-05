import { io } from "socket.io-client";

const socket = io(process.env.SOCKET_URL || "http://localhost:8080", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  timeout: 10000
});

export default socket;
