console.log("social.js loaded ✅");

// ================= LIKE IDEA =================
async function toggleLike(ideaId) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`/api/social/${ideaId}/like`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        if (res.ok) {
            const btn = document.querySelector(`[data-like-btn="${ideaId}"]`);
            const count = document.querySelector(`[data-likes-count="${ideaId}"]`);

            if (data.isLiked) {
                btn.classList.add("liked");
                btn.style.color = "#ff4757";
            } else {
                btn.classList.remove("liked");
                btn.style.color = "#999";
            }

            count.textContent = data.likes;
        } else {
            alert(data.message || "Error liking idea");
        }

    } catch (error) {
        console.error(error);
        alert("Error liking idea");
    }
}

// ================= DISLIKE IDEA =================
async function toggleDislike(ideaId) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`/api/social/${ideaId}/dislike`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        if (res.ok) {
            const btn = document.querySelector(`[data-dislike-btn="${ideaId}"]`);
            const count = document.querySelector(`[data-dislikes-count="${ideaId}"]`);

            if (data.isDisliked) {
                btn.classList.add("disliked");
                btn.style.color = "#ff4757";
            } else {
                btn.classList.remove("disliked");
                btn.style.color = "#999";
            }

            count.textContent = data.dislikes;
        } else {
            alert(data.message || "Error disliking idea");
        }

    } catch (error) {
        console.error(error);
        alert("Error disliking idea");
    }
}

// ================= RATE IDEA =================
async function rateIdea(ideaId, rating) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`/api/social/${ideaId}/rate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ rating })
        });

        const data = await res.json();

        if (res.ok) {
            // Update the average rating display
            const avgRatingEl = document.querySelector(`[data-avg-rating="${ideaId}"]`);
            const totalRatingsEl = document.querySelector(`[data-total-ratings="${ideaId}"]`);

            if (avgRatingEl) avgRatingEl.textContent = data.averageRating;
            if (totalRatingsEl) totalRatingsEl.textContent = data.totalRatings;

            // Update star display
            updateStarDisplay(ideaId, data.userRating);

            alert("Rating submitted!");
        } else {
            alert(data.message || "Error rating idea");
        }

    } catch (error) {
        console.error(error);
        alert("Error rating idea");
    }
}

// ================= GET COMMENTS =================
async function loadComments(ideaId) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`/api/social/${ideaId}/comments`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const comments = await res.json();
        const modalBody = document.getElementById("commentsModalBody");
        const modal = document.getElementById("commentsModal");

        if (!modalBody || !modal) return;

        let commentsHtml = `<div class="comments-list">`;

        if (comments.length > 0) {
            comments.forEach(comment => {
                const userObj = JSON.parse(localStorage.getItem("user")) || {};
                commentsHtml += `
                    <div class="comment-item">
                        <strong>${comment.user.name}</strong>
                        <p>${comment.text}</p>
                        <small>${new Date(comment.createdAt).toLocaleDateString()}</small>
                        ${comment.user._id === userObj._id ? 
                            `<button class="delete-comment-btn" onclick="deleteComment('${comment._id}')">Delete</button>` 
                            : ''}
                    </div>
                `;
            });
        } else {
            commentsHtml += `<p style="text-align: center; color: #999;">No comments yet. Be the first!</p>`;
        }

        commentsHtml += `</div>`;
        modalBody.innerHTML = commentsHtml;
        modal.style.display = "block";
        
        document.getElementById("commentInput").dataset.ideaId = ideaId;

    } catch (error) {
        console.error(error);
        alert("Error loading comments");
    }
}

// ================= SUBMIT COMMENT =================
async function submitComment() {
    const token = localStorage.getItem("token");
    const input = document.getElementById("commentInput");
    const ideaId = input.dataset.ideaId;
    const text = input.value.trim();

    if (!text) {
        alert("Comment cannot be empty");
        return;
    }

    try {
        const res = await fetch(`/api/social/${ideaId}/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ text })
        });

        const data = await res.json();

        if (res.ok) {
            input.value = "";
            await loadComments(ideaId);
        } else {
            alert(data.message || "Error adding comment");
        }

    } catch (error) {
        console.error(error);
        alert("Error adding comment");
    }
}

function closeCommentsModal() {
    const modal = document.getElementById("commentsModal");
    if (modal) {
        modal.style.display = "none";
    }
}

window.addEventListener("click", (event) => {
    const modal = document.getElementById("commentsModal");
    if (modal && event.target === modal) {
        closeCommentsModal();
    }
});

