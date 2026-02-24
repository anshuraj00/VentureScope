const Idea = require("../models/idea");


// Add new idea
const createIdea = async (req, res) => {

    try {

        const { title, description, category } = req.body;

        const newIdea = new Idea({
            title,
            description,
            category,
            createdBy: req.user.id
        });

        await newIdea.save();

        res.status(201).json({
            message: "Idea created successfully",
            idea: newIdea
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// Get all ideas
const getAllIdeas = async (req, res) => {

    try {

        const ideas = await Idea.find().populate("createdBy", "name email");

        res.status(200).json(ideas);

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// Get my ideas
const getMyIdeas = async (req, res) => {

    try {

        const ideas = await Idea.find({ createdBy: req.user.id });

        res.status(200).json(ideas);

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// Delete idea
const deleteIdea = async (req, res) => {

    try {

        const idea = await Idea.findById(req.params.id);

        if (!idea) {
            return res.status(404).json({
                message: "Idea not found"
            });
        }

        await idea.deleteOne();

        res.status(200).json({
            message: "Idea deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



module.exports = {
    createIdea,
    getAllIdeas,
    getMyIdeas,
    deleteIdea
};
