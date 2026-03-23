const API_URL = "http://localhost:5000/api/ideas";

// Get token from localStorage
const token = localStorage.getItem("token");


// ================= LOAD ALL IDEAS =================
async function loadIdeas() {
    try {
        const res = await fetch(API_URL);
        const ideas = await res.json();

        const container = document.getElementById("ideasContainer");
        container.innerHTML = "";

        ideas.forEach(idea => {
            const div = document.createElement("div");

            div.innerHTML = `
                <h3>${idea.title}</h3>
                <p>${idea.description}</p>
                <small>By: ${idea.user?.name || "Unknown"}</small>
                <br/>
                <button onclick="deleteIdea('${idea._id}')">Delete</button>
                <hr/>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        console.error(error);
    }
}


// ================= CREATE IDEA =================
async function createIdea(event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, category })
        });

        const data = await res.json();
        alert(data.message);

        loadIdeas();

    } catch (error) {
        console.error(error);
    }
}


// ================= DELETE IDEA =================
async function deleteIdea(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        alert(data.message);

        loadIdeas();

    } catch (error) {
        console.error(error);
    }
}


// Auto load when page opens
window.onload = loadIdeas;