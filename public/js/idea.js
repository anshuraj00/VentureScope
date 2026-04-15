console.log("idea.js loaded ✅");

let activeEditIdeaId = null;

function buildImageUrl(imagePath) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath.startsWith('/') ? imagePath : '/' + imagePath;
}

function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// ================= LOAD ALL IDEAS (Feed) =================
async function loadIdeas() {
    const token = localStorage.getItem("token");

    // Set active button
    document.getElementById("allPostsBtn").classList.add("active");
    document.getElementById("followedPostsBtn").classList.remove("active");
    document.getElementById("suggestionsBtn").classList.remove("active");

    try {
        const res = await fetch("/api/ideas/", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        let ideas = [];
        if (res.headers.get('content-type')?.includes('application/json')) {
            ideas = await res.json();
        }

        const container = document.getElementById("ideasContainer");
        if (!container) {
            console.warn('No ideasContainer element found');
            return;
        }
        container.innerHTML = "";

        if (!ideas || ideas.length === 0) {
            container.innerHTML = "<p>No ideas yet 🚀</p>";
            return;
        }

        ideas.forEach(idea => {
            const ideaDiv = createIdeaElement(idea);
            container.appendChild(ideaDiv);
        });

    } catch (error) {
        console.error(error);
        alert("Error loading ideas");
    }
}

// ================= LOAD FOLLOWED IDEAS =================
async function loadFollowedIdeas() {
    const token = localStorage.getItem("token");

    // Set active button
    document.getElementById("followedPostsBtn").classList.add("active");
    document.getElementById("allPostsBtn").classList.remove("active");
    document.getElementById("suggestionsBtn").classList.remove("active");

    try {
        const res = await fetch("/api/ideas/followed", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        let ideas = [];
        if (res.headers.get('content-type')?.includes('application/json')) {
            ideas = await res.json();
        }

        const container = document.getElementById("ideasContainer");
        if (!container) {
            console.warn('No ideasContainer element found');
            return;
        }
        container.innerHTML = "";

        if (!ideas || ideas.length === 0) {
            container.innerHTML = "<p>No posts from people you follow yet. Start following some users! 🚀</p>";
            return;
        }

        ideas.forEach(idea => {
            const ideaDiv = createIdeaElement(idea);
            container.appendChild(ideaDiv);
        });

    } catch (error) {
        console.error(error);
        alert("Error loading followed ideas");
    }
}

// ================= LOAD SUGGESTIONS =================
async function loadSuggestions() {
    const token = localStorage.getItem("token");

    // Set active button
    document.getElementById("suggestionsBtn").classList.add("active");
    document.getElementById("allPostsBtn").classList.remove("active");
    document.getElementById("followedPostsBtn").classList.remove("active");

    try {
        const res = await fetch("/api/ideas/", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        let ideas = [];
        if (res.headers.get('content-type')?.includes('application/json')) {
            ideas = await res.json();
        }

        const user = JSON.parse(localStorage.getItem("user")) || {};
        const filteredIdeas = ideas.filter(idea => idea.user._id !== user._id);

        const container = document.getElementById("ideasContainer");
        if (!container) {
            console.warn('No ideasContainer element found');
            return;
        }
        container.innerHTML = "";

        if (!filteredIdeas || filteredIdeas.length === 0) {
            container.innerHTML = "<p>No suggestions available. Be the first to post! 🚀</p>";
            return;
        }

        filteredIdeas.forEach(idea => {
            const ideaDiv = createIdeaElement(idea);
            container.appendChild(ideaDiv);
        });

    } catch (error) {
        console.error(error);
        alert("Error loading suggestions");
    }
}


// ================= CREATE IDEA =================
async function createIdea(event) {

    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value.trim();
    const images = document.getElementById("images").files;

    if (!title || !description) {
        alert("Title and description are required");
        return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);

    for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
    }

    try {
        const res = await fetch("/api/ideas/add", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        });

        let data = {};
        if (res.headers.get('content-type')?.includes('application/json')) {
            data = await res.json();
        }

        if (res.ok) {
            alert("Idea added ✅");

            // clear form
            document.getElementById("title").value = "";
            document.getElementById("description").value = "";
            document.getElementById("category").value = "";
            document.getElementById("images").value = "";

            loadIdeas(); // refresh
        } else {
            alert(data.message || "Failed to add idea");
        }

    } catch (error) {
        console.error(error);
        alert("Error adding idea");
    }
}


// ================= EDIT IDEA =================
function startEditIdea(id) {
    const ideaCard = document.querySelector(`[data-idea-id="${id}"]`);
    if (!ideaCard) return;

    const title = ideaCard.querySelector('.idea-header h3')?.innerText || '';
    const description = ideaCard.querySelector('.idea-content p')?.innerText || '';
    const category = ideaCard.querySelector('.idea-content .category')?.innerText || '';

    const editSection = document.getElementById('editIdeaSection');
    if (!editSection) return;

    activeEditIdeaId = id;
    editSection.style.display = 'block';
    document.getElementById('editTitle').value = title;
    document.getElementById('editDescription').value = description;
    document.getElementById('editCategory').value = category;
    document.getElementById('editImages').value = '';
    window.scrollTo({ top: editSection.offsetTop - 20, behavior: 'smooth' });
}

function cancelEditIdea() {
    const editSection = document.getElementById('editIdeaSection');
    if (!editSection) return;
    activeEditIdeaId = null;
    editSection.style.display = 'none';
    document.getElementById('editIdeaForm').reset();
}

async function submitIdeaEdit() {
    if (!activeEditIdeaId) {
        alert('No idea selected for edit');
        return;
    }

    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const category = document.getElementById('editCategory').value.trim();
    const images = document.getElementById('editImages').files;

    if (!title || !description) {
        alert('Title and description are required');
        return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);

    for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
    }

    try {
        const res = await fetch(`/api/ideas/${activeEditIdeaId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        });

        let data = {};
        if (res.headers.get('content-type')?.includes('application/json')) {
            data = await res.json();
        }

        if (res.ok) {
            alert('Idea updated ✅');
            cancelEditIdea();
            loadIdeas();
        } else {
            alert(data.message || 'Failed to update idea');
        }
    } catch (error) {
        console.error(error);
        alert('Error updating idea');
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

        let data = {};
        if (res.headers.get('content-type')?.includes('application/json')) {
            data = await res.json();
        }

        if (res.ok) {
            alert("Idea deleted ✅");
            loadIdeas();
        } else {
            alert(data.message || "Failed to delete idea");
        }

    } catch (error) {
        console.error(error);
        alert("Error deleting idea");
    }
}


// ================= CREATE IDEA ELEMENT =================
function createIdeaElement(idea) {
    const ideaDiv = document.createElement("div");
    ideaDiv.className = "idea-card venture-card";
    ideaDiv.setAttribute("data-idea-id", idea._id);

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const creator = idea.user || {};
    const userId = creator._id ? creator._id.toString() : (typeof creator === 'string' ? creator : null);
    const isOwner = user._id && userId && user._id === userId;
    
    const isLiked = user && user._id && idea.likes ? idea.likes.some(like => {
        return typeof like === 'string' ? like === user._id : like._id === user._id;
    }) : false;
    
    const isDisliked = user && idea.dislikes ? idea.dislikes.some(dislike => {
        return typeof dislike === 'string' ? dislike === user._id : dislike._id === user._id;
    }) : false;

    // Calculate rating info
    const ratings = idea.ratings || [];
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;
    const userRating = user && ratings.find(r => r.user && r.user._id === user._id);
    const userRatingValue = userRating ? userRating.rating : 0;

    const profileImage = creator.profileImage ? (creator.profileImage.startsWith('http') ? creator.profileImage : buildImageUrl(creator.profileImage)) : '/images/default-avatar.png';
    const roleLabel = creator.role ? capitalize(creator.role) : 'Founder';
    const category = idea.category || 'Startup';
    const timeAgo = new Date(idea.createdAt).toLocaleDateString();
    const hasTextContent = !idea.image || idea.image.length === 0;
    const description = idea.description || '';
    const safeFullText = encodeURIComponent(description);
    const truncatedDescription = description.length > 140 ? description.slice(0, 140) + '...' : description;

    ideaDiv.innerHTML = `
        <div class="venture-card-header">
            <div class="venture-card-user">
                <div class="venture-card-avatar"><img src="${profileImage}" alt="${creator.name || 'Creator'}"></div>
                <div class="venture-card-userinfo">
                    <a href="profile.html?id=${userId}" class="venture-card-username">${creator.username || creator.name || 'Anonymous'}</a>
                    <span class="venture-card-role">${roleLabel}</span>
                </div>
            </div>
            <div class="venture-card-menu">
                <button class="venture-menu-button" onclick="toggleIdeaMenu('${idea._id}', event)">⋯</button>
                <div id="ideaMenu-${idea._id}" class="venture-menu-dropdown">
                    ${isOwner ? `<button onclick="startEditIdea('${idea._id}')">Edit</button><button onclick="deleteIdea('${idea._id}')">Delete</button>` : ''}
                    <button onclick="reportIdea('${idea._id}')">Report</button>
                    <button onclick="shareIdea('${idea._id}')">Share</button>
                </div>
            </div>
        </div>
        <div class="venture-card-body">
            ${hasTextContent ? `
                <div class="venture-card-text">
                    <h3 class="venture-card-title">${idea.title || 'Startup Idea'}</h3>
                    <p class="venture-card-description" data-full-text="${safeFullText}">${truncatedDescription}</p>
                    ${description.length > 140 ? `<button class="venture-card-expand" onclick="toggleCaption(this)">Read more</button>` : ''}
                </div>
            ` : `
                <div class="venture-card-media">
                    <img src="${buildImageUrl(idea.image[0])}" alt="${idea.title || 'Idea image'}">
                </div>
            `}
        </div>
        <div class="venture-card-tagbar">
            <span class="venture-tag">#${category.replace(/\s+/g, '')}</span>
            <span class="venture-category-label">${category}</span>
        </div>
        <div class="venture-card-actions">
            <button class="venture-action-btn ${isLiked ? 'active' : ''}" data-like-btn="${idea._id}" onclick="toggleLike('${idea._id}')">👍 Like <span data-likes-count="${idea._id}">${idea.likes ? idea.likes.length : 0}</span></button>
            <button class="venture-action-btn ${isDisliked ? 'active' : ''}" data-dislike-btn="${idea._id}" onclick="toggleDislike('${idea._id}')">👎 Dislike <span data-dislikes-count="${idea._id}">${idea.dislikes ? idea.dislikes.length : 0}</span></button>
            <button class="venture-action-btn" onclick="loadComments('${idea._id}')">💬 Comments <span>${idea.comments ? idea.comments.length : 0}</span></button>
            <button class="venture-action-btn" onclick="toggleSaveIdea('${idea._id}')">🔖 Save</button>
        </div>
        <div class="venture-card-rating">
            <div class="rating-display">
                <div class="stars-display">
                    ${generateStarsDisplay(averageRating)}
                </div>
                <span class="rating-text">${averageRating} (${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})</span>
            </div>
            <div class="rating-input">
                <span class="rate-label">Rate this:</span>
                <div class="stars-input" data-idea-id="${idea._id}">
                    ${generateStarsInput(idea._id, userRatingValue)}
                </div>
            </div>
        </div>
        <div class="venture-card-footer">
            <p class="venture-caption">${description}</p>
            <div class="venture-footer-meta">
                <button class="venture-collaborate-btn" onclick="collaborate('${idea._id}')">🤝 Collaborate</button>
                <span class="venture-time">${timeAgo}</span>
            </div>
        </div>
    `;

    return ideaDiv;
}

function generateStarsDisplay(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '⭐';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '⭐'; // For now, we'll use full stars. Could add half-star logic later
        } else {
            stars += '☆';
        }
    }
    
    return stars;
}

function generateStarsInput(ideaId, userRating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= userRating;
        stars += `<span class="star-input ${isActive ? 'active' : ''}" data-rating="${i}" onclick="rateIdea('${ideaId}', ${i})">★</span>`;
    }
    return stars;
}

function toggleIdeaMenu(id, event) {
    event.stopPropagation();
    closeAllIdeaMenus();
    const menu = document.getElementById(`ideaMenu-${id}`);
    if (menu) {
        menu.classList.toggle('open');
    }
}

function closeAllIdeaMenus() {
    document.querySelectorAll('.venture-menu-dropdown.open').forEach(menu => {
        menu.classList.remove('open');
    });
}

document.addEventListener('click', closeAllIdeaMenus);

function toggleCaption(button) {
    const description = button.previousElementSibling;
    if (!description) return;
    const fullText = decodeURIComponent(description.dataset.fullText || '');
    if (button.dataset.expanded === 'true') {
        description.innerText = fullText.slice(0, 140) + '...';
        button.innerText = 'Read more';
        button.dataset.expanded = 'false';
        description.classList.remove('expanded');
    } else {
        description.innerText = fullText;
        button.innerText = 'Show less';
        button.dataset.expanded = 'true';
        description.classList.add('expanded');
    }
}

async function shareIdea(id) {
    const url = `${window.location.origin}/dashboard.html?idea=${id}`;
    try {
        await navigator.clipboard.writeText(url);
        alert('Post link copied to clipboard');
    } catch (error) {
        prompt('Copy this link:', url);
    }
}

function toggleSaveIdea(id) {
    const saved = JSON.parse(localStorage.getItem('savedIdeas') || '[]');
    const index = saved.indexOf(id);
    if (index >= 0) {
        saved.splice(index, 1);
        alert('Removed from saved posts');
    } else {
        saved.push(id);
        alert('Saved post to your bookmarks');
    }
    localStorage.setItem('savedIdeas', JSON.stringify(saved));
}

function reportIdea(id) {
    alert('Report submitted for review');
}

function collaborate(id) {
    alert('Collaboration request sent to the creator');
}

// ================= UPDATE STAR DISPLAY =================
function updateStarDisplay(ideaId, userRating) {
    const stars = document.querySelectorAll(`[data-idea-id="${ideaId}"] .star`);
    stars.forEach((star, index) => {
        if (index + 1 <= userRating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
}

async function rateIdea(ideaId, rating) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to rate ideas");
        return;
    }

    try {
        const response = await fetch(`/api/social/${ideaId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ rating })
        });

        const result = await response.json();

        if (response.ok) {
            // Update the rating display
            updateIdeaRating(ideaId, result.averageRating, result.totalRatings);
            // Update user's rating
            updateUserRating(ideaId, rating);
            console.log('Rating submitted successfully');
        } else {
            alert(result.message || 'Error submitting rating');
        }
    } catch (error) {
        console.error('Error rating idea:', error);
        alert('Error submitting rating');
    }
}

