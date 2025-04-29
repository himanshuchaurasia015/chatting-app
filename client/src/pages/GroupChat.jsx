import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/Axios";
import { useChatContext } from "../context/ChatContext";
import { useUserContext } from "../context/UserContext";
import { useSocket } from "../context/SocketContext";

const GroupChat = () => {
  const { groupId, chatId } = useParams();
  const { currentUser, setCurrentUser } = useUserContext();

  const navigate = useNavigate();
  const { setMessages } = useChatContext();
  const [currMsg, setCurrMsg] = useState([]);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { socket, connectSocket } = useSocket();
  const messagesEndRef = useRef(null);
  const storedUser = localStorage.getItem("user");
  const user = JSON.parse(storedUser || "{}");

  // Check authentication
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) {
      navigate("/");
    } else {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [navigate, setCurrentUser]);

  // Initialize chat and socket connection
  useEffect(() => {
    if (!groupId || !chatId) return;

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${chatId}`);
        setCurrMsg(res.data);
        const groupInfo = await api.get(`/chat/${chatId}`);
        setRecipient(groupInfo.data.chat);
        if (socket.connected) {
          socket.emit("group-chat-open", {
            chatId,
            userId: currentUser._id,
            groupId,
          });
        }
        setLoading(false);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError(`Failed to fetch messages: ${err.message}`);
      }
    };
    if (!socket) {
      connectSocket();
      return;
    }
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };
    if (socket.connected) {
      console.log("Socket connected:", socket.id);
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("connect_error", (err) => {
      setError("Connection failed: " + err.message);
      setLoading(false);
    });

    // Handle message events - updated to use "group-message" event
    socket.on("group-message", (newMessage) => {
      console.log("message-recieved");
      // Check if the message is related to our current chat and not sent by current user
      if (newMessage.chatId === chatId && newMessage.sender !== user._id) {
        console.log("Received group message:", newMessage);
        setCurrMsg((prev) => [...prev, newMessage]);
      }
    });

    socket.on("group-message-sent", (newMessage) => {
      console.log("Message sent confirmation:", newMessage);
    });

    fetchMessages();

    // Cleanup
    return () => {
      socket.off("group-message");
      socket.off("group-message-sent");
      socket.off("connect_error");
    };
  }, [groupId, chatId, socket, connectSocket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currMsg]);

  // Send message handler
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !recipient) return;

    const newMessage = {
      sender: currentUser._id,
      to: groupId,
      chatId,
      content: message,
      contentType: "text",
      createdAt: new Date().toISOString(),
    };

    socket.emit("send-group-message", newMessage);

    // Add to local state with current user details for display
    const messageWithDetails = {
      ...newMessage,
      senderDetails: {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        profilePicture: currentUser.profilePicture,
      },
    };

    setCurrMsg((prev) => [...prev, messageWithDetails]);
    setMessages((prev) => ({
      ...prev,
      [chatId]: [
        ...(prev[chatId] || []),
        { ...messageWithDetails, type: "sent" },
      ],
    }));
    setMessage("");
  };

  // Handle message display format differences
  const formatMessage = (msg) => {
    // Ensure consistent format for display
    return {
      id: msg._id || `temp-${Date.now()}`,
      content: msg.content || "",
      contentType: msg.contentType || "text",
      sender: getSenderId(msg),
      senderDetails:
        msg.senderDetails ||
        (msg.sender && typeof msg.sender === "object"
          ? msg.sender
          : { _id: msg.sender }),
      createdAt: msg.createdAt || new Date().toISOString(),
    };
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

  // Get sender ID from message based on new format
  const getSenderId = (msg) => {
    if (msg.senderDetails && msg.senderDetails._id) {
      return msg.senderDetails._id;
    }
    return (
      msg.sender &&
      (typeof msg.sender === "object" ? msg.sender._id : msg.sender)
    );
  };

  // Get sender name for display
  const getSenderName = (msg) => {
    if (msg.senderDetails && msg.senderDetails.name) {
      return msg.senderDetails.name;
    }
    return msg.sender && msg.sender.name ? msg.sender.name : "Unknown";
  };

  // Chat UI
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow flex justify-center">
        <h2 className="text-xl font-bold">Chat with {recipient.chatName}</h2>
        {recipient.groupAdmin === currentUser._id && (
          <button
            className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
            onClick={() => navigate(`/settings/${chatId}`)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {currMsg.map((msg, index) => {
          const formattedMsg = formatMessage(msg);
          const isCurrentUser = formattedMsg.sender === currentUser._id;
          return (
            <div
              key={index}
              className={`mb-4 ${isCurrentUser ? "text-right" : "text-left"}`}
            >
              {!isCurrentUser && (
                <p className="ml-2 mb-1 text-sm text-gray-600">
                  {getSenderName(msg)}
                </p>
              )}
              <div
                className={`inline-block p-3 rounded-lg ${
                  isCurrentUser
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p>{formattedMsg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isCurrentUser ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(formattedMsg.createdAt).toLocaleTimeString()}
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

export default GroupChat;
