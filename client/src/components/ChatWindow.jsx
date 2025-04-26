// import { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { io } from "socket.io-client";
// import api from "../utils/Axios";
// import { useChatContext } from "../context/ChatContext";
// import { useUserContext } from "../context/UserContext";
// const ChatWindow = () => {
//   const { user: userId, to, chatId } = useParams();
//   const navigate = useNavigate();
//   const { currentUser } = useUserContext();
//   const { setMessages } = useChatContext();
//   const [currMsg, setcurrMsg] = useState([]);
//   const socket = useRef(null);
//   const [currUser, setCurrUser] = useState(null);
//   const [message, setMessage] = useState("");
//   const [recipient, setRecipient] = useState("");
//   const [isChecking, setIsChecking] = useState(true);
//   const [error, setError] = useState("");
//   const messagesEndRef = useRef(null);

//   console.log(currentUser);
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     const token = localStorage.getItem("user");
//     console.log(storedUser, token);
//     if (!storedUser && !token) {
//       navigate("/");
//     } else {
//       setCurrUser(JSON.parse(storedUser));
//     }
//   }, [navigate, to]);

//   useEffect(() => {
//     // if (!userId || !to || !chatId) {
//     //   setError("Unauthorized access");
//     //   return;
//     // }

//     // let msg = localStorage.getItem("messages");
//     // msg = JSON.parse(msg);

//     // setcurrMsg((prev) => [...prev, ...(msg?.[chatId] || [])]);

//     async function fetchMsg() {
//       const res = await api.get(`/chat/messages/${chatId}`);
//       const msg = res.data;
//       setcurrMsg(() => [...msg]);
//     }
//     if (!userId || !to || !chatId) return;

//     fetchMsg();

//     const verifyAndConnect = async () => {
//       try {
//         // 2. Get recipient info
//         const userResponse = await api.get(`/auth/user/${to}`);
//         setRecipient(userResponse.data.user);
//         const token = localStorage.getItem("token");
//         // 3. Initialize socket connection
//         const newSocket = io("http://localhost:4000", {
//           auth: { token },
//           query: { userId: userId },
//           transports: ["websocket"],
//         });

//         // 4. Setup socket event handlers
//         newSocket.on("connect", () => {
//           console.log("Connected:", newSocket.id);
//           setIsChecking(false);
//         });

//         newSocket.on("connect_error", (err) => {
//           console.error("Connection error:", err);
//           setError("Connection failed: " + err.message);
//           setIsChecking(false);
//         });

//         newSocket.on("message", async (newMessage) => {
//           console.log(newMessage);

//           setcurrMsg((prev) => [...prev, { ...newMessage }]);
//         });

//         socket.current = newSocket;
//       } catch (err) {
//         console.error("Error:", err);
//         setError("Server error: " + err.message);
//         setIsChecking(false);
//       }
//     };

//     verifyAndConnect();

//     // Cleanup function
//     return () => {
//       if (socket.current) {
//         console.log("Disconnecting socket");
//         socket.current.disconnect();
//       }
//     };
//   }, [userId, to, navigate]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [currMsg]);

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (!message.trim() || !socket.current || !recipient) return;

//     const newMessage = {
//       sender: userId,
//       to: to,
//       chatId,
//       content: message,
//       createdAt: new Date().toISOString(),
//     };

//     socket.current.emit("send-message", newMessage);
//     setcurrMsg((prev) => [...prev, { ...newMessage }]);
//     setMessages((prevMessages) => ({
//       ...prevMessages,
//       [chatId]: [
//         ...(prevMessages[chatId] || []),
//         { ...newMessage, type: "sent" },
//       ],
//     }));
//     setMessage("");
//   };

//   if (isChecking) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Verifying your number...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="bg-red-100 p-6 rounded-lg">
//           <p className="text-red-600">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div className="bg-white p-4 shadow">
//         <h2 className="text-xl font-bold">Welcome, {currUser.name}</h2>
//         <p>Send message to {recipient.name}</p>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4">
//         {currMsg.map((msg, index) => {
//           console.log(msg);
//           return (
//             <div
//               key={index}
//               className={`mb-4 ${
//                 (msg.sender._id || msg.sender) === userId
//                   ? "text-right"
//                   : "text-left"
//               }`}
//             >
//               <div
//                 className={`inline-block p-3 rounded-lg ${
//                   msg.sender._id === userId || msg.sender === userId
//                     ? "bg-blue-500 text-white"
//                     : "bg-white border border-gray-200"
//                 }`}
//               >
//                 <p>{msg.content}</p>
//                 <p
//                   className={`text-xs mt-1 ${
//                     msg.type === "sent" ? "text-blue-100" : "text-gray-500"
//                   }`}
//                 >
//                   {new Date(msg.createdAt).toLocaleTimeString()}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>

//       <form onSubmit={sendMessage} className="bg-white p-4 shadow">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-1 p-2 border rounded"
//           />
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Send
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ChatWindow;

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/Axios";
import { useChatContext } from "../context/ChatContext";

const ChatWindow = () => {
  const { user: userId, to, chatId } = useParams();
  const navigate = useNavigate();
  const { setMessages } = useChatContext();
  const [currMsg, setCurrMsg] = useState([]);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  // Check authentication
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/");
    }
  }, [navigate]);

  // Initialize chat and socket connection
  useEffect(() => {
    if (!userId || !to || !chatId) return;

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${chatId}`);
        setCurrMsg(res.data);
        const userResponse = await api.get(`/auth/user/${to}`);
        setRecipient(userResponse.data.user);
      } catch (err) {
        setError(`Failed to fetch messages: ${err.message}`);
      }
    };

    // Set up socket connection
    const setupSocket = async () => {
      try {
        // Get recipient info

        // Connect to socket
        const token = localStorage.getItem("token");
        const newSocket = io("http://localhost:4000", {
          auth: { token },
          query: { userId },
          transports: ["websocket"],
        });

        newSocket.on("connect", () => {
          console.log("Connected:", newSocket.id);
          setLoading(false);
        });

        newSocket.on("connect_error", (err) => {
          setError("Connection failed: " + err.message);
          setLoading(false);
        });

        newSocket.on("message", (newMessage) => {
          setCurrMsg((prev) => [...prev, newMessage]);
        });

        socket.current = newSocket;
      } catch (err) {
        setError("Server error: " + err.message);
        setLoading(false);
      }
    };

    fetchMessages();
    setupSocket();

    // Cleanup
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userId, to, chatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currMsg]);

  // Send message handler
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket.current || !recipient) return;

    const newMessage = {
      sender: userId,
      to,
      chatId,
      content: message,
      createdAt: new Date().toISOString(),
    };

    socket.current.emit("send-message", newMessage);
    setCurrMsg((prev) => [...prev, newMessage]);
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), { ...newMessage, type: "sent" }],
    }));
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
        {currMsg.map((msg, index) => (
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
                (msg.sender._id || msg.sender) === userId
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              <p>{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  (msg.sender._id || msg.sender) === userId
                    ? "text-blue-100"
                    : "text-gray-500"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
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
