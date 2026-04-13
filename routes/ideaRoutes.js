const express = require("express");
const router = express.Router();
const multer = require("multer");

const { protect, admin } = require("../middleware/authMiddleware");

const ideaController = require("../controllers/ideaController");

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


// ================= ROUTES =================

// Create Idea
router.post("/add", protect, upload.array('images', 5), ideaController.createIdea); // allow up to 5 images

// Get all ideas
router.get("/", ideaController.getIdeas);

// Get my ideas
router.get("/my", protect, ideaController.getMyIdeas);

// Get followed users' ideas
router.get("/followed", protect, ideaController.getFollowedIdeas);

// Admin routes
router.get("/admin/pending", protect, admin, ideaController.getPendingIdeas);
router.put("/admin/:id/approve", protect, admin, ideaController.approveIdea);
router.put("/admin/:id/reject", protect, admin, ideaController.rejectIdea);

// Get single idea
router.get("/:id", ideaController.getIdeaById);

// Update idea
router.put("/:id", protect, upload.array('images', 5), ideaController.updateIdea);

// Delete idea
router.delete("/:id", protect, ideaController.deleteIdea);


module.exports = router;