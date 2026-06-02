const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000,
    },
},
    {
        timestamps: true,
    });
messageSchema.index({
    senderId: 1,
    receiverId: 1,
    createdAt: -1
});

const Message = mongoose.model("Message", messageSchema)
module.exports = Message