require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));

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