import "./App.css";
import { Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Home from "./components/Home"; // we’ll create this next

function App() {
  return (
    <Routes>
      {/* Auth page */}
      <Route path="/" element={<Signup />} />

      {/* Home page after login */}
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
