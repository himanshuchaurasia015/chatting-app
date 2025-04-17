// Corrected server code
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connect = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const auth = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const Message = require("./models/Message");
const { sendMessage } = require("./utils/createNewMessage");

app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,

    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use("/api/auth", auth);
app.use("/api/chat", chatRoutes);

const activeUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  // Store connection
  activeUsers.set(userId, socket.id);
  console.log(`User ${userId} connected`);

  socket.on("send-message", async (message) => {
    console.log(message);
    const receiverSocketId = activeUsers.get(message.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message", {
        ...message,
        type: "received",
      });
    }
  });

  socket.on("disconnect", () => {
    activeUsers.delete(userId);
    console.log(`User ${userId} disconnected`);
  });
});

server.listen(4000, () => {
  console.log("Socket.io server running on port 4000");
});
