const Idea = require("../models/idea");


// ================= CREATE IDEA =================
const createIdea = async (req, res) => {
    try {
        const { title, description, category } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required"
            });
        }

        const idea = new Idea({
            title,
            description,
            category,
            user: req.user.id
        });

        await idea.save();

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
        const ideas = await Idea.find()
            .populate("user", "name email")
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
        const ideas = await Idea.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json(ideas);

    } catch (error) {
        console.error("GET MY ERROR:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};


// ================= GET SINGLE IDEA =================
const getIdeaById = async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id)
            .populate("user", "name email");

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


// ================= EXPORT =================
module.exports = {
    createIdea,
    getIdeas,
    getMyIdeas,
    getIdeaById,
    updateIdea,
    deleteIdea
};