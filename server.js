require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // ✅ enough for CORS (no need for app.options)

// Log incoming requests for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Validate env
if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not set. Defaulting to mongodb://127.0.0.1:27017/venturescope");
}
if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET not set. Defaulting to insecure secret for development.");
}

// Database
connectDB();

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));
app.use("/api/social", require("./routes/socialRoutes"));

// API 404
app.use("/api", (req, res) => {
    res.status(404).json({ message: "API route not found" });
});

// Frontend fallback
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});