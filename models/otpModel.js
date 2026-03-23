const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({

    name: String,

    username: String,

    password: String,

    email: {
        type: String,
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    purpose: {
        type: String,
        default: 'register' // or 'change-email'
    },

    otp: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // ✅ auto delete after expiry
    }

});

module.exports = mongoose.model("OTP", otpSchema);