import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const connectSocket = useCallback(() => {
    const token = localStorage.getItem("token");

    const newSocket = io("http://localhost:4000", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    setSocket(newSocket);
  }, []);

  useEffect(() => {
    connectSocket();
  }, [connectSocket]);
  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
