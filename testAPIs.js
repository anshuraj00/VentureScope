const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/user");

async function testAdminFlow() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/venturescope");
        
        console.log("=== TESTING ADMIN FLOW ===\n");

        // Get admin user
        const adminUser = await User.findOne({ email: "aaravraj48cha@gmail.com" });
        console.log("✅ Found admin user:", adminUser.email);
        console.log("   Role:", adminUser.role);

        // Create JWT token
        const token = jwt.sign(
            { id: adminUser._id, role: adminUser.role },
            process.env.JWT_SECRET || "secret123",
            { expiresIn: "1d" }
        );

        console.log("\n✅ Created JWT token");
        console.log("   Role in token: adminUser.role");

        await mongoose.disconnect();

        // Test API calls
        console.log("\n=== TESTING API ENDPOINTS ===\n");

        // Test admin check endpoint
        console.log("Test 1: Checking admin status...");
        const adminCheckRes = await fetch("http://localhost:5000/api/users/check-admin", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (adminCheckRes.ok) {
            const data = await adminCheckRes.json();
            console.log("✅ Admin check passed");
            console.log("   isAdmin:", data.isAdmin);
            console.log("   role:", data.role);
        } else {
            console.log("❌ Admin check failed:", adminCheckRes.statusText);
        }

        // Test pending ideas endpoint
        console.log("\nTest 2: Getting pending ideas...");
        const pendingRes = await fetch("http://localhost:5000/api/ideas/admin/pending", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (pendingRes.ok) {
            const ideas = await pendingRes.json();
            console.log("✅ Pending ideas endpoint works");
            console.log("   Found", ideas.length, "pending ideas");
        } else {
            console.log("❌ Pending ideas endpoint failed:", pendingRes.statusText);
        }

        // Test approved ideas endpoint
        console.log("\nTest 3: Getting approved ideas (public)...");
        const approvedRes = await fetch("http://localhost:5000/api/ideas/");
        
        if (approvedRes.ok) {
            const ideas = await approvedRes.json();
            console.log("✅ Approved ideas endpoint works");
            console.log("   Found", ideas.length, "approved ideas");
        } else {
            console.log("❌ Approved ideas endpoint failed:", approvedRes.statusText);
        }

        console.log("\n✅ ALL TESTS COMPLETED!");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

setTimeout(testAdminFlow, 1000);
