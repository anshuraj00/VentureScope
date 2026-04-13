const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        default: "General"
    },

    image: [{
        type: String // array of image paths
    }],

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
    }],

    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],

    averageRating: {
        type: Number,
        default: 0
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("Idea", ideaSchema);