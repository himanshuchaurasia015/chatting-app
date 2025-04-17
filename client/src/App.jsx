import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatLayout from "./layouts/ChatLayout";
import ChatWindow from "./components/ChatWindow";
import { UserProvider } from "./context/UserContext";
import { ChatProvider } from "./context/ChatContext";
import "./App.css";
import Home from "./components/Home.jsx";

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
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to={`/home`} />
                ) : (
                  <Login setIsAuthenticated={setIsAuthenticated} />
                )
              }
            />
            <Route
              path="/register"
              element={<Register setIsAuthenticated={setIsAuthenticated} />}
            />{" "}
            <Route path="/" element={<ChatLayout />}>
              <Route path="/home" element={<Home />} />

              <Route path="chat/:user/:to/:chatId" element={<ChatWindow />} />
            </Route>
          </Routes>
        </ChatProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
