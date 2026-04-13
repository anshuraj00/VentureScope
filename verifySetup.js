const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user");
const Idea = require("./models/idea");

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        console.log("Connected to MongoDB");

        // Check admin user
        const adminUser = await User.findOne({ email: "aaravraj48cha@gmail.com" });
        console.log("\n=== Admin User ===");
        console.log("Email:", adminUser?.email);
        console.log("Role:", adminUser?.role);

        // Check raw Mongoose schema
        console.log("\n=== Idea Schema Fields ===");
        console.log(Idea.schema.paths);

        // Check pending ideas using raw collection
        const db = mongoose.connection.db;
        const ideasCollection = db.collection('ideas');
        const rawIdeas = await ideasCollection.find({ status: 'pending' }).toArray();
        console.log("\n=== Raw MongoDB Query for status='pending' ===");
        console.log("Found:", rawIdeas.length, "ideas");
        
        // Check raw ideas without filter
        const allRawIdeas = await ideasCollection.find({}).toArray();
        console.log("\n=== All Raw Ideas ===");
        console.log("Count:", allRawIdeas.length);
        allRawIdeas.forEach(idea => {
            console.log(`- _id: ${idea._id}, title: ${idea.title}, status: ${idea.status}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

verify();
