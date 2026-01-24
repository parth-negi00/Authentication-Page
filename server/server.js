const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db");

dotenv.config();

const app = express();

// 1. Connect DB
connectDB();

// 2. CORS Middleware (Must be first)
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Added OPTIONS
    credentials: true
}));

// 3. JSON Parser
app.use(express.json());

// 4. Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/forms", require("./routes/forms"));

// 5. Root Route (Health Check)
app.get("/", (req, res) => {
  res.send("Auth API is running successfully!");
});

// 6. Local Development Server
// Only run the server if NOT in Vercel (Vercel handles the server start automatically)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

// 7. Export the App for Vercel
module.exports = app;