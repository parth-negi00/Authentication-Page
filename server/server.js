const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

// Connect DB
connectDB();

// Test route (important)
app.get("/", (req, res) => {
  res.send("Auth API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
