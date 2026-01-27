import React, { useState, useEffect } from "react";
import "./Signup.css"; 
import { useNavigate } from "react-router-dom"; 

// FIX 1: Use Localhost for testing, Vercel for production
const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://authentication-page-backend.vercel.app";

export default function AuthForm() {
  const [isSignup, setIsSignup] = useState(true);
  
  // FIX 2: Added 'organizationName' to the form state
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    organizationName: "" 
  });
  
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate(); 
  
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
    e.preventDefault(); // Prevents the "new tab" or reload issue
    const endpoint = isSignup ? "signup" : "login";

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // FIX 3: Store the new User Object correctly
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setMessage(
          isSignup
            ? `Signup successful! Organization "${data.user.organizationId}" Created.`
            : `Login successful! Welcome back ${data.user.name}`
        );

        // Redirect to Dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);

      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setMessage("Server error. Please try again later.");
    }
  };

  const switchMode = (signupMode) => {
    setIsSignup(signupMode);
    setMessage("");
    // Reset form (including the new org field)
    setForm({ name: "", email: "", password: "", organizationName: "" });
  };

  return (
    <div className={`auth-page ${darkMode ? "dark" : "light"}`}>
      <div className="animated-bg" />
      <div className={`signup-container ${darkMode ? "dark" : "light"}`}>
        <button className="toggle-btn" onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <h2>{isSignup ? "SignUp" : "Login"}</h2>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
                <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                {/* FIX 4: The New Organization Input (Only visible in Signup) */}
                <input
                    type="text"
                    name="organizationName"
                    placeholder="Organization/Designation"
                    value={form.organizationName}
                    onChange={handleChange}
                    required
                />
            </>
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

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}