const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const User = require("./models/user");

async function testJWT() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        console.log("✅ Connected\n");

        const user = await User.findOne({ email: "aaravraj48cha@gmail.com" });
        console.log("=== USER DATA ===");
        console.log("Email:", user.email);
        console.log("Role:", user.role);
        console.log("_ID:", user._id);

        // Create JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret123",
            { expiresIn: "1d" }
        );

        console.log("\n=== JWT TOKEN ===");
        console.log(token);

        // Decode and verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
        console.log("\n=== DECODED JWT ===");
        console.log("ID:", decoded.id);
        console.log("Role:", decoded.role);

        // Simulate what frontend will receive
        const frontendUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
        };

        console.log("\n=== FRONTEND USER OBJECT ===");
        console.log(JSON.stringify(frontendUser, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

testJWT();
