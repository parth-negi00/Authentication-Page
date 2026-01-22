const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db");

dotenv.config();

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


// Routes
app.use("/api/auth", require("./routes/auth"));

app.get("/", (req, res) => {
  res.send("Auth API running");
});

module.exports = app;
