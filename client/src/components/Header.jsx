import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const Header = () => {
  const { currentUser, setCurrentUser } = useUserContext();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("chats");
    localStorage.removeItem("messages");
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={currentUser?.avatar || "/placeholder.svg?height=40&width=40"}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
              onMouseEnter={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div className="absolute top-12 left-0 bg-white shadow-lg rounded-md border border-gray-100 w-48 z-10">
                <div className="p-3 border-b border-gray-100">
                  <p className="font-medium">{currentUser?.name || "User"}</p>
                  <p className="text-xs text-gray-500">
                    {currentUser?.email || ""}
                  </p>
                </div>
                <div
                  className="p-3 flex items-center space-x-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate("/profile")}
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profile</span>
                </div>
                <div
                  className="p-3 flex items-center space-x-2 text-red-500 hover:bg-gray-50 cursor-pointer"
                  onClick={handleLogout}
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
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
          <h1 className="font-bold text-lg text-gray-800">ChatterBox</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="text-gray-600 hover:bg-gray-100 p-2 rounded-full"
            onClick={() => navigate("/settings")}
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
          <button
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full"
            onClick={() => navigate("/create/chat")}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
