console.log("idea.js loaded ✅");


// ================= LOAD USER IDEAS =================
async function loadIdeas() {

    const token = localStorage.getItem("token");

    try {
        const res = await fetch("/api/ideas/my", {   // ✅ FIXED
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const ideas = await res.json();

        const container = document.getElementById("ideasContainer");
        container.innerHTML = "";

        if (!ideas || ideas.length === 0) {
            container.innerHTML = "<p>No ideas yet 🚀</p>";
            return;
        }

        ideas.forEach(idea => {

            const div = document.createElement("div");

            div.innerHTML = `
                <h3>${idea.title}</h3>
                <p>${idea.description}</p>
                <small>Category: ${idea.category || "N/A"}</small>
                <br/>
                <button onclick="deleteIdea('${idea._id}')">Delete</button>
                <hr/>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        alert("Error loading ideas");
    }
}


// ================= CREATE IDEA =================
async function createIdea(event) {

    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value.trim();

    const token = localStorage.getItem("token");

    try {
        const res = await fetch("/api/ideas/add", {   // ✅ FIXED
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ title, description, category })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Idea added ✅");

            // clear form
            document.getElementById("title").value = "";
            document.getElementById("description").value = "";
            document.getElementById("category").value = "";

            loadIdeas(); // refresh
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Error adding idea");
    }
}


// ================= DELETE IDEA =================
async function deleteIdea(id) {

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`/api/ideas/${id}`, {   // ✅ FIXED
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        if (res.ok) {
            alert("Idea deleted ✅");
            loadIdeas();
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Error deleting idea");
    }
}


// ================= AUTO LOAD =================
window.onload = loadIdeas;