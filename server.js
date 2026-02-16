const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Connect database
connectDB();

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("API is running");
});

// User routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Dashboard routes
const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
