const Message = require("../models/message");
const User = require("../models/user");

// ================= GET USER CONVERSATIONS =================
const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all unique users the current user has chatted with
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { receiver: userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$receiver",
                            else: "$sender"
                        }
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiver", userId] },
                                        { $eq: ["$read", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    user: {
                        _id: 1,
                        name: 1,
                        username: 1,
                        profileImage: 1
                    },
                    lastMessage: {
                        content: 1,
                        createdAt: 1,
                        messageType: 1
                    },
                    unreadCount: 1
                }
            },
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ]);

        res.status(200).json(conversations);

    } catch (error) {
        console.error("GET CONVERSATIONS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET MESSAGES WITH USER =================
const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;

        // Mark messages as read
        await Message.updateMany(
            {
                sender: otherUserId,
                receiver: userId,
                read: false
            },
            {
                read: true,
                readAt: new Date()
            }
        );

        // Get messages between the two users
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        })
            .populate("sender", "name username profileImage")
            .populate("receiver", "name username profileImage")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);

    } catch (error) {
        console.error("GET MESSAGES ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= SEND MESSAGE =================
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, messageType = "text" } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) {
            return res.status(400).json({ message: "Receiver and content are required" });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            messageType
        });

        await message.save();

        // Populate sender info for response
        await message.populate("sender", "name username profileImage");
        await message.populate("receiver", "name username profileImage");

        res.status(201).json({
            message: "Message sent",
            data: message
        });

    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= MARK MESSAGES AS READ =================
const markMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;

        const result = await Message.updateMany(
            {
                sender: otherUserId,
                receiver: userId,
                read: false
            },
            {
                read: true,
                readAt: new Date()
            }
        );

        res.status(200).json({
            message: "Messages marked as read",
            updatedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("MARK READ ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= DELETE MESSAGE =================
const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const userId = req.user.id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Only sender can delete their message
        if (message.sender.toString() !== userId) {
            return res.status(403).json({ message: "Can only delete your own messages" });
        }

        await Message.findByIdAndDelete(messageId);

        res.status(200).json({ message: "Message deleted" });

    } catch (error) {
        console.error("DELETE MESSAGE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    deleteMessage
};