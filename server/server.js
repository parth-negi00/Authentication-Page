const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db");

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// Connect DB FIRST
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/forms", require("./routes/forms"));

app.get("/", (req, res) => {
  res.send("Auth API running");
});

module.exports = app;
