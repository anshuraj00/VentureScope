const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    username: {
        type: String,
        unique: true,
        sparse: true // allows null but unique when set
    },

    password: {
        type: String,
        required: true
    },

    // =============== PROFILE FIELDS ===============
    bio: {
        type: String,
        default: ""
    },

    phone: {
        type: String,
        default: ""
    },

    company: {
        type: String,
        default: ""
    },

    skills: {
        type: [String],
        default: []
    },

    location: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'male'
    },

    profileImage: {
        type: String,
        default: null
    },

    socialLinks: {
        twitter: {
            type: String,
            default: ""
        },
        linkedin: {
            type: String,
            default: ""
        },
        github: {
            type: String,
            default: ""
        }
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);
