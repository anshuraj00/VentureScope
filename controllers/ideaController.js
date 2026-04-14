const Idea = require("../models/idea");
const User = require("../models/user");
const Notification = require("../models/notification");


// ================= CREATE IDEA =================
const createIdea = async (req, res) => {
    try {
        const { title, description, category } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required"
            });
        }

        const imagePaths = req.files ? req.files.map(file => file.path.replace(/\\/g, "/")) : [];

        const idea = new Idea({
            title,
            description,
            category,
            image: imagePaths,
            user: req.user.id,
            status: 'pending'
        });

        await idea.save();

        // Create notifications for all admins about pending idea
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            const notification = new Notification({
                recipient: admin._id,
                actor: req.user.id,
                type: "pending-idea",
                idea: idea._id
            });
            await notification.save();
        }

        res.status(201).json({
            message: "Idea created successfully",
            idea
        });

    } catch (error) {
        console.error("CREATE ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= GET ALL IDEAS =================
const getIdeas = async (req, res) => {
    try {
        const ideas = await Idea.find({ status: 'approved' })
            .populate("user", "name email username role profileImage")
            .populate("ratings.user", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(ideas);

    } catch (error) {
        console.error("GET ALL ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= GET MY IDEAS =================
const getMyIdeas = async (req, res) => {
    try {
        const userId = req.query.userId || req.user.id;
        const ideas = await Idea.find({ user: userId })
            .populate("user", "name email username role profileImage")
            .populate("ratings.user", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(ideas);

    } catch (error) {
        console.error("GET MY ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ================= GET FOLLOWED USERS' IDEAS =================
const getFollowedIdeas = async (req, res) => {
    try {
        const user = await require("../models/user").findById(req.user.id);
        const followedUsers = user.following;

        const ideas = await Idea.find({ 
            user: { $in: followedUsers },
            status: 'approved' 
        })
            .populate("user", "name email username role profileImage")
            .populate("ratings.user", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(ideas);

    } catch (error) {
        console.error("GET FOLLOWED ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= GET SINGLE IDEA =================
const getIdeaById = async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id)
            .populate("user", "name email username role profileImage")
            .populate("ratings.user", "name");

        if (!idea) {
            return res.status(404).json({
                message: "Idea not found"
            });
        }

        res.status(200).json(idea);

    } catch (error) {
        console.error("GET ONE ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= UPDATE IDEA =================
const updateIdea = async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);

        if (!idea) {
            return res.status(404).json({
                message: "Idea not found"
            });
        }

        if (idea.user.toString() !== req.user.id) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }

        const { title, description, category } = req.body;

        idea.title = title || idea.title;
        idea.description = description || idea.description;
        idea.category = category || idea.category;

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path.replace(/\\/g, "/"));
            idea.image = [...(idea.image || []), ...newImages];
        }

        const updatedIdea = await idea.save();

        res.status(200).json({
            message: "Idea updated successfully",
            idea: updatedIdea
        });

    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= DELETE IDEA =================
const deleteIdea = async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);

        if (!idea) {
            return res.status(404).json({
                message: "Idea not found"
            });
        }

        if (idea.user.toString() !== req.user.id) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }

        await idea.deleteOne();

        res.status(200).json({
            message: "Idea deleted successfully"
        });

    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= GET PENDING IDEAS (ADMIN) =================
const getPendingIdeas = async (req, res) => {
    try {
        const ideas = await Idea.find({ status: 'pending' })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(ideas);

    } catch (error) {
        console.error("GET PENDING ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= APPROVE IDEA (ADMIN) =================
const approveIdea = async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);

        if (!idea) {
            return res.status(404).json({
                message: "Idea not found"
            });
        }

        idea.status = 'approved';
        await idea.save();

        res.status(200).json({
            message: "Idea approved successfully"
        });

    } catch (error) {
        console.error("APPROVE ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= REJECT IDEA (ADMIN) =================
const rejectIdea = async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);

        if (!idea) {
            return res.status(404).json({
                message: "Idea not found"
            });
        }

        idea.status = 'rejected';
        await idea.save();

        res.status(200).json({
            message: "Idea rejected successfully"
        });

    } catch (error) {
        console.error("REJECT ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= EXPORT =================
module.exports = {
    createIdea,
    getIdeas,
    getMyIdeas,
    getFollowedIdeas,
    getIdeaById,
    updateIdea,
    deleteIdea,
    getPendingIdeas,
    approveIdea,
    rejectIdea
};