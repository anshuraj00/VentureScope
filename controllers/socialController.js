const Idea = require("../models/idea");
const Comment = require("../models/comment");
const Notification = require("../models/notification");
const User = require("../models/user");

// ================= LIKE IDEA =================
const likeIdea = async (req, res) => {
    try {
        const ideaId = req.params.id;
        const userId = req.user.id;

        const idea = await Idea.findById(ideaId);
        if (!idea) {
            return res.status(404).json({ message: "Idea not found" });
        }

        const alreadyLiked = idea.likes.includes(userId);
        if (alreadyLiked) {
            idea.likes = idea.likes.filter(id => id.toString() !== userId);
        } else {
            idea.likes.push(userId);

            // Create notification (only if not liking own idea)
            if (idea.user.toString() !== userId) {
                const notification = new Notification({
                    recipient: idea.user,
                    actor: userId,
                    type: "like",
                    idea: ideaId
                });
                await notification.save();
            }
        }

        await idea.save();

        res.status(200).json({
            message: alreadyLiked ? "Idea unliked" : "Idea liked",
            likes: idea.likes.length,
            isLiked: !alreadyLiked
        });

    } catch (error) {
        console.error("LIKE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= DISLIKE IDEA =================
const dislikeIdea = async (req, res) => {
    try {
        const ideaId = req.params.id;
        const userId = req.user.id;

        const idea = await Idea.findById(ideaId);
        if (!idea) {
            return res.status(404).json({ message: "Idea not found" });
        }

        const alreadyDisliked = idea.dislikes.includes(userId);
        if (alreadyDisliked) {
            idea.dislikes = idea.dislikes.filter(id => id.toString() !== userId);
        } else {
            idea.dislikes.push(userId);
        }

        await idea.save();

        res.status(200).json({
            message: alreadyDisliked ? "Idea undisliked" : "Idea disliked",
            dislikes: idea.dislikes.length,
            isDisliked: !alreadyDisliked
        });

    } catch (error) {
        console.error("DISLIKE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= RATE IDEA =================
const rateIdea = async (req, res) => {
    try {
        const ideaId = req.params.id;
        const userId = req.user.id;
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const idea = await Idea.findById(ideaId);
        if (!idea) {
            return res.status(404).json({ message: "Idea not found" });
        }

        // Check if user already rated
        const existingRatingIndex = idea.ratings.findIndex(r => r.user.toString() === userId);

        if (existingRatingIndex >= 0) {
            // Update existing rating
            idea.ratings[existingRatingIndex].rating = rating;
        } else {
            // Add new rating
            idea.ratings.push({ user: userId, rating });
        }

        await idea.save();

        // Calculate average rating
        const totalRatings = idea.ratings.length;
        const sumRatings = idea.ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;

        res.status(200).json({
            message: "Rating submitted",
            averageRating: parseFloat(averageRating),
            userRating: rating,
            totalRatings
        });

    } catch (error) {
        console.error("RATE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= ADD COMMENT =================
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const ideaId = req.params.id;
        const userId = req.user.id;

        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const idea = await Idea.findById(ideaId);
        if (!idea) {
            return res.status(404).json({ message: "Idea not found" });
        }

        const comment = new Comment({
            text,
            user: userId,
            idea: ideaId
        });

        await comment.save();
        idea.comments.push(comment._id);
        await idea.save();

        // Create notification
        if (idea.user.toString() !== userId) {
            const notification = new Notification({
                recipient: idea.user,
                actor: userId,
                type: "comment",
                idea: ideaId
            });
            await notification.save();
        }

        res.status(201).json({
            message: "Comment added",
            comment
        });

    } catch (error) {
        console.error("COMMENT ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= DELETE COMMENT =================
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.user.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        await Comment.findByIdAndDelete(commentId);
        await Idea.updateOne(
            { _id: comment.idea },
            { $pull: { comments: commentId } }
        );

        res.status(200).json({ message: "Comment deleted" });

    } catch (error) {
        console.error("DELETE COMMENT ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET COMMENTS =================
const getComments = async (req, res) => {
    try {
        const ideaId = req.params.id;

        const comments = await Comment.find({ idea: ideaId })
            .populate("user", "name username profileImage")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);

    } catch (error) {
        console.error("GET COMMENTS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= FOLLOW USER =================
const followUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.params.id;

        if (userId === targetUserId) {
            return res.status(400).json({ message: "Cannot follow yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = user.following.includes(targetUserId);

        if (isFollowing) {
            user.following = user.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
        } else {
            user.following.push(targetUserId);
            targetUser.followers.push(userId);

            // Create notification
            const notification = new Notification({
                recipient: targetUserId,
                actor: userId,
                type: "follow"
            });
            await notification.save();
        }

        await user.save();
        await targetUser.save();

        res.status(200).json({
            message: isFollowing ? "User unfollowed" : "User followed",
            isFollowing: !isFollowing
        });

    } catch (error) {
        console.error("FOLLOW ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= SEARCH IDEAS =================
const searchIdeas = async (req, res) => {
    try {
        const { q, type } = req.query;

        if (!q || q.trim() === "") {
            return res.status(400).json({ message: "Search query required" });
        }

        let results = {};

        // Search for users
        if (!type || type === 'all' || type === 'users') {
            const users = await User.find({
                $or: [
                    { name: { $regex: q, $options: "i" } },
                    { username: { $regex: q, $options: "i" } }
                ]
            })
                .select("name username profileImage bio")
                .limit(10);

            results.users = users;
        }

        // Search for ideas
        if (!type || type === 'all' || type === 'ideas') {
            const ideas = await Idea.find({
                status: 'approved',
                $or: [
                    { title: { $regex: q, $options: "i" } },
                    { description: { $regex: q, $options: "i" } },
                    { category: { $regex: q, $options: "i" } }
                ]
            })
                .populate("user", "name username profileImage")
                .sort({ createdAt: -1 })
                .limit(20);

            results.ideas = ideas;
        }

        res.status(200).json(results);

    } catch (error) {
        console.error("SEARCH ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET RECOMMENDATIONS =================
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        // Get ideas from users that current user follows, sorted by newest
        const recommendations = await Idea.find({
            user: { $in: user.following }
        })
            .populate("user", "name username profileImage")
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json(recommendations);

    } catch (error) {
        console.error("RECOMMENDATIONS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET NOTIFICATIONS =================
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = await Notification.find({ recipient: userId })
            .populate("actor", "name username profileImage")
            .populate("idea", "title")
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);

    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= MARK NOTIFICATION AS READ =================
const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification marked as read", notification });

    } catch (error) {
        console.error("MARK READ ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= DELETE NOTIFICATION =================
const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Check if user owns this notification
        if (notification.recipient.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this notification" });
        }

        await Notification.findByIdAndDelete(notificationId);

        res.status(200).json({ message: "Notification deleted" });

    } catch (error) {
        console.error("DELETE NOTIFICATION ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET USER PROFILE =================
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId)
            .populate("followers", "name username profileImage")
            .populate("following", "name username profileImage")
            .select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const ideas = await Idea.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            user,
            ideas,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            ideasCount: ideas.length
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    likeIdea,
    dislikeIdea,
    rateIdea,
    addComment,
    deleteComment,
    getComments,
    followUser,
    searchIdeas,
    getRecommendations,
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
    getUserProfile
};
