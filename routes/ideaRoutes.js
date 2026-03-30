const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const ideaController = require("../controllers/ideaController");

console.log("protect:", typeof protect);
console.log("createIdea:", typeof ideaController.createIdea);

// ================= ROUTES =================

// Create Idea
router.post("/add", protect, ideaController.createIdea);

// Get all ideas
router.get("/", ideaController.getIdeas);

// Get my ideas
router.get("/my", protect, ideaController.getMyIdeas);

// Get single idea
router.get("/:id", ideaController.getIdeaById);

// Update idea
router.put("/:id", protect, ideaController.updateIdea);

// Delete idea
router.delete("/:id", protect, ideaController.deleteIdea);


module.exports = router;