"use client";

import { createContext, useState, useContext } from "react";

const ChatContext = createContext(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);

  const [activeChat, setActiveChat] = useState(null);

  const sendMessage = (chatId, content) => {
    const newMessage = {
      id: Date.now().toString(),
      senderId: "current",
      content,
      timestamp: new Date(),
      status: "sent",
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage,
            }
          : chat
      )
    );
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        activeChat,
        setActiveChat,
        sendMessage,
        messages,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
