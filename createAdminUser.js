const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user");
const bcrypt = require("bcryptjs");

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        console.log("Connected to MongoDB");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: "admin@venturescope.com" });
        if (existingAdmin) {
            console.log("Admin user already exists");
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash("admin123", 10);

        // Create admin user
        const adminUser = new User({
            name: "Admin User",
            username: "admin",
            email: "admin@venturescope.com",
            password: hashedPassword,
            role: "admin"
        });

        await adminUser.save();
        console.log("Admin user created successfully");
        console.log("Email: admin@venturescope.com");
        console.log("Password: admin123");

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

createAdmin();