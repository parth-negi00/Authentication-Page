import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormBuilder from './FormBuilder'; // Import the new component

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      {/* Navbar */}
      <nav style={{ padding: '10px 20px', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Enterprise Resource Portal Form Builder </h3>
        <button onClick={handleLogout} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
      </nav>

      {/* The Form Builder */}
      <FormBuilder />
    </div>
  );
}