const mongoose = require("mongoose");
require("dotenv").config();

const Idea = require("./models/idea");

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        console.log("Connected");

        // Try to find all ideas and check their status
        const allIdeas = await Idea.find().exec();
        console.log("\nAll Ideas:");
        allIdeas.forEach(idea => {
            console.log(`${idea.title}: status="${idea.status}" (hasOwnProperty: ${idea.hasOwnProperty('status')})`);
        });

        // Try raw collection query
        const db = mongoose.connection.db;
        const collection = db.collection('ideas');
        const found = await collection.countDocuments({ status: 'pending' });
        console.log(`\nRaw MongoDB count with status='pending': ${found}`);

        // Check one idea in detail
        if (allIdeas.length > 0) {
            console.log("\nFirst idea full object:");
            console.log(JSON.stringify(allIdeas[0].toObject(), null, 2));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
