import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatLayout from "./layouts/ChatLayout";
import ChatWindow from "./components/ChatWindow";
import { UserProvider } from "./context/UserContext";
import { ChatProvider } from "./context/ChatContext";
import "./App.css";
import Home from "./components/Home.jsx";
import CreateGroup from "./pages/CreateGroup.jsx";
import GroupChat from "./pages/GroupChat.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <UserProvider>
        <ChatProvider>
          <SocketProvider>
            <Routes>
              <Route
                path="/"
                element={<Login setIsAuthenticated={setIsAuthenticated} />}
              />
              <Route
                path="/register"
                element={<Register setIsAuthenticated={setIsAuthenticated} />}
              />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/create/group" element={<CreateGroup />} />
              <Route
                path="/chat/group/:groupId/:chatId"
                element={<GroupChat />}
              />
              <Route path="/" element={<ChatLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="chat/:user/:to/:chatId" element={<ChatWindow />} />
              </Route>
            </Routes>
          </SocketProvider>
        </ChatProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
