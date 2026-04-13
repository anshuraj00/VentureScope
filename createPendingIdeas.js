const mongoose = require("mongoose");
require("dotenv").config();

const Idea = require("./models/idea");
const User = require("./models/user");

async function createPendingIdeas() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        console.log("Connected to MongoDB");

        // Get an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        
        // Create some pending ideas
        const pendingIdeas = [
            {
                title: "AI Chat Platform",
                description: "A real-time chat platform powered by AI assistants",
                category: "AI/ML",
                user: adminUser._id,
                status: "pending"
            },
            {
                title: "Green Energy Storage",
                description: "Innovative battery technology for renewable energy storage",
                category: "Clean Energy",
                user: adminUser._id,
                status: "pending"
            },
            {
                title: "Blockchain Supply Chain",
                description: "Track and verify product authenticity using blockchain",
                category: "Blockchain",
                user: adminUser._id,
                status: "pending"
            }
        ];

        const result = await Idea.insertMany(pendingIdeas);
        console.log(`\n✅ Created ${result.length} pending ideas`);
        
        result.forEach(idea => {
            console.log(`   - ${idea.title} (ID: ${idea._id})`);
        });

        // Show stats
        const pending = await Idea.countDocuments({ status: 'pending' });
        const approved = await Idea.countDocuments({ status: 'approved' });
        
        console.log(`\n📊 Idea Stats:`);
        console.log(`   Pending: ${pending}`);
        console.log(`   Approved: ${approved}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

createPendingIdeas();
