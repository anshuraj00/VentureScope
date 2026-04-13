const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user");

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        console.log("Connected to MongoDB");

        const result = await User.updateOne(
            { email: "aaravraj48cha@gmail.com" },
            { $set: { role: "admin" } }
        );

        if (result.matchedCount > 0) {
            console.log("User updated to admin successfully");
        } else {
            console.log("User not found");
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

makeAdmin();