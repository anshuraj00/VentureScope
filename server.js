const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Database connection
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));

// Server start
app.listen(5000, () => {
    console.log("Server running on port 5000");
});