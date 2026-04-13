const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user");
const Idea = require("./models/idea");

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        console.log("✅ Connected to MongoDB\n");

        // Check admin user
        const adminUser = await User.findOne({ email: "aaravraj48cha@gmail.com" }).select('name email role');
        console.log("=== ADMIN USER ===");
        console.log("Email:", adminUser?.email);
        console.log("Role:", adminUser?.role);
        console.log("_id:", adminUser?._id);

        // Check idea statuses
        console.log("\n=== IDEAS STATUS ===");
        const pending = await Idea.countDocuments({ status: 'pending' });
        const approved = await Idea.countDocuments({ status: 'approved' });
        const rejected = await Idea.countDocuments({ status: 'rejected' });
        
        console.log(`Pending: ${pending}`);
        console.log(`Approved: ${approved}`);
        console.log(`Rejected: ${rejected}`);
        
        // Show approved ideas that will be displayed
        console.log("\n=== APPROVED IDEAS (will be shown to users) ===");
        const approvedIdeas = await Idea.find({ status: 'approved' }).populate('user', 'name email');
        approvedIdeas.forEach(idea => {
            console.log(`- ${idea.title} (by ${idea.user?.name || 'Unknown'})`);
        });

        // Show pending ideas for admin
        console.log("\n=== PENDING IDEAS (admin panel) ===");
        const pendingIdeas = await Idea.find({ status: 'pending' }).populate('user', 'name email');
        console.log(`Count: ${pendingIdeas.length}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

diagnose();
