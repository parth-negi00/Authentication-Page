import './App.css';
import Signup from './components/Signup';
import Login from "./components/Login";

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>MERN Auth Example</h1>
      <Signup/>
      <Login />
    </div>
  );
}


export default App;
