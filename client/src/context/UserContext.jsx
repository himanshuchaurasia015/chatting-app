// import { createContext, useState, useContext, useEffect } from "react";

// const UserContext = createContext(undefined);

// export const useUserContext = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUserContext must be used within a UserProvider");
//   }
//   return context;
// };

// export const UserProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [contacts, setContacts] = useState([]); // You can later add setContacts if needed
//   const [groups, setGroups] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     const token = localStorage.getItem("token");

//     if (storedUser && token) {
//       setCurrentUser(JSON.parse(storedUser));
//     }
//     setLoading(false);
//   }, []);

//   // Persist user to localStorage on change
//   useEffect(() => {
//     if (currentUser) {
//       localStorage.setItem("user", JSON.stringify(currentUser));
//     } else {
//       localStorage.removeItem("user");
//       localStorage.removeItem("token"); // Optionally clear token too
//     }
//   }, [currentUser]);

//   return (
//     <UserContext.Provider
//       value={{
//         currentUser,
//         setCurrentUser,
//         setContacts,
//         groups,
//         setGroups,
//         contacts,
//         loading,
//         setLoading,
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// };

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
  const [contacts] = useState([]); // Contacts or other state that you may need
  const [loading, setLoading] = useState(true); // To handle async data loading

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    console.log("UserContext initialization:", { storedUser, token });

    // localStorage.getItem returns null (not undefined) when item doesn't exist
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed user:", parsedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Handle corrupted data - maybe clear it
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Persist currentUser to localStorage when it changes
  // useEffect(() => {
  //   if (currentUser) {
  //     localStorage.setItem("user", JSON.stringify(currentUser)); // Store user in localStorage
  //   } else {
  //     localStorage.removeItem("user"); // Clear user data on logout
  //     localStorage.removeItem("token"); // Clear token on logout
  //   }
  // }, [currentUser]);

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, contacts, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};
