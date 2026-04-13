const mongoose = require("mongoose");
require("dotenv").config();

const Idea = require("./models/idea");

async function approveIdeas() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        console.log("Connected to MongoDB");

        // Approve first 2 ideas for testing
        const result = await Idea.updateMany(
            { status: 'pending' },
            { $set: { status: 'approved' } },
            { limit: 2 }
        );
        
        console.log(`\n✅ Approved ${result.modifiedCount} ideas`);

        // Show stats
        const pending = await Idea.countDocuments({ status: 'pending' });
        const approved = await Idea.countDocuments({ status: 'approved' });
        const rejected = await Idea.countDocuments({ status: 'rejected' });
        
        console.log(`\n📊 Idea Status Summary:`);
        console.log(`   Pending: ${pending}`);
        console.log(`   Approved: ${approved}`);
        console.log(`   Rejected: ${rejected}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

approveIdeas();
