import './App.css';
import Signup from './components/Signup';
// import Login from "./components/Login";  <-- remove this import

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>MERN Auth Example</h1>
      <Signup />
      {/* <Login /> <-- remove this */}
    </div>
  );
}

export default App;