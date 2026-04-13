const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user");

async function findUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        
        const users = await User.find({}, 'email role -_id');
        console.log("=== USERS IN DATABASE ===");
        users.forEach(user => {
            console.log(`Email: ${user.email}, Role: ${user.role}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

findUsers();
