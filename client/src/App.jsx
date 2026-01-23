import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import your pages
import Signup from './components/Signup';
import Dashboard from './Dashboard'; // Make sure this file exists!

// --- 1. The Security Guard (Private Route) ---
// This checks if a token exists. If not, it kicks the user back to the home page.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    // --- 2. The Router Wrapper ---
    <BrowserRouter>
      <Routes>
        
        {/* Public Route: This is your Signup/Login page */}
        {/* We set path="/" so this is the first thing users see */}
        <Route path="/" element={<Signup />} />

        {/* Protected Route: The Dashboard */}
        {/* We wrap Dashboard inside PrivateRoute to protect it */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;