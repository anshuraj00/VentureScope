const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());

// ✅ Serve frontend
app.use(express.static("public"));

// Database
connectDB();

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));

app.listen(5000, () => {
    console.log("Server running on port 5000");
});