function updateIdeaRating(ideaId, averageRating, totalRatings) {
    const ideaCard = document.querySelector(`[data-idea-id="${ideaId}"]`);
    if (!ideaCard) return;

    const starsDisplay = ideaCard.querySelector('.stars-display');
    const ratingText = ideaCard.querySelector('.rating-text');
    
    if (starsDisplay) {
        starsDisplay.innerHTML = generateStarsDisplay(averageRating);
    }
    
    if (ratingText) {
        ratingText.textContent = `${averageRating} (${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})`;
    }
}

function updateUserRating(ideaId, rating) {
    const ideaCard = document.querySelector(`[data-idea-id="${ideaId}"]`);
    if (!ideaCard) return;

    const starsInput = ideaCard.querySelector('.stars-input');
    if (starsInput) {
        starsInput.innerHTML = generateStarsInput(ideaId, rating);
    }
}


// ================= CHECK ADMIN =================
function checkAdmin() {
    try {
        console.log("🔍 Checking admin status...");
        
        // Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            console.log("❌ No user found in localStorage");
            return;
        }

        const user = JSON.parse(userStr);
        console.log("👤 User loaded:", user);
        console.log("   Role:", user.role);

        // Check if admin
        if (user.role === 'admin') {
            console.log("✅ User IS admin - showing admin panel");
            const adminPanel = document.getElementById("adminPanel");
            if (adminPanel) {
                adminPanel.style.display = "block";
                console.log("✅ Admin panel displayed");
                loadPendingIdeas();
            } else {
                console.error("❌ adminPanel element not found in DOM");
            }
        } else {
            console.log("❌ User is NOT admin");
            const adminPanel = document.getElementById("adminPanel");
            if (adminPanel) {
                adminPanel.style.display = "none";
            }
        }
        
    } catch (error) {
        console.error("❌ Error in checkAdmin:", error);
    }
}


