const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createIdea,
    getAllIdeas,
    getMyIdeas,
    deleteIdea
} = require("../controllers/ideaController");


// Create idea (protected)
router.post("/", protect, createIdea);


// Get all ideas (public)
router.get("/", getAllIdeas);


// Get my ideas (protected)
router.get("/my", protect, getMyIdeas);


// Delete idea (protected)
router.delete("/:id", protect, deleteIdea);


module.exports = router;
