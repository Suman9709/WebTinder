const express = require('express');
const { userAuth } = require('../middlewares/auth');
const Message = require('../models/messageModel');


const chatRouter = express.Router();


chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const targetUserId = req.params.targetUserId;


        const message = await Message.find({
            $or: [
                { senderId: loggedInUserId, receiverId: targetUserId },
                { senderId: targetUserId, receiverId: loggedInUserId },
            ]
        }).sort({ createdAt: -1 }).limit(50);
        res.json({
            data: message.reverse(),
            message: "Messages fetched successfully",
        });

    }
    catch (error) {
        res.status(400).json({
            message: "Error in fetching messages" + error.message,
        })
    }
})
module.exports = chatRouter