import { io } from "socket.io-client";

let socket;

const socketConnect = (id) => {
  if (!socket) {
    socket = io("http://localhost:4000", {
      query: { userid: id },
    });
  }
  return socket;
};

export default socketConnect;
