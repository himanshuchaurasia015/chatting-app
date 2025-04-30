const { verifyToken } = require("./utils/verifyToken");
const { sendMessage } = require("./utils/createNewMessage");
const getUserGroups = require("./utils/getGroupIds");
const { Socket } = require("socket.io");
// const client = require("./client");
const { markAsRead, markAllAsRead } = require("./utils/markAsRead");

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
    // let pending = await client.llen(`messages:${userId}`);
    // if (pending > 0) {
    //   while (pending > 0) {
    //     let msg = await client.rpop(`messages:${userId}`);
    //     msg = JSON.parse(msg);
    //     console.log("pending", msg);
    //     const SocketId = activeUsers.get(msg.to);
    //     socket.to(SocketId).emit("message", msg);
    //     pending -= 1;
    //   }
    // }

    socket.on("group-chat-open", async (data) => {
      try {
        let msgs = await markAllAsRead(data);

        // socket.emit("inbox-opened", { msgs });
      } catch (error) {
        console.log("read all message error:", error);
      }
    });

    socket.on("open-inbox", async (data) => {
      try {
        // console.log("open-inbox from:", data.userId);
        const msgs = await markAllAsRead(data);

        // Emit back to THE SAME USER who opened the inbox
        console.log("Highlight", data);
        const otherUserSocketId = activeUsers.get(data.sender);
        if (otherUserSocketId)
          socket.to(otherUserSocketId).emit("inbox-opened", msgs, () => {
            console.log("msges opened readed", msgs);
          }); // Direct emission to current socket

        // If you need to notify the other participant:

        // if (otherUserSocketId) {
        //   socket.to(otherUserSocketId).emit("messages-read", msgs);
        // }
      } catch (error) {
        console.log("read error:", error);
      }
    });
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
          // console.log(message.to, result);

          socket.to(receiverSocketId).emit("message", result);
        }
        // else {
        //   await client.lpush(`messages:${message.to}`, JSON.stringify(result));
        // }
        socket.emit("message-sent", result);
      } catch (err) {
        console.log("Send message error:", err);
      }
    });
    socket.on("message-read", async (msg) => {
      try {
        console.log("messages-read-2");

        await markAsRead(msg).then(async (res) => {
          let key = activeUsers.get(msg.sender);

          if (key) {
            console.log("msg readed");
            socket.to(key).emit("read-by-reciever", res);
          }
        });
      } catch (error) {
        console.log("Send message error:", error);
      }
    });

    socket.on("disconnect", () => {
      activeUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });
};
