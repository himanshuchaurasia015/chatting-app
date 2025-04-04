import { useState } from "react";
import "./App.css";

function App() {
  const [clicked, setClicked] = useState(false);
  const handleClick = () => {
    setClicked(!clicked);
    // alert("button clicked");
  };
  return (
    <>
      <div
        className={`${
          !clicked ? "hidden" : "block"
        } w-[100%] h-[100%] p-4 bg-gray-400 rounded-lg shadow-xl `}
      >
        <h2 className="text-lg font-bold mb-2">Login</h2>
        <form className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="Username"
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
      <div className="fixed bottom-5 right-5 z-50  ">
        <button
          onClick={handleClick}
          className="w-16 h-16 rounded-full bg-blue-600 text-white text-3xl shadow-lg hover:bg-blue-700 transition"
        >
          +
        </button>
      </div>
    </>
  );
}

export default App;