// ================= DELETE COMMENT =================
async function deleteComment(commentId) {
    const token = localStorage.getItem("token");

    if (!confirm("Delete this comment?")) return;

    try {
        const res = await fetch(`/api/social/comment/${commentId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        if (res.ok) {
            alert("Comment deleted");
            location.reload();
        } else {
            alert(data.message || "Error deleting comment");
        }

    } catch (error) {
        console.error(error);
        alert("Error deleting comment");
    }
}

// ================= SEARCH IDEAS =================
async function searchIdeas() {
    const query = document.getElementById("searchInput").value.trim();

    if (!query) {
        alert("Enter a search term");
        return;
    }

    try {
        const res = await fetch(`/api/social/search?q=${encodeURIComponent(query)}`);
        const ideas = await res.json();

        displaySearchResults(ideas);

    } catch (error) {
        console.error(error);
        alert("Error searching ideas");
    }
}

// ================= DISPLAY SEARCH RESULTS =================
function displaySearchResults(ideas) {
    const container = document.getElementById("ideasContainer");
    container.innerHTML = "";

    if (ideas.length === 0) {
        container.innerHTML = "<p>No ideas found</p>";
        return;
    }

    ideas.forEach(idea => {
        const ideaDiv = createIdeaElement(idea);
        container.appendChild(ideaDiv);
    });
}

// ================= FOLLOW USER =================
async function toggleFollow(userId) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`/api/social/user/${userId}/follow`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        if (res.ok) {
            const btn = document.querySelector(`[data-follow-btn="${userId}"]`);
            if (data.isFollowing) {
                btn.textContent = "Unfollow";
                btn.classList.add("following");
            } else {
                btn.textContent = "Follow";
                btn.classList.remove("following");
            }
        } else {
            alert(data.message || "Error following user");
        }

    } catch (error) {
        console.error(error);
        alert("Error following user");
    }
}

// ================= GET RECOMMENDATIONS =================
async function loadRecommendations() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("/api/social/recommendations", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const ideas = await res.json();
        const container = document.getElementById("recommendationsSection");

        if (!container) return;

        container.innerHTML = "<h3>Recommendations from Following</h3>";

        if (ideas.length === 0) {
            container.innerHTML += "<p>No recommendations yet. Follow users to see their ideas!</p>";
            return;
        }

        ideas.forEach(idea => {
            const ideaDiv = createIdeaElement(idea);
            container.appendChild(ideaDiv);
        });

    } catch (error) {
        console.error(error);
    }
}

// ================= GET NOTIFICATIONS =================
async function loadNotifications() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("/api/social/notifications", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const notifications = await res.json();

        displayNotifications(notifications);

    } catch (error) {
        console.error(error);
    }
}

// ================= DISPLAY NOTIFICATIONS =================
function displayNotifications(notifications) {
    const container = document.getElementById("notificationsSection");

    if (!container) return;

    container.innerHTML = "<h3>Notifications</h3>";

    if (notifications.length === 0) {
        container.innerHTML += "<p>No notifications</p>";
        return;
    }

    notifications.forEach(notif => {
        const notifDiv = document.createElement("div");
        notifDiv.className = `notification ${notif.read ? '' : 'unread'}`;

        let message = "";
        if (notif.type === "like") {
            message = `${notif.actor.name} liked your idea "${notif.idea.title}"`;
        } else if (notif.type === "comment") {
            message = `${notif.actor.name} commented on your idea "${notif.idea.title}"`;
        } else if (notif.type === "follow") {
            message = `${notif.actor.name} started following you`;
        }

        notifDiv.innerHTML = `
            <p>${message}</p>
            <small>${new Date(notif.createdAt).toLocaleDateString()}</small>
        `;

        container.appendChild(notifDiv);
    });
}

// ================= TOGGLE COMMENTS SECTION =================
function toggleComments(ideaId) {
    const section = document.querySelector(`[data-comments-section="${ideaId}"]`);
    const input = document.querySelector(`[data-comment-input="${ideaId}"]`);
    const btn = document.querySelector(`[data-comment-btn="${ideaId}"]`);

    if (section.style.display === "none") {
        section.style.display = "block";
        input.style.display = "block";
        btn.style.display = "block";
        loadComments(ideaId);
    } else {
        section.style.display = "none";
        input.style.display = "none";
        btn.style.display = "none";
    }
}
