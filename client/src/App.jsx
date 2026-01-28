import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import your pages
import Signup from './components/Signup';
import Dashboard from './Dashboard';
import Preview from './Preview';
import FormBuilder from './FormBuilder';
import View from './View';
import Responses from './Responses'; 

// --- Security Guard ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />; 
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
        <Route path="/login" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* --- PRIVATE ROUTES --- */}
        
        {/* 1. Dashboard */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* 2. Builder */}
        <Route path="/form-builder" element={<PrivateRoute><FormBuilder /></PrivateRoute>} />

        {/* 3. Preview (Internal Test) */}
        <Route path="/preview" element={<PrivateRoute><Preview /></PrivateRoute>} />

        {/* 4. SHARE LINK ROUTE (THIS WAS MISSING) */}
        {/* This makes the link http://localhost:3000/fill/123 work! */}
        <Route path="/fill/:formId" element={<PrivateRoute><Preview /></PrivateRoute>} />

        {/* 5. View (Read Only) */}
        <Route path="/view" element={<PrivateRoute><View /></PrivateRoute>} />

        {/* 6. Responses (Admin Only) */}
        <Route path="/responses" element={<PrivateRoute><Responses /></PrivateRoute>} />

        {/* Catch-all - MUST BE LAST */}
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;