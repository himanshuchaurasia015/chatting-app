import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatContext } from "../context/ChatContext";
import { useUserContext } from "../context/UserContext";
import api from "../utils/Axios";
import Header from "./Header";
import { useSocket } from "../context/SocketContext";

const Home = () => {
  const { socket } = useSocket();
  const { chats, setChats, setActiveChat, messages, setMessages } =
    useChatContext();
  const [users, setUsers] = useState([]);
  const { currentUser, setCurrentUser } = useUserContext();
  const [activeTab, setActiveTab] = useState("chats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessages, setNewMessages] = useState({});

  const navigate = useNavigate();

  const handleChatClick = async (recipt) => {
    try {
      if (recipt.chatId) {
        setActiveChat(recipt.chatId);

        navigate(`/chat/${currentUser._id}/${recipt.userId}/${recipt.chatId}`);
      } else {
        const chat = await api.post("/chat/personal", {
          userId1: currentUser._id,
          userId2: recipt.userId,
        });
        if (chat) {
          setActiveChat(chat._id);
          navigate(
            `/chat/${currentUser._id}/${recipt.userId}/${chat.data.chat._id}`
          );
        }
      }
    } catch (error) {
      setLoading(false);
      setError(error);
      console.log(error);
    }
  };
  async function fetchUnread() {
    try {
      const res = await api.get("/chat");
      let data = res.data;
      setNewMessages((prev) => ({ ...prev, ...data }));
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }
  const handleGroupChatClick = async (recipt) => {
    setActiveChat(recipt._id);
    navigate(`/chat/group/${recipt.groupId}/${recipt._id}`);
  };

  async function fetchUsers() {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data.users);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }
  async function getAllChats() {
    try {
      const res = await api.get(`/chat/all/${currentUser._id}`);
      setChats(res.data.chats);
      setMessages(res.data.messages);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    let storedUser = localStorage.getItem("user");
    async function check() {
      if (!token && !storedUser) {
        navigate("/");
      } else {
        storedUser = JSON.parse(storedUser);
        setCurrentUser(storedUser);
      }
      fetchUsers();
    }
    check();
    fetchUnread();
  }, [navigate]);

  useEffect(() => {
    if (currentUser?._id) {
      getAllChats();
    }
  }, [currentUser]);

  const addNewChat = async (newChatId) => {
    try {
      const response = await api.get(`/chat/${newChatId}`);
      const newChat = response.data.chat;
      // setChats((prev) => [...prev, newChat]);
      setChats((prev) =>
        prev.some((c) => c._id === newChat._id) ? prev : [...prev, newChat]
      );
    } catch (error) {
      setLoading(false);
      setError(error);
      console.error("Error fetching new chat:", error);
    }
  };
  useEffect(() => {
    if (!socket) return;
    socket.on("connect_error", (err) => {
      setError("Connection failed: " + err.message);
      setLoading(false);
    });

    // Handle message events - updated to use "group-message" event
    socket.on("group-message", (newMessage) => {
      const chatId = newMessage.chatId;

      setNewMessages((prev) => {
        // If chatId exists, increment the count
        if (chatId in prev) {
          return {
            ...prev,
            [chatId]: prev[chatId] + 1,
          };
        } else {
          // If chatId doesn't exist, initialize it
          return {
            ...prev,
            [chatId]: 1,
          };
        }
      });
    });

    socket.on("message", (newMessage) => {
      const newChatId = newMessage.chatId;

      setMessages((prevMessages) => {
        const existingMessages = prevMessages[newChatId] || [];
        return {
          ...prevMessages,
          [newChatId]: [...existingMessages, newMessage],
        };
      });

      setNewMessages((prev) => {
        if (newChatId in prev) {
          return { ...prev, [newChatId]: prev[newChatId] + 1 };
        } else {
          addNewChat(newChatId);
          return { ...prev, [newChatId]: 1 };
        }
      });
    });

    return () => {
      socket.off("message");
      socket.off("group-message");
      socket.off("connect_error");
    };
  }, [socket]);

  // Save to localStorage when chats or messages update
  useEffect(() => {
    if (chats.length > 0) localStorage.setItem("chats", JSON.stringify(chats));
    if (Object.keys(messages).length > 0)
      localStorage.setItem("messages", JSON.stringify(messages));
    setLoading(false);
  }, [chats, messages]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-100">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading chat...</p>
  //       </div>
  //     </div>
  //   );
  // }

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

  return (
    <div className="w-[50%] mx-auto bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      {/* <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src={currentUser?.avatar || "/placeholder.svg?height=40&width=40"}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <span className="font-semibold">{currentUser?.name || "User"}</span>
        </div>
        <div className="flex space-x-2">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div> */}
      <Header setWindow={setActiveTab} />
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-center ${
            activeTab === "chats"
              ? "border-b-2 border-green-500 text-green-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("chats")}
        >
          Chats
        </button>
        <button
          className={`flex-1 py-3 text-center ${
            activeTab === "groups"
              ? "border-b-2 border-green-500 text-green-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("groups")}
        >
          Groups
        </button>
        <button
          className={`flex-1 py-3 text-center ${
            activeTab === "contacts"
              ? "border-b-2 border-green-500 text-green-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("contacts")}
        >
          Contacts
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200 hidden">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-100 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      {loading ? (
        <>
          {" "}
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading chat...</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {activeTab === "chats" && (
            <div className="divide-y divide-gray-200">
              {
                // chats.map((chat) => {
                //   const chatId = chat._id;
                //   let userId;
                //   let name;
                //   if (chat.isGroup) return;
                //   if (!chat.isGroup) {
                //     if (chat.users[0]._id === currentUser._id) {
                //       name = chat.users[1]?.name || "user";
                //       userId = chat.users[1]._id;
                //     } else {
                //       name = chat.users[0]?.name;
                //       userId = chat.users[0]._id;
                //     }
                //   } else {
                //     name = chat.chatName;
                //   }
                //   if (
                //     !messages[chatId] ||
                //     (messages[chatId].length === 0 && !chat.isGroup)
                //   )
                //     return null;
                chats.map((chat) => {
                  if (chat.isGroup) return;

                  const user0 = chat.users?.[0];
                  const user1 = chat.users?.[1];

                  // Skip if users are not properly populated
                  if (!user0 || !user1) return null;

                  let userId, name;
                  if (user0._id === currentUser._id) {
                    name = user1.name || "user";
                    userId = user1._id;
                  } else {
                    name = user0.name;
                    userId = user0._id;
                  }

                  if (!messages[chat._id] || messages[chat._id].length === 0)
                    return null;
                  return (
                    <div
                      key={chat._id}
                      className="p-3 flex itesms-center space-x-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        if (chat.isGroup) {
                          handleGroupChatClick(chat);
                        } else {
                          handleChatClick({
                            chatId: chat._id,
                            userId,
                          });
                        }
                      }}
                    >
                      <div className="relative">
                        <img
                          src={chat.avatar || "./default-profile.png"}
                          alt={name}
                          className="w-12 h-12 rounded-full"
                        />
                        {/* {chat.participants.some((p) => p.status === "online") && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )} */}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-sm font-medium truncate">
                            {name}
                          </h3>
                          <p className="text-green-600">
                            {newMessages[chat._id]
                              ? newMessages[chat._id] + " new Message"
                              : null}
                          </p>
                          {/* <span className="text-xs text-gray-500">
                        {messages.length > 0
                          ? new Date(
                              chat.messages[chat.messages.length - 1].timestamp
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span> */}
                        </div>
                        {/* <p className="text-sm text-gray-500 truncate">
                      {chat.messages.length > 0
                        ? `${
                            chat.messages[chat.messages.length - 1].senderId ===
                            "current"
                              ? "You: "
                              : ""
                          }${chat.messages[chat.messages.length - 1].content}`
                        : "No messages yet"}
                    </p> */}
                      </div>
                      {/* {chat.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )} */}
                    </div>
                  );
                })
              }
            </div>
          )}
          {activeTab === "groups" && (
            <div className="divide-y divide-gray-200">
              {/* Add new group button */}
              <div
                className="p-3 flex items-center space-x-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate("/create/group")}
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium">New Group</h3>
                  <p className="text-xs text-gray-500">
                    Create a new group chat
                  </p>
                </div>
              </div>
              {chats.map((chat) => {
                const chatId = chat._id;
                let userId;
                let name;
                if (!chat.isGroup) return;
                if (!chat.isGroup) {
                  if (chat.users[0]._id === currentUser._id) {
                    name = chat.users[1].name;
                    userId = chat.users[1]._id;
                  } else {
                    name = chat.users[0].name;
                    userId = chat.users[0]._id;
                  }
                } else {
                  name = chat.chatName;
                }
                if (
                  !messages[chatId] ||
                  (messages[chatId].length === 0 && !chat.isGroup)
                )
                  return null;
                return (
                  <div
                    key={chat._id}
                    className="p-3 flex items-center space-x-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (chat.isGroup) {
                        handleGroupChatClick(chat);
                      } else {
                        handleChatClick({
                          chatId: chat._id,
                          userId,
                        });
                      }
                    }}
                  >
                    <div className="relative">
                      <img
                        src={"./" + chat.groupPicture}
                        alt={name}
                        className="w-12 h-12 rounded-full"
                      />
                      {/* {chat.participants.some((p) => p.status === "online") && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )} */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-medium truncate">{name}</h3>
                        <p className="text-green-600">
                          {newMessages[chat._id]
                            ? newMessages[chat._id] + " new Message"
                            : null}
                        </p>
                        {/* <span className="text-xs text-gray-500">
                        {messages.length > 0
                          ? new Date(
                              chat.messages[chat.messages.length - 1].timestamp
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span> */}
                      </div>
                      {/* <p className="text-sm text-gray-500 truncate">
                      {chat.messages.length > 0
                        ? `${
                            chat.messages[chat.messages.length - 1].senderId ===
                            "current"
                              ? "You: "
                              : ""
                          }${chat.messages[chat.messages.length - 1].content}`
                        : "No messages yet"}
                    </p> */}
                    </div>
                    {/* {chat.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )} */}
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === "contacts" && (
            <div className="divide-y divide-gray-200">
              {users.length == 0 ? (
                <p>No contacts found</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="p-3 flex items-center space-x-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleChatClick({ userId: user._id })}
                  >
                    <div className="relative">
                      <img
                        src={user.profilePicture || "./default-profile.png"}
                        alt={user.name || "user"}
                        className="w-12 h-12 rounded-full"
                      />
                      {/* {chat.participants.some((p) => p.status === "online") && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )} */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-medium truncate">
                          {user._id === currentUser._id ? "Me" : user.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
