import { Outlet } from "react-router-dom";
import Sidebar from "../components/Home";

const ChatLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;
