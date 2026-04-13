const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    getProfile,
    getUserProfile,
    updateProfile,
    requestEmailChange,
    confirmEmailChange,
    uploadProfileImage,
    followUser,
    unfollowUser
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// Multer upload setting
const uploadDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.id}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (allowed.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error("Only JPEG, PNG, GIF, WEBP are allowed"));
    }
});


// ================= ROUTES =================

// Send OTP during registration
router.post("/register", registerUser);

// Verify OTP & create user
router.post("/verify-otp", verifyOTP);

// Login
router.post("/login", loginUser);

// Profile
router.get("/profile", protect, getProfile);
router.get("/profile/:id", protect, getUserProfile);
router.put("/profile", protect, updateProfile);

// Follow/Unfollow
router.post("/follow/:id", protect, followUser);
router.post("/unfollow/:id", protect, unfollowUser);

// Email change (OTP flow)
router.post("/profile/change-email-request", protect, requestEmailChange);
router.post("/profile/change-email-verify", protect, confirmEmailChange);

// Image upload
router.post("/profile/upload-image", protect, upload.single('profileImage'), uploadProfileImage);

// Resend OTP
router.post("/resend-otp", resendOTP);

// Check if user is admin
router.get("/check-admin", protect, (req, res) => {
    res.status(200).json({
        isAdmin: req.user.role === 'admin',
        role: req.user.role
    });
});

module.exports = router;