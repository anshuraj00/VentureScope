const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyOTP,
    loginUser
} = require("../controllers/userController");

// ================= ROUTES =================

// Send OTP during registration
router.post("/register", registerUser);

// Verify OTP & create user
router.post("/verify-otp", verifyOTP);

// Login
router.post("/login", loginUser);

module.exports = router;