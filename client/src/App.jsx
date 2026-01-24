import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import your pages
import Signup from './components/Signup';
import Dashboard from './Dashboard';
import Preview from './Preview'; 
import FormBuilder from './FormBuilder'; // Ensure this is imported

// --- Security Guard ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

// --- Login Redirect ---
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth */}
        <Route path="/" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Dashboard (The Table View) */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Builder (The Editor) */}
        <Route path="/builder" element={<PrivateRoute><FormBuilder /></PrivateRoute>} />

        {/* Preview (The Live Form) */}
        <Route path="/preview" element={<PrivateRoute><Preview /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;