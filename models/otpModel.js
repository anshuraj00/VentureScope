const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    otp: String,
    expiresAt: Date
});

module.exports = mongoose.model("OTP", otpSchema);