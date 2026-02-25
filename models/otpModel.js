const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({

    name: String,

    password: String,

    email: {
        type: String,
        required: true
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