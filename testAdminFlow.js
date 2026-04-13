const jwt = require("jsonwebtoken");

// Simulate the login process and verification
async function testAdminFlow() {
    try {
        console.log("=== TESTING ADMIN VERIFICATION FLOW ===\n");

        // 1. Simulate login - get JWT token
        console.log("Step 1: Logging in...");
        const loginResponse = await fetch("http://localhost:5000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "aaravraj48cha@gmail.com",
                password: "Anshu@1234"  // Change if needed
            })
        });

        if (!loginResponse.ok) {
            console.error("❌ Login failed:", loginResponse.statusText);
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        console.log("✅ Login successful");
        console.log("   Token:", token.substring(0, 50) + "...");
        console.log("   User role:", loginData.user.role);

        // 2. Check admin endpoint
        console.log("\nStep 2: Checking admin status via API...");
        const adminCheckResponse = await fetch("http://localhost:5000/api/users/check-admin", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!adminCheckResponse.ok) {
            console.error("❌ Admin check failed:", adminCheckResponse.statusText);
            return;
        }

        const adminCheckData = await adminCheckResponse.json();
        console.log("✅ Admin check response:");
        console.log("   isAdmin:", adminCheckData.isAdmin);
        console.log("   role:", adminCheckData.role);

        // 3. Get pending ideas
        if (adminCheckData.isAdmin) {
            console.log("\nStep 3: Getting pending ideas (admin only)...");
            const pendingResponse = await fetch("http://localhost:5000/api/ideas/admin/pending", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (!pendingResponse.ok) {
                console.error("❌ Failed to get pending ideas:", pendingResponse.statusText);
                const errorText = await pendingResponse.text();
                console.error("Error:", errorText);
                return;
            }

            const pendingIdeas = await pendingResponse.json();
            console.log("✅ Retrieved pending ideas:");
            console.log("   Count:", pendingIdeas.length);
            if (pendingIdeas.length > 0) {
                console.log("   First idea:", pendingIdeas[0].title);
            }
        }

        console.log("\n✅ ADMIN FLOW TEST PASSED!");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

// Wait for server to be ready and run test
setTimeout(testAdminFlow, 2000);
