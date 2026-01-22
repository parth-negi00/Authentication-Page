import React, { useState, useEffect } from "react";
import "./Signup.css";

const BACKEND_URL = "https://authentication-page-backend.vercel.app";

export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(true); // true = signup, false = login
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Persist dark mode
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? "signup" : "login";

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage(
          isSignup
            ? "Signup successful! Welcome " + data.user.name
            : "Login successful! Welcome back " + data.user.name
        );
      } else {
        setMessage(data.message || "Error occurred");
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className={`signup-container ${darkMode ? "dark" : "light"}`}>
      {/* Toggle dark/light mode */}
      <button className="toggle-btn" onClick={toggleDarkMode}>
        {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      </button>

      <h2>{isSignup ? "Signup" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        {isSignup && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{isSignup ? "Signup" : "Login"}</button>
      </form>

      {/* Switch form link */}
      <p className="switch-link">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <span onClick={() => { setIsSignup(false); setMessage(""); setForm({ name: "", email: "", password: "" }) }} className="link">
              Login
            </span>
          </>
        ) : (
          <>
            Don't have an account?{" "}
            <span onClick={() => { setIsSignup(true); setMessage(""); setForm({ name: "", email: "", password: "" }) }} className="link">
              Signup
            </span>
          </>
        )}
      </p>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
