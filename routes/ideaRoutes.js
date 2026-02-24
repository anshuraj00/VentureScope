const express = require("express");
const router = express.Router();

const {
    createIdea,
    getIdeas,
    getMyIdeas,
    updateIdea,
    deleteIdea
} = require("../controllers/ideaController");

const protect = require("../middleware/authMiddleware");


// Create Idea
router.post("/", protect, createIdea);

// Get All Ideas
router.get("/", protect, getIdeas);

// Get Logged User Ideas
router.get("/my", protect, getMyIdeas);

// Update Idea
router.put("/:id", protect, updateIdea);

// Delete Idea
router.delete("/:id", protect, deleteIdea);

module.exports = router;