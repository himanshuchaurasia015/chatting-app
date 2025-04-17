// import { useEffect } from "react";
// import { useParams } from "react-router";
// import socketConnect from "../utils/socket";

const Welcome = () => {
  //   const params = useParams();
  //   useEffect(() => {
  //     const { mobile } = params;
  //     const socket = socketConnect(mobile);

  //     socket.on("connect", () => {
  //       console.log("Connected to socket:", socket.id);
  //     });

  //     return () => {
  //       socket.disconnect(); // Cleanup
  //       console.log("Socket disconnected");
  //     };
  //   }, [params.mobile]);
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-64 h-64 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-32 w-32 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome to ChatApp
      </h1>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Connect with friends, family, and colleagues through one-to-one and
        group chats.
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <h3 className="font-medium">One-to-One Chat</h3>
          </div>
          <p className="text-sm text-gray-600">
            Start a private conversation with any of your contacts.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="font-medium">Group Chat</h3>
          </div>
          <p className="text-sm text-gray-600">
            Create groups with multiple participants for team collaboration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
