import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/Axios";
import { useChatContext } from "../context/ChatContext";
import { useUserContext } from "../context/UserContext";
const ChatWindow = () => {
  const { user: userId, to, chatId } = useParams();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUserContext();
  const { messages, setMessages } = useChatContext();
  const [currMsg, setcurrMsg] = useState([]);
  const socket = useRef(null);
  const [currUser, setCurrUser] = useState(null);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  console.log(currentUser);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
    } else {
      setCurrUser(JSON.parse(storedUser));
    }
  }, [navigate, to]);

  useEffect(() => {
    // if (!userId || !to || !chatId) {
    //   setError("Unauthorized access");
    //   return;
    // }

    // let msg = localStorage.getItem("messages");
    // msg = JSON.parse(msg);

    // setcurrMsg((prev) => [...prev, ...(msg?.[chatId] || [])]);
    if (!userId || !to || !chatId) return;
    console.log("hello");
    const msg = JSON.parse(localStorage.getItem("messages"));
    setcurrMsg((prev) => [...prev, ...(msg?.[chatId] || [])]);

    const verifyAndConnect = async () => {
      try {
        // 2. Get recipient info
        const userResponse = await api.get(`/auth/user/${to}`);
        setRecipient(userResponse.data.user);

        // 3. Initialize socket connection
        const newSocket = io("http://localhost:4000", {
          query: { userId: userId },
          transports: ["websocket"],
        });

        // 4. Setup socket event handlers
        newSocket.on("connect", () => {
          console.log("Connected:", newSocket.id);
          setIsChecking(false);
        });

        newSocket.on("connect_error", (err) => {
          console.error("Connection error:", err);
          setError("Connection failed: " + err.message);
          setIsChecking(false);
        });

        newSocket.on("message", async (newMessage) => {
          console.log(newMessage);
          let res = await api.post(`/chat/message`, newMessage);

          setcurrMsg((prev) => [...prev, { ...res.data }]);
        });

        socket.current = newSocket;
      } catch (err) {
        console.error("Error:", err);
        setError("Server error: " + err.message);
        setIsChecking(false);
      }
    };

    verifyAndConnect();

    // Cleanup function
    return () => {
      if (socket.current) {
        console.log("Disconnecting socket");
        socket.current.disconnect();
      }
    };
  }, [userId, to, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currMsg]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket.current || !recipient) return;

    const newMessage = {
      sender: userId,
      to: to,
      chatId,
      content: message,
      createdAt: new Date().toISOString(),
    };

    socket.current.emit("send-message", newMessage);
    setcurrMsg((prev) => [...prev, { ...newMessage }]);
    setMessages((prevMessages) => ({
      ...prevMessages,
      [chatId]: [
        ...(prevMessages[chatId] || []),
        { ...newMessage, type: "sent" },
      ],
    }));
    setMessage("");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your number...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-100 p-6 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white p-4 shadow">
        <h2 className="text-xl font-bold">Welcome, {currUser.name}</h2>
        <p>Send message to {recipient.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {currMsg.map((msg, index) => {
          console.log(msg);
          return (
            <div
              key={index}
              className={`mb-4 ${
                (msg.sender._id || msg.sender) === userId
                  ? "text-right"
                  : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  msg.sender._id === userId || msg.sender === userId
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.type === "sent" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-white p-4 shadow">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
