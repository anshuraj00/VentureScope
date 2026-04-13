const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const socialController = require("../controllers/socialController");

// ================= SOCIAL ROUTES =================

// Like/Unlike idea
router.post("/:id/like", protect, socialController.likeIdea);

// Dislike/Undislike idea
router.post("/:id/dislike", protect, socialController.dislikeIdea);

// Rate idea
router.post("/:id/rate", protect, socialController.rateIdea);

// Comments
router.post("/:id/comment", protect, socialController.addComment);
router.get("/:id/comments", socialController.getComments);
router.delete("/comment/:id", protect, socialController.deleteComment);

// Follow/Unfollow
router.post("/user/:id/follow", protect, socialController.followUser);

// Search
router.get("/search", socialController.searchIdeas);

// Recommendations
router.get("/recommendations", protect, socialController.getRecommendations);

// Notifications
router.get("/notifications", protect, socialController.getNotifications);
router.put("/notification/:id/read", protect, socialController.markNotificationAsRead);

// User Profile
router.get("/user/:id", socialController.getUserProfile);

module.exports = router;
