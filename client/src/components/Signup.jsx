import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const url = isSignup
    ? `${process.env.REACT_APP_BACKEND_URL}/api/auth/signup`
    : `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Something went wrong");
      return;
    }

    localStorage.setItem("token", data.token);

    if (isSignup) {
      setMessage("Signup successful! Please login.");
      setIsSignup(false);
      setForm({ name: "", email: "", password: "" });
    } else {
      navigate("/home");
    }
  } catch (err) {
    setMessage("Server error");
  }
};


  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
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
          {isSignup ? "Signup" : "Login"}
        </button>
      </form>

      <p style={{ color: "green" }}>{message}</p>

      <button onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? "Already have an account? Login" : "New user? Signup"}
      </button>
    </div>
  );
}
