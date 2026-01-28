import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import your pages
import Signup from './components/Signup';
import Dashboard from './Dashboard';
import Preview from './Preview'; 
import FormBuilder from './FormBuilder'; 
import View from './View';

// --- Security Guard ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />; // Redirect to /login if no token
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
        {/* Public Auth - We add aliases for login/signup so links work */}
        <Route path="/" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Dashboard (The Table View) */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Builder (The Editor) - FIXED ROUTE NAME */}
        <Route path="/form-builder" element={<PrivateRoute><FormBuilder /></PrivateRoute>} />

        {/* Preview (The Live Form) */}
        <Route path="/preview" element={<PrivateRoute><Preview /></PrivateRoute>} />

        {/* View (Read Only Page) */}
        <Route path="/view" element={<PrivateRoute><View /></PrivateRoute>} />

        {/* Catch-all - Must be at the bottom */}
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;