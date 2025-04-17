"use client";

import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, contacts }}>
      {children}
    </UserContext.Provider>
  );
};