// ================= LOAD PENDING IDEAS =================
async function loadPendingIdeas() {
    const token = localStorage.getItem("token");

    try {
        console.log("🔄 Loading pending ideas...");
        const res = await fetch("/api/ideas/admin/pending", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        console.log("📡 Response status:", res.status);

        let ideas = [];
        if (res.headers.get('content-type')?.includes('application/json')) {
            ideas = await res.json();
        }

        console.log("📦 Received ideas:", ideas);

        const container = document.getElementById("pendingIdeasContainer");
        if (!container) {
            console.error("❌ pendingIdeasContainer not found!");
            return;
        }
        
        container.innerHTML = "";

        if (!ideas || ideas.length === 0) {
            container.innerHTML = "<p>✅ No pending ideas</p>";
            console.log("✅ No pending ideas to moderate");
            return;
        }

        console.log(`📋 Found ${ideas.length} pending ideas`);

        ideas.forEach(idea => {
            const ideaDiv = document.createElement("div");
            ideaDiv.className = "idea-card";
            ideaDiv.innerHTML = `
                <div class="idea-header">
                    <h3>${idea.title}</h3>
                    <small>By ${idea.user?.name || 'Unknown'} • ${new Date(idea.createdAt).toLocaleDateString()}</small>
                </div>
                <div class="idea-content">
                    <p>${idea.description}</p>
                    ${idea.category ? `<span class="category">${idea.category}</span>` : ''}
                </div>
                <div class="admin-actions">
                    <button onclick="approveIdea('${idea._id}')">✅ Approve</button>
                    <button onclick="rejectIdea('${idea._id}')">❌ Reject</button>
                </div>
            `;
            container.appendChild(ideaDiv);
        });

    } catch (error) {
        console.error("❌ Error loading pending ideas:", error);
    }
}


// ================= APPROVE IDEA =================
async function approveIdea(id) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`/api/ideas/admin/${id}/approve`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (res.ok) {
            alert("Idea approved");
            loadPendingIdeas();
            loadIdeas(); // refresh main feed
        } else {
            alert("Error approving idea");
        }

    } catch (error) {
        console.error(error);
    }
}


// ================= REJECT IDEA =================
async function rejectIdea(id) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`/api/ideas/admin/${id}/reject`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (res.ok) {
            alert("Idea rejected");
            loadPendingIdeas();
        } else {
            alert("Error rejecting idea");
        }

    } catch (error) {
        console.error(error);
    }
}


// ================= AUTO LOAD =================
window.onload = loadIdeas;