import "./App.css";

function App() {
  const handleClick = () => {
    alert("button clicked");
  };
  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
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
