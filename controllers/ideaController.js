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

        const idea = await Idea.create({
            title,
            description,
            category,
            user: req.user.id
        });

        res.status(201).json({
            message: "Idea created successfully",
            idea
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
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
        res.status(500).json({
            message: "Server error"
        });
    }
};



// ================= GET MY IDEAS =================
const getMyIdeas = async (req, res) => {
    try {

        const ideas = await Idea.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json(ideas);

    } catch (error) {
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

        // Owner check
        if (idea.user.toString() !== req.user.id) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }

        const updatedIdea = await Idea.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json({
            message: "Idea updated successfully",
            updatedIdea
        });

    } catch (error) {
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

        // Owner check
        if (idea.user.toString() !== req.user.id) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }

        await idea.deleteOne();

        res.json({
            message: "Idea deleted successfully"
        });

    } catch (error) {
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
    updateIdea,
    deleteIdea
};