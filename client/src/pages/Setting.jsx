// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useUserContext } from "../context/UserContext";
// import api from "../utils/Axios";
// import { v4 as uuidv4 } from "uuid";
// const Setting = () => {
//   const navigate = useNavigate();
//   const { chatId } = useParams();
//   const { currentUser, setCurrentUser } = useUserContext();
//   const [groupName, setGroupName] = useState("");
//   const [description, setDescription] = useState("");
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [availableUsers, setAvailableUsers] = useState([]);
//   const [chatDetails, setChatDetails] = useState(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const token = localStorage.getItem("token");
//   let user = localStorage.getItem("user");
//   user = JSON.parse(user);
//   useEffect(() => {
//     // Check authentication

//     if (!token || !user) {
//       navigate("/");
//       return;
//     } else {
//       if (!currentUser) {
//         setCurrentUser(user);
//       }
//     }

//     // Fetch available users
//     const fetchDetails = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get(`/chat/${chatId}`);
//         const response = await api.get("/auth/users");
//         // Filter out current user from the list
//         setChatDetails(res.data.chat);

//         setSelectedUsers(res.data.users);
//         const filteredUsers = response.data.users.filter((doc) => {
//           console.log(doc._id, currentUser._id);
//           return doc._id !== currentUser._id;
//         });
//         setAvailableUsers(filteredUsers);
//       } catch (err) {
//         console.error("Error fetching users:", err);
//         setError("Failed to load users. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDetails();
//   }, [currentUser, navigate]);

//   const handleUserToggle = (userId) => {
//     if (selectedUsers.includes(userId)) {
//       setSelectedUsers(selectedUsers.filter((id) => id !== userId));
//     } else {
//       setSelectedUsers([...selectedUsers, userId]);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     // Validation
//     if (!groupName.trim()) {
//       setError("Group name is required");
//       return;
//     }

//     if (selectedUsers.length === 0) {
//       setError("You must select at least one member for the group");
//       return;
//     }

//     try {
//       setLoading(true);
//       const Updates = {
//         chatName: groupName,
//         users: selectedUsers,
//         description: description,
//       };
//       // Create group chat with selected users
//       const response = await api.post("/chat/group", { chatId, Updates });

//       if (response.data && response.data.chat) {
//         navigate(-1);
//       } else {
//         setError("Failed to update group");
//       }
//     } catch (err) {
//       console.error("Error updating group:", err);
//       setError(err.response?.data?.message || "Failed to update group chat");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4">
//       <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
//         <h1 className="text-2xl font-bold text-center mb-6">
//           Update Group
//           {/* {chatDetails.chatName} */}
//         </h1>

//         {error && (
//           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
//             <p>{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Group Name *
//             </label>
//             <input
//               type="text"
//               value={groupName}
//               onChange={(e) => setGroupName(e.target.value)}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               placeholder="Enter group name"
//               required
//             />
//           </div>

//           <div className="mb-6">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Description
//             </label>
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               placeholder="Enter group description (optional)"
//               rows="3"
//             />
//           </div>

//           <div className="mb-6">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Select Members *
//             </label>
//             {loading ? (
//               <div className="text-center p-4">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
//                 <p className="mt-2 text-sm text-gray-600">Loading users...</p>
//               </div>
//             ) : (
//               <div className="max-h-60 overflow-y-auto border rounded p-2">
//                 {availableUsers.length === 0 ? (
//                   <p className="text-gray-500 text-center py-2">
//                     No users available
//                   </p>
//                 ) : (
//                   availableUsers.map((user) => (
//                     <div
//                       key={user._id}
//                       className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded ${
//                         selectedUsers.includes(user._id) ? "bg-green-50" : ""
//                       }`}
//                       onClick={() => handleUserToggle(user._id)}
//                     >
//                       <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
//                         {user.avatar ? (
//                           <img
//                             src={user.avatar}
//                             alt={user.name}
//                             className="w-8 h-8 rounded-full"
//                           />
//                         ) : (
//                           <span className="text-sm font-medium">
//                             {user.name.charAt(0).toUpperCase()}
//                           </span>
//                         )}
//                       </div>
//                       <span className="flex-grow">{user.name}</span>
//                       <input
//                         type="checkbox"
//                         checked={selectedUsers.includes(user._id)}
//                         onChange={() => {}}
//                         className="h-5 w-5 text-green-600"
//                       />
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//             <p className="text-sm text-gray-600 mt-1">
//               Selected: {selectedUsers.length} members
//             </p>
//           </div>

//           <div className="flex items-center justify-between">
//             <button
//               type="button"
//               onClick={() => navigate("/home")}
//               className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading || !groupName || selectedUsers.length === 0}
//               className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
//                 loading || !groupName || selectedUsers.length === 0
//                   ? "opacity-50 cursor-not-allowed"
//                   : ""
//               }`}
//             >
//               {loading ? "Creating..." : "Create Group"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Setting;

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import api from "../utils/Axios";

const Setting = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { currentUser, setCurrentUser } = useUserContext();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token || !storedUser) {
      navigate("/");
      return;
    }

    if (!currentUser) {
      setCurrentUser(storedUser);
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const chatRes = await api.get(`/chat/${chatId}`);
        const userRes = await api.get("/auth/users");

        const chat = chatRes.data.chat;
        const chatUsers = chatRes.data.users.map((user) => user._id); // Store only user IDs

        setGroupName(chat.chatName || "");
        setDescription(chat.description || "");
        setSelectedUsers(chatUsers);

        const filteredUsers = userRes.data.users.filter(
          (u) => u._id !== storedUser._id
        );
        setAvailableUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [chatId, currentUser, navigate, setCurrentUser]);

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    if (selectedUsers.length === 0) {
      setError("You must select at least one member for the group");
      return;
    }

    try {
      setLoading(true);
      const Updates = {
        chatName: groupName,
        users: selectedUsers,
        description,
      };

      const response = await api.put("/chat/group", { chatId, Updates });

      if (response.data?.chat) {
        navigate(-1);
      } else {
        setError("Failed to update group");
      }
    } catch (err) {
      console.error("Error updating group:", err);
      setError(err.response?.data?.message || "Failed to update group chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Update Group</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter group description (optional)"
              rows="3"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Members *
            </label>
            {loading ? (
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading users...</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded p-2">
                {availableUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-2">
                    No users available
                  </p>
                ) : (
                  availableUsers.map((user) => (
                    <div
                      key={user._id}
                      className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded ${
                        selectedUsers.includes(user._id) ? "bg-green-50" : ""
                      }`}
                      onClick={() => handleUserToggle(user._id)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="flex-grow">{user.name}</span>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => {}}
                        className="h-5 w-5 text-green-600"
                      />
                    </div>
                  ))
                )}
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1">
              Selected: {selectedUsers.length} members
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !groupName || selectedUsers.length === 0}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                loading || !groupName || selectedUsers.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading ? "Updating..." : "Update Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Setting;
