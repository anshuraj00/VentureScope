require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ✅ Serve frontend properly
app.use(express.static(path.join(__dirname, "public")));

// Database
connectDB();

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));

// ✅ Handle frontend routes (IMPORTANT)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});