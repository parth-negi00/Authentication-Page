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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
            ? `Signup successful! Welcome ${data.user.name}`
            : `Login successful! Welcome back ${data.user.name}`
        );
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      setMessage("Server error. Please try again later.");
    }
  };

  const switchMode = (signupMode) => {
    setIsSignup(signupMode);
    setMessage("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className={`auth-page ${darkMode ? "dark" : "light"}`}>
      {/* Animated Background */}
      <div className="animated-bg" />

      {/* Auth Card */}
      <div className={`signup-container ${darkMode ? "dark" : "light"}`}>
        {/* Dark / Light Toggle */}
        <button className="toggle-btn" onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
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

          <button type="submit">
            {isSignup ? "Create Account" : "Login"}
          </button>
        </form>

        {/* Switch Signup/Login */}
        <p className="switch-link">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span className="link" onClick={() => switchMode(false)}>
                Login
              </span>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <span className="link" onClick={() => switchMode(true)}>
                Signup
              </span>
            </>
          )}
        </p>

        {/* Message */}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
