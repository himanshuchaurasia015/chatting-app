const { verifyToken } = require("./utils/verifyToken");
const { sendMessage } = require("./utils/createNewMessage");
const getUserGroups = require("./utils/getGroupIds");
const { Socket } = require("socket.io");
const client = require("./client");

const activeUsers = new Map();

module.exports = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const user = verifyToken(token);
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id;
    console.log("Connected user:", userId);

    const groups = await getUserGroups(userId);

    groups.forEach((e) => {
      socket.join(e);
    });

    activeUsers.set(userId, socket.id);
    let pending = await client.llen(`messages:${userId}`);
    if (pending > 0) {
      while (pending > 0) {
        let msg = await client.rpop(`messages:${userId}`);
        msg = JSON.parse(msg);
        const SocketId = activeUsers.get(msg.to);
        socket.to(SocketId).emit("message", msg);
        pending -= 1;
      }
    }
    socket.on("send-group-message", async (message) => {
      try {
        if (message.to) {
          const result = await sendMessage(message);
          socket.to(message.to).emit("group-message", result);
        }
      } catch (err) {
        console.log("Send message error:", err);
      }
    });

    socket.on("send-message", async (message) => {
      try {
        const receiverSocketId = activeUsers.get(message.to);
        const result = await sendMessage(message);
        if (receiverSocketId) {
          message = { ...message, deliveredTo: message.to };
          console.log(message.to, result);
          socket.to(receiverSocketId).emit("message", result);
        } else {
          await client.lpush(`messages:${message.to}`, JSON.stringify(result));
        }
      } catch (err) {
        console.log("Send message error:", err);
      }
    });

    socket.on("disconnect", () => {
      activeUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });
};
