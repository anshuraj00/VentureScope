const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

// ================= CHAT ROUTES =================

// Get user's conversations
router.get("/conversations", protect, chatController.getConversations);

// Get messages with a specific user
router.get("/messages/:userId", protect, chatController.getMessages);

// Send a message
router.post("/messages", protect, chatController.sendMessage);

// Mark messages as read
router.put("/messages/:userId/read", protect, chatController.markMessagesAsRead);

// Delete a message
router.delete("/messages/:messageId", protect, chatController.deleteMessage);

module.exports = router;