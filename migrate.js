const mongoose = require("mongoose");
require("dotenv").config();

const Idea = require("./models/idea");

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        console.log("Connected to MongoDB");

        // Update all ideas to have status='pending' if they don't have one
        const result = await Idea.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'pending' } }
        );
        
        console.log(`\n✅ Migration Complete:`);
        console.log(`   Matched: ${result.matchedCount} documents`);
        console.log(`   Modified: ${result.modifiedCount} documents`);

        // Verify
        const pendingCount = await Idea.countDocuments({ status: 'pending' });
        console.log(`\n   Total pending ideas now: ${pendingCount}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

migrate();
