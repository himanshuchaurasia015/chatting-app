const { verifyToken } = require("./utils/verifyToken");
const { sendMessage } = require("./utils/createNewMessage");
const getUserGroups = require("./utils/getGroupIds");
const { Socket } = require("socket.io");

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
        const result = await sendMessage(message);
        const receiverSocketId = activeUsers.get(message.to);

        if (receiverSocketId) {
          socket.to(receiverSocketId).emit("message", {
            ...result,
            type: "received",
          });
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
