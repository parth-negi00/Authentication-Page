import React, { useState } from "react";
import "./Signup.css";

export default function Signup() {
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  // Signup form change
  const handleSignupChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };

  // Login form change
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  // Signup submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("Signup successful! Welcome " + data.user.name);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  // Login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("Login successful! Welcome back " + data.user.name);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSignupSubmit}>
        <input type="text" name="name" placeholder="Name" value={signupForm.name} onChange={handleSignupChange} required />
        <input type="email" name="email" placeholder="Email" value={signupForm.email} onChange={handleSignupChange} required />
        <input type="password" name="password" placeholder="Password" value={signupForm.password} onChange={handleSignupChange} required />
        <button type="submit">Signup</button>
      </form>

      <h2 style={{ marginTop: "40px" }}>Login</h2>
      <form onSubmit={handleLoginSubmit}>
        <input type="email" name="email" placeholder="Email" value={loginForm.email} onChange={handleLoginChange} required />
        <input type="password" name="password" placeholder="Password" value={loginForm.password} onChange={handleLoginChange} required />
        <button type="submit">Login</button>
      </form>

      {message && <p style={{ marginTop: "20px", color: "yellow" }}>{message}</p>}
    </div>
  );
}
