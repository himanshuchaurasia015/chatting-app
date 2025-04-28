import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/Axios";
import { useChatContext } from "../context/ChatContext";
import { RiCheckDoubleLine } from "react-icons/ri";
import { useSocket } from "../context/SocketContext";

const ChatWindow = () => {
  const { user: userId, to, chatId } = useParams();
  const navigate = useNavigate();
  const { setMessages } = useChatContext();
  const [currMsg, setCurrMsg] = useState([]);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  // Check authentication
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/");
    }
  }, [navigate]);
  useEffect(() => {
    if (!userId || !to || !chatId) return;
    const setup = async () => {
      try {
        const res = await api.get(`/chat/messages/${chatId}`);
        setCurrMsg(res.data);
        // Get recipient info
        const userResponse = await api.get(`/auth/user/${to}`);
        setRecipient(userResponse.data.user);

        // socket.on("connect", () => {
        //   console.log("Connected:", socket.id);

        //   setLoading(false);
        // });
        if (!socket) return;
        socket.emit("open-inbox", {
          chatId,
          userId,
          sender: userResponse.data.user._id,
        });
      } catch (err) {
        setError("Server error: " + err.message);
        setLoading(false);
      }
    };
    setup();
  }, [userId, to, chatId, navigate]);

  useEffect(() => {
    // Set up socket connection
    if (!socket) return;
    socket.on("connect_error", (err) => {
      setError("Connection failed: " + err.message);
      setLoading(false);
    });
    socket.on("message", (newMessage) => {
      setCurrMsg((prev) => [...prev, newMessage]);

      socket.emit("message-read", {
        chatId,
        _id: newMessage._id,
        userId,
      });
    });
    socket.on("inbox-opened", (seenMessages) => {
      const seenIds = new Set(seenMessages.msgs.map((m) => m._id));

      setCurrMsg((prevMessages) =>
        prevMessages.map((msg) => {
          if (seenIds.has(msg._id)) {
            // Update readBy array to include the current userId (if not already)
            if (!msg.readBy.includes(userId)) {
              return {
                ...msg,
                readBy: [...msg.readBy, userId],
              };
            }
          }
          return msg;
        })
      );
    });

    socket.on("message-sent", (msg) => {
      setCurrMsg((prev) => [...prev, msg]);
      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), { ...msg, type: "sent" }],
      }));
    });

    socket.on("read-by-reciever", (readInfo) => {
      console.log("Message read by:", readInfo);

      const { _id: messageId, readBy } = readInfo; // assuming server sends this info
      let readerId = readBy[0];
      // Update messages
      setMessages((prev) => {
        const updatedChat = (prev[chatId] || []).map((m) => {
          if (m._id === messageId) {
            // Add readerId to readBy array if not already there
            if (!m.readBy.includes(readerId)) {
              return { ...m, readBy: [readerId] };
            }
          }
          return m;
        });
        return { ...prev, [chatId]: updatedChat };
      });

      // Update currMsg
      setCurrMsg((prev) =>
        prev.map((m) => {
          if (m._id === messageId) {
            if (!m.readBy.includes(readerId)) {
              return { ...m, readBy: [...m.readBy, readerId] };
            }
          }
          return m;
        })
      );
    });

    // Cleanup
    return () => {
      socket.off("message");
      socket.off("connect_error");
      socket.off("inbox-opened");
      socket.off("message-sent");
      socket.off("read-by-reciever");
    };
  }, [socket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currMsg]);

  // Send message handler
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !recipient) return;

    const newMessage = {
      sender: userId,
      to,
      chatId,
      content: message,
      createdAt: new Date().toISOString(),
    };

    socket.emit("send-message", newMessage);

    // setCurrMsg((prev) => [...prev, newMessage]);
    // setMessages((prev) => ({
    //   ...prev,
    //   [chatId]: [...(prev[chatId] || []), { ...newMessage, type: "sent" }],
    // }));
    setMessage("");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // Chat UI
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow">
        <h2 className="text-xl font-bold">Chat with {recipient.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {currMsg.map((msg, index) => {
          console.log(msg);
          let readBy = msg.readBy;
          let isRead = readBy.length != 0 && readBy[0] === recipient._id;
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
                className={`inline-block p-3 rounded-lg  ${
                  (msg.sender._id || msg.sender) === userId
                    ? "bg-blue-500 text-white min-w-[120px]"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 flex justify-between items-center gap-10${
                    (msg.sender._id || msg.sender) === userId
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString()}{" "}
                  {(msg.sender._id || msg.sender) === userId && isRead ? (
                    <span>
                      <RiCheckDoubleLine color="blue" size={20} />
                    </span>
                  ) : (
                    <></>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
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